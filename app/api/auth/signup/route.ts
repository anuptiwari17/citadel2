// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'
import { generateMemberId } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fullName, email, phone, password, userType } = body

    // SRS: Only @nitj.ac.in allowed
    if (!email.toLowerCase().endsWith('@nitj.ac.in')) {
      return NextResponse.json(
        { success: false, error: 'Only NITJ email allowed (@nitj.ac.in)' },
        { status: 400 }
      )
    }

    // SRS Validation
    if (!fullName || !email || !phone || !password || !userType) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 })
    }

    if (!/^[a-zA-Z ]+$/.test(fullName)) {
      return NextResponse.json({ success: false, error: 'Name can only contain letters and spaces' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be 8+ characters' }, { status: 400 })
    }

    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json({ success: false, error: 'Phone must be 10 digits' }, { status: 400 })
    }

    const emailLower = email.toLowerCase().trim()

    // Check if email exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', emailLower)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 400 })
    }

    const memberId = await generateMemberId(supabase)
    const hash = await bcrypt.hash(password, 10)

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        member_id: memberId,
        full_name: fullName.trim(),
        email: emailLower,
        phone,
        password_hash: hash,
        user_type: userType,
        role: userType, // Student or Faculty
        is_active: true,
      })
      .select('member_id, email')
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      data: { memberId: user.member_id }
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { success: false, error: message || 'Server error' },
      { status: 500 }
    )
  }
}