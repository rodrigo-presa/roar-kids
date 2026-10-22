-- ============================================================
-- ROAR! Kids — Schema Supabase
-- ============================================================

-- ── Extensiones ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Roles de usuario ─────────────────────────────────────────
create type user_role as enum ('retail', 'wholesale', 'admin');
create type wholesale_status as enum ('pending', 'approved', 'rejected');
create type order_status as enum ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
create type payment_status as enum ('pending', 'approved', 'rejected', 'cancelled', 'in_process');
create type wholesale_request_status as enum ('pending', 'confirmed', 'cancelled');

-- ── Perfiles de usuario ──────────────────────────────────────
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  phone text,
  role user_role not null default 'retail',
  wholesale_status wholesale_status,
  business_name text,           -- para mayoristas
  cuit text,                    -- para mayoristas
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Admins can update all profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Trigger: crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Categorías ───────────────────────────────────────────────
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  description text,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table public.categories enable row level security;

create policy "Categories are viewable by everyone"
  on public.categories for select using (true);

create policy "Only admins can modify categories"
  on public.categories for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Datos iniciales
insert into public.categories (name, slug, sort_order) values
  ('Bebés', 'bebes', 1),
  ('Niños', 'ninos', 2),
  ('Teens', 'teens', 3);

-- ── Colores ───────────────────────────────────────────────────
create table public.colors (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  hex_code text,
  created_at timestamptz default now()
);

alter table public.colors enable row level security;
create policy "Colors are viewable by everyone" on public.colors for select using (true);
create policy "Only admins can modify colors" on public.colors for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ── Talles ────────────────────────────────────────────────────
create table public.sizes (
  id uuid default uuid_generate_v4() primary key,
  name text not null,        -- "0-3M", "6-9M", "2", "4", "S", "M", etc.
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table public.sizes enable row level security;
create policy "Sizes are viewable by everyone" on public.sizes for select using (true);
create policy "Only admins can modify sizes" on public.sizes for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ── Productos ─────────────────────────────────────────────────
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  description text,
  category_id uuid references public.categories(id),
  retail_price numeric(10,2) not null,
  wholesale_price numeric(10,2),        -- solo visible para mayoristas
  is_published boolean default true,
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.products enable row level security;

-- Lectura pública (retail_price visible para todos, wholesale_price protegido en app)
create policy "Published products viewable by everyone"
  on public.products for select
  using (is_published = true);

create policy "Admins can do everything with products"
  on public.products for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Función para ocultar wholesale_price en el nivel de DB para no-mayoristas
-- (se complementa con validación en el backend/edge functions)

-- ── Imágenes de producto ──────────────────────────────────────
create table public.product_images (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade,
  url text not null,
  alt_text text,
  sort_order int default 0,
  is_primary boolean default false,
  created_at timestamptz default now()
);

alter table public.product_images enable row level security;
create policy "Product images viewable by everyone" on public.product_images for select using (true);
create policy "Only admins can modify product images" on public.product_images for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ── Variantes de producto (talle + color) ────────────────────
create table public.product_variants (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade,
  color_id uuid references public.colors(id),
  size_id uuid references public.sizes(id),
  stock int not null default 0 check (stock >= 0),
  sku text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(product_id, color_id, size_id)
);

alter table public.product_variants enable row level security;

create policy "Variants viewable by everyone (no exact stock)"
  on public.product_variants for select using (true);

create policy "Only admins can modify variants"
  on public.product_variants for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ── Pedidos minoristas ────────────────────────────────────────
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  order_number text not null unique default ('ROAR-' || to_char(now(), 'YYYYMMDD') || '-' || substr(uuid_generate_v4()::text, 1, 6)),
  user_id uuid references auth.users(id),
  status order_status default 'pending',
  payment_status payment_status default 'pending',
  mp_payment_id text,          -- ID de pago de Mercado Pago
  mp_preference_id text,       -- preference_id de Mercado Pago
  subtotal numeric(10,2) not null,
  shipping_cost numeric(10,2) default 0,
  total numeric(10,2) not null,
  -- Datos del comprador
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text,
  buyer_dni text,
  -- Datos de envío
  shipping_address text not null,
  shipping_city text not null,
  shipping_province text not null,
  shipping_postal_code text not null,
  shipping_method text,         -- tipo de envío Correo Argentino
  tracking_number text,         -- número de seguimiento
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.orders enable row level security;

create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can create orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all orders"
  on public.orders for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admins can update all orders"
  on public.orders for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ── Items de pedido ───────────────────────────────────────────
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  variant_id uuid references public.product_variants(id),
  product_id uuid references public.products(id),
  product_name text not null,
  color_name text,
  size_name text,
  quantity int not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  total_price numeric(10,2) not null,
  created_at timestamptz default now()
);

alter table public.order_items enable row level security;

create policy "Users can view their own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "Admins can view all order items"
  on public.order_items for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "System can insert order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

-- ── Solicitudes mayoristas ────────────────────────────────────
create table public.wholesale_requests (
  id uuid default uuid_generate_v4() primary key,
  request_number text not null unique default ('WMAY-' || to_char(now(), 'YYYYMMDD') || '-' || substr(uuid_generate_v4()::text, 1, 6)),
  user_id uuid references auth.users(id),
  status wholesale_request_status default 'pending',
  notes text,
  wa_message_sent boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.wholesale_requests enable row level security;

create policy "Wholesale users can view their own requests"
  on public.wholesale_requests for select
  using (auth.uid() = user_id);

create policy "Wholesale users can create requests"
  on public.wholesale_requests for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'wholesale'
        and p.wholesale_status = 'approved'
    )
  );

create policy "Admins can manage all wholesale requests"
  on public.wholesale_requests for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ── Items de solicitud mayorista ──────────────────────────────
create table public.wholesale_request_items (
  id uuid default uuid_generate_v4() primary key,
  request_id uuid references public.wholesale_requests(id) on delete cascade,
  variant_id uuid references public.product_variants(id),
  product_id uuid references public.products(id),
  product_name text not null,
  color_name text,
  size_name text,
  quantity int not null check (quantity > 0),
  unit_price numeric(10,2) not null,  -- precio mayorista al momento de la solicitud
  total_price numeric(10,2) not null,
  created_at timestamptz default now()
);

alter table public.wholesale_request_items enable row level security;

create policy "Wholesale users can view their own request items"
  on public.wholesale_request_items for select
  using (
    exists (
      select 1 from public.wholesale_requests r
      where r.id = request_id and r.user_id = auth.uid()
    )
  );

create policy "Admins can view all request items"
  on public.wholesale_request_items for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "System can insert request items"
  on public.wholesale_request_items for insert
  with check (
    exists (
      select 1 from public.wholesale_requests r
      where r.id = request_id and r.user_id = auth.uid()
    )
  );

-- ── Solicitudes de registro mayorista ────────────────────────
create table public.wholesale_applications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  business_name text not null,
  cuit text not null,
  phone text not null,
  city text,
  province text,
  message text,
  status wholesale_status default 'pending',
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

alter table public.wholesale_applications enable row level security;

create policy "Users can view their own applications"
  on public.wholesale_applications for select
  using (auth.uid() = user_id);

create policy "Users can create applications"
  on public.wholesale_applications for insert
  with check (auth.uid() = user_id);

create policy "Admins can manage all applications"
  on public.wholesale_applications for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ── Función: actualizar inventario al confirmar pago ─────────
create or replace function public.deduct_stock_on_payment(p_order_id uuid)
returns void as $$
declare
  item record;
begin
  for item in
    select oi.variant_id, oi.quantity
    from public.order_items oi
    where oi.order_id = p_order_id
  loop
    update public.product_variants
    set stock = stock - item.quantity,
        updated_at = now()
    where id = item.variant_id
      and stock >= item.quantity;

    if not found then
      raise exception 'Stock insuficiente para variante %', item.variant_id;
    end if;
  end loop;
end;
$$ language plpgsql security definer;

-- ── Función: updated_at automático ───────────────────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at before update on public.products
  for each row execute procedure public.handle_updated_at();
create trigger variants_updated_at before update on public.product_variants
  for each row execute procedure public.handle_updated_at();
create trigger orders_updated_at before update on public.orders
  for each row execute procedure public.handle_updated_at();
create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ── Índices de performance ────────────────────────────────────
create index idx_products_category on public.products(category_id);
create index idx_products_published on public.products(is_published);
create index idx_variants_product on public.product_variants(product_id);
create index idx_order_items_order on public.order_items(order_id);
create index idx_orders_user on public.orders(user_id);
create index idx_wholesale_requests_user on public.wholesale_requests(user_id);

-- ── Storage: bucket para imágenes de productos ───────────────
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);

create policy "Product images publicly accessible"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admins can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images' and
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins can delete product images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images' and
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
