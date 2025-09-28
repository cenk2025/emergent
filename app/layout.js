import { Inter, Poppins } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';
import './design-system.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'FoodAi.fi - Löydä parhaat ruokatarjoukset Suomessa',
  description: 'Vertaile ruokatarjouksia Woltista, Foodorasta ja ResQ Clubista. Säästä aikaa ja rahaa ruokaostoksissa.',
  keywords: 'ruokatarjoukset, alennus, wolt, foodora, resq club, ruoka, tilaus, säästö, helsinki, suomi',
  openGraph: {
    title: 'FoodAi.fi - Ruokatarjousten vertailupalvelu',
    description: 'Löydä parhaat ruokatarjoukset ja säästä rahaa tilauksissasi',
    type: 'website',
    locale: 'fi_FI',
  },
  alternates: {
    languages: {
      'fi': '/fi',
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