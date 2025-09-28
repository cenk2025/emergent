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
  title: 'FoodAi - Älykkäät ruokatarjoukset Suomesta',
  description: 'Löydä parhaat ruokatarjoukset Woltista, Foodorasta, ResQ Clubista ja muista palveluista. Säästä aikaa ja rahaa.',
  keywords: 'ruokatarjoukset, alennus, wolt, foodora, resq club, kotipizza, k-ruoka, fiksuruoka, helsinki, suomi',
  openGraph: {
    title: 'FoodAi - Älykkäät ruokatarjoukset',
    description: 'AI-pohjainen ruokatarjousten vertailupalvelu Suomessa',
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
      <body className={`${inter.className} ${poppins.variable}`}>
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