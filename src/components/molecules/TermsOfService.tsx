type TermsOfServiceProps = {
  open: boolean;
  onClose: () => void;
};

const TERMS_TEXT = `
Termos de Uso e Política de Privacidade

1. Aceitação dos termos
Ao acessar e utilizar a plataforma ResolveJá, você concorda com estes termos e com nossa Política de Privacidade. Se não concordar, não utilize o serviço.

2. Descrição do serviço
O ResolveJá conecta clientes a prestadores de serviços cadastrados na plataforma. Não somos responsáveis pela execução, qualidade ou resultado dos serviços prestados por terceiros.

3. Cadastro e conta
Você se compromete a fornecer informações verdadeiras e atualizadas durante o cadastro e é responsável por manter a confidencialidade de sua conta e senha.

4. Privacidade
Coletamos apenas os dados necessários para o funcionamento da plataforma. Seus dados pessoais não são compartilhados com terceiros sem consentimento, exceto quando exigido por lei ou necessário para a prestação do serviço.

5. Responsabilidades
Clientes devem fornecer informações claras sobre o serviço desejado. Prestadores devem cumprir com o combinado, respeitar prazos e manter comunicação transparente.

6. Cancelamento e exclusão
Você pode solicitar o cancelamento da conta ou exclusão de dados a qualquer momento por meio das configurações do perfil ou entrando em contato com o suporte.

7. Alterações nos termos
Podemos atualizar estes termos periodicamente. Alterações significativas serão comunicadas por meio da plataforma ou por e-mail.

8. Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)
O ResolveJá está comprometido com a proteção dos seus dados pessoais, em conformidade com a LGPD.

a) Dados pessoais coletados no cadastro:
- Nome completo
- E-mail
- Telefone
- CPF
- Cidade

b) Finalidade do uso dos dados:
Os dados são utilizados exclusivamente para conectar clientes e prestadores de serviços na plataforma, autenticar usuários e permitir o funcionamento dos recursos de solicitação, avaliação e histórico de serviços.

c) Direitos do titular dos dados:
Você tem direito a:
- Acessar seus dados pessoais a qualquer momento
- Corrigir dados incompletos, inexatos ou desatualizados
- Solicitar a exclusão de seus dados pessoais
- Revogar o consentimento a qualquer momento

d) Registro do consentimento:
Seu consentimento com estes termos é registrado automaticamente no momento do cadastro, com data e hora, e pode ser consultado em seu perfil ou solicitado ao suporte.

Versão 1.0 — Agosto de 2026
`;

const TermsOfService = ({ open, onClose }: TermsOfServiceProps) => {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10,18,38,0.6)',
        backdropFilter: 'blur(6px)',
        zIndex: 300,
        animation: 'fadeIn 0.18s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          borderRadius: '28px 28px 0 0',
          zIndex: 301,
          padding: '0 0 env(safe-area-inset-bottom, 16px)',
          maxHeight: '85dvh',
          overflowY: 'auto',
          boxShadow: '0 -16px 64px rgba(26,43,76,0.2)',
          animation: 'slideUp 0.25s cubic-bezier(.32,1,.23,1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 99, background: '#e2e8f0' }} />
        </div>

        <div style={{ padding: '8px 24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#64748b', marginBottom: 4 }}>
                Termos legais
              </p>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-navy)', lineHeight: 1.2 }}>
                Termos de Uso e Política de Privacidade
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: 'none',
                background: '#f1f5f9',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                color: '#64748b',
              }}
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>

          <div
            style={{
              whiteSpace: 'pre-line',
              fontSize: 14,
              lineHeight: 1.7,
              color: '#334155',
            }}
          >
            {TERMS_TEXT}
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              marginTop: 24,
              padding: '14px',
              borderRadius: 20,
              border: 'none',
              background: 'var(--color-primary)',
              color: 'var(--color-navy)',
              fontWeight: 800,
              fontSize: 15,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(255,217,0,0.4)',
            }}
          >
            Fechar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(60px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
};

export default TermsOfService;
