import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Geist, Geist_Mono, Source_Serif_4, Public_Sans } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Fonts for the physics-exam-papers design pilot (scoped via the .pe-redesign
// class in globals.css) -- Source Serif 4 for headings, Public Sans for body
// text. Declared here rather than a CSS @import so Next.js can self-host and
// optimize them, and exposed as CSS variables the same way the existing
// Geist fonts already are.
const sourceSerif = Source_Serif_4({
  variable: '--font-source-serif',
  subsets: ['latin'],
});

const publicSans = Public_Sans({
  variable: '--font-public-sans',
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
        className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} ${publicSans.variable} antialiased`}
      >
        {children}
      </body>
    </html></ClerkProvider>
  );
}
