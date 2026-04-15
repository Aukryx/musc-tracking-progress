import type { Metadata, Viewport } from 'next';
import './globals.css';
import NavBar from '@/components/ui/NavBar';

export const metadata: Metadata = {
  title: 'MuscleTrack',
  description: 'Tracker de progression en musculation',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MuscleTrack',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="bg-black text-white antialiased" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <main className="pb-20">{children}</main>
        <NavBar />
      </body>
    </html>
  );
}
