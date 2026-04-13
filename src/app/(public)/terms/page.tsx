'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-stone-900">Termos e Condições</h1>
          <p className="text-stone-500 mt-2">Última atualização: {new Date().toLocaleDateString('pt-PT')}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-sm max-w-none space-y-6 text-stone-700">

          {/* Section 1 */}
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">1. Descrição do Serviço</h2>
            <p>
              A Shiftera ("Serviço") é uma plataforma digital de software como serviço (SaaS) que oferece funcionalidades de gestão de escalas de trabalho, controlo de disponibilidades, pedidos de folgas e trocas de turnos, especificamente desenvolvida para farmácias, clínicas, laboratórios e outras organizações em Portugal.
            </p>
            <p className="mt-3">
              O Serviço inclui: criação e publicação de horários, gestão de equipas, validações automáticas conforme o Código do Trabalho português, análise de equidade na distribuição de turnos, e exportação de relatórios em PDF e Excel.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">2. Acesso e Conta de Utilizador</h2>
            <div className="space-y-3">
              <p>
                <strong>2.1 Elegibilidade:</strong> Para utilizar o Serviço, deve ter pelo menos 18 anos de idade e ser representante legalmente autorizado de uma organização registada em Portugal.
              </p>
              <p>
                <strong>2.2 Criação de Conta:</strong> Ao criar uma conta, compromete-se a fornecer informações precisas, atualizadas e completas. É responsável pela confidencialidade da sua password e por todas as atividades ocorridas na sua conta.
              </p>
              <p>
                <strong>2.3 Suspensão e Encerramento:</strong> Reservamos o direito de suspender ou encerrar a sua conta se violarmos estes Termos ou se a conta for utilizada de forma abusiva ou ilegal.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">3. Termos de Utilização</h2>
            <div className="space-y-3">
              <p>
                <strong>3.1 Licença de Uso:</strong> Concedemos uma licença limitada, não exclusiva e revogável para usar o Serviço de acordo com estes Termos. Não pode transferir, vender ou sublicenciar esta licença.
              </p>
              <p>
                <strong>3.2 Restrições:</strong> Não pode:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Reproduzir, copiar ou piratear qualquer conteúdo do Serviço</li>
                <li>Desmontar, reverter ou tentar descobrir código-fonte</li>
                <li>Usar o Serviço para atividades ilegais ou prejudiciais</li>
                <li>Aceder não autorizado a sistemas, dados ou redes</li>
                <li>Interferir com o funcionamento do Serviço ou de outros utilizadores</li>
                <li>Violar direitos de propriedade intelectual</li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">4. Modelo de Preços e Faturação</h2>
            <div className="space-y-3">
              <p>
                <strong>4.1 Modelo de Preço:</strong> O Serviço funciona com um modelo de subscrição:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Taxa base: €19,00 por mês</li>
                <li>Taxa por utilizador: €2,00 por utilizador/mês adicional</li>
                <li>Exemplo: 10 utilizadores = €19 + (10 × €2) = €39/mês</li>
              </ul>
              <p className="mt-3">
                <strong>4.2 Período de Teste Gratuito:</strong> Oferecemos um período de teste de 14 dias sem necessidade de cartão de crédito. Após expiração, a subscrição renova automaticamente a menos que cancele antes da data de vencimento.
              </p>
              <p>
                <strong>4.3 Faturação:</strong> Atualmente, a faturação é efetuada manualmente. No futuro, implementaremos pagamentos automáticos via Stripe. Receberá faturas eletrónicas pelo email registado.
              </p>
              <p>
                <strong>4.4 Reembolsos:</strong> Não oferecemos reembolsos. Pode cancelar a subscrição a qualquer momento, e o acesso terminará no final do período de faturação atual.
              </p>
              <p>
                <strong>4.5 Alterações de Preço:</strong> Reservamos o direito de alterar os preços com 30 dias de aviso prévio por email.
              </p>
            </div>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">5. Cancelamento e Rescisão</h2>
            <div className="space-y-3">
              <p>
                <strong>5.1 Cancelamento de Subscrição:</strong> Pode cancelar a sua subscrição a qualquer momento através da área de Definições na plataforma. O acesso continuará até ao final do período de faturação em curso.
              </p>
              <p>
                <strong>5.2 Dados Após Cancelamento:</strong> Após cancelamento, os seus dados serão retidos por 30 dias. Após este período, serão permanentemente eliminados, exceto se exigido por lei.
              </p>
              <p>
                <strong>5.3 Rescisão pela Shiftera:</strong> Podemos rescindir o acesso se: violar estes Termos, utilizar o Serviço de forma abusiva, ou por razões técnicas ou comerciais com 15 dias de aviso.
              </p>
            </div>
          </div>

          {/* Section 6 */}
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">6. Propriedade Intelectual</h2>
            <p>
              Todos os direitos de propriedade intelectual do Serviço, incluindo software, design, interfaces e conteúdo, pertencem à Shiftera e aos seus licenciantes. O código-fonte, bases de dados e documentação são protegidos por direitos de autor e segredos comerciais.
            </p>
            <p className="mt-3">
              Concede à Shiftera uma licença para usar os seus dados exclusivamente para fornecer e melhorar o Serviço.
            </p>
          </div>

          {/* Section 7 */}
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">7. Garantias e Responsabilidades</h2>
            <div className="space-y-3">
              <p>
                <strong>7.1 Isenção de Garantias:</strong> O Serviço é fornecido "como está" e "como disponível", sem garantias expressas ou implícitas. Não garantimos:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Acesso ininterrupto ou sem erros</li>
                <li>Adequação para fins específicos</li>
                <li>Precisão completa das validações legais</li>
              </ul>
              <p className="mt-3">
                <strong>7.2 Responsabilidades do Utilizador:</strong> É sua responsabilidade:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Verificar que os horários cumprem a legislação laboral</li>
                <li>Manter cópias de segurança dos seus dados</li>
                <li>Usar o Serviço em conformidade com a lei portuguesa</li>
              </ul>
              <p className="mt-3">
                <strong>7.3 Limitação de Responsabilidade:</strong> Em nenhum caso seremos responsáveis por danos indiretos, incidentais ou consequentes resultantes do uso ou incapacidade de usar o Serviço, mesmo se alertados da possibilidade de tais danos.
              </p>
            </div>
          </div>

          {/* Section 8 */}
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">8. Conformidade Legal</h2>
            <div className="space-y-3">
              <p>
                <strong>8.1 Código do Trabalho Português:</strong> O Serviço foi desenvolvido para validar automaticamente:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Períodos de descanso obrigatórios (11 horas consecutivas entre turnos)</li>
                <li>Limite semanal de 40 horas (Lei n.º 7/2009)</li>
                <li>Feriados legais e seu reconhecimento em escalas</li>
                <li>Direitos de férias anuais (22 dias úteis mínimo)</li>
              </ul>
              <p className="mt-3">
                No entanto, é sua responsabilidade verificar conformidade total com legislação específica da sua organização.
              </p>
              <p>
                <strong>8.2 RGPD:</strong> O Serviço cumpre o Regulamento Geral de Proteção de Dados. Consulte a nossa Política de Privacidade para detalhes.
              </p>
            </div>
          </div>

          {/* Section 9 */}
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">9. Modificações do Serviço</h2>
            <p>
              Reservamos o direito de modificar, melhorar ou descontinuar qualquer aspecto do Serviço sem aviso prévio, exceto para mudanças materiais que afetam a faturação (com 30 dias de aviso).
            </p>
          </div>

          {/* Section 10 */}
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">10. Lei Aplicável e Jurisdição</h2>
            <p>
              Estes Termos são regidos pelas leis de Portugal. Qualquer litígio será resolvido nos tribunais da jurisdição competente em Portugal.
            </p>
          </div>

          {/* Section 11 */}
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-3">11. Contacto</h2>
            <p>
              Para questões sobre estes Termos, contacte-nos através de:
            </p>
            <div className="mt-3 space-y-1 text-stone-600">
              <p>Email: <a href="mailto:support@shiftera.app" className="text-blue-600 hover:underline">support@shiftera.app</a></p>
              <p>Website: <a href="https://shiftera.app" className="text-blue-600 hover:underline">https://shiftera.app</a></p>
            </div>
          </div>

          {/* Closing */}
          <div className="bg-stone-50 rounded-lg p-6 mt-8 border border-stone-200">
            <p className="text-sm text-stone-600">
              <strong>Aviso Legal:</strong> Estes Termos constituem o acordo integral entre você e a Shiftera relativo ao Serviço. Se qualquer cláusula for considerada inválida, as restantes continuarão em vigor. A não aplicação de qualquer direito não constitui renúncia.
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
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Política de Privacidade
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
