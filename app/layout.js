import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'FoodAi.fi - En İyi Yemek Fırsatları Türkiye',
  description: 'Yemeksepeti, Getir ve Trendyol Yemek\'teki indirimli teklifleri karşılaştır. Zamandan ve paradan tasarruf et.',
  keywords: 'yemek siparişi, indirim, yemeksepeti, getir yemek, trendyol yemek, yemek fırsatları, tasarruf, istanbul, ankara',
  openGraph: {
    title: 'FoodAi.fi - Yemek Tekliflerini Karşılaştırma Platformu',
    description: 'En iyi yemek fırsatlarını keşfet ve sipariş verirken tasarruf et',
    type: 'website',
    locale: 'tr_TR',
  },
  alternates: {
    languages: {
      'tr': '/tr',
      'en': '/en',
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}