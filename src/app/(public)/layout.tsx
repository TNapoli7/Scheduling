import { ReactNode } from 'react';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

export const metadata = {
  title: 'Shiftera',
  description: 'Gestão de escalas para farmácias, clínicas e laboratórios em Portugal',
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation - simple for public pages */}
      <nav className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-600">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-stone-900">Shiftera</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            Voltar ao site
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-stone-50 border-t border-stone-200 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-600">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-stone-900">Shiftera</span>
              </div>
              <p className="text-sm text-stone-600">
                Gestão de escalas para farmácias, clínicas e laboratórios em Portugal.
              </p>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-sm font-semibold text-stone-900 mb-4">Produto</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-stone-600 hover:text-stone-900 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <a href="/#features" className="text-stone-600 hover:text-stone-900 transition-colors">
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a href="/#pricing" className="text-stone-600 hover:text-stone-900 transition-colors">
                    Preços
                  </a>
                </li>
                <li>
                  <a href="/#faq" className="text-stone-600 hover:text-stone-900 transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-stone-900 mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/terms" className="text-stone-600 hover:text-stone-900 transition-colors">
                    Termos e Condições
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-stone-600 hover:text-stone-900 transition-colors">
                    Política de Privacidade
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-semibold text-stone-900 mb-4">Contacto</h3>
              <ul className="space-y-2 text-sm text-stone-600">
                <li>
                  <a href="mailto:support@shiftera.app" className="hover:text-stone-900 transition-colors">
                    support@shiftera.app
                  </a>
                </li>
                <li>
                  <a href="https://shiftera.app" className="hover:text-stone-900 transition-colors">
                    shiftera.app
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom footer */}
          <div className="border-t border-stone-200 pt-8 text-center text-sm text-stone-500">
            <p>© {currentYear} Shiftera. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
