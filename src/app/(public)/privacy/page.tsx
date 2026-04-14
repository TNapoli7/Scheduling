"use client";

import { useLocale } from "next-intl";
import { LegalLayout } from "@/components/lp/LegalLayout";

export default function PrivacyPage() {
  const locale = useLocale();

  const content = {
    pt: {
      title: "Política de Privacidade",
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
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">1. Controlador de Dados</h2>
            <p>
              Shiftera é o controlador de dados responsável pelo processamento dos seus dados pessoais em conformidade com o Regulamento Geral de Proteção de Dados (RGPD - Regulamento UE 2016/679) e legislação portuguesa de proteção de dados.
            </p>
            <div className="mt-3 space-y-1 text-stone-600">
              <p><strong>Shiftera</strong></p>
              <p>Email: <a href="mailto:dpo@shiftera.app" className="text-blue-600 hover:underline">dpo@shiftera.app</a></p>
              <p>Endereço: [Endereço fiscal a definir após constituição da empresa]</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">2. Dados Recolhidos</h2>
            <p>
              Recolhemos e processamos dados pessoais nas seguintes categorias:
            </p>
            <div className="mt-3 space-y-3">
              <div>
                <p><strong>2.1 Dados de Conta:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Nome completo</li>
                  <li>Email e número de telefone (opcional)</li>
                  <li>Dados da organização (nome, morada, setor de atividade)</li>
                  <li>Password (encriptada com bcrypt)</li>
                </ul>
              </div>
              <div>
                <p><strong>2.2 Dados de Utilização:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Dados de turnos e escalas</li>
                  <li>Disponibilidades de colaboradores</li>
                  <li>Pedidos de folgas e trocas de turnos</li>
                  <li>Logs de atividade e timestamps de acesso</li>
                  <li>Endereço IP e informações de navegador (user agent)</li>
                </ul>
              </div>
              <div>
                <p><strong>2.3 Dados Técnicos:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Cookies de sessão e autenticação</li>
                  <li>Identificadores de dispositivo</li>
                  <li>Dados de acesso à plataforma (frequência, duração)</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">3. Base Legal para Processamento (RGPD Art. 6)</h2>
            <div className="space-y-3">
              <p>
                <strong>3.1 Consentimento (Art. 6.1.a):</strong> Recolhemos dados de conta e preferências de comunicação com base no consentimento que fornece ao registar-se.
              </p>
              <p>
                <strong>3.2 Contrato (Art. 6.1.b):</strong> Processamos dados necessários para prestar o Serviço (escalas, turnos, dados de equipa) conforme o acordo de subscrição.
              </p>
              <p>
                <strong>3.3 Obrigação Legal (Art. 6.1.c):</strong> Retenção de registos conforme legislação laboral portuguesa (conformidade legal).
              </p>
              <p>
                <strong>3.4 Interesses Legítimos (Art. 6.1.f):</strong> Segurança da plataforma, prevenção de fraude, detecção de abusos e melhoria contínua do Serviço.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">4. Utilização de Dados</h2>
            <p>
              Utilizamos os seus dados para:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
              <li>Prestar e melhorar o Serviço</li>
              <li>Validar conformidade com legislação laboral</li>
              <li>Enviar notificações e atualizações sobre a conta</li>
              <li>Contacto para suporte técnico e administrativo</li>
              <li>Análise agregada para melhorar funcionalidades</li>
              <li>Segurança, prevenção de fraude e conformidade legal</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">5. Partilha de Dados e Subprocessadores</h2>
            <p>
              Não vendemos nem alugamos seus dados pessoais. Partilhamos dados apenas com os seguintes prestadores de serviço (subprocessadores):
            </p>
            <div className="mt-3 space-y-2">
              <p>
                <strong>5.1 Prestadores de Serviço Essenciais:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Supabase</strong> - Base de dados PostgreSQL, autenticação e armazenamento. Localização: Frankfurt, EU. (Sujeito a DPA GDPR)</li>
                <li><strong>Vercel</strong> - Hospedagem de aplicação e CDN edge. Localização: EU region. (Sujeito a DPA GDPR)</li>
              </ul>
              <p className="mt-3">
                <strong>5.2 Prestadores de Serviço Operacionais:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Resend</strong> - Serviço de email transacional (notificações, recuperação de password)</li>
                <li><strong>Sentry</strong> - Rastreamento de erros e monitoramento de desempenho (dados técnicos anónimos)</li>
              </ul>
              <p className="mt-3">
                <strong>5.3 Requisitos Legais:</strong> Partilharemos dados se obrigados por lei, mandado judicial ou solicitação governamental legalmente válida.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">6. Retenção de Dados</h2>
            <div className="space-y-3">
              <p>
                <strong>Dados de Conta:</strong> Mantidos enquanto a conta estiver ativa. Após cancelamento, retidos por 30 dias antes de eliminação segura.
              </p>
              <p>
                <strong>Dados de Escalas e Turnos:</strong> Mantidos durante a subscrição ativa. Após cancelamento, retidos por 1 ano para conformidade com legislação laboral portuguesa, depois eliminados permanentemente.
              </p>
              <p>
                <strong>Logs de Atividade e Segurança:</strong> Retidos por 12 meses para fins de segurança, auditoria e conformidade legal.
              </p>
              <p>
                <strong>Dados de Cookies:</strong> Conforme definições de privacidade do navegador (tipicamente 12 meses).
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">7. Seus Direitos (RGPD Arts. 12-22)</h2>
            <div className="space-y-2">
              <p>
                <strong>7.1 Direito de Acesso (Art. 15):</strong> Pode solicitar uma cópia de todos os seus dados pessoais processados.
              </p>
              <p>
                <strong>7.2 Direito de Retificação (Art. 16):</strong> Pode corrigir dados inexatos ou incompletos através das definições da conta.
              </p>
              <p>
                <strong>7.3 Direito ao Esquecimento (Art. 17):</strong> Pode solicitar eliminação dos seus dados (sujeito a limitações legais de retenção).
              </p>
              <p>
                <strong>7.4 Direito à Portabilidade (Art. 20):</strong> Pode solicitar seus dados em formato estruturado, comum e legível por máquina (ex: JSON, CSV).
              </p>
              <p>
                <strong>7.5 Direito à Restrição (Art. 18):</strong> Pode limitar o processamento de seus dados em determinadas circunstâncias.
              </p>
              <p>
                <strong>7.6 Direito de Oposição (Art. 21):</strong> Pode objetar ao processamento para fins específicos (ex: marketing, interesses legítimos).
              </p>
              <p className="mt-3">
                <strong>Para exercer estes direitos:</strong> Contacte <a href="mailto:dpo@shiftera.app" className="text-blue-600 hover:underline">dpo@shiftera.app</a> com identificação válida. Responderemos em 30 dias.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">8. Segurança de Dados</h2>
            <p>
              Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
              <li>Encriptação SSL/TLS em trânsito (HTTPS obrigatório)</li>
              <li>Passwords encriptadas com bcrypt (irreversível)</li>
              <li>Encriptação at-rest dos dados pela Supabase</li>
              <li>Row-Level Security (RLS) no PostgreSQL para isolamento de dados</li>
              <li>Acesso limitado aos dados (princípio do menor privilégio)</li>
              <li>Firewalls e proteção de rede</li>
              <li>Monitoramento contínuo de segurança via Sentry</li>
              <li>Backups regulares com testes de recuperação</li>
            </ul>
            <p className="mt-3">
              Embora implementemos medidas robustas, nenhuma transmissão pela internet é 100% segura. Não garantimos proteção absoluta contra ataques sofisticados.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">9. Cookies</h2>
            <div className="space-y-3">
              <p>
                <strong>9.1 Tipos de Cookies Utilizados:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li><strong>Essenciais:</strong> Autenticação Supabase, CSRF tokens, sessão (necessários para funcionar; sem consentimento prévio)</li>
                <li><strong>Funcionais:</strong> NEXT_LOCALE para lembrar idioma escolhido (sem consentimento prévio)</li>
                <li><strong>Analíticos:</strong> Plausible ou PostHog quando configurados (requer consentimento explícito)</li>
                <li><strong>Performance:</strong> Sentry para erros (dados técnicos anónimos; requer consentimento)</li>
              </ul>
              <p className="mt-3">
                <strong>9.2 Gestão de Cookies:</strong> Pode desativar cookies não essenciais nas definições de privacidade do seu navegador. Cookies essenciais são necessários para o Serviço funcionar.
              </p>
              <p>
                Para mais detalhes, consulte a nossa <a href="/cookies" className="text-blue-600 hover:underline">Política de Cookies</a>.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">10. Transferências Internacionais</h2>
            <p>
              Por padrão, processamos dados dentro da UE/EEA (Supabase em Frankfurt, Vercel em EU regions). Se implementarmos subprocessadores fora do EEA no futuro, utilizaremos Standard Contractual Clauses (SCC) ou outras salvaguardas conformes ao RGPD.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">11. Menores</h2>
            <p>
              O Serviço é destinado a representantes de organizações (16+ anos). Não recolhemos intencionalmente dados pessoais de menores de 16 anos. Se descobrir que recolhemos dados de um menor, contacte-nos imediatamente para eliminação.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">12. Notificação de Violações de Dados</h2>
            <p>
              Em caso de violação de dados pessoais que constitua risco para os direitos e liberdades, notificaremos as autoridades relevantes (CNPD) sem demora desnecessária e de forma coerente com o RGPD Artigo 33. Se relevante, também notificaremos os titulares de dados afetados.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">13. Alterações a Esta Política</h2>
            <p>
              Podemos atualizar esta Política periodicamente para refletir mudanças nos processos ou requisitos legais. Notificaremos sobre mudanças substanciais por email ou aviso prominente na plataforma. O uso continuado implica aceitação das alterações.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">14. Lei Aplicável e Autoridade de Proteção</h2>
            <p>
              Esta Política é regida pelas leis de Portugal e pelo RGPD. Qualquer reclamação sobre privacidade pode ser apresentada à Comissão Nacional de Proteção de Dados (CNPD), entidade de supervisão portuguesa.
            </p>
            <div className="mt-3 space-y-1 text-stone-600">
              <p><strong>CNPD - Comissão Nacional de Proteção de Dados</strong></p>
              <p>Rua de São Bento, 148-3</p>
              <p>1200-821 Lisboa, Portugal</p>
              <p>Website: <a href="https://www.cnpd.pt" className="text-blue-600 hover:underline">www.cnpd.pt</a></p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">15. Contacto</h2>
            <p>
              Para questões sobre privacidade, exercer direitos RGPD ou reportar violações:
            </p>
            <div className="mt-3 space-y-1 text-stone-600">
              <p>Email DPO: <a href="mailto:dpo@shiftera.app" className="text-blue-600 hover:underline">dpo@shiftera.app</a></p>
              <p>Email Geral: <a href="mailto:hello@shiftera.app" className="text-blue-600 hover:underline">hello@shiftera.app</a></p>
              <p>Website: <a href="https://shiftera.app" className="text-blue-600 hover:underline">shiftera.app</a></p>
            </div>
          </div>

          <div className="bg-stone-50 rounded-lg p-6 mt-8 border border-stone-200">
            <p className="text-sm text-stone-600">
              <strong>Tempo de Resposta:</strong> Comprometemo-nos a responder a todas as solicitações sobre dados pessoais dentro de 30 dias (conforme RGPD). Se o pedido for complexo, podemos solicitar extensão de 60 dias adicionais.
            </p>
          </div>
        </>
      ),
    },
    en: {
      title: "Privacy Policy",
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
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">1. Data Controller</h2>
            <p>
              Shiftera is the data controller responsible for processing your personal data in compliance with the General Data Protection Regulation (GDPR - EU Regulation 2016/679) and Portuguese data protection law.
            </p>
            <div className="mt-3 space-y-1 text-stone-600">
              <p><strong>Shiftera</strong></p>
              <p>Email: <a href="mailto:dpo@shiftera.app" className="text-blue-600 hover:underline">dpo@shiftera.app</a></p>
              <p>Address: [Registered address to be defined after company incorporation]</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">2. Data Collected</h2>
            <p>
              We collect and process personal data in the following categories:
            </p>
            <div className="mt-3 space-y-3">
              <div>
                <p><strong>2.1 Account Data:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Full name</li>
                  <li>Email and phone number (optional)</li>
                  <li>Organization data (name, address, industry)</li>
                  <li>Password (encrypted with bcrypt)</li>
                </ul>
              </div>
              <div>
                <p><strong>2.2 Usage Data:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Shift and schedule data</li>
                  <li>Employee availability</li>
                  <li>Leave requests and shift swaps</li>
                  <li>Activity logs and access timestamps</li>
                  <li>IP address and browser information (user agent)</li>
                </ul>
              </div>
              <div>
                <p><strong>2.3 Technical Data:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Session and authentication cookies</li>
                  <li>Device identifiers</li>
                  <li>Platform access data (frequency, duration)</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">3. Legal Basis for Processing (GDPR Art. 6)</h2>
            <div className="space-y-3">
              <p>
                <strong>3.1 Consent (Art. 6.1.a):</strong> We collect account data and communication preferences based on consent you provide during registration.
              </p>
              <p>
                <strong>3.2 Contract (Art. 6.1.b):</strong> We process data necessary to provide the Service (schedules, shifts, team data) per your subscription agreement.
              </p>
              <p>
                <strong>3.3 Legal Obligation (Art. 6.1.c):</strong> Data retention per Portuguese labor law (compliance requirement).
              </p>
              <p>
                <strong>3.4 Legitimate Interests (Art. 6.1.f):</strong> Platform security, fraud prevention, abuse detection, and continuous Service improvement.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">4. How We Use Your Data</h2>
            <p>
              We use your data to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
              <li>Provide and improve the Service</li>
              <li>Validate compliance with labor legislation</li>
              <li>Send account notifications and updates</li>
              <li>Provide technical and administrative support</li>
              <li>Aggregate analysis to enhance features</li>
              <li>Security, fraud prevention, and legal compliance</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">5. Data Sharing and Sub-processors</h2>
            <p>
              We do not sell or rent your personal data. We share data only with the following service providers (sub-processors):
            </p>
            <div className="mt-3 space-y-2">
              <p>
                <strong>5.1 Essential Service Providers:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Supabase</strong> - PostgreSQL database, authentication, storage. Location: Frankfurt, EU. (Subject to GDPR DPA)</li>
                <li><strong>Vercel</strong> - Application hosting and edge CDN. Location: EU region. (Subject to GDPR DPA)</li>
              </ul>
              <p className="mt-3">
                <strong>5.2 Operational Service Providers:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Resend</strong> - Transactional email service (notifications, password recovery)</li>
                <li><strong>Sentry</strong> - Error tracking and performance monitoring (anonymous technical data)</li>
              </ul>
              <p className="mt-3">
                <strong>5.3 Legal Requirements:</strong> We will share data if required by law, court order, or legally valid government request.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">6. Data Retention</h2>
            <div className="space-y-3">
              <p>
                <strong>Account Data:</strong> Retained while the account is active. After cancellation, retained for 30 days before secure deletion.
              </p>
              <p>
                <strong>Shifts and Schedule Data:</strong> Retained during active subscription. After cancellation, retained for 1 year for Portuguese labor law compliance, then permanently deleted.
              </p>
              <p>
                <strong>Activity and Security Logs:</strong> Retained for 12 months for security, audit, and legal compliance purposes.
              </p>
              <p>
                <strong>Cookie Data:</strong> Per your browser privacy settings (typically 12 months).
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">7. Your Rights (GDPR Arts. 12-22)</h2>
            <div className="space-y-2">
              <p>
                <strong>7.1 Right of Access (Art. 15):</strong> You may request a copy of all your personal data we process.
              </p>
              <p>
                <strong>7.2 Right to Rectification (Art. 16):</strong> You may correct inaccurate or incomplete data via account settings.
              </p>
              <p>
                <strong>7.3 Right to Erasure (Art. 17):</strong> You may request deletion of your data (subject to legal retention limits).
              </p>
              <p>
                <strong>7.4 Right to Data Portability (Art. 20):</strong> You may request your data in a structured, common, machine-readable format (e.g., JSON, CSV).
              </p>
              <p>
                <strong>7.5 Right to Restrict (Art. 18):</strong> You may limit processing of your data in certain circumstances.
              </p>
              <p>
                <strong>7.6 Right to Object (Art. 21):</strong> You may object to processing for specific purposes (e.g., marketing, legitimate interests).
              </p>
              <p className="mt-3">
                <strong>To exercise these rights:</strong> Contact <a href="mailto:dpo@shiftera.app" className="text-blue-600 hover:underline">dpo@shiftera.app</a> with valid identification. We will respond within 30 days.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">8. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your data:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
              <li>SSL/TLS encryption in transit (HTTPS mandatory)</li>
              <li>Passwords encrypted with bcrypt (irreversible)</li>
              <li>At-rest encryption of data by Supabase</li>
              <li>Row-Level Security (RLS) in PostgreSQL for data isolation</li>
              <li>Limited data access (principle of least privilege)</li>
              <li>Firewalls and network protection</li>
              <li>Continuous security monitoring via Sentry</li>
              <li>Regular backups with recovery testing</li>
            </ul>
            <p className="mt-3">
              Although we implement robust measures, no internet transmission is 100% secure. We do not guarantee absolute protection against sophisticated attacks.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">9. Cookies</h2>
            <div className="space-y-3">
              <p>
                <strong>9.1 Types of Cookies Used:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li><strong>Essential:</strong> Supabase authentication, CSRF tokens, session (required to function; no prior consent)</li>
                <li><strong>Functional:</strong> NEXT_LOCALE to remember your chosen language (no prior consent)</li>
                <li><strong>Analytics:</strong> Plausible or PostHog when configured (requires explicit consent)</li>
                <li><strong>Performance:</strong> Sentry for errors (anonymous technical data; requires consent)</li>
              </ul>
              <p className="mt-3">
                <strong>9.2 Cookie Management:</strong> You can disable non-essential cookies in your browser's privacy settings. Essential cookies are required for the Service to function.
              </p>
              <p>
                For more details, see our <a href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</a>.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">10. International Transfers</h2>
            <p>
              By default, we process data within the EU/EEA (Supabase in Frankfurt, Vercel in EU regions). If we implement sub-processors outside the EEA in the future, we will use Standard Contractual Clauses (SCC) or other GDPR-compliant safeguards.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">11. Minors</h2>
            <p>
              The Service is intended for organization representatives (16+ years). We do not intentionally collect personal data of minors under 16. If you discover we have collected data of a minor, contact us immediately for deletion.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">12. Data Breach Notification</h2>
            <p>
              In the event of a personal data breach that poses a risk to rights and freedoms, we will notify relevant authorities (CNPD) without undue delay and in accordance with GDPR Article 33. Where applicable, we will also notify affected data subjects.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">13. Changes to This Policy</h2>
            <p>
              We may update this Policy periodically to reflect changes in processes or legal requirements. We will notify you of material changes via email or prominent notice on the platform. Continued use implies acceptance of changes.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">14. Applicable Law and Supervisory Authority</h2>
            <p>
              This Policy is governed by Portuguese law and the GDPR. Any privacy complaint may be filed with the National Commission for Data Protection (CNPD), Portugal's supervisory authority.
            </p>
            <div className="mt-3 space-y-1 text-stone-600">
              <p><strong>CNPD - National Commission for Data Protection</strong></p>
              <p>Rua de São Bento, 148-3</p>
              <p>1200-821 Lisbon, Portugal</p>
              <p>Website: <a href="https://www.cnpd.pt" className="text-blue-600 hover:underline">www.cnpd.pt</a></p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">15. Contact</h2>
            <p>
              For privacy questions, exercising GDPR rights, or reporting breaches:
            </p>
            <div className="mt-3 space-y-1 text-stone-600">
              <p>DPO Email: <a href="mailto:dpo@shiftera.app" className="text-blue-600 hover:underline">dpo@shiftera.app</a></p>
              <p>General Email: <a href="mailto:hello@shiftera.app" className="text-blue-600 hover:underline">hello@shiftera.app</a></p>
              <p>Website: <a href="https://shiftera.app" className="text-blue-600 hover:underline">shiftera.app</a></p>
            </div>
          </div>

          <div className="bg-stone-50 rounded-lg p-6 mt-8 border border-stone-200">
            <p className="text-sm text-stone-600">
              <strong>Response Time:</strong> We commit to responding to all personal data requests within 30 days (per GDPR). If a request is complex, we may request an additional 60-day extension.
            </p>
          </div>
        </>
      ),
    },
    es: {
      title: "Política de Privacidad",
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
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">1. Responsable del Tratamiento</h2>
            <p>
              Shiftera es el responsable del tratamiento de datos responsable del procesamiento de sus datos personales en cumplimiento del Reglamento General de Protección de Datos (RGPD - Reglamento UE 2016/679) y la ley de protección de datos portuguesa.
            </p>
            <div className="mt-3 space-y-1 text-stone-600">
              <p><strong>Shiftera</strong></p>
              <p>Correo Electrónico: <a href="mailto:dpo@shiftera.app" className="text-blue-600 hover:underline">dpo@shiftera.app</a></p>
              <p>Dirección: [Dirección registrada a definir después de la constitución de la empresa]</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">2. Datos Recogidos</h2>
            <p>
              Recopilamos y procesamos datos personales en las siguientes categorías:
            </p>
            <div className="mt-3 space-y-3">
              <div>
                <p><strong>2.1 Datos de Cuenta:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Nombre completo</li>
                  <li>Correo electrónico y número de teléfono (opcional)</li>
                  <li>Datos de la organización (nombre, dirección, sector)</li>
                  <li>Contraseña (encriptada con bcrypt)</li>
                </ul>
              </div>
              <div>
                <p><strong>2.2 Datos de Uso:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Datos de turnos y horarios</li>
                  <li>Disponibilidad de empleados</li>
                  <li>Solicitudes de ausencias e intercambios de turnos</li>
                  <li>Registros de actividad y marcas de tiempo de acceso</li>
                  <li>Dirección IP e información del navegador (user agent)</li>
                </ul>
              </div>
              <div>
                <p><strong>2.3 Datos Técnicos:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Cookies de sesión y autenticación</li>
                  <li>Identificadores de dispositivo</li>
                  <li>Datos de acceso a la plataforma (frecuencia, duración)</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">3. Base Legal para el Tratamiento (RGPD Art. 6)</h2>
            <div className="space-y-3">
              <p>
                <strong>3.1 Consentimiento (Art. 6.1.a):</strong> Recopilamos datos de cuenta y preferencias de comunicación basados en el consentimiento que proporciona durante el registro.
              </p>
              <p>
                <strong>3.2 Contrato (Art. 6.1.b):</strong> Procesamos datos necesarios para proporcionar el Servicio (horarios, turnos, datos de equipo) según su acuerdo de suscripción.
              </p>
              <p>
                <strong>3.3 Obligación Legal (Art. 6.1.c):</strong> Retención de datos según la ley laboral portuguesa (requisito de cumplimiento).
              </p>
              <p>
                <strong>3.4 Intereses Legítimos (Art. 6.1.f):</strong> Seguridad de la plataforma, prevención de fraude, detección de abusos y mejora continua del Servicio.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">4. Cómo Utilizamos Sus Datos</h2>
            <p>
              Utilizamos sus datos para:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
              <li>Proporcionar y mejorar el Servicio</li>
              <li>Validar el cumplimiento con la legislación laboral</li>
              <li>Enviar notificaciones y actualizaciones de cuenta</li>
              <li>Proporcionar soporte técnico y administrativo</li>
              <li>Análisis agregado para mejorar funcionalidades</li>
              <li>Seguridad, prevención de fraude y cumplimiento legal</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">5. Compartición de Datos y Subencargados</h2>
            <p>
              No vendemos ni alquilamos sus datos personales. Compartimos datos solo con los siguientes proveedores de servicios (subencargados):
            </p>
            <div className="mt-3 space-y-2">
              <p>
                <strong>5.1 Proveedores de Servicios Esenciales:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Supabase</strong> - Base de datos PostgreSQL, autenticación, almacenamiento. Ubicación: Frankfurt, UE. (Sujeto a DPA RGPD)</li>
                <li><strong>Vercel</strong> - Hospedaje de aplicaciones y CDN edge. Ubicación: región UE. (Sujeto a DPA RGPD)</li>
              </ul>
              <p className="mt-3">
                <strong>5.2 Proveedores de Servicios Operacionales:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Resend</strong> - Servicio de correo electrónico transaccional (notificaciones, recuperación de contraseña)</li>
                <li><strong>Sentry</strong> - Seguimiento de errores y monitoreo de rendimiento (datos técnicos anónimos)</li>
              </ul>
              <p className="mt-3">
                <strong>5.3 Requisitos Legales:</strong> Compartiremos datos si se requiere por ley, orden judicial o solicitud gubernamental legalmente válida.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">6. Retención de Datos</h2>
            <div className="space-y-3">
              <p>
                <strong>Datos de Cuenta:</strong> Retenidos mientras la cuenta esté activa. Después de la cancelación, retenidos durante 30 días antes de su eliminación segura.
              </p>
              <p>
                <strong>Datos de Turnos y Horarios:</strong> Retenidos durante la suscripción activa. Después de la cancelación, retenidos durante 1 año para cumplimiento de la ley laboral portuguesa, luego eliminados permanentemente.
              </p>
              <p>
                <strong>Registros de Actividad y Seguridad:</strong> Retenidos durante 12 meses para propósitos de seguridad, auditoría y cumplimiento legal.
              </p>
              <p>
                <strong>Datos de Cookies:</strong> Según la configuración de privacidad de su navegador (típicamente 12 meses).
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">7. Sus Derechos (RGPD Arts. 12-22)</h2>
            <div className="space-y-2">
              <p>
                <strong>7.1 Derecho de Acceso (Art. 15):</strong> Puede solicitar una copia de todos sus datos personales que procesamos.
              </p>
              <p>
                <strong>7.2 Derecho de Rectificación (Art. 16):</strong> Puede corregir datos inexactos o incompletos a través de la configuración de cuenta.
              </p>
              <p>
                <strong>7.3 Derecho al Olvido (Art. 17):</strong> Puede solicitar la eliminación de sus datos (sujeto a límites legales de retención).
              </p>
              <p>
                <strong>7.4 Derecho a la Portabilidad (Art. 20):</strong> Puede solicitar sus datos en un formato estructurado, común y legible por máquina (p. ej., JSON, CSV).
              </p>
              <p>
                <strong>7.5 Derecho a Limitar (Art. 18):</strong> Puede limitar el procesamiento de sus datos en determinadas circunstancias.
              </p>
              <p>
                <strong>7.6 Derecho de Objeción (Art. 21):</strong> Puede objetar el procesamiento para fines específicos (p. ej., marketing, intereses legítimos).
              </p>
              <p className="mt-3">
                <strong>Para ejercer estos derechos:</strong> Contacte a <a href="mailto:dpo@shiftera.app" className="text-blue-600 hover:underline">dpo@shiftera.app</a> con identificación válida. Responderemos en 30 días.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">8. Seguridad de Datos</h2>
            <p>
              Implementamos medidas técnicas y organizacionales apropiadas para proteger sus datos:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
              <li>Encriptación SSL/TLS en tránsito (HTTPS obligatorio)</li>
              <li>Contraseñas encriptadas con bcrypt (irreversible)</li>
              <li>Encriptación en reposo de datos por Supabase</li>
              <li>Seguridad a nivel de fila (RLS) en PostgreSQL para aislamiento de datos</li>
              <li>Acceso limitado a datos (principio de menor privilegio)</li>
              <li>Firewalls y protección de red</li>
              <li>Monitoreo continuo de seguridad via Sentry</li>
              <li>Copias de seguridad regulares con pruebas de recuperación</li>
            </ul>
            <p className="mt-3">
              Aunque implementamos medidas robustas, ninguna transmisión por internet es 100% segura. No garantizamos protección absoluta contra ataques sofisticados.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">9. Cookies</h2>
            <div className="space-y-3">
              <p>
                <strong>9.1 Tipos de Cookies Utilizados:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li><strong>Esenciales:</strong> Autenticación Supabase, tokens CSRF, sesión (necesarios para funcionar; sin consentimiento previo)</li>
                <li><strong>Funcionales:</strong> NEXT_LOCALE para recordar su idioma elegido (sin consentimiento previo)</li>
                <li><strong>Analíticos:</strong> Plausible o PostHog cuando se configuran (requiere consentimiento explícito)</li>
                <li><strong>Rendimiento:</strong> Sentry para errores (datos técnicos anónimos; requiere consentimiento)</li>
              </ul>
              <p className="mt-3">
                <strong>9.2 Gestión de Cookies:</strong> Puede desactivar cookies no esenciales en la configuración de privacidad de su navegador. Las cookies esenciales son necesarias para que el Servicio funcione.
              </p>
              <p>
                Para más detalles, consulte nuestra <a href="/cookies" className="text-blue-600 hover:underline">Política de Cookies</a>.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">10. Transferencias Internacionales</h2>
            <p>
              Por defecto, procesamos datos dentro de la UE/EEE (Supabase en Frankfurt, Vercel en regiones UE). Si implementamos subencargados fuera del EEA en el futuro, utilizaremos Cláusulas Contractuales Estándar (CCS) u otras salvaguardas conformes al RGPD.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">11. Menores</h2>
            <p>
              El Servicio está destinado a representantes de organizaciones (16+ años). No recopilamos intencionalmente datos personales de menores de 16 años. Si descubre que hemos recopilado datos de un menor, contáctenos inmediatamente para su eliminación.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">12. Notificación de Brechas de Datos</h2>
            <p>
              En caso de una brecha de datos personales que presente un riesgo para los derechos y libertades, notificaremos a las autoridades relevantes (CNPD) sin demora injustificada y de conformidad con el Artículo 33 del RGPD. Cuando sea aplicable, también notificaremos a los interesados afectados.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">13. Cambios en Esta Política</h2>
            <p>
              Podemos actualizar esta Política periódicamente para reflejar cambios en procesos o requisitos legales. Lo notificaremos sobre cambios sustanciales por correo electrónico o aviso destacado en la plataforma. El uso continuado implica aceptación de cambios.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">14. Ley Aplicable y Autoridad Supervisora</h2>
            <p>
              Esta Política se rige por las leyes de Portugal y el RGPD. Cualquier queja sobre privacidad puede presentarse ante la Comisión Nacional de Protección de Datos (CNPD), la autoridad supervisora portuguesa.
            </p>
            <div className="mt-3 space-y-1 text-stone-600">
              <p><strong>CNPD - Comisión Nacional de Protección de Datos</strong></p>
              <p>Rua de São Bento, 148-3</p>
              <p>1200-821 Lisboa, Portugal</p>
              <p>Sitio Web: <a href="https://www.cnpd.pt" className="text-blue-600 hover:underline">www.cnpd.pt</a></p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">15. Contacto</h2>
            <p>
              Para preguntas sobre privacidad, ejercer derechos RGPD o reportar brechas:
            </p>
            <div className="mt-3 space-y-1 text-stone-600">
              <p>Correo Electrónico DPO: <a href="mailto:dpo@shiftera.app" className="text-blue-600 hover:underline">dpo@shiftera.app</a></p>
              <p>Correo Electrónico General: <a href="mailto:hello@shiftera.app" className="text-blue-600 hover:underline">hello@shiftera.app</a></p>
              <p>Sitio Web: <a href="https://shiftera.app" className="text-blue-600 hover:underline">shiftera.app</a></p>
            </div>
          </div>

          <div className="bg-stone-50 rounded-lg p-6 mt-8 border border-stone-200">
            <p className="text-sm text-stone-600">
              <strong>Tiempo de Respuesta:</strong> Nos comprometemos a responder a todas las solicitudes de datos personales dentro de 30 días (según RGPD). Si una solicitud es compleja, podemos solicitar una extensión de 60 días adicionales.
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
