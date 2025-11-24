import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));

  // remove auth cookie
  response.cookies.set('citadel-auth', '', { expires: new Date(0) });

  return response;
}
