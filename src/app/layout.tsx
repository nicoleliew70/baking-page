import type { Metadata } from 'next';
import { Work_Sans } from 'next/font/google';
import './globals.css';

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Nicole's Baking Studio | Baking Classes in Sandakan, Sabah",
  description: 'Learn artisanal baking from Master Baker Nicole Liew. Hands-on baking classes for kids, teens & adults in Sandakan. Small group workshops with all materials included.',
  keywords: 'baking classes sandakan, baking workshop sabah, artisanal baking, dessert classes, baking lessons',
  authors: [{ name: 'Nicole Liew' }],
  creator: 'Nicole Liew',
  publisher: 'Nicole Baking Studio',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: 'https://nicolebaking.com',
  },
  openGraph: {
    type: 'website',
    locale: 'en_MY',
    url: 'https://nicolebaking.com',
    siteName: "Nicole's Baking Studio",
    title: "Nicole's Baking Studio | Baking Classes in Sandakan",
    description: 'Learn artisanal baking with expert guidance. Hands-on workshops for all skill levels.',
    images: [
      {
        url: 'https://nicolebaking.com/chef-nicole.webp',
        width: 1200,
        height: 630,
        alt: "Nicole's Baking Studio",
        type: 'image/webp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nicolebaking',
    creator: '@nicolebaking',
    title: "Nicole's Baking Studio | Baking Classes",
    description: 'Artisanal baking workshops in Sandakan',
    images: ['https://nicolebaking.com/chef-nicole.webp'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: "Nicole's Baking Studio",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://nicolebaking.com',
    name: "Nicole's Baking Studio",
    description: 'Master the art of artisanal baking with expert-led hands-on workshops',
    url: 'https://nicolebaking.com',
    telephone: '+60113384841 2',
    email: 'nicoleliew70@gmail.com',
    image: 'https://nicolebaking.com/chef-nicole.webp',
    priceRange: 'RM150-RM250',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Sandakan',
      addressLocality: 'Sandakan',
      addressRegion: 'Sabah',
      postalCode: '90000',
      addressCountry: 'MY',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '5.8320',
      longitude: '118.1087',
    },
    areaServed: 'Sandakan, Sabah, Malaysia',
    sameAs: [
      'https://wa.me/601133848412',
      'https://www.instagram.com/nicolebaking',
    ],
    serviceType: ['Baking Classes', 'Baking Workshops', 'Baking Experiences'],
    founder: {
      '@type': 'Person',
      name: 'Nicole Liew',
      jobTitle: 'Master Baker',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: "Nicole's Baking Studio",
    url: 'https://nicolebaking.com',
    logo: 'https://nicolebaking.com/logo.png',
    description: 'Artisanal baking workshops and classes',
    sameAs: [
      'https://wa.me/601133848412',
      'https://www.instagram.com/nicolebaking',
    ],
    contact: {
      '@type': 'ContactPoint',
      telephone: '+60113384841 2',
      email: 'nicoleliew70@gmail.com',
      contactType: 'Customer Service',
    },
  };

  return (
    <html lang="en" className={`scroll-smooth ${workSans.variable}`}>
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-2JYB7SHDXV"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-2JYB7SHDXV');
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
          suppressHydrationWarning
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          suppressHydrationWarning
        />
      </head>
      <body className="antialiased min-h-screen relative font-sans text-charcoal bg-cream selection:bg-primary/20">
        {children}
      </body>
    </html>
  );
}
