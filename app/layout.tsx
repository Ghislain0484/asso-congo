import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AssoCongo — Plateforme de gestion des ONG au Congo',
  description:
    "AssoCongo est une plateforme 100% gratuite de gestion d'ONG et d'associations en République du Congo, alignée avec les missions de la DGIFN pour la transparence et l'inclusion financière.",
  openGraph: {
    title: 'AssoCongo',
    description: "La plateforme gratuite de gestion des ONG au Congo",
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
