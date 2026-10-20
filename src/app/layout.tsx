import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Flick Media | Custom Form Builder & Applicant Operations',
  description:
    'Create custom forms, track artist & crew applications, sort entries, and manage submissions with Google Forms & Docs ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-rose-500 selection:text-white">
        <div className="relative min-h-screen flex flex-col">
          {/* Subtle background ambient glow */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-rose-600/10 blur-[130px] rounded-full" />
            <div className="absolute top-20 right-1/4 w-[400px] h-[300px] bg-indigo-600/10 blur-[130px] rounded-full" />
          </div>

          <AuthProvider>
            <Navbar />
            <main className="flex-1 relative z-10">{children}</main>
          </AuthProvider>

          <footer className="relative z-10 border-t border-hairline bg-studio-950 py-5 text-center text-xs text-studio-500">
            <div className="max-w-[1400px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[11px]">
              <p>FLICK MEDIA OPERATIONS • FORM INTAKE ENGINE • BUILDWITHREX.ME</p>
              <p className="text-studio-600">FORMS.BUILDWITHREX.ME • PANEL.BUILDWITHREX.ME</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
