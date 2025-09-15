
import {NextResponse} from 'next/server';
import {getSession} from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (session) {
      return NextResponse.json(session.user);
    }
    return NextResponse.json(null);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {error: 'An internal error occurred'},
      {status: 500}
    );
  }
}
