import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'playlist-read-private',
  'playlist-read-collaborative',
].join(' ');

export function GET(request: NextRequest) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: 'SPOTIFY_CLIENT_ID is not configured.' },
      { status: 500 }
    );
  }

  const origin      = new URL(request.url).origin;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI ?? `${origin}/api/spotify/callback`;
  const state       = randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    client_id:     clientId,
    response_type: 'code',
    redirect_uri:  redirectUri,
    scope:         SCOPES,
    state,
  });

  const response = NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params}`
  );

  // Store state in an httpOnly cookie for CSRF verification in the callback
  response.cookies.set('spotify_auth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge:   600, // 10 minutes
    path:     '/',
  });

  return response;
}
