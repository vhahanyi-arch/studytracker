import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://studytrack-cambridge-planner.vhahanyi.chatgpt.site'),
  title: 'StudyTrack — Cambridge Learner Planner',
  description: 'A focused task and progress tracker for Cambridge Lower Secondary, IGCSE and AS Level Mathematics and Physics.',
  openGraph: {
    title: 'StudyTrack — Cambridge Learner Planner',
    description: 'Plan and track Cambridge Mathematics and Physics study tasks from Lower Secondary through AS Level.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudyTrack — Cambridge Learner Planner',
    description: 'Plan and track Cambridge Mathematics and Physics study tasks from Lower Secondary through AS Level.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider><html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html></ClerkProvider>
  );
}
