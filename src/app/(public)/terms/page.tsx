"use client";

import { useLocale } from "next-intl";
import { LegalLayout } from "@/components/lp/LegalLayout";

export default function TermsPage() {
  const locale = useLocale();

  const content = {
    pt: {
      title: "Termos de Serviço",
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
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">1. Introdução e Escopo</h2>
            <p>
              Bem-vindo ao Shiftera. Estes Termos de Serviço ("Termos") regem o seu uso da plataforma Shiftera, incluindo o website, aplicações e todos os serviços associados (coletivamente, o "Serviço"). O Serviço é fornecido por Shiftera ("Nós", "Nos", "Shiftera").
            </p>
            <p className="mt-3">
              A Shiftera é uma plataforma digital SaaS que oferece funcionalidades de gestão de escalas de trabalho, controlo de disponibilidades, pedidos de folgas e trocas de turnos, especificamente desenvolvida para farmácias, clínicas, laboratórios e outras organizações em Portugal.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">2. Conta e Elegibilidade</h2>
            <div className="space-y-3">
              <p>
                <strong>2.1 Elegibilidade:</strong> Para utilizar o Serviço, deve ter pelo menos 16 anos de idade e ser representante legalmente autorizado de uma organização válida (empresa, farmácia, clínica ou instituição de saúde). Ao criar uma conta, garante que detém a autoridade para celebrar este acordo em nome da sua organização.
              </p>
              <p>
                <strong>2.2 Criação de Conta:</strong> Compromete-se a fornecer informações precisas, atualizadas e completas durante o registo e a mantê-las atualizadas. É exclusivamente responsável pela confidencialidade da sua password e por todas as atividades que ocorram na sua conta. Notifique-nos imediatamente de qualquer uso não autorizado.
              </p>
              <p>
                <strong>2.3 Uma Conta por Organização:</strong> Cada organização pode registar-se uma única vez. Contas duplicadas ou fraudulentas serão encerradas.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">3. Período de Teste e Subscrição</h2>
            <div className="space-y-3">
              <p>
                <strong>3.1 Período de Teste Gratuito:</strong> Oferecemos um período de teste de 14 dias sem necessidade de cartão de crédito. Durante este período, tem acesso a todas as funcionalidades do Serviço.
              </p>
              <p>
                <strong>3.2 Renovação Automática:</strong> Após expiração do período de teste, a subscrição renova automaticamente no primeiro ciclo de faturação, a menos que cancele antes da data de vencimento. Receberá notificação por email 7 dias antes da renovação.
              </p>
              <p>
                <strong>3.3 Modelo de Preços:</strong> O Serviço opera sob um modelo de subscrição baseado em utilizadores:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Taxa base: €19,00 por mês (inclui até 3 utilizadores)</li>
                <li>Taxa por utilizador adicional: €2,00 por utilizador/mês (acima de 3 utilizadores)</li>
                <li>Exemplo: 10 utilizadores = €19 + (7 × €2) = €33/mês</li>
                <li>IVA não incluído (será adicionado conforme legislação portuguesa)</li>
              </ul>
              <p className="mt-3">
                <strong>3.4 Faturação:</strong> Atualmente, a faturação é efetuada manualmente. No futuro, implementaremos pagamentos automáticos via Stripe. Receberá faturas eletrónicas pelo email registado.
              </p>
              <p>
                <strong>3.5 Reembolsos:</strong> Não oferecemos reembolsos por períodos de teste não utilizados ou por cancelamento antecipado.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">4. Responsabilidades do Utilizador</h2>
            <div className="space-y-3">
              <p>
                <strong>4.1 Uso Lícito:</strong> Compromete-se a usar o Serviço apenas de forma lícita e em conformidade com todas as leis e regulamentos aplicáveis, incluindo o Código do Trabalho português.
              </p>
              <p>
                <strong>4.2 Dados Corretos:</strong> É responsável por garantir que todos os dados introduzidos (nomes, horários, disponibilidades) são precisos e atualizados. Verificará regularmente a conformidade com legislação laboral.
              </p>
              <p>
                <strong>4.3 Segurança da Conta:</strong> Compromete-se a manter a segurança das credenciais de acesso e a não partilhar a password. Qualquer violação de segurança deve ser reportada imediatamente a hello@shiftera.app.
              </p>
              <p>
                <strong>4.4 Proibições:</strong> Não pode:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Reproduzir, copiar ou piratear qualquer conteúdo ou funcionalidade do Serviço</li>
                <li>Desmontar, reverter ou tentar descobrir o código-fonte</li>
                <li>Usar o Serviço para atividades ilegais, fraudulentas ou prejudiciais</li>
                <li>Aceder não autorizado a sistemas, dados ou redes</li>
                <li>Interferir com o funcionamento do Serviço ou de outros utilizadores</li>
                <li>Violar direitos de propriedade intelectual</li>
                <li>Automatizar acesso sem consentimento escrito</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">5. Propriedade Intelectual</h2>
            <div className="space-y-3">
              <p>
                <strong>5.1 Propriedade da Shiftera:</strong> Todos os direitos de propriedade intelectual do Serviço, incluindo software, design, interfaces, gráficos, logos e conteúdo, pertencem a Shiftera e aos seus licenciantes. O código-fonte, bases de dados e documentação são protegidos por direitos de autor e segredos comerciais.
              </p>
              <p>
                <strong>5.2 Sua Propriedade:</strong> Retém total propriedade dos dados que introduz no Serviço (escalas, disponibilidades, dados de colaboradores). Concede a Shiftera uma licença para usar esses dados exclusivamente para prestar e melhorar o Serviço.
              </p>
              <p>
                <strong>5.3 Feedback:</strong> Qualquer feedback, sugestões ou comentários que forneça sobre o Serviço poderá ser utilizado livremente por Shiftera sem obrigação de compensação ou reconhecimento.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">6. Confidencialidade</h2>
            <p>
              Ambas as partes concordam em manter como confidenciais informações proprietárias compartilhadas durante o uso do Serviço. A confidencialidade não se aplica a informações que são: (a) públicas; (b) obrigatoriamente divulgadas por lei; ou (c) recebidas de terceiros sem restrição de confidencialidade.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">7. Limitação de Responsabilidade</h2>
            <div className="space-y-3">
              <p>
                <strong>7.1 Isenção de Garantias:</strong> O Serviço é fornecido "como está" e "como disponível", sem garantias expressas ou implícitas. Não garantimos:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Acesso ininterrupto ou livre de erros</li>
                <li>Adequação para fins específicos ou resultados específicos</li>
                <li>Precisão absoluta das validações legais</li>
              </ul>
              <p className="mt-3">
                <strong>7.2 Responsabilidades do Utilizador:</strong> É responsabilidade sua:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Verificar que os horários cumprem toda a legislação laboral aplicável</li>
                <li>Manter cópias de segurança regularmente dos seus dados</li>
                <li>Usar o Serviço em conformidade com a lei portuguesa</li>
              </ul>
              <p className="mt-3">
                <strong>7.3 Limite de Responsabilidade:</strong> A responsabilidade total de Shiftera perante si não excederá o valor pago por si nos últimos 12 meses de utilização do Serviço. Em nenhum caso seremos responsáveis por danos indiretos, incidentais, especiais ou consequentes.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">8. Suspensão e Rescisão</h2>
            <div className="space-y-3">
              <p>
                <strong>8.1 Cancelamento pelo Utilizador:</strong> Pode cancelar a subscrição a qualquer momento através da área de Definições na plataforma. O acesso continuará até ao final do período de faturação em curso.
              </p>
              <p>
                <strong>8.2 Dados Após Cancelamento:</strong> Após cancelamento, os seus dados serão retidos por 30 dias. Após este período, serão permanentemente eliminados e não poderão ser recuperados, exceto se exigido por lei.
              </p>
              <p>
                <strong>8.3 Rescisão pela Shiftera:</strong> Podemos rescindir o acesso se: (a) violar estes Termos; (b) utilizar o Serviço de forma abusiva ou ilegal; (c) não pagar as taxas devidas; ou (d) por razões técnicas ou comerciais, com 15 dias de aviso prévio por email.
              </p>
              <p>
                <strong>8.4 Efeito da Rescisão:</strong> Após rescisão, perderá acesso a toda a plataforma e dados.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">9. Modificações dos Termos</h2>
            <p>
              Reservamos o direito de modificar estes Termos a qualquer momento. Notificaremos sobre mudanças substanciais com 30 dias de aviso prévio por email. O uso continuado do Serviço após as modificações constitui aceitação dos novos Termos.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">10. Lei Aplicável e Jurisdição</h2>
            <p>
              Estes Termos são regidos pelas leis da República Portuguesa, sem consideração aos seus conflitos de princípios legais. Qualquer litígio, ação ou procedimento decorrente destes Termos será resolvido exclusivamente nos tribunais da jurisdição de Lisboa, Portugal.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">11. Contacto</h2>
            <p>
              Para questões, reclamações ou notificações sobre estes Termos, contacte-nos:
            </p>
            <div className="mt-3 space-y-2 text-stone-600">
              <p>
                Email: <a href="mailto:hello@shiftera.app" className="text-blue-600 hover:underline">hello@shiftera.app</a>
              </p>
              <p>
                Website: <a href="https://shiftera.app" className="text-blue-600 hover:underline">shiftera.app</a>
              </p>
              <p>
                Endereço: [Endereço fiscal a definir após constituição da empresa]
              </p>
            </div>
          </div>

          <div className="bg-stone-50 rounded-lg p-6 mt-8 border border-stone-200">
            <p className="text-sm text-stone-600">
              <strong>Disposições Finais:</strong> Estes Termos constituem o acordo integral entre si e Shiftera. Se qualquer cláusula for considerada inválida ou inexequível, as cláusulas restantes permanecerão em pleno vigor. A não aplicação de qualquer direito não constitui renúncia àquele direito.
            </p>
          </div>
        </>
      ),
    },
    en: {
      title: "Terms of Service",
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
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">1. Introduction and Scope</h2>
            <p>
              Welcome to Shiftera. These Terms of Service ("Terms") govern your use of the Shiftera platform, including the website, applications, and all associated services (collectively, the "Service"). The Service is provided by Shiftera ("We", "Us", "Shiftera").
            </p>
            <p className="mt-3">
              Shiftera is a digital SaaS platform that offers shift scheduling management, availability control, leave requests, and shift-swap functionality, specifically developed for pharmacies, clinics, laboratories, and other organizations in Portugal.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">2. Account and Eligibility</h2>
            <div className="space-y-3">
              <p>
                <strong>2.1 Eligibility:</strong> To use the Service, you must be at least 16 years of age and an authorized representative of a valid organization (company, pharmacy, clinic, or healthcare institution). By creating an account, you warrant that you have the authority to bind your organization to this agreement.
              </p>
              <p>
                <strong>2.2 Account Creation:</strong> You agree to provide accurate, current, and complete information during registration and maintain such information. You are solely responsible for password confidentiality and all activities under your account. Notify us immediately of any unauthorized use.
              </p>
              <p>
                <strong>2.3 One Account Per Organization:</strong> Each organization may register once. Duplicate or fraudulent accounts will be terminated.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">3. Trial Period and Subscription</h2>
            <div className="space-y-3">
              <p>
                <strong>3.1 Free Trial Period:</strong> We offer a 14-day trial period with no credit card required. During this period, you have access to all Service features.
              </p>
              <p>
                <strong>3.2 Automatic Renewal:</strong> After the trial expires, your subscription renews automatically on the first billing cycle unless cancelled before the renewal date. You will receive email notification 7 days before renewal.
              </p>
              <p>
                <strong>3.3 Pricing Model:</strong> The Service operates under a user-based subscription model:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Base fee: €19.00 per month (includes up to 3 users)</li>
                <li>Additional user fee: €2.00 per user/month (above 3 users)</li>
                <li>Example: 10 users = €19 + (7 × €2) = €33/month</li>
                <li>VAT not included (will be added per Portuguese law)</li>
              </ul>
              <p className="mt-3">
                <strong>3.4 Billing:</strong> Currently, billing is performed manually. In the future, we will implement automatic payments via Stripe. You will receive electronic invoices at your registered email.
              </p>
              <p>
                <strong>3.5 Refunds:</strong> We do not offer refunds for unused trial periods or early cancellation.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">4. User Responsibilities</h2>
            <div className="space-y-3">
              <p>
                <strong>4.1 Lawful Use:</strong> You agree to use the Service only lawfully and in compliance with all applicable laws and regulations, including Portuguese labor law.
              </p>
              <p>
                <strong>4.2 Accurate Data:</strong> You are responsible for ensuring that all data entered (names, schedules, availabilities) is accurate and current. You will regularly verify compliance with labor legislation.
              </p>
              <p>
                <strong>4.3 Account Security:</strong> You agree to maintain the security of your login credentials and not share your password. Any security breach must be reported immediately to hello@shiftera.app.
              </p>
              <p>
                <strong>4.4 Prohibited Activities:</strong> You may not:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Reproduce, copy, or pirate any content or functionality of the Service</li>
                <li>Disassemble, reverse-engineer, or attempt to discover source code</li>
                <li>Use the Service for illegal, fraudulent, or harmful activities</li>
                <li>Gain unauthorized access to systems, data, or networks</li>
                <li>Interfere with the operation of the Service or other users</li>
                <li>Violate intellectual property rights</li>
                <li>Automate access without written consent</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">5. Intellectual Property</h2>
            <div className="space-y-3">
              <p>
                <strong>5.1 Shiftera Ownership:</strong> All intellectual property rights in the Service, including software, design, interfaces, graphics, logos, and content, belong to Shiftera and its licensors. Source code, databases, and documentation are protected by copyright and trade secrets.
              </p>
              <p>
                <strong>5.2 Your Ownership:</strong> You retain full ownership of the data you enter into the Service (schedules, availabilities, employee data). You grant Shiftera a license to use such data solely for providing and improving the Service.
              </p>
              <p>
                <strong>5.3 Feedback:</strong> Any feedback, suggestions, or comments you provide about the Service may be used freely by Shiftera without obligation of compensation or attribution.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">6. Confidentiality</h2>
            <p>
              Both parties agree to keep confidential proprietary information shared during use of the Service. Confidentiality does not apply to information that is: (a) publicly available; (b) legally required to be disclosed; or (c) received from third parties without confidentiality restrictions.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">7. Limitation of Liability</h2>
            <div className="space-y-3">
              <p>
                <strong>7.1 Disclaimer of Warranties:</strong> The Service is provided "as is" and "as available" without express or implied warranties. We do not warrant:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Uninterrupted or error-free access</li>
                <li>Fitness for specific purposes or specific results</li>
                <li>Absolute accuracy of legal validations</li>
              </ul>
              <p className="mt-3">
                <strong>7.2 User Responsibilities:</strong> It is your responsibility to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Verify that schedules comply with all applicable labor laws</li>
                <li>Regularly maintain backups of your data</li>
                <li>Use the Service in compliance with Portuguese law</li>
              </ul>
              <p className="mt-3">
                <strong>7.3 Liability Cap:</strong> Shiftera's total liability to you shall not exceed the amount paid by you in the preceding 12 months of Service use. In no event shall we be liable for indirect, incidental, special, or consequential damages.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">8. Suspension and Termination</h2>
            <div className="space-y-3">
              <p>
                <strong>8.1 Cancellation by User:</strong> You may cancel your subscription at any time through the Settings area on the platform. Access will continue until the end of your current billing period.
              </p>
              <p>
                <strong>8.2 Data After Cancellation:</strong> After cancellation, your data will be retained for 30 days. After this period, it will be permanently deleted and cannot be recovered, unless required by law.
              </p>
              <p>
                <strong>8.3 Termination by Shiftera:</strong> We may terminate access if: (a) you violate these Terms; (b) you use the Service abusively or illegally; (c) you fail to pay fees; or (d) for technical or business reasons, with 15 days' prior email notice.
              </p>
              <p>
                <strong>8.4 Effect of Termination:</strong> Upon termination, you will lose access to the entire platform and your data.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">9. Modifications to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of material changes with 30 days' prior email notice. Continued use of the Service after modifications constitutes acceptance of the new Terms.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">10. Applicable Law and Jurisdiction</h2>
            <p>
              These Terms are governed by the laws of the Portuguese Republic, without regard to its conflict of law principles. Any dispute, action, or proceeding arising from these Terms shall be resolved exclusively in the courts of Lisbon, Portugal.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">11. Contact</h2>
            <p>
              For questions, complaints, or notices regarding these Terms, contact us:
            </p>
            <div className="mt-3 space-y-2 text-stone-600">
              <p>
                Email: <a href="mailto:hello@shiftera.app" className="text-blue-600 hover:underline">hello@shiftera.app</a>
              </p>
              <p>
                Website: <a href="https://shiftera.app" className="text-blue-600 hover:underline">shiftera.app</a>
              </p>
              <p>
                Address: [Registered address to be defined after company incorporation]
              </p>
            </div>
          </div>

          <div className="bg-stone-50 rounded-lg p-6 mt-8 border border-stone-200">
            <p className="text-sm text-stone-600">
              <strong>Final Provisions:</strong> These Terms constitute the entire agreement between you and Shiftera. If any provision is found invalid or unenforceable, the remaining provisions shall remain in full force. Non-enforcement of any right does not constitute a waiver of that right.
            </p>
          </div>
        </>
      ),
    },
    es: {
      title: "Términos del Servicio",
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
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">1. Introducción y Alcance</h2>
            <p>
              Bienvenido a Shiftera. Estos Términos de Servicio ("Términos") rigen el uso de la plataforma Shiftera, incluyendo el sitio web, aplicaciones y todos los servicios asociados (colectivamente, el "Servicio"). El Servicio es proporcionado por Shiftera ("Nosotros", "Nos", "Shiftera").
            </p>
            <p className="mt-3">
              Shiftera es una plataforma SaaS digital que ofrece funcionalidades de gestión de turnos, control de disponibilidad, solicitudes de ausencias e intercambio de turnos, desarrollada específicamente para farmacias, clínicas, laboratorios y otras organizaciones en Portugal.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">2. Cuenta y Elegibilidad</h2>
            <div className="space-y-3">
              <p>
                <strong>2.1 Elegibilidad:</strong> Para usar el Servicio, debe tener al menos 16 años de edad y ser un representante autorizado de una organización válida (empresa, farmacia, clínica o institución sanitaria). Al crear una cuenta, garantiza que tiene la autoridad para vincularse a este acuerdo en nombre de su organización.
              </p>
              <p>
                <strong>2.2 Creación de Cuenta:</strong> Se compromete a proporcionar información precisa, actual y completa durante el registro y a mantenerla actualizada. Es responsable exclusivamente de la confidencialidad de su contraseña y de todas las actividades en su cuenta. Notifiquenos inmediatamente de cualquier uso no autorizado.
              </p>
              <p>
                <strong>2.3 Una Cuenta por Organización:</strong> Cada organización puede registrarse una sola vez. Las cuentas duplicadas o fraudulentas serán canceladas.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">3. Período de Prueba y Suscripción</h2>
            <div className="space-y-3">
              <p>
                <strong>3.1 Período de Prueba Gratuito:</strong> Ofrecemos un período de prueba de 14 días sin necesidad de tarjeta de crédito. Durante este período, tiene acceso a todas las funcionalidades del Servicio.
              </p>
              <p>
                <strong>3.2 Renovación Automática:</strong> Después de que vence el período de prueba, su suscripción se renueva automáticamente en el primer ciclo de facturación a menos que cancele antes de la fecha de renovación. Recibirá una notificación por correo electrónico 7 días antes de la renovación.
              </p>
              <p>
                <strong>3.3 Modelo de Precios:</strong> El Servicio opera bajo un modelo de suscripción basado en usuarios:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Tarifa base: €19,00 por mes (incluye hasta 3 usuarios)</li>
                <li>Tarifa por usuario adicional: €2,00 por usuario/mes (más de 3 usuarios)</li>
                <li>Ejemplo: 10 usuarios = €19 + (7 × €2) = €33/mes</li>
                <li>IVA no incluido (se añadirá conforme a la ley portuguesa)</li>
              </ul>
              <p className="mt-3">
                <strong>3.4 Facturación:</strong> Actualmente, la facturación se realiza manualmente. En el futuro, implementaremos pagos automáticos a través de Stripe. Recibirá facturas electrónicas en su correo registrado.
              </p>
              <p>
                <strong>3.5 Reembolsos:</strong> No ofrecemos reembolsos por períodos de prueba no utilizados o por cancelación anticipada.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">4. Responsabilidades del Usuario</h2>
            <div className="space-y-3">
              <p>
                <strong>4.1 Uso Legal:</strong> Se compromete a usar el Servicio únicamente de forma legal y en conformidad con todas las leyes y regulaciones aplicables, incluyendo la ley laboral portuguesa.
              </p>
              <p>
                <strong>4.2 Datos Precisos:</strong> Es responsable de garantizar que todos los datos ingresados (nombres, horarios, disponibilidades) sean precisos y estén actualizados. Verificará regularmente el cumplimiento con la legislación laboral.
              </p>
              <p>
                <strong>4.3 Seguridad de la Cuenta:</strong> Se compromete a mantener la seguridad de sus credenciales de acceso y no compartir su contraseña. Cualquier violación de seguridad debe reportarse inmediatamente a hello@shiftera.app.
              </p>
              <p>
                <strong>4.4 Actividades Prohibidas:</strong> No puede:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Reproducir, copiar o piratear ningún contenido o funcionalidad del Servicio</li>
                <li>Desensamblar, aplicar ingeniería inversa o intentar descubrir el código fuente</li>
                <li>Usar el Servicio para actividades ilegales, fraudulentas o dañinas</li>
                <li>Acceder sin autorización a sistemas, datos o redes</li>
                <li>Interferir con el funcionamiento del Servicio u otros usuarios</li>
                <li>Violar derechos de propiedad intelectual</li>
                <li>Automatizar el acceso sin consentimiento escrito</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">5. Propiedad Intelectual</h2>
            <div className="space-y-3">
              <p>
                <strong>5.1 Propiedad de Shiftera:</strong> Todos los derechos de propiedad intelectual del Servicio, incluyendo software, diseño, interfaces, gráficos, logos y contenido, pertenecen a Shiftera y sus licenciantes. El código fuente, bases de datos y documentación están protegidos por derechos de autor y secretos comerciales.
              </p>
              <p>
                <strong>5.2 Su Propiedad:</strong> Retiene la propiedad total de los datos que ingresa en el Servicio (horarios, disponibilidades, datos de empleados). Otorga a Shiftera una licencia para usar tales datos únicamente para proporcionar y mejorar el Servicio.
              </p>
              <p>
                <strong>5.3 Comentarios:</strong> Cualquier comentario, sugerencia u opinión que proporcione sobre el Servicio puede ser utilizado libremente por Shiftera sin obligación de compensación o reconocimiento.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">6. Confidencialidad</h2>
            <p>
              Ambas partes se comprometen a mantener confidencial la información propietaria compartida durante el uso del Servicio. La confidencialidad no se aplica a la información que es: (a) pública; (b) legalmente requerida ser divulgada; o (c) recibida de terceros sin restricciones de confidencialidad.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">7. Limitación de Responsabilidad</h2>
            <div className="space-y-3">
              <p>
                <strong>7.1 Renuncia de Garantías:</strong> El Servicio se proporciona "tal cual" y "según disponibilidad" sin garantías expresas o implícitas. No garantizamos:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Acceso ininterrumpido o libre de errores</li>
                <li>Idoneidad para propósitos específicos o resultados específicos</li>
                <li>Precisión absoluta de validaciones legales</li>
              </ul>
              <p className="mt-3">
                <strong>7.2 Responsabilidades del Usuario:</strong> Es su responsabilidad:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Verificar que los horarios cumplan con toda la legislación laboral aplicable</li>
                <li>Mantener regularmente copias de seguridad de sus datos</li>
                <li>Usar el Servicio en conformidad con la ley portuguesa</li>
              </ul>
              <p className="mt-3">
                <strong>7.3 Límite de Responsabilidad:</strong> La responsabilidad total de Shiftera ante usted no excederá la cantidad pagada por usted en los 12 meses anteriores de uso del Servicio. En ningún caso seremos responsables por daños indirectos, incidentales, especiales o consecuentes.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">8. Suspensión y Terminación</h2>
            <div className="space-y-3">
              <p>
                <strong>8.1 Cancelación por Usuario:</strong> Puede cancelar su suscripción en cualquier momento a través del área de Configuración en la plataforma. El acceso continuará hasta el final de su período de facturación actual.
              </p>
              <p>
                <strong>8.2 Datos Después de la Cancelación:</strong> Después de la cancelación, sus datos se retendrán durante 30 días. Después de este período, serán eliminados permanentemente y no podrán recuperarse, a menos que lo requiera la ley.
              </p>
              <p>
                <strong>8.3 Terminación por Shiftera:</strong> Podemos terminar el acceso si: (a) viola estos Términos; (b) usa el Servicio de forma abusiva o ilegal; (c) no paga las tarifas debidas; o (d) por razones técnicas o comerciales, con 15 días de aviso previo por correo electrónico.
              </p>
              <p>
                <strong>8.4 Efecto de la Terminación:</strong> Tras la terminación, perderá acceso a toda la plataforma y sus datos.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">9. Modificaciones de los Términos</h2>
            <p>
              Nos reservamos el derecho de modificar estos Términos en cualquier momento. Lo notificaremos sobre cambios sustanciales con 30 días de aviso previo por correo electrónico. El uso continuado del Servicio después de las modificaciones constituye aceptación de los nuevos Términos.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">10. Ley Aplicable y Jurisdicción</h2>
            <p>
              Estos Términos se rigen por las leyes de la República Portuguesa, sin consideración a sus principios de conflicto de leyes. Cualquier disputa, acción o procedimiento que surja de estos Términos será resuelto exclusivamente en los tribunales de Lisboa, Portugal.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">11. Contacto</h2>
            <p>
              Para preguntas, quejas o notificaciones con respecto a estos Términos, contáctenos:
            </p>
            <div className="mt-3 space-y-2 text-stone-600">
              <p>
                Correo Electrónico: <a href="mailto:hello@shiftera.app" className="text-blue-600 hover:underline">hello@shiftera.app</a>
              </p>
              <p>
                Sitio Web: <a href="https://shiftera.app" className="text-blue-600 hover:underline">shiftera.app</a>
              </p>
              <p>
                Dirección: [Dirección registrada a definir después de la constitución de la empresa]
              </p>
            </div>
          </div>

          <div className="bg-stone-50 rounded-lg p-6 mt-8 border border-stone-200">
            <p className="text-sm text-stone-600">
              <strong>Disposiciones Finales:</strong> Estos Términos constituyen el acuerdo completo entre usted y Shiftera. Si se encuentra que alguna disposición es inválida o inaplicable, las disposiciones restantes permanecerán en plena vigencia. La no aplicación de ningún derecho no constituye una renuncia a ese derecho.
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
