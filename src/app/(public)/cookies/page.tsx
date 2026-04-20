"use client";

import { useLocale } from "next-intl";
import { LegalLayout } from "@/components/lp/LegalLayout";

export default function CookiesPage() {
  const locale = useLocale();

  const content = {
    pt: {
      title: "Política de Cookies",
      lastUpdated: "Última atualização: 14 de Abril de 2026",
      backLabel: "Voltar ao site",
      body: (
        <>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-8">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Versão draft beta.</strong> Este documento será revisto por advogado antes do lançamento comercial.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">1. O Que são Cookies?</h2>
            <p>
              Cookies são pequenos ficheiros de texto armazenados no seu dispositivo (computador, tablet, telemóvel) quando visita um website. São utilizados para recordar preferências, manter sessões ativas e analisar como usa a plataforma. Os cookies não contêm vírus e não podem ser executados como programas.
            </p>
            <p className="mt-3">
              Existem dois tipos principais: cookies de "sessão" (eliminados quando fecha o navegador) e cookies "persistentes" (mantidos até à data de expiração).
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">2. Cookies Que Utilizamos</h2>
            <div className="space-y-4 mt-3">
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-stone-900">2.1 Cookies Essenciais</h3>
                <p className="mt-2 text-stone-700">
                  <strong>Sem consentimento prévio.</strong> Estes cookies são necessários para o Serviço funcionar. Incluem autenticação, tokens de segurança e informações de sessão.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-stone-700">
                  <li><strong>sb-auth-token:</strong> Autenticação Supabase (sessão ativa)</li>
                  <li><strong>CSRF-token:</strong> Proteção contra cross-site request forgery</li>
                  <li><strong>session-id:</strong> Identificador de sessão (expires ao fechar navegador)</li>
                </ul>
                <p className="mt-2 text-sm text-stone-600">Prazo de expiração: Sessão ou 24-48 horas.</p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-stone-900">2.2 Cookies Funcionais</h3>
                <p className="mt-2 text-stone-700">
                  <strong>Sem consentimento prévio.</strong> Melhoram a funcionalidade e a experiência do utilizador, recordando preferências.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-stone-700">
                  <li><strong>NEXT_LOCALE:</strong> Lembra o idioma que escolheu (PT, EN, ES)</li>
                </ul>
                <p className="mt-2 text-sm text-stone-600">Prazo de expiração: 1 ano.</p>
              </div>

              <div className="border-l-4 border-amber-500 pl-4">
                <h3 className="font-semibold text-stone-900">2.3 Cookies Analíticos</h3>
                <p className="mt-2 text-stone-700">
                  <strong>Requer consentimento explícito.</strong> Permitem-nos entender como a plataforma é utilizada (páginas visitadas, tempo gasto, ações realizadas) para melhorar o Serviço.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-stone-700">
                  <li><strong>Plausible Analytics:</strong> Quando configurado (dados agregados, sem rastreamento entre sites)</li>
                  <li><strong>PostHog:</strong> Alternativa para análise de funcionalidades e comportamento de utilizador</li>
                </ul>
                <p className="mt-2 text-sm text-stone-600">Prazo de expiração: 12 meses. Dados são anónimos quando possível.</p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-stone-900">2.4 Cookies de Performance e Erro</h3>
                <p className="mt-2 text-stone-700">
                  <strong>Requer consentimento explícito.</strong> Monitoram erros e performance para garantir estabilidade.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-stone-700">
                  <li><strong>Sentry Cookies:</strong> Rastreamento de erros e performance (dados técnicos, sem informação pessoal direta)</li>
                </ul>
                <p className="mt-2 text-sm text-stone-600">Prazo de expiração: 12 meses.</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">3. Como Gerir Cookies</h2>
            <div className="space-y-3 mt-3">
              <div>
                <p><strong>3.1 Desativar Cookies Não-Essenciais:</strong></p>
                <p className="mt-2 text-stone-700">
                  Pode desativar cookies analíticos e de performance nas definições de privacidade do seu navegador. Cookies essenciais continuarão ativos (necessários para o Serviço funcionar).
                </p>
              </div>
              <div>
                <p><strong>3.2 Controlar por Navegador:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-stone-700">
                  <li><strong>Chrome:</strong> Definições &gt; Privacidade e segurança &gt; Cookies e dados de sites</li>
                  <li><strong>Firefox:</strong> Preferências &gt; Privacidade &amp; Segurança &gt; Cookies e dados de sites</li>
                  <li><strong>Safari:</strong> Preferências &gt; Privacidade &gt; Cookies e dados de sites</li>
                  <li><strong>Edge:</strong> Definições &gt; Privacidade &gt; Cookies e dados de sites</li>
                </ul>
              </div>
              <div>
                <p><strong>3.2 Eliminar Cookies Existentes:</strong></p>
                <p className="mt-2 text-stone-700">
                  Pode eliminar cookies armazenados a qualquer momento através das definições do seu navegador. Se eliminar cookies essenciais, terá de fazer login novamente.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">4. Cookies de Terceiros</h2>
            <p>
              O Serviço Shiftera utiliza cookies de terceiros apenas para funcionalidade essencial:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-3 text-stone-700">
              <li><strong>Supabase Auth Cookies:</strong> Para autenticação e manutenção de sessão</li>
              <li><strong>Vercel Cookies:</strong> Para otimização de CDN e performance (opcional)</li>
            </ul>
            <p className="mt-3">
              Não compartilhamos dados de cookies com anunciantes ou redes publicitárias.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">5. Consentimento e Aviso Prévio</h2>
            <p>
              Shiftera implementa consentimento granular para cookies:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-3 text-stone-700">
              <li><strong>Cookies Essenciais:</strong> Ativadas por padrão (sem aviso; necessárias para funcionar)</li>
              <li><strong>Cookies Não-Essenciais:</strong> Requerem consentimento explícito antes de serem ativadas</li>
            </ul>
            <p className="mt-3">
              Quando visita Shiftera pela primeira vez (se ainda não aceitou), será apresentada uma notificação sobre cookies. Pode aceitar todos ou gerir preferências individualmente.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">6. Direito ao Recusa e Alterações</h2>
            <p>
              Tem o direito de recusar ou revogar o consentimento para cookies não-essenciais a qualquer momento. Para revogar consentimento:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-3 text-stone-700">
              <li>Contacte-nos em privacy@shiftera.app</li>
              <li>Ou altere as definições de cookies no seu navegador</li>
            </ul>
            <p className="mt-3">
              Podemos atualizar esta Política de Cookies periodicamente. Qualquer alteração será notificada por email (para mudanças substanciais) ou publicada aqui.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">7. Contacto</h2>
            <p>
              Para questões sobre cookies ou para gerir preferências:
            </p>
            <div className="mt-3 space-y-2 text-stone-600">
              <p>
                Email: <a href="mailto:privacy@shiftera.app" className="text-blue-600 hover:underline">privacy@shiftera.app</a>
              </p>
              <p>
                Website: <a href="https://shiftera.app" className="text-blue-600 hover:underline">shiftera.app</a>
              </p>
            </div>
          </div>

          <div className="bg-stone-50 rounded-lg p-6 mt-8 border border-stone-200">
            <p className="text-sm text-stone-600">
              <strong>Nota Importante:</strong> Esta Política de Cookies complementa a nossa <a href="/privacy" className="text-blue-600 hover:underline">Política de Privacidade</a>. Para informações completas sobre tratamento de dados, consulte esse documento.
            </p>
          </div>
        </>
      ),
    },
    en: {
      title: "Cookie Policy",
      lastUpdated: "Last updated: April 14, 2026",
      backLabel: "Back to site",
      body: (
        <>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-8">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Beta draft.</strong> This document will be reviewed by counsel before commercial launch.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">1. What are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device (computer, tablet, mobile) when you visit a website. They are used to remember preferences, keep sessions active, and analyze how you use the platform. Cookies do not contain viruses and cannot be executed as programs.
            </p>
            <p className="mt-3">
              There are two main types: "session" cookies (deleted when you close the browser) and "persistent" cookies (kept until their expiration date).
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">2. Cookies We Use</h2>
            <div className="space-y-4 mt-3">
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-stone-900">2.1 Essential Cookies</h3>
                <p className="mt-2 text-stone-700">
                  <strong>No prior consent required.</strong> These cookies are necessary for the Service to function. They include authentication, security tokens, and session information.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-stone-700">
                  <li><strong>sb-auth-token:</strong> Supabase authentication (active session)</li>
                  <li><strong>CSRF-token:</strong> Cross-site request forgery protection</li>
                  <li><strong>session-id:</strong> Session identifier (expires when closing browser)</li>
                </ul>
                <p className="mt-2 text-sm text-stone-600">Expiration: Session or 24-48 hours.</p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-stone-900">2.2 Functional Cookies</h3>
                <p className="mt-2 text-stone-700">
                  <strong>No prior consent required.</strong> Enhance functionality and user experience by remembering preferences.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-stone-700">
                  <li><strong>NEXT_LOCALE:</strong> Remembers your chosen language (PT, EN, ES)</li>
                </ul>
                <p className="mt-2 text-sm text-stone-600">Expiration: 1 year.</p>
              </div>

              <div className="border-l-4 border-amber-500 pl-4">
                <h3 className="font-semibold text-stone-900">2.3 Analytics Cookies</h3>
                <p className="mt-2 text-stone-700">
                  <strong>Requires explicit consent.</strong> Allow us to understand how the platform is used (pages visited, time spent, actions taken) to improve the Service.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-stone-700">
                  <li><strong>Plausible Analytics:</strong> When configured (aggregated data, no cross-site tracking)</li>
                  <li><strong>PostHog:</strong> Alternative for feature analysis and user behavior insights</li>
                </ul>
                <p className="mt-2 text-sm text-stone-600">Expiration: 12 months. Data is anonymized when possible.</p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-stone-900">2.4 Performance and Error Cookies</h3>
                <p className="mt-2 text-stone-700">
                  <strong>Requires explicit consent.</strong> Monitor errors and performance to ensure stability.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-stone-700">
                  <li><strong>Sentry Cookies:</strong> Error tracking and performance monitoring (technical data, no direct personal information)</li>
                </ul>
                <p className="mt-2 text-sm text-stone-600">Expiration: 12 months.</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">3. How to Manage Cookies</h2>
            <div className="space-y-3 mt-3">
              <div>
                <p><strong>3.1 Disable Non-Essential Cookies:</strong></p>
                <p className="mt-2 text-stone-700">
                  You can disable analytics and performance cookies in your browser's privacy settings. Essential cookies will remain active (required for the Service to function).
                </p>
              </div>
              <div>
                <p><strong>3.2 Control by Browser:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-stone-700">
                  <li><strong>Chrome:</strong> Settings &gt; Privacy and security &gt; Cookies and site data</li>
                  <li><strong>Firefox:</strong> Preferences &gt; Privacy &amp; Security &gt; Cookies and site data</li>
                  <li><strong>Safari:</strong> Preferences &gt; Privacy &gt; Cookies and site data</li>
                  <li><strong>Edge:</strong> Settings &gt; Privacy &gt; Cookies and site data</li>
                </ul>
              </div>
              <div>
                <p><strong>3.3 Delete Existing Cookies:</strong></p>
                <p className="mt-2 text-stone-700">
                  You can delete stored cookies at any time through your browser settings. If you delete essential cookies, you will need to log in again.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">4. Third-Party Cookies</h2>
            <p>
              Shiftera uses third-party cookies only for essential functionality:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-3 text-stone-700">
              <li><strong>Supabase Auth Cookies:</strong> For authentication and session maintenance</li>
              <li><strong>Vercel Cookies:</strong> For CDN optimization and performance (optional)</li>
            </ul>
            <p className="mt-3">
              We do not share cookie data with advertisers or ad networks.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">5. Consent and Prior Notice</h2>
            <p>
              Shiftera implements granular consent for cookies:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-3 text-stone-700">
              <li><strong>Essential Cookies:</strong> Enabled by default (no notice; required to function)</li>
              <li><strong>Non-Essential Cookies:</strong> Require explicit consent before activation</li>
            </ul>
            <p className="mt-3">
              When you first visit Shiftera (if you haven't accepted yet), a cookie notification will be displayed. You can accept all or manage preferences individually.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">6. Right to Refuse and Changes</h2>
            <p>
              You have the right to refuse or revoke consent for non-essential cookies at any time. To revoke consent:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-3 text-stone-700">
              <li>Contact us at privacy@shiftera.app</li>
              <li>Or change the cookie settings in your browser</li>
            </ul>
            <p className="mt-3">
              We may update this Cookie Policy periodically. Any changes will be notified by email (for material changes) or posted here.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">7. Contact</h2>
            <p>
              For questions about cookies or to manage preferences:
            </p>
            <div className="mt-3 space-y-2 text-stone-600">
              <p>
                Email: <a href="mailto:privacy@shiftera.app" className="text-blue-600 hover:underline">privacy@shiftera.app</a>
              </p>
              <p>
                Website: <a href="https://shiftera.app" className="text-blue-600 hover:underline">shiftera.app</a>
              </p>
            </div>
          </div>

          <div className="bg-stone-50 rounded-lg p-6 mt-8 border border-stone-200">
            <p className="text-sm text-stone-600">
              <strong>Important Note:</strong> This Cookie Policy complements our <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>. For complete information about data processing, please see that document.
            </p>
          </div>
        </>
      ),
    },
    es: {
      title: "Política de Cookies",
      lastUpdated: "Última actualización: 14 de abril de 2026",
      backLabel: "Volver al sitio",
      body: (
        <>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-8">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Borrador beta.</strong> Este documento será revisado por un abogado antes del lanzamiento comercial.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">1. ¿Qué son las Cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto almacenados en su dispositivo (computadora, tableta, móvil) cuando visita un sitio web. Se utilizan para recordar preferencias, mantener sesiones activas y analizar cómo utiliza la plataforma. Las cookies no contienen virus y no pueden ejecutarse como programas.
            </p>
            <p className="mt-3">
              Hay dos tipos principales: cookies de "sesión" (eliminadas al cerrar el navegador) y cookies "persistentes" (mantenidas hasta su fecha de caducidad).
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">2. Cookies que Utilizamos</h2>
            <div className="space-y-4 mt-3">
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-stone-900">2.1 Cookies Esenciales</h3>
                <p className="mt-2 text-stone-700">
                  <strong>Sin consentimiento previo requerido.</strong> Estas cookies son necesarias para que el Servicio funcione. Incluyen autenticación, tokens de seguridad e información de sesión.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-stone-700">
                  <li><strong>sb-auth-token:</strong> Autenticación Supabase (sesión activa)</li>
                  <li><strong>CSRF-token:</strong> Protección contra falsificación de solicitud entre sitios</li>
                  <li><strong>session-id:</strong> Identificador de sesión (caduca al cerrar navegador)</li>
                </ul>
                <p className="mt-2 text-sm text-stone-600">Caducidad: Sesión o 24-48 horas.</p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-stone-900">2.2 Cookies Funcionales</h3>
                <p className="mt-2 text-stone-700">
                  <strong>Sin consentimiento previo requerido.</strong> Mejoran la funcionalidad y la experiencia del usuario al recordar preferencias.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-stone-700">
                  <li><strong>NEXT_LOCALE:</strong> Recuerda su idioma elegido (PT, EN, ES)</li>
                </ul>
                <p className="mt-2 text-sm text-stone-600">Caducidad: 1 año.</p>
              </div>

              <div className="border-l-4 border-amber-500 pl-4">
                <h3 className="font-semibold text-stone-900">2.3 Cookies Analíticas</h3>
                <p className="mt-2 text-stone-700">
                  <strong>Requiere consentimiento explícito.</strong> Nos permiten entender cómo se utiliza la plataforma (páginas visitadas, tiempo invertido, acciones realizadas) para mejorar el Servicio.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-stone-700">
                  <li><strong>Plausible Analytics:</strong> Cuando se configura (datos agregados, sin seguimiento entre sitios)</li>
                  <li><strong>PostHog:</strong> Alternativa para análisis de funciones e información de comportamiento del usuario</li>
                </ul>
                <p className="mt-2 text-sm text-stone-600">Caducidad: 12 meses. Los datos se anonimizan cuando es posible.</p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-stone-900">2.4 Cookies de Rendimiento y Error</h3>
                <p className="mt-2 text-stone-700">
                  <strong>Requiere consentimiento explícito.</strong> Monitorean errores y rendimiento para garantizar estabilidad.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-stone-700">
                  <li><strong>Sentry Cookies:</strong> Seguimiento de errores y monitoreo de rendimiento (datos técnicos, sin información personal directa)</li>
                </ul>
                <p className="mt-2 text-sm text-stone-600">Caducidad: 12 meses.</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">3. Cómo Gestionar Cookies</h2>
            <div className="space-y-3 mt-3">
              <div>
                <p><strong>3.1 Desactivar Cookies No Esenciales:</strong></p>
                <p className="mt-2 text-stone-700">
                  Puede desactivar cookies analíticas y de rendimiento en la configuración de privacidad de su navegador. Las cookies esenciales permanecerán activas (necesarias para que el Servicio funcione).
                </p>
              </div>
              <div>
                <p><strong>3.2 Controlar por Navegador:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-stone-700">
                  <li><strong>Chrome:</strong> Configuración &gt; Privacidad y seguridad &gt; Cookies y datos de sitios</li>
                  <li><strong>Firefox:</strong> Preferencias &gt; Privacidad y Seguridad &gt; Cookies y datos de sitios</li>
                  <li><strong>Safari:</strong> Preferencias &gt; Privacidad &gt; Cookies y datos de sitios</li>
                  <li><strong>Edge:</strong> Configuración &gt; Privacidad &gt; Cookies y datos de sitios</li>
                </ul>
              </div>
              <div>
                <p><strong>3.3 Eliminar Cookies Existentes:</strong></p>
                <p className="mt-2 text-stone-700">
                  Puede eliminar cookies almacenadas en cualquier momento a través de la configuración de su navegador. Si elimina cookies esenciales, deberá volver a iniciar sesión.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">4. Cookies de Terceros</h2>
            <p>
              Shiftera utiliza cookies de terceros solo para funcionalidad esencial:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-3 text-stone-700">
              <li><strong>Supabase Auth Cookies:</strong> Para autenticación y mantenimiento de sesión</li>
              <li><strong>Vercel Cookies:</strong> Para optimización de CDN y rendimiento (opcional)</li>
            </ul>
            <p className="mt-3">
              No compartimos datos de cookies con publicistas o redes publicitarias.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">5. Consentimiento y Aviso Previo</h2>
            <p>
              Shiftera implementa consentimiento granular para cookies:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-3 text-stone-700">
              <li><strong>Cookies Esenciales:</strong> Habilitadas por defecto (sin aviso; necesarias para funcionar)</li>
              <li><strong>Cookies No Esenciales:</strong> Requieren consentimiento explícito antes de la activación</li>
            </ul>
            <p className="mt-3">
              Cuando visita Shiftera por primera vez (si aún no ha aceptado), se mostrará una notificación sobre cookies. Puede aceptar todo o gestionar preferencias individualmente.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">6. Derecho a Rechazar y Cambios</h2>
            <p>
              Tiene derecho a rechazar o revocar el consentimiento para cookies no esenciales en cualquier momento. Para revocar el consentimiento:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-3 text-stone-700">
              <li>Contáctenos en privacy@shiftera.app</li>
              <li>O cambie la configuración de cookies en su navegador</li>
            </ul>
            <p className="mt-3">
              Podemos actualizar esta Política de Cookies periódicamente. Cualquier cambio se notificará por correo electrónico (para cambios sustanciales) o se publicará aquí.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">7. Contacto</h2>
            <p>
              Para preguntas sobre cookies o para gestionar preferencias:
            </p>
            <div className="mt-3 space-y-2 text-stone-600">
              <p>
                Correo Electrónico: <a href="mailto:privacy@shiftera.app" className="text-blue-600 hover:underline">privacy@shiftera.app</a>
              </p>
              <p>
                Sitio Web: <a href="https://shiftera.app" className="text-blue-600 hover:underline">shiftera.app</a>
              </p>
            </div>
          </div>

          <div className="bg-stone-50 rounded-lg p-6 mt-8 border border-stone-200">
            <p className="text-sm text-stone-600">
              <strong>Nota Importante:</strong> Esta Política de Cookies complementa nuestra <a href="/privacy" className="text-blue-600 hover:underline">Política de Privacidad</a>. Para información completa sobre el procesamiento de datos, consulte ese documento.
            </p>
          </div>
        </>
      ),
    },
  } as const;

  const c = content[locale as keyof typeof content] || content.pt;
  return (
    <LegalLayout title={c.title} lastUpdated={c.lastUpdated} backLabel={c.backLabel}>
      {c.body}
    </LegalLayout>
  );
}
