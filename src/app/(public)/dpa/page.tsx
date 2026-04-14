"use client";

import { useLocale } from "next-intl";
import { LegalLayout } from "@/components/lp/LegalLayout";

export default function DpaPage() {
  const locale = useLocale();

  const content = {
    pt: {
      title: "Acordo de Tratamento de Dados",
      lastUpdated: "Última atualização: 14 de Abril de 2026",
      backLabel: "Voltar ao site",
      body: (
        <>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-8">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Versão draft beta.</strong> Este documento será revisto por advogado antes do lançamento comercial. Endereço fiscal será adicionado após constituição da empresa.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">1. Objeto e Âmbito</h2>
            <p>
              Este Acordo de Tratamento de Dados (ATD) é celebrado entre o Cliente e Shiftera, de acordo com o Artigo 28 do Regulamento Geral de Proteção de Dados (RGPD - Regulamento UE 2016/679).
            </p>
            <p className="mt-3">
              Shiftera atua como Processador de Dados em relação aos dados pessoais de colaboradores e utilizadores processados através do Serviço. O Cliente é o Controlador de Dados responsável pelas instruções de tratamento.
            </p>
            <p className="mt-3">
              Este ATA aplica-se a todos os dados pessoais processados pela Shiftera ao prestar o Serviço, incluindo dados de conta, escalas, disponibilidades e logs de atividade.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">2. Definições (RGPD Art. 4)</h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Dados Pessoais:</strong> Qualquer informação relativa a uma pessoa singular identificada ou identificável (ex: nome, email, dados de localização ou identificadores online).
              </p>
              <p>
                <strong>Controlador:</strong> A entidade (Cliente) que determina os fins e meios do tratamento de dados pessoais.
              </p>
              <p>
                <strong>Processador:</strong> A entidade (Shiftera) que trata dados pessoais em nome do Controlador.
              </p>
              <p>
                <strong>Dados de Pessoal:</strong> Dados pessoais de colaboradores, utilizadores e outras pessoas cujos dados são processados através do Serviço.
              </p>
              <p>
                <strong>Violação de Dados Pessoais:</strong> Comprometimento de segurança que resulta em acesso, divulgação ou destruição não autorizada de dados pessoais.
              </p>
              <p>
                <strong>Tratamento:</strong> Qualquer operação sobre dados pessoais (recolha, gravação, utilização, alteração, eliminação, etc.).
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">3. Natureza e Finalidade do Tratamento</h2>
            <div className="space-y-3">
              <p>
                <strong>3.1 Categorias de Dados Pessoais:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Dados de identificação (nome, email, número de identificação)</li>
                <li>Dados de contacto (email, telefone)</li>
                <li>Dados de emprego (cargo, departamento, horários)</li>
                <li>Dados de disponibilidade e escalas</li>
                <li>Logs técnicos (IP, timestamps, ações realizadas)</li>
              </ul>
              <p className="mt-3">
                <strong>3.2 Categorias de Titulares de Dados:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Colaboradores da organização do Cliente</li>
                <li>Gestores e administradores de recursos humanos</li>
                <li>Utilizadores finais da plataforma Shiftera</li>
              </ul>
              <p className="mt-3">
                <strong>3.3 Finalidade do Tratamento:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Gestão de escalas e turnos</li>
                <li>Controlo de disponibilidades</li>
                <li>Processamento de pedidos de folgas e trocas</li>
                <li>Geração de relatórios laborais</li>
                <li>Validação de conformidade legal</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">4. Obrigações de Shiftera (Processador)</h2>
            <div className="space-y-3">
              <p>
                <strong>4.1 Processar Dados Apenas Conforme Instruções:</strong> Shiftera processa dados pessoais exclusivamente conforme as instruções documentadas do Cliente, incluindo quanto aos fins, duração, natureza e categorias de dados e titulares. Shiftera não processará dados para fins diferentes sem consentimento escrito prévio.
              </p>
              <p>
                <strong>4.2 Confidencialidade:</strong> Shiftera garante que pessoas autorizadas a processar dados pessoais (colaboradores, subcontratados) são obrigadas por contrato ou lei a guardar sigilo.
              </p>
              <p>
                <strong>4.3 Medidas de Segurança (Art. 32):</strong> Shiftera implementa medidas técnicas e organizacionais apropriadas:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Encriptação SSL/TLS em trânsito (HTTPS obrigatório)</li>
                <li>Encriptação at-rest de dados na Supabase</li>
                <li>Row-Level Security (RLS) para isolamento de dados</li>
                <li>Passwords encriptadas com bcrypt</li>
                <li>Controlo de acesso baseado em funções (RBAC)</li>
                <li>Monitoramento contínuo de segurança via Sentry</li>
                <li>Backups regulares e testes de recuperação</li>
                <li>Política de autenticação forte (2FA disponível)</li>
              </ul>
              <p className="mt-3">
                <strong>4.4 Cooperação com Direitos dos Titulares:</strong> Shiftera auxiliará o Cliente a responder a pedidos de titulares de dados (acesso, retificação, eliminação, portabilidade, etc.) no prazo estabelecido pelo RGPD (máx. 30 dias). O Cliente mantém responsabilidade final pela conformidade.
              </p>
              <p>
                <strong>4.5 Notificação de Violações:</strong> Shiftera notificará o Cliente de qualquer violação de dados pessoais sem demora desnecessária e, em qualquer caso, num prazo não superior a 48 horas após identificação da violação.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">5. Subprocessadores (Art. 28.2, 28.4)</h2>
            <div className="space-y-3">
              <p>
                <strong>5.1 Lista Atual de Subprocessadores:</strong>
              </p>
              <table className="w-full border-collapse border border-stone-300 mt-3">
                <thead>
                  <tr className="bg-stone-100">
                    <th className="border border-stone-300 p-2 text-left">Subprocessador</th>
                    <th className="border border-stone-300 p-2 text-left">Função</th>
                    <th className="border border-stone-300 p-2 text-left">Localização</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-stone-300 p-2">Supabase (supabase.com)</td>
                    <td className="border border-stone-300 p-2">Base de dados e autenticação</td>
                    <td className="border border-stone-300 p-2">Frankfurt, UE</td>
                  </tr>
                  <tr>
                    <td className="border border-stone-300 p-2">Vercel (vercel.com)</td>
                    <td className="border border-stone-300 p-2">Hospedagem e CDN</td>
                    <td className="border border-stone-300 p-2">Regiões UE</td>
                  </tr>
                  <tr>
                    <td className="border border-stone-300 p-2">Resend (resend.com)</td>
                    <td className="border border-stone-300 p-2">Email transacional</td>
                    <td className="border border-stone-300 p-2">UE</td>
                  </tr>
                  <tr>
                    <td className="border border-stone-300 p-2">Sentry (sentry.io)</td>
                    <td className="border border-stone-300 p-2">Rastreamento de erros</td>
                    <td className="border border-stone-300 p-2">UE</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-3">
                <strong>5.2 Autorização:</strong> O Cliente autoriza Shiftera a utilizar subprocessadores listados acima. Shiftera implementou medidas para garantir que subprocessadores cumprem obrigações equivalentes de proteção de dados.
              </p>
              <p>
                <strong>5.3 Novos Subprocessadores:</strong> Antes de incluir novos subprocessadores, Shiftera notificará o Cliente com 30 dias de antecedência por email. O Cliente pode objetar por escrito dentro de 15 dias.
              </p>
              <p>
                <strong>5.4 Obrigações Contratais:</strong> Shiftera obriga subprocessadores, por contrato, a cumprir com obrigações equivalentes ao RGPD Art. 28, incluindo confidencialidade, segurança e assistência em direitos dos titulares.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">6. Direitos dos Titulares de Dados</h2>
            <p>
              Shiftera auxiliará o Cliente na garantia dos seguintes direitos dos titulares:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-3 text-sm">
              <li><strong>Acesso (Art. 15):</strong> Fornecimento de cópia dos dados pessoais</li>
              <li><strong>Retificação (Art. 16):</strong> Correção de dados inexatos</li>
              <li><strong>Eliminação (Art. 17):</strong> Eliminação de dados ("direito ao esquecimento")</li>
              <li><strong>Restrição (Art. 18):</strong> Limitação do tratamento</li>
              <li><strong>Portabilidade (Art. 20):</strong> Dados em formato estruturado e portável</li>
              <li><strong>Oposição (Art. 21):</strong> Objeção ao tratamento para fins específicos</li>
            </ul>
            <p className="mt-3">
              O Cliente é responsável por responder aos pedidos de titulares no prazo legal (máx. 30 dias). Shiftera proporcionará assistência técnica e documental quando necessário.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">7. Violações de Dados Pessoais (Art. 33)</h2>
            <div className="space-y-3">
              <p>
                <strong>7.1 Notificação Imediata:</strong> Em caso de violação que afete dados pessoais, Shiftera notificará o Cliente sem demora desnecessária e, em qualquer caso, num prazo não superior a 48 horas. A notificação incluirá:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-sm">
                <li>Descrição da natureza da violação</li>
                <li>Categorias e número aproximado de titulares afetados</li>
                <li>Efeitos prováveis da violação</li>
                <li>Medidas tomadas ou propostas para remediar</li>
                <li>Contacto para mais informações</li>
              </ul>
              <p className="mt-3">
                <strong>7.2 Investigação:</strong> Shiftera investigará a violação e fornecerá ao Cliente informações suficientes para cumprir com as obrigações de notificação à autoridade supervisora (CNPD).
              </p>
              <p>
                <strong>7.3 Resposta Técnica:</strong> Shiftera implementará medidas para conter a violação e evitar futuras ocorrências.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">8. Auditoria e Inspeção (Art. 28.3.h)</h2>
            <p>
              O Cliente (ou auditor independente por seu pedido) tem direito a auditar as instalações e processos de Shiftera relacionados com o tratamento de dados pessoais, mediante notificação prévia de 30 dias por escrito. Shiftera fornecerá acesso a informações, registos de processamento, e documentação relevante. Shiftera pode estabelecer restrições razoáveis de sigilo ou segurança.
            </p>
            <p className="mt-3">
              Shiftera não está sujeita a certificações de segurança formais (SOC 2, ISO 27001) no momento, mas implementa medidas de boas práticas conforme descrito neste ATA.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">9. Eliminação ou Devolução de Dados</h2>
            <div className="space-y-3">
              <p>
                <strong>9.1 Após Términoe da Relação:</strong> Após rescisão do contrato de Serviço, Shiftera, conforme instruções escritas do Cliente, irá:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Devolver todos os dados pessoais num formato estruturado e comum (JSON, CSV)</li>
                <li>Ou eliminar permanentemente todos os dados pessoais</li>
              </ul>
              <p className="mt-3">
                <strong>9.2 Cópia de Segurança:</strong> Uma cópia de segurança pode ser mantida durante 30 dias para fins de conformidade legal, sendo depois eliminada permanentemente.
              </p>
              <p>
                <strong>9.3 Processo de Eliminação:</strong> Shiftera elimina dados através de métodos seguros que impedem recuperação (sobrescrita, criptografia de chaves, destruição física se aplicável).
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">10. Lei Aplicável e Jurisdição</h2>
            <p>
              Este ATA é regido pelas leis de Portugal e pelo RGPD. As partes concordam com a jurisdição dos tribunais de Lisboa, Portugal, para qualquer disputa relacionada com este ATA.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">11. Contacto e Escalada</h2>
            <p>
              Para questões sobre este ATA:
            </p>
            <div className="mt-3 space-y-1 text-stone-600 text-sm">
              <p>Email DPO: <a href="mailto:dpo@shiftera.app" className="text-blue-600 hover:underline">dpo@shiftera.app</a></p>
              <p>Email Geral: <a href="mailto:hello@shiftera.app" className="text-blue-600 hover:underline">hello@shiftera.app</a></p>
              <p>Endereço: [Endereço fiscal a definir após constituição da empresa]</p>
            </div>
          </div>

          <div className="bg-stone-50 rounded-lg p-6 mt-8 border border-stone-200">
            <p className="text-sm text-stone-600">
              <strong>Vigência:</strong> Este Acordo de Tratamento de Dados entra em vigor com a aceitação pelos Termos de Serviço de Shiftera e permanece em vigor enquanto dados pessoais forem processados. Alterações serão notificadas conforme disposto acima.
            </p>
          </div>
        </>
      ),
    },
    en: {
      title: "Data Processing Agreement",
      lastUpdated: "Last updated: April 14, 2026",
      backLabel: "Back to site",
      body: (
        <>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-8">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Beta draft.</strong> This document will be reviewed by counsel before commercial launch. Registered address will be added after company incorporation.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">1. Purpose and Scope</h2>
            <p>
              This Data Processing Agreement (DPA) is entered into between the Customer and Shiftera in accordance with Article 28 of the General Data Protection Regulation (GDPR - EU Regulation 2016/679).
            </p>
            <p className="mt-3">
              Shiftera acts as a Data Processor regarding personal data of employees and users processed through the Service. The Customer is the Data Controller responsible for processing instructions.
            </p>
            <p className="mt-3">
              This DPA applies to all personal data processed by Shiftera when providing the Service, including account data, schedules, availabilities, and activity logs.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">2. Definitions (GDPR Art. 4)</h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Personal Data:</strong> Any information relating to an identified or identifiable natural person (e.g., name, email, location data or online identifiers).
              </p>
              <p>
                <strong>Controller:</strong> The entity (Customer) that determines the purposes and means of personal data processing.
              </p>
              <p>
                <strong>Processor:</strong> The entity (Shiftera) that processes personal data on behalf of the Controller.
              </p>
              <p>
                <strong>Personnel Data:</strong> Personal data of employees, users, and other persons whose data is processed through the Service.
              </p>
              <p>
                <strong>Personal Data Breach:</strong> A security incident that results in unauthorized access, disclosure, or destruction of personal data.
              </p>
              <p>
                <strong>Processing:</strong> Any operation on personal data (collection, recording, use, alteration, deletion, etc.).
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">3. Nature and Purpose of Processing</h2>
            <div className="space-y-3">
              <p>
                <strong>3.1 Categories of Personal Data:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Identification data (name, email, identification number)</li>
                <li>Contact data (email, phone)</li>
                <li>Employment data (position, department, schedules)</li>
                <li>Availability and shift data</li>
                <li>Technical logs (IP, timestamps, actions performed)</li>
              </ul>
              <p className="mt-3">
                <strong>3.2 Categories of Data Subjects:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Customer's organization employees</li>
                <li>HR managers and administrators</li>
                <li>End users of the Shiftera platform</li>
              </ul>
              <p className="mt-3">
                <strong>3.3 Purpose of Processing:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Shift and turn management</li>
                <li>Availability control</li>
                <li>Processing of leave and swap requests</li>
                <li>Generation of labor reports</li>
                <li>Validation of legal compliance</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">4. Obligations of Shiftera (Processor)</h2>
            <div className="space-y-3">
              <p>
                <strong>4.1 Process Data Only Per Instructions:</strong> Shiftera processes personal data exclusively per documented instructions from the Customer, including regarding purposes, duration, nature and categories of data and data subjects. Shiftera will not process data for different purposes without prior written consent.
              </p>
              <p>
                <strong>4.2 Confidentiality:</strong> Shiftera ensures that persons authorized to process personal data (employees, contractors) are bound by contract or law to maintain confidentiality.
              </p>
              <p>
                <strong>4.3 Security Measures (Art. 32):</strong> Shiftera implements appropriate technical and organizational measures:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>SSL/TLS encryption in transit (HTTPS mandatory)</li>
                <li>At-rest encryption of data in Supabase</li>
                <li>Row-Level Security (RLS) for data isolation</li>
                <li>Bcrypt password encryption</li>
                <li>Role-based access control (RBAC)</li>
                <li>Continuous security monitoring via Sentry</li>
                <li>Regular backups and recovery testing</li>
                <li>Strong authentication policy (2FA available)</li>
              </ul>
              <p className="mt-3">
                <strong>4.4 Cooperation on Data Subject Rights:</strong> Shiftera will assist the Customer in responding to data subject requests (access, rectification, deletion, portability, etc.) within GDPR timelines (max. 30 days). The Customer retains final responsibility for compliance.
              </p>
              <p>
                <strong>4.5 Breach Notification:</strong> Shiftera will notify the Customer of any personal data breach without undue delay and, in any case, within 48 hours of identifying the breach.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">5. Sub-processors (Art. 28.2, 28.4)</h2>
            <div className="space-y-3">
              <p>
                <strong>5.1 Current List of Sub-processors:</strong>
              </p>
              <table className="w-full border-collapse border border-stone-300 mt-3">
                <thead>
                  <tr className="bg-stone-100">
                    <th className="border border-stone-300 p-2 text-left">Sub-processor</th>
                    <th className="border border-stone-300 p-2 text-left">Function</th>
                    <th className="border border-stone-300 p-2 text-left">Location</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-stone-300 p-2">Supabase (supabase.com)</td>
                    <td className="border border-stone-300 p-2">Database and authentication</td>
                    <td className="border border-stone-300 p-2">Frankfurt, EU</td>
                  </tr>
                  <tr>
                    <td className="border border-stone-300 p-2">Vercel (vercel.com)</td>
                    <td className="border border-stone-300 p-2">Hosting and CDN</td>
                    <td className="border border-stone-300 p-2">EU regions</td>
                  </tr>
                  <tr>
                    <td className="border border-stone-300 p-2">Resend (resend.com)</td>
                    <td className="border border-stone-300 p-2">Transactional email</td>
                    <td className="border border-stone-300 p-2">EU</td>
                  </tr>
                  <tr>
                    <td className="border border-stone-300 p-2">Sentry (sentry.io)</td>
                    <td className="border border-stone-300 p-2">Error tracking</td>
                    <td className="border border-stone-300 p-2">EU</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-3">
                <strong>5.2 Authorization:</strong> The Customer authorizes Shiftera to use the sub-processors listed above. Shiftera has implemented measures to ensure that sub-processors comply with equivalent data protection obligations.
              </p>
              <p>
                <strong>5.3 New Sub-processors:</strong> Before engaging new sub-processors, Shiftera will notify the Customer 30 days in advance by email. The Customer may object in writing within 15 days.
              </p>
              <p>
                <strong>5.4 Contractual Obligations:</strong> Shiftera contractually binds sub-processors to comply with obligations equivalent to GDPR Art. 28, including confidentiality, security, and assistance with data subject rights.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">6. Data Subject Rights</h2>
            <p>
              Shiftera will assist the Customer in ensuring the following data subject rights:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-3 text-sm">
              <li><strong>Access (Art. 15):</strong> Provision of a copy of personal data</li>
              <li><strong>Rectification (Art. 16):</strong> Correction of inaccurate data</li>
              <li><strong>Erasure (Art. 17):</strong> Deletion of data ("right to be forgotten")</li>
              <li><strong>Restriction (Art. 18):</strong> Limitation of processing</li>
              <li><strong>Portability (Art. 20):</strong> Data in a structured and portable format</li>
              <li><strong>Objection (Art. 21):</strong> Objection to processing for specific purposes</li>
            </ul>
            <p className="mt-3">
              The Customer is responsible for responding to data subject requests within legal timelines (max. 30 days). Shiftera will provide technical and documentary assistance when needed.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">7. Personal Data Breaches (Art. 33)</h2>
            <div className="space-y-3">
              <p>
                <strong>7.1 Immediate Notification:</strong> In the event of a breach affecting personal data, Shiftera will notify the Customer without undue delay and, in any case, within 48 hours of identifying the breach. The notification will include:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-sm">
                <li>Description of the nature of the breach</li>
                <li>Categories and approximate number of affected data subjects</li>
                <li>Likely effects of the breach</li>
                <li>Measures taken or proposed to remedy the breach</li>
                <li>Contact for further information</li>
              </ul>
              <p className="mt-3">
                <strong>7.2 Investigation:</strong> Shiftera will investigate the breach and provide the Customer with sufficient information to meet notification obligations to the supervisory authority (CNPD).
              </p>
              <p>
                <strong>7.3 Technical Response:</strong> Shiftera will implement measures to contain the breach and prevent future occurrences.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">8. Audits and Inspections (Art. 28.3.h)</h2>
            <p>
              The Customer (or an independent auditor at Customer's request) has the right to audit Shiftera's facilities and processes related to personal data processing, upon 30 days' prior written notice. Shiftera will provide access to information, processing records, and relevant documentation. Shiftera may impose reasonable confidentiality or security restrictions.
            </p>
            <p className="mt-3">
              Shiftera is not currently subject to formal security certifications (SOC 2, ISO 27001), but implements industry best practice measures as described in this DPA.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">9. Deletion or Return of Data</h2>
            <div className="space-y-3">
              <p>
                <strong>9.1 Upon Termination:</strong> Upon termination of the Service contract, Shiftera, per Customer's written instructions, will either:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Return all personal data in a structured and common format (JSON, CSV)</li>
                <li>Or permanently delete all personal data</li>
              </ul>
              <p className="mt-3">
                <strong>9.2 Backup Copy:</strong> A backup copy may be retained for 30 days for compliance purposes, then permanently deleted.
              </p>
              <p>
                <strong>9.3 Deletion Process:</strong> Shiftera deletes data using secure methods that prevent recovery (overwriting, key encryption, physical destruction where applicable).
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">10. Applicable Law and Jurisdiction</h2>
            <p>
              This DPA is governed by Portuguese law and the GDPR. The parties agree to the jurisdiction of the courts of Lisbon, Portugal, for any dispute arising from this DPA.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">11. Contact and Escalation</h2>
            <p>
              For questions regarding this DPA:
            </p>
            <div className="mt-3 space-y-1 text-stone-600 text-sm">
              <p>DPO Email: <a href="mailto:dpo@shiftera.app" className="text-blue-600 hover:underline">dpo@shiftera.app</a></p>
              <p>General Email: <a href="mailto:hello@shiftera.app" className="text-blue-600 hover:underline">hello@shiftera.app</a></p>
              <p>Address: [Registered address to be defined after company incorporation]</p>
            </div>
          </div>

          <div className="bg-stone-50 rounded-lg p-6 mt-8 border border-stone-200">
            <p className="text-sm text-stone-600">
              <strong>Effective Date:</strong> This Data Processing Agreement becomes effective upon acceptance through Shiftera's Terms of Service and remains in effect while personal data is processed. Changes will be notified as provided above.
            </p>
          </div>
        </>
      ),
    },
    es: {
      title: "Acuerdo de Tratamiento de Datos",
      lastUpdated: "Última actualización: 14 de abril de 2026",
      backLabel: "Volver al sitio",
      body: (
        <>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-8">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Borrador beta.</strong> Este documento será revisado por un abogado antes del lanzamiento comercial. La dirección registrada se añadirá después de la constitución de la empresa.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">1. Propósito y Alcance</h2>
            <p>
              Este Acuerdo de Tratamiento de Datos (ATD) se celebra entre el Cliente y Shiftera de conformidad con el Artículo 28 del Reglamento General de Protección de Datos (RGPD - Reglamento UE 2016/679).
            </p>
            <p className="mt-3">
              Shiftera actúa como Encargado del Tratamiento respecto a los datos personales de empleados y usuarios procesados a través del Servicio. El Cliente es el Responsable del Tratamiento responsable de las instrucciones de tratamiento.
            </p>
            <p className="mt-3">
              Este ATD se aplica a todos los datos personales procesados por Shiftera al proporcionar el Servicio, incluyendo datos de cuenta, horarios, disponibilidades y registros de actividad.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">2. Definiciones (RGPD Art. 4)</h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Datos Personales:</strong> Cualquier información relativa a una persona física identificada o identificable (p. ej., nombre, correo electrónico, datos de ubicación o identificadores en línea).
              </p>
              <p>
                <strong>Responsable:</strong> La entidad (Cliente) que determina los fines y medios del tratamiento de datos personales.
              </p>
              <p>
                <strong>Encargado:</strong> La entidad (Shiftera) que trata datos personales en nombre del Responsable.
              </p>
              <p>
                <strong>Datos de Personal:</strong> Datos personales de empleados, usuarios y otras personas cuyos datos se procesan a través del Servicio.
              </p>
              <p>
                <strong>Violación de Datos Personales:</strong> Un incidente de seguridad que resulta en acceso no autorizado, divulgación o destrucción de datos personales.
              </p>
              <p>
                <strong>Tratamiento:</strong> Cualquier operación sobre datos personales (recopilación, grabación, uso, alteración, eliminación, etc.).
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">3. Naturaleza y Propósito del Tratamiento</h2>
            <div className="space-y-3">
              <p>
                <strong>3.1 Categorías de Datos Personales:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Datos de identificación (nombre, correo electrónico, número de identificación)</li>
                <li>Datos de contacto (correo electrónico, teléfono)</li>
                <li>Datos de empleo (puesto, departamento, horarios)</li>
                <li>Datos de disponibilidad y turnos</li>
                <li>Registros técnicos (IP, marcas de tiempo, acciones realizadas)</li>
              </ul>
              <p className="mt-3">
                <strong>3.2 Categorías de Interesados:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Empleados de la organización del Cliente</li>
                <li>Gerentes y administradores de RRHH</li>
                <li>Usuarios finales de la plataforma Shiftera</li>
              </ul>
              <p className="mt-3">
                <strong>3.3 Propósito del Tratamiento:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Gestión de turnos y horarios</li>
                <li>Control de disponibilidad</li>
                <li>Procesamiento de solicitudes de ausencias e intercambios</li>
                <li>Generación de informes laborales</li>
                <li>Validación del cumplimiento legal</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">4. Obligaciones de Shiftera (Encargado)</h2>
            <div className="space-y-3">
              <p>
                <strong>4.1 Procesar Datos Solo Según Instrucciones:</strong> Shiftera procesa datos personales exclusivamente según instrucciones documentadas del Cliente, incluyendo respecto a fines, duración, naturaleza y categorías de datos e interesados. Shiftera no procesará datos para fines diferentes sin consentimiento previo por escrito.
              </p>
              <p>
                <strong>4.2 Confidencialidad:</strong> Shiftera garantiza que las personas autorizadas a procesar datos personales (empleados, contratistas) están obligadas por contrato o ley a mantener confidencialidad.
              </p>
              <p>
                <strong>4.3 Medidas de Seguridad (Art. 32):</strong> Shiftera implementa medidas técnicas y organizacionales apropiadas:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Encriptación SSL/TLS en tránsito (HTTPS obligatorio)</li>
                <li>Encriptación en reposo de datos en Supabase</li>
                <li>Seguridad a nivel de fila (RLS) para aislamiento de datos</li>
                <li>Encriptación de contraseña con bcrypt</li>
                <li>Control de acceso basado en roles (RBAC)</li>
                <li>Monitoreo continuo de seguridad via Sentry</li>
                <li>Copias de seguridad regulares y pruebas de recuperación</li>
                <li>Política de autenticación fuerte (2FA disponible)</li>
              </ul>
              <p className="mt-3">
                <strong>4.4 Cooperación en Derechos de Interesados:</strong> Shiftera asistirá al Cliente en responder a solicitudes de interesados (acceso, rectificación, eliminación, portabilidad, etc.) dentro de plazos RGPD (máx. 30 días). El Cliente retiene la responsabilidad final del cumplimiento.
              </p>
              <p>
                <strong>4.5 Notificación de Violación:</strong> Shiftera notificará al Cliente de cualquier violación de datos personales sin demora indebida y, en cualquier caso, dentro de 48 horas de identificar la violación.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">5. Subencargados (Art. 28.2, 28.4)</h2>
            <div className="space-y-3">
              <p>
                <strong>5.1 Lista Actual de Subencargados:</strong>
              </p>
              <table className="w-full border-collapse border border-stone-300 mt-3">
                <thead>
                  <tr className="bg-stone-100">
                    <th className="border border-stone-300 p-2 text-left">Subencargado</th>
                    <th className="border border-stone-300 p-2 text-left">Función</th>
                    <th className="border border-stone-300 p-2 text-left">Ubicación</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-stone-300 p-2">Supabase (supabase.com)</td>
                    <td className="border border-stone-300 p-2">Base de datos y autenticación</td>
                    <td className="border border-stone-300 p-2">Frankfurt, UE</td>
                  </tr>
                  <tr>
                    <td className="border border-stone-300 p-2">Vercel (vercel.com)</td>
                    <td className="border border-stone-300 p-2">Hospedaje y CDN</td>
                    <td className="border border-stone-300 p-2">Regiones UE</td>
                  </tr>
                  <tr>
                    <td className="border border-stone-300 p-2">Resend (resend.com)</td>
                    <td className="border border-stone-300 p-2">Correo transaccional</td>
                    <td className="border border-stone-300 p-2">UE</td>
                  </tr>
                  <tr>
                    <td className="border border-stone-300 p-2">Sentry (sentry.io)</td>
                    <td className="border border-stone-300 p-2">Seguimiento de errores</td>
                    <td className="border border-stone-300 p-2">UE</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-3">
                <strong>5.2 Autorización:</strong> El Cliente autoriza a Shiftera a utilizar los subencargados listados anteriormente. Shiftera ha implementado medidas para garantizar que los subencargados cumplen con obligaciones de protección de datos equivalentes.
              </p>
              <p>
                <strong>5.3 Nuevos Subencargados:</strong> Antes de contratar nuevos subencargados, Shiftera notificará al Cliente 30 días antes por correo electrónico. El Cliente puede objetar por escrito dentro de 15 días.
              </p>
              <p>
                <strong>5.4 Obligaciones Contractuales:</strong> Shiftera vincula contractualmente a los subencargados a cumplir con obligaciones equivalentes al RGPD Art. 28, incluyendo confidencialidad, seguridad y asistencia con derechos de interesados.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">6. Derechos de Interesados</h2>
            <p>
              Shiftera asistirá al Cliente en garantizar los siguientes derechos de interesados:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-3 text-sm">
              <li><strong>Acceso (Art. 15):</strong> Provisión de copia de datos personales</li>
              <li><strong>Rectificación (Art. 16):</strong> Corrección de datos inexactos</li>
              <li><strong>Eliminación (Art. 17):</strong> Eliminación de datos ("derecho al olvido")</li>
              <li><strong>Restricción (Art. 18):</strong> Limitación del tratamiento</li>
              <li><strong>Portabilidad (Art. 20):</strong> Datos en formato estructurado y portable</li>
              <li><strong>Objeción (Art. 21):</strong> Objeción al tratamiento para fines específicos</li>
            </ul>
            <p className="mt-3">
              El Cliente es responsable de responder a solicitudes de interesados dentro de plazos legales (máx. 30 días). Shiftera proporcionará asistencia técnica y documental cuando sea necesario.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">7. Violaciones de Datos Personales (Art. 33)</h2>
            <div className="space-y-3">
              <p>
                <strong>7.1 Notificación Inmediata:</strong> En caso de una violación que afecte datos personales, Shiftera notificará al Cliente sin demora indebida y, en cualquier caso, dentro de 48 horas de identificar la violación. La notificación incluirá:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-sm">
                <li>Descripción de la naturaleza de la violación</li>
                <li>Categorías y número aproximado de interesados afectados</li>
                <li>Efectos probables de la violación</li>
                <li>Medidas tomadas o propuestas para remediar la violación</li>
                <li>Contacto para más información</li>
              </ul>
              <p className="mt-3">
                <strong>7.2 Investigación:</strong> Shiftera investigará la violación y proporcionará al Cliente información suficiente para cumplir con las obligaciones de notificación a la autoridad supervisora (CNPD).
              </p>
              <p>
                <strong>7.3 Respuesta Técnica:</strong> Shiftera implementará medidas para contener la violación y prevenir futuras ocurrencias.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">8. Auditorías e Inspecciones (Art. 28.3.h)</h2>
            <p>
              El Cliente (o un auditor independiente a solicitud del Cliente) tiene derecho a auditar las instalaciones y procesos de Shiftera relacionados con el tratamiento de datos personales, previa notificación escrita de 30 días. Shiftera proporcionará acceso a información, registros de tratamiento y documentación relevante. Shiftera puede imponer restricciones razonables de confidencialidad o seguridad.
            </p>
            <p className="mt-3">
              Shiftera actualmente no está sujeto a certificaciones de seguridad formales (SOC 2, ISO 27001), pero implementa medidas de mejores prácticas de la industria como se describe en este ATD.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">9. Eliminación o Devolución de Datos</h2>
            <div className="space-y-3">
              <p>
                <strong>9.1 Tras la Terminación:</strong> Tras la terminación del contrato de Servicio, Shiftera, según las instrucciones escritas del Cliente, hará lo siguiente:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Devolver todos los datos personales en un formato estructurado y común (JSON, CSV)</li>
                <li>O eliminar permanentemente todos los datos personales</li>
              </ul>
              <p className="mt-3">
                <strong>9.2 Copia de Seguridad:</strong> Una copia de seguridad puede retenerse durante 30 días para fines de cumplimiento, luego se eliminará permanentemente.
              </p>
              <p>
                <strong>9.3 Proceso de Eliminación:</strong> Shiftera elimina datos mediante métodos seguros que previenen recuperación (sobrescritura, encriptación de claves, destrucción física cuando sea aplicable).
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">10. Ley Aplicable y Jurisdicción</h2>
            <p>
              Este ATD se rige por la ley portuguesa y el RGPD. Las partes acuerdan con la jurisdicción de los tribunales de Lisboa, Portugal, para cualquier disputa que surja de este ATD.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">11. Contacto y Escalada</h2>
            <p>
              Para preguntas respecto a este ATD:
            </p>
            <div className="mt-3 space-y-1 text-stone-600 text-sm">
              <p>Correo Electrónico DPO: <a href="mailto:dpo@shiftera.app" className="text-blue-600 hover:underline">dpo@shiftera.app</a></p>
              <p>Correo Electrónico General: <a href="mailto:hello@shiftera.app" className="text-blue-600 hover:underline">hello@shiftera.app</a></p>
              <p>Dirección: [Dirección registrada a definir después de la constitución de la empresa]</p>
            </div>
          </div>

          <div className="bg-stone-50 rounded-lg p-6 mt-8 border border-stone-200">
            <p className="text-sm text-stone-600">
              <strong>Fecha Efectiva:</strong> Este Acuerdo de Tratamiento de Datos entra en vigor al aceptar los Términos de Servicio de Shiftera y permanece en vigor mientras se procesan datos personales. Los cambios se notificarán como se proporciona anteriormente.
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
