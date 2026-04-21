import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.delete('kb-auth');
  response.cookies.delete('kb-refresh');

  return response;
}
