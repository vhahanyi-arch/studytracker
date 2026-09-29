import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SignInScreen } from '@/components/SignInScreen';

export const metadata: Metadata = { title: 'Sign in to StudyTrack' };

// Someone already signed in has nothing to do here; the portal is at /.
export default async function SignInPage() {
  const { userId } = await auth();
  if (userId) redirect('/');
  return (
    <main className="portal-app">
      <SignInScreen />
    </main>
  );
}
