import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Source_Serif_4, Public_Sans } from 'next/font/google';
import './globals.css';

// Two families, each with one job: Source Serif 4 sets every heading, Public
// Sans does the interface work. Declared here rather than as a CSS @import so
// Next.js self-hosts them, and exposed as CSS variables.
//
// Geist and Geist Mono were also loaded here and were referenced nowhere in
// the stylesheet -- two families fetched on every page load for nothing.
const sourceSerif = Source_Serif_4({
  variable: '--font-source-serif',
  subsets: ['latin'],
});

const publicSans = Public_Sans({
  variable: '--font-public-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://studytrack.win'),
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
        className={`${sourceSerif.variable} ${publicSans.variable} antialiased`}
      >
        {children}
      </body>
    </html></ClerkProvider>
  );
}
