import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Territorial.io',
  description:
    'Authentic full-screen Territorial.io game engine with complete deobfuscation, online multiplayer lobby, 24 maps, bot AI, and AI Gym RL training interface.',
  openGraph: {
    title: 'Territorial.io',
    description:
      'Authentic full-screen Territorial.io game engine with complete deobfuscation, online multiplayer lobby, 24 maps, bot AI, and AI Gym RL training interface.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Territorial.io',
    description:
      'Authentic full-screen Territorial.io game engine with complete deobfuscation, online multiplayer lobby, 24 maps, bot AI, and AI Gym RL training interface.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrainsMono.variable} dark`}>
      <body
        suppressHydrationWarning
        className="bg-black text-slate-100 font-sans antialiased overflow-hidden m-0 p-0 w-screen h-screen"
      >
        {children}
      </body>
    </html>
  );
}
