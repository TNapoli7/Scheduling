'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-white">
      {/* Header with back button */}
      <div className="bg-stone-50 border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao site
          </Link>
          <h1 className="text-3xl font-bold text-stone-900">Política de Privacidade</h1>
          <p className="text-stone-500 mt-2">Última atualização: {new Date().toLocaleDateString('pt-PT')}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-sm max-w-none space-y-6 text-stone-700">

          {/* Section 1 */}
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">1. Controlador de Dados</h2>
            <p>
              A Shiftera ("Controlador") é responsável pelo processamento dos seus dados pessoais em conformidade com o Regulamento Geral de Proteção de Dados (RGPD - Regulamento UE 2016/679).
            </p>
            <div className="mt-3 space-y-1 text-stone-600">
              <p><strong>Shiftera</strong></p>
              <p>Email: <a href="mailto:dpo@shiftera.app" className="text-blue-600 hover:underline">dpo@shiftera.app</a></p>
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">2. Dados Recolhidos</h2>
            <p>
              Recolhemos e processamos os seguintes dados pessoais:
            </p>
            <div className="mt-3 space-y-2">
              <p>
                <strong>2.1 Dados de Conta:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Nome completo</li>
                <li>Email</li>
                <li>Número de telefone (opcional)</li>
                <li>Dados da organização (nome, morada, setor)</li>
                <li>Password (encriptada)</li>
              </ul>
              <p className="mt-3">
                <strong>2.2 Dados de Utilização:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Dados de turnos e escalas</li>
                <li>Disponibilidades de colaboradores</li>
                <li>Pedidos de folgas e trocas</li>
                <li>Logs de atividade e timestamps</li>
                <li>Endereço IP e informações de navegador</li>
              </ul>
              <p className="mt-3">
                <strong>2.3 Dados Técnicos:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Cookies e identificadores de sessão</li>
                <li>Informações de dispositivo</li>
                <li>Dados de acesso e utilização da plataforma</li>
              </ul>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">3. Bases Legais para Processamento (RGPD Art. 6)</h2>
            <div className="space-y-3">
              <p>
                <strong>3.1 Consentimento (Art. 6.1.a):</strong> Dados de conta e preferências de comunicação.
              </p>
              <p>
                <strong>3.2 Contrato (Art. 6.1.b):</strong> Dados necessários para prestar o Serviço (escalas, turnos, dados de equipa).
              </p>
              <p>
                <strong>3.3 Obrigação Legal (Art. 6.1.c):</strong> Retenção de registos conforme legislação laboral portuguesa.
              </p>
              <p>
                <strong>3.4 Interesses Legítimos (Art. 6.1.f):</strong> Segurança da plataforma, prevenção de fraude e melhoria de serviço.
              </p>
            </div>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">4. Retenção de Dados</h2>
            <div className="space-y-3">
              <p>
                <strong>Dados de Conta:</strong> Mantidos enquanto a conta estiver ativa. Após cancelamento, retidos por 30 dias antes de eliminação.
              </p>
              <p>
                <strong>Dados de Escalas e Turnos:</strong> Mantidos durante a subscrição e 1 ano após cancelamento (conformidade legal).
              </p>
              <p>
                <strong>Logs de Atividade:</strong> Retidos por 12 meses para fins de segurança e auditoria.
              </p>
              <p>
                <strong>Dados de Cookies:</strong> Conforme definições de privacidade do browser (típico: 12 meses).
              </p>
            </div>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">5. Direitos dos Utilizadores (RGPD Arts. 12-22)</h2>
            <div className="space-y-2">
              <p>
                <strong>5.1 Direito de Acesso (Art. 15):</strong> Pode solicitar uma cópia dos seus dados pessoais.
              </p>
              <p>
                <strong>5.2 Direito de Retificação (Art. 16):</strong> Pode corrigir dados inexatos ou incompletos.
              </p>
              <p>
                <strong>5.3 Direito ao Esquecimento (Art. 17):</strong> Pode solicitar eliminação dos seus dados (sujeito a limitações legais).
              </p>
              <p>
                <strong>5.4 Direito à Portabilidade (Art. 20):</strong> Pode solicitar os seus dados em formato estruturado e portável.
              </p>
              <p>
                <strong>5.5 Direito à Restrição (Art. 18):</strong> Pode limitar o processamento de seus dados.
              </p>
              <p>
                <strong>5.6 Direito de Oposição (Art. 21):</strong> Pode objetar ao processamento para fins específicos.
              </p>
              <p>
                <strong>5.7 Decisões Automatizadas (Art. 22):</strong> Pode pedir não ser sujeito exclusivamente a decisões automatizadas.
              </p>
              <p className="mt-3">
                Para exercer estes direitos, contacte: <a href="mailto:dpo@shiftera.app" className="text-blue-600 hover:underline">dpo@shiftera.app</a>
              </p>
            </div>
          </div>

          {/* Section 6 */}
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">6. Compartilhamento de Dados</h2>
            <p>
              Não vendemos nem alugamos seus dados pessoais. Compartilhamos apenas com:
            </p>
            <div className="mt-3 space-y-2">
              <p>
                <strong>6.1 Prestadores de Serviço:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Supabase</strong> - Base de dados e autenticação (conforme GDPR Data Processing Agreement)</li>
                <li><strong>Vercel</strong> - Hospedagem e CDN (conforme GDPR Data Processing Agreement)</li>
                <li><strong>Resend</strong> - Serviço de email transacional (conformidade GDPR)</li>
                <li><strong>Stripe</strong> (futuro) - Pagamentos (conformidade PCI DSS)</li>
              </ul>
              <p className="mt-3">
                <strong>6.2 Requisitos Legais:</strong> Compartilharemos dados se obrigados por lei, processo legal ou solicitação governamental.
              </p>
              <p>
                <strong>6.3 Transferências Internacionais:</strong> Os dados podem ser transferidos para países fora do EEE. Implementamos salvaguardas conforme RGPD (Standard Contractual Clauses).
              </p>
            </div>
          </div>

          {/* Section 7 */}
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">7. Segurança de Dados</h2>
            <p>
              Implementamos medidas técnicas e organizacionais para proteger seus dados:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
              <li>Encriptação SSL/TLS em trânsito</li>
              <li>Passwords encriptadas com bcrypt</li>
              <li>Acesso limitado aos dados (princípio do menor privilégio)</li>
              <li>Firewalls e proteção de rede</li>
              <li>Monitoramento de segurança e detecção de intrusões</li>
              <li>Backups regulares com testes de recuperação</li>
            </ul>
            <p className="mt-3">
              Embora empenhados na segurança, nenhuma transmissão pela internet é 100% segura. Não garantimos proteção absoluta.
            </p>
          </div>

          {/* Section 8 */}
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">8. Política de Cookies</h2>
            <div className="space-y-3">
              <p>
                <strong>8.1 Tipos de Cookies:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Essenciais:</strong> Autenticação e segurança de sessão (necessários para funcionar)</li>
                <li><strong>Preferências:</strong> Idioma e tema escolhido</li>
                <li><strong>Analytics:</strong> Entender como usa a plataforma (anónimos quando possível)</li>
              </ul>
              <p className="mt-3">
                <strong>8.2 Gestão de Cookies:</strong> Pode desativar cookies no seu navegador. Tenha em conta que alguns cookies são necessários para o Serviço funcionar.
              </p>
            </div>
          </div>

          {/* Section 9 */}
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">9. Links Externos</h2>
            <p>
              O Serviço pode conter links para websites de terceiros. Não somos responsáveis por suas políticas de privacidade. Recomendamos ler as políticas de privacidade de sites externos antes de partilhar dados pessoais.
            </p>
          </div>

          {/* Section 10 */}
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">10. Menores</h2>
            <p>
              O Serviço não é destinado a indivíduos menores de 18 anos. Não recolhemos intencionalmente dados de menores. Se descobrir que recolhemos dados de um menor, contacte-nos imediatamente.
            </p>
          </div>

          {/* Section 11 */}
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">11. Alterações a Esta Política</h2>
            <p>
              Podemos atualizar esta Política periodicamente. Notificaremos sobre mudanças substanciais por email ou aviso na plataforma. O uso continuado implica aceitação das alterações.
            </p>
          </div>

          {/* Section 12 */}
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">12. Lei Aplicável</h2>
            <p>
              Esta Política é regida pelas leis de Portugal e pelo RGPD. Qualquer reclamação sobre privacidade pode ser apresentada à Comissão Nacional de Proteção de Dados (CNPD).
            </p>
          </div>

          {/* Section 13 */}
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">13. Contacto</h2>
            <p>
              Para questões sobre privacidade ou para exercer direitos RGPD:
            </p>
            <div className="mt-3 space-y-1 text-stone-600">
              <p>Email DPO: <a href="mailto:dpo@shiftera.app" className="text-blue-600 hover:underline">dpo@shiftera.app</a></p>
              <p>Email Geral: <a href="mailto:support@shiftera.app" className="text-blue-600 hover:underline">support@shiftera.app</a></p>
              <p>Website: <a href="https://shiftera.app" className="text-blue-600 hover:underline">https://shiftera.app</a></p>
            </div>
          </div>

          {/* Closing */}
          <div className="bg-stone-50 rounded-lg p-6 mt-8 border border-stone-200">
            <p className="text-sm text-stone-600">
              <strong>Contacto da CNPD (Portugal):</strong> Caso considere que seus direitos foram violados, pode apresentar uma reclamação à Comissão Nacional de Proteção de Dados (CNPD), Rua de São Bento, 148-3, 1200-821 Lisboa, Portugal.
            </p>
          </div>

        </div>

        {/* Footer link */}
        <div className="mt-12 pt-6 border-t border-stone-200 text-center">
          <p className="text-sm text-stone-500">
            © {currentYear} Shiftera. Todos os direitos reservados.
          </p>
          <div className="mt-4 space-y-2">
            <p>
              <Link href="/terms" className="text-blue-600 hover:underline">
                Termos e Condições
              </Link>
            </p>
            <p>
              <Link href="/" className="text-blue-600 hover:underline">
                Voltar ao site
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
