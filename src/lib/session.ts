
import 'server-only';
import {SignJWT, jwtVerify} from 'jose';
import {cookies} from 'next/headers';
import type {User} from './types';

interface SessionPayload {
  user: Omit<User, 'password'>;
  expires: Date;
}

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({alg: 'HS256'})
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const {payload} = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as SessionPayload;
  } catch (error) {
    console.log('Failed to verify session');
    return null;
  }
}

export async function getSession() {
  const cookie = cookies().get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.user) {
    return null;
  }

  // Refresh the session so it doesn't expire
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  cookies().set('session', cookie!, {
    expires,
    httpOnly: true,
  });

  return session;
}
