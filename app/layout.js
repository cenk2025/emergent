import { Inter, Poppins } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';
import './design-system.css';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins'
});

export const metadata = {
  title: 'FoodAi - Akıllı Yemek | Türkiye\'nin En İyi Yemek Fırsatları',
  description: 'Yemek siparişlerinde akıllı tasarruf! Wolt, Foodora ve ResQ Club\'dan en iyi fırsatları karşılaştır.',
  keywords: 'akıllı yemek, yemek fırsatları, indirim, wolt, foodora, resq club, yemek siparişi, tasarruf, türkiye',
  openGraph: {
    title: 'FoodAi - Akıllı Yemek Platformu',
    description: 'Yapay zeka destekli yemek fırsatlarını keşfet ve tasarruf et',
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
    <html lang="fi" suppressHydrationWarning>
      <body className={inter.className}>
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
      </body>
    </html>
  );
}