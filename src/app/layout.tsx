import type { Metadata } from 'next';
import { Work_Sans } from 'next/font/google';
import './globals.css';

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Nicole's Baking Studio | Sandakan, Sabah",
  description: 'Master the art of flour with our hands-on artisanal workshops.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${workSans.variable}`}>
      <body className="antialiased min-h-screen relative font-sans text-charcoal bg-cream selection:bg-primary/20">
        {children}
      </body>
    </html>
  );
}
