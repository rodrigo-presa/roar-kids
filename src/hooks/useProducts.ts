import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Product, Category } from '../types'
import { useAuth } from '../context/AuthContext'

// ── Categorías ─────────────────────────────────────────────
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order')
      if (error) throw error
      return data as Category[]
    },
    staleTime: 5 * 60 * 1000,
  })
}

// ── Productos ──────────────────────────────────────────────
export function useProducts(categorySlug?: string) {
  const { isWholesale } = useAuth()

  return useQuery({
    queryKey: ['products', categorySlug, isWholesale],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*, order_by:sort_order),
          variants:product_variants(
            *,
            color:colors(*),
            size:sizes(*)
          )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (categorySlug) {
        // join por slug de categoría
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .single()
        if (cat) query = query.eq('category_id', cat.id)
      }

      const { data, error } = await query
      if (error) throw error

      // Ocultar wholesale_price si no es mayorista
      return (data as Product[]).map(p => ({
        ...p,
        wholesale_price: isWholesale ? p.wholesale_price : null,
      }))
    },
  })
}

// ── Producto individual ────────────────────────────────────
export function useProduct(slug: string) {
  const { isWholesale } = useAuth()

  return useQuery({
    queryKey: ['product', slug, isWholesale],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(
            *,
            color:colors(*),
            size:sizes(*)
          )
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

      if (error) throw error

      const product = data as Product
      return {
        ...product,
        wholesale_price: isWholesale ? product.wholesale_price : null,
        images: product.images?.sort((a, b) => a.sort_order - b.sort_order),
      }
    },
    enabled: !!slug,
  })
}

// ── Productos destacados ───────────────────────────────────
export function useFeaturedProducts() {
  const { isWholesale } = useAuth()

  return useQuery({
    queryKey: ['products-featured', isWholesale],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*, color:colors(*), size:sizes(*))
        `)
        .eq('is_published', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(8)

      if (error) throw error
      return (data as Product[]).map(p => ({
        ...p,
        wholesale_price: isWholesale ? p.wholesale_price : null,
      }))
    },
    staleTime: 2 * 60 * 1000,
  })
}
