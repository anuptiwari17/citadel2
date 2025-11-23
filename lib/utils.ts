// lib/utils.ts
import { SupabaseClient } from '@supabase/supabase-js'

interface UserRow {
  member_id: string
}

export async function generateMemberId(supabase: SupabaseClient): Promise<string> {
  const year = new Date().getFullYear()

  const { data, error } = await supabase
    .from('users')
    .select('member_id')
    .like('member_id', `MEM-${year}-%`)
    .order('member_id', { ascending: false })
    .limit(1)

  if (error) throw error

  let nextNum = 1
  if (data && data.length > 0 && data[0].member_id) {
    const lastId = data[0].member_id // e.g., MEM-2025-0005
    const lastNum = parseInt(lastId.split('-')[2])
    if (!isNaN(lastNum)) nextNum = lastNum + 1
  }

  return `MEM-${year}-${String(nextNum).padStart(4, '0')}`
}