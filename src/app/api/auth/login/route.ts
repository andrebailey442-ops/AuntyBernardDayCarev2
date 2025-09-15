
import {NextResponse} from 'next/server';
import {authenticateUser} from '@/services/users';
import {encrypt} from '@/lib/session';
import {cookies} from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {username, password} = body;

    const user = await authenticateUser(username, password);

    if (!user) {
      return NextResponse.json({error: 'Invalid credentials'}, {status: 401});
    }

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const session = await encrypt({user, expires});

    cookies().set('session', session, {expires, httpOnly: true});

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {error: 'An internal error occurred'},
      {status: 500}
    );
  }
}
