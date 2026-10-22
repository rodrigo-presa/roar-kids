import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Color } from '../types'

export function useColors() {
  return useQuery({
    queryKey: ['colors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('colors')
        .select('*')
        .order('name')
      if (error) throw error
      return data as Color[]
    },
  })
}

export function useCreateColor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, hex_code }: { name: string; hex_code: string }) => {
      const { data, error } = await supabase
        .from('colors')
        .insert({ name, hex_code })
        .select()
        .single()
      if (error) throw error
      return data as Color
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['colors'] }),
  })
}
