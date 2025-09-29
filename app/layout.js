import { Inter, DM_Serif_Display } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';
import './design-system.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
});

const dmSerif = DM_Serif_Display({ 
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-serif',
  display: 'swap'
});

export const metadata = {
  metadataBase: new URL('https://foodai.fi'),
  title: {
    default: 'FoodAi - Älykkäät ruokatarjoukset Suomesta | AI-pohjainen ruokavertailu',
    template: '%s | FoodAi'
  },
  description: 'Löydä parhaat ruokatarjoukset Woltista, Foodorasta, ResQ Clubista, Kotipizzasta, K-Ruoasta ja Fiksuruoasta. Säästä aikaa ja rahaa AI:n avulla. Vertaile hintoja ja nauti alennuksista.',
  keywords: [
    'ruokatarjoukset',
    'ruoka-alennus', 
    'wolt tarjoukset',
    'foodora alennukset',
    'resq club',
    'kotipizza tarjoukset',
    'k-ruoka alennus',
    'fiksuruoka',
    'ruoan tilaus',
    'ruokavertailu',
    'AI ruokasuositukset',
    'helsinki ruoka',
    'tampere ruoka',
    'turku ruoka',
    'oulu ruoka',
    'suomi ruokapalvelut',
    'tekoäly ruoka',
    'säästä ruokaostoksissa'
  ].join(', '),
  authors: [{ name: 'FoodAi Team' }],
  creator: 'FoodAi',
  publisher: 'FoodAi',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fi_FI',
    url: 'https://foodai.fi',
    siteName: 'FoodAi',
    title: 'FoodAi - Älykkäät ruokatarjoukset Suomesta',
    description: 'AI-pohjainen ruokatarjousten vertailupalvelu. Löydä parhaat tarjoukset Woltista, Foodorasta ja muista palveluista.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FoodAi - Älykkäät ruokatarjoukset',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FoodAi - Älykkäät ruokatarjoukset Suomesta',
    description: 'Löydä parhaat ruokatarjoukset AI:n avulla. Vertaile hintoja ja säästä rahaa.',
    images: ['/og-image.jpg'],
    creator: '@foodai_fi',
  },
  alternates: {
    canonical: 'https://foodai.fi',
    languages: {
      'fi': 'https://foodai.fi',
      'en': 'https://foodai.fi/en',
    },
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
  },
  category: 'food',
  classification: 'Business',
  other: {
    'fb:app_id': '123456789012345',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'theme-color': '#FFB000',
    'msapplication-TileColor': '#FFB000',
    'application-name': 'FoodAi',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fi" suppressHydrationWarning>
      <body className={`${inter.variable} ${dmSerif.variable} font-sans`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="top-right" />
          </ThemeProvider>
        </AuthProvider>
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "FoodAi",
              "alternateName": "FoodAi - Älykkäät ruokatarjoukset",
              "url": "https://foodai.fi",
              "description": "AI-pohjainen ruokatarjousten vertailupalvelu Suomessa. Löydä parhaat tarjoukset Woltista, Foodorasta, ResQ Clubista ja muista palveluista.",
              "applicationCategory": "Food & Drink",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "category": "Food Delivery Comparison",
                "availability": "https://schema.org/InStock"
              },
              "creator": {
                "@type": "Organization",
                "name": "FoodAi",
                "url": "https://foodai.fi",
                "contactPoint": {
                  "@type": "ContactPoint",
                  "telephone": "+358-40-123-4567",
                  "contactType": "Customer Service",
                  "email": "info@foodai.fi",
                  "availableLanguage": ["Finnish", "English"]
                },
                "address": {
                  "@type": "PostalAddress",
                  "addressCountry": "FI",
                  "addressLocality": "Helsinki"
                }
              },
              "serviceArea": {
                "@type": "Country",
                "name": "Finland"
              },
              "inLanguage": ["fi", "en"],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "1247",
                "bestRating": "5",
                "worstRating": "1"
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://foodai.fi/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </body>
    </html>
  );
}