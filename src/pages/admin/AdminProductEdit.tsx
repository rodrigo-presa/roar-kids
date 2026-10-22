import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { slugify } from '../../lib/utils'
import { useCategories } from '../../hooks/useProducts'
import { useColors, useCreateColor } from '../../hooks/useColors'
import { useSizes } from '../../hooks/useSizes'
import { toast } from 'sonner'

interface VariantRow {
  id?: string
  color_id: string
  size_id: string
  stock: number
  sku: string
  _key: string // local key for React
}

interface ImageRow {
  id?: string
  url: string
  alt_text: string
  is_primary: boolean
  sort_order: number
  _file?: File
  _preview?: string
  _uploading?: boolean
}

export default function AdminProductEdit() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const qc = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: categories } = useCategories()
  const { data: colors } = useColors()
  const { data: sizes } = useSizes()
  const createColor = useCreateColor()

  // Basic fields
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [retailPrice, setRetailPrice] = useState('')
  const [wholesalePrice, setWholesalePrice] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [featured, setFeatured] = useState(false)

  // Variants
  const [variants, setVariants] = useState<VariantRow[]>([])

  // Images
  const [images, setImages] = useState<ImageRow[]>([])

  // New color
  const [showColorForm, setShowColorForm] = useState(false)
  const [newColorName, setNewColorName] = useState('')
  const [newColorHex, setNewColorHex] = useState('#000000')

  const [saving, setSaving] = useState(false)

  // Load existing product if editing
  const { data: existingProduct, isLoading: loadingProduct } = useQuery({
    queryKey: ['admin-product', id],
    enabled: isEdit,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, images:product_images(*), variants:product_variants(*)')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data
    },
  })

  useEffect(() => {
    if (!existingProduct) return
    setName(existingProduct.name)
    setSlug(existingProduct.slug)
    setSlugManual(true)
    setDescription(existingProduct.description ?? '')
    setCategoryId(existingProduct.category_id ?? '')
    setRetailPrice(String(existingProduct.retail_price))
    setWholesalePrice(existingProduct.wholesale_price ? String(existingProduct.wholesale_price) : '')
    setIsPublished(existingProduct.is_published)
    setFeatured(existingProduct.featured)
    setVariants(
      (existingProduct.variants ?? []).map((v: any) => ({
        id: v.id,
        color_id: v.color_id ?? '',
        size_id: v.size_id ?? '',
        stock: v.stock,
        sku: v.sku ?? '',
        _key: v.id,
      }))
    )
    setImages(
      (existingProduct.images ?? [])
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((img: any) => ({
          id: img.id,
          url: img.url,
          alt_text: img.alt_text ?? '',
          is_primary: img.is_primary,
          sort_order: img.sort_order,
        }))
    )
  }, [existingProduct])

  const handleNameChange = (val: string) => {
    setName(val)
    if (!slugManual) setSlug(slugify(val))
  }

  const addVariant = () => {
    setVariants(prev => [...prev, {
      color_id: colors?.[0]?.id ?? '',
      size_id: sizes?.[0]?.id ?? '',
      stock: 0,
      sku: '',
      _key: crypto.randomUUID(),
    }])
  }

  const updateVariant = (key: string, field: keyof VariantRow, value: string | number) => {
    setVariants(prev => prev.map(v => v._key === key ? { ...v, [field]: value } : v))
  }

  const removeVariant = (key: string) => {
    setVariants(prev => prev.filter(v => v._key !== key))
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    const newImages: ImageRow[] = Array.from(files).map((file, i) => ({
      url: '',
      alt_text: '',
      is_primary: images.length === 0 && i === 0,
      sort_order: images.length + i,
      _file: file,
      _preview: URL.createObjectURL(file),
    }))
    setImages(prev => [...prev, ...newImages])
  }

  const removeImage = (idx: number) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== idx)
      // If removed was primary, set first as primary
      if (prev[idx].is_primary && next.length > 0) {
        next[0].is_primary = true
      }
      return next.map((img, i) => ({ ...img, sort_order: i }))
    })
  }

  const setPrimary = (idx: number) => {
    setImages(prev => prev.map((img, i) => ({ ...img, is_primary: i === idx })))
  }

  const uploadImage = async (productId: string, imageRow: ImageRow): Promise<string> => {
    if (!imageRow._file) return imageRow.url
    const ext = imageRow._file.name.split('.').pop()
    const path = `${productId}/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, imageRow._file, { upsert: false })
    if (error) throw error
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    return data.publicUrl
  }

  const handleAddColor = async () => {
    if (!newColorName.trim()) return
    try {
      await createColor.mutateAsync({ name: newColorName.trim(), hex_code: newColorHex })
      setNewColorName('')
      setNewColorHex('#000000')
      setShowColorForm(false)
      toast.success('Color agregado')
    } catch {
      toast.error('No se pudo agregar el color')
    }
  }

  const handleSave = async () => {
    if (!name.trim()) { toast.error('El nombre es obligatorio'); return }
    if (!slug.trim()) { toast.error('El slug es obligatorio'); return }
    if (!retailPrice || isNaN(Number(retailPrice))) { toast.error('El precio minorista es obligatorio'); return }

    setSaving(true)
    try {
      let productId = id

      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        category_id: categoryId || null,
        retail_price: Number(retailPrice),
        wholesale_price: wholesalePrice ? Number(wholesalePrice) : null,
        is_published: isPublished,
        featured,
      }

      if (isEdit) {
        const { error } = await supabase.from('products').update(payload).eq('id', id!)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('products').insert(payload).select().single()
        if (error) throw error
        productId = data.id
      }

      // --- Variantes ---
      if (isEdit) {
        // Delete removed variants
        const existingIds = (existingProduct?.variants ?? []).map((v: any) => v.id)
        const keptIds = variants.filter(v => v.id).map(v => v.id!)
        const toDelete = existingIds.filter((vid: string) => !keptIds.includes(vid))
        if (toDelete.length > 0) {
          await supabase.from('product_variants').delete().in('id', toDelete)
        }
        // Upsert kept / new
        for (const v of variants) {
          const vPayload = {
            product_id: productId,
            color_id: v.color_id || null,
            size_id: v.size_id || null,
            stock: Number(v.stock),
            sku: v.sku || null,
          }
          if (v.id) {
            await supabase.from('product_variants').update(vPayload).eq('id', v.id)
          } else {
            await supabase.from('product_variants').insert(vPayload)
          }
        }
      } else {
        for (const v of variants) {
          await supabase.from('product_variants').insert({
            product_id: productId,
            color_id: v.color_id || null,
            size_id: v.size_id || null,
            stock: Number(v.stock),
            sku: v.sku || null,
          })
        }
      }

      // --- Imágenes ---
      // Upload new files
      const finalImages: ImageRow[] = []
      for (const img of images) {
        if (img._file) {
          const url = await uploadImage(productId!, img)
          finalImages.push({ ...img, url })
        } else {
          finalImages.push(img)
        }
      }

      if (isEdit) {
        // Delete removed images
        const existingImgIds = (existingProduct?.images ?? []).map((i: any) => i.id)
        const keptImgIds = finalImages.filter(i => i.id).map(i => i.id!)
        const toDeleteImgs = existingImgIds.filter((iid: string) => !keptImgIds.includes(iid))
        if (toDeleteImgs.length > 0) {
          await supabase.from('product_images').delete().in('id', toDeleteImgs)
        }
        // Upsert
        for (const [i, img] of finalImages.entries()) {
          const imgPayload = {
            product_id: productId,
            url: img.url,
            alt_text: img.alt_text || null,
            is_primary: img.is_primary,
            sort_order: i,
          }
          if (img.id) {
            await supabase.from('product_images').update(imgPayload).eq('id', img.id)
          } else {
            await supabase.from('product_images').insert(imgPayload)
          }
        }
      } else {
        for (const [i, img] of finalImages.entries()) {
          if (!img.url) continue
          await supabase.from('product_images').insert({
            product_id: productId,
            url: img.url,
            alt_text: img.alt_text || null,
            is_primary: img.is_primary,
            sort_order: i,
          })
        }
      }

      qc.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success(isEdit ? 'Producto actualizado' : 'Producto creado')
      navigate('/admin/productos')
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message ?? 'No se pudo guardar el producto')
    } finally {
      setSaving(false)
    }
  }

  if (isEdit && loadingProduct) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-roar-orange" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/admin/productos')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold text-roar-graphite">
          {isEdit ? 'Editar producto' : 'Nuevo producto'}
        </h1>
      </div>

      <div className="space-y-6">
        {/* Datos básicos */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-roar-graphite mb-4">Información básica</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-roar-graphite mb-1.5">Nombre *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  className="input"
                  placeholder="Ej: Remera Manga Larga Rayas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-roar-graphite mb-1.5">Slug (URL)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={e => { setSlugManual(true); setSlug(e.target.value) }}
                  className="input font-mono text-xs"
                  placeholder="remera-manga-larga-rayas"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-roar-graphite mb-1.5">Descripción</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="input h-24 resize-none"
                placeholder="Describí el producto..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-roar-graphite mb-1.5">Categoría</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="input">
                  <option value="">Sin categoría</option>
                  {categories?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-roar-graphite mb-1.5">Precio minorista *</label>
                <input
                  type="number"
                  value={retailPrice}
                  onChange={e => setRetailPrice(e.target.value)}
                  className="input"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-roar-graphite mb-1.5">Precio mayorista</label>
                <input
                  type="number"
                  value={wholesalePrice}
                  onChange={e => setWholesalePrice(e.target.value)}
                  className="input"
                  placeholder="Opcional"
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setIsPublished(p => !p)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${isPublished ? 'bg-green-500' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPublished ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm font-medium text-roar-graphite">Publicado</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setFeatured(f => !f)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${featured ? 'bg-roar-yellow' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${featured ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm font-medium text-roar-graphite">Destacado</span>
              </label>
            </div>
          </div>
        </div>

        {/* Imágenes */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-roar-graphite mb-4">Imágenes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-roar-beige">
                <img
                  src={img._preview || img.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {img.is_primary && (
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-roar-orange text-white text-xs font-semibold rounded-full">
                    Principal
                  </span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {!img.is_primary && (
                    <button
                      onClick={() => setPrimary(idx)}
                      className="px-2 py-1 bg-white text-roar-graphite text-xs font-medium rounded-lg"
                    >
                      Principal
                    </button>
                  )}
                  <button
                    onClick={() => removeImage(idx)}
                    className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}

            {/* Upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-roar-orange hover:bg-roar-beige/40 transition-colors flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-roar-orange"
            >
              <Upload size={20} />
              <span className="text-xs font-medium">Subir</span>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => handleFileSelect(e.target.files)}
          />
          {images.length === 0 && (
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <ImageIcon size={13} /> Hacé click en "Subir" para agregar imágenes
            </p>
          )}
        </div>

        {/* Variantes */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-roar-graphite">Variantes (color + talle + stock)</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowColorForm(f => !f)}
                className="text-xs text-roar-sky hover:underline"
              >
                + Nuevo color
              </button>
              <button onClick={addVariant} className="btn-primary text-xs px-3 py-1.5 gap-1.5">
                <Plus size={13} /> Agregar variante
              </button>
            </div>
          </div>

          {/* New color form */}
          {showColorForm && (
            <div className="bg-roar-beige/40 rounded-xl p-4 mb-4 flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-roar-graphite mb-1">Nombre del color</label>
                <input
                  type="text"
                  value={newColorName}
                  onChange={e => setNewColorName(e.target.value)}
                  className="input text-sm"
                  placeholder="Ej: Azul marino"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-roar-graphite mb-1">Color</label>
                <input
                  type="color"
                  value={newColorHex}
                  onChange={e => setNewColorHex(e.target.value)}
                  className="h-10 w-16 rounded-lg border border-gray-200 cursor-pointer"
                />
              </div>
              <button
                onClick={handleAddColor}
                disabled={createColor.isPending}
                className="btn-primary text-xs px-4 py-2"
              >
                {createColor.isPending ? <Loader2 size={13} className="animate-spin" /> : 'Guardar'}
              </button>
              <button onClick={() => setShowColorForm(false)} className="p-2 text-gray-400 hover:text-roar-graphite">
                <X size={15} />
              </button>
            </div>
          )}

          {variants.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Sin variantes. Hacé click en "Agregar variante" para empezar.
            </p>
          ) : (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-400 uppercase px-2">
                <div className="col-span-4">Color</div>
                <div className="col-span-3">Talle</div>
                <div className="col-span-2">Stock</div>
                <div className="col-span-2">SKU</div>
                <div className="col-span-1" />
              </div>
              {variants.map(v => (
                <div key={v._key} className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-xl px-2 py-2">
                  <div className="col-span-4">
                    <select
                      value={v.color_id}
                      onChange={e => updateVariant(v._key, 'color_id', e.target.value)}
                      className="input text-sm py-1.5"
                    >
                      <option value="">Sin color</option>
                      {colors?.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <select
                      value={v.size_id}
                      onChange={e => updateVariant(v._key, 'size_id', e.target.value)}
                      className="input text-sm py-1.5"
                    >
                      <option value="">Sin talle</option>
                      {sizes?.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={v.stock}
                      onChange={e => updateVariant(v._key, 'stock', e.target.value)}
                      className="input text-sm py-1.5"
                      min="0"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={v.sku}
                      onChange={e => updateVariant(v._key, 'sku', e.target.value)}
                      className="input text-sm py-1.5 font-mono"
                      placeholder="Opcional"
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => removeVariant(v._key)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <button onClick={() => navigate('/admin/productos')} className="btn-ghost text-sm">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm px-8">
            {saving ? <Loader2 size={16} className="animate-spin" /> : isEdit ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </div>
    </div>
  )
}
