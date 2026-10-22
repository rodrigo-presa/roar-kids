import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Size } from '../types'

export function useSizes() {
  return useQuery({
    queryKey: ['sizes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sizes')
        .select('*')
        .order('sort_order')
      if (error) throw error
      return data as Size[]
    },
  })
}
