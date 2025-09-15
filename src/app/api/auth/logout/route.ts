
import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';

export async function POST() {
  try {
    cookies().set('session', '', {expires: new Date(0)});
    return NextResponse.json({message: 'Logged out successfully'});
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {error: 'An internal error occurred'},
      {status: 500}
    );
  }
}
