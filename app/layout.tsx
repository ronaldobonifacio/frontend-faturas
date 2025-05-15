import '../styles/globals.css';
import { Metadata } from 'next';
import AuthProvider from '../context/AuthContext';

export const metadata: Metadata = {
  title: 'Faturas Dashboard',
  description: 'Gerencie suas faturas importadas e manuais',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}