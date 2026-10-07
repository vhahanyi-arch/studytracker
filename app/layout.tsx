import { THEME_BOOT } from '@/lib/theme';
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Archivo, Nunito, Red_Hat_Mono } from 'next/font/google';
import './globals.css';

// Two families, each with one job. Archivo does all the reading and the
// interface; its width axis gives the condensed, heavy heads of a divider
// tab without a third family. Red Hat Mono is kept for what is genuinely
// code or a figure: syllabus codes (0625, 8Ni.03), marks and counts.
// Declared here rather than as a CSS @import so Next.js self-hosts them,
// and exposed as CSS variables.
const archivo = Archivo({
  variable: '--font-sans',
  subsets: ['latin'],
  axes: ['wdth'],
});

// Figures (counts, scores, percentages, syllabus codes) are set in Nunito's
// heaviest weights: bold, rounded numerals with some warmth in them, where a
// mono read as a machine's output.
const nunito = Nunito({
  variable: '--font-figures',
  subsets: ['latin'],
});

const redHatMono = Red_Hat_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://studytrack.win'),
  title: 'StudyTrack — Cambridge Learner Planner',
  description: 'A focused task and progress tracker for Cambridge Lower Secondary, IGCSE and AS Level Mathematics and Physics.',
  openGraph: {
    title: 'StudyTrack — Cambridge Learner Planner',
    description: 'Plan and track Cambridge Mathematics and Physics study tasks from Lower Secondary through AS Level.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudyTrack — Cambridge Learner Planner',
    description: 'Plan and track Cambridge Mathematics and Physics study tasks from Lower Secondary through AS Level.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Clerk renders the sign-in form itself, so without this it arrives in
    // stock Clerk colours beside a page that is not. These variables are the
    // app's own, so the form reads as part of the product rather than a
    // widget dropped into it.
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#1d2125',
          colorText: '#17212e',
          colorTextSecondary: '#5b6472',
          colorBackground: '#ffffff',
          borderRadius: '4px',
          fontSize: '16px',
          fontFamily: 'var(--font-sans), Arial, sans-serif',
        },
        // A flat leaf like every other in the app, not a floating card.
        elements: {
          cardBox: { boxShadow: 'none', border: '1px solid #dde3ea', borderRadius: '4px' },
          card: { boxShadow: 'none', borderRadius: '4px' },
          headerTitle: { fontWeight: 800, fontStretch: '85%', fontSize: '22px' },
          formButtonPrimary: { boxShadow: 'none', backgroundImage: 'none', borderRadius: '4px', fontWeight: 700 },
          buttonArrowIcon: { display: 'none' },
          socialButtonsBlockButton: { borderRadius: '4px', boxShadow: 'none' },
          formFieldInput: { borderRadius: '4px' },
          footer: { background: '#f1f3f2', backgroundImage: 'none' },
        },
      }}
      // The Clerk dashboard's application name reads "Studytracker"; the
      // product's name is set here so the form says it whatever that holds.
      localization={{
        signIn: {
          start: {
            title: 'Sign in to StudyTrack',
          },
        },
      }}
    >{/* suppressHydrationWarning: THEME_BOOT sets data-theme before React loads. */}
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body
        className={`${archivo.variable} ${nunito.variable} ${redHatMono.variable} antialiased`}
      >
        {children}
      </body>
    </html></ClerkProvider>
  );
}
