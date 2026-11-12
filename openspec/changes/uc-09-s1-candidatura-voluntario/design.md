# Design: UC-09-S1

## Context

Ver `proposal.md` para a motivação e `specs/volunteer-onboarding/spec.md` para os requisitos. A candidatura é submetida por candidatos em dispositivos móveis, onde a ligação pode falhar, e envolve documentos pessoais que exigem tratamento RGPD (BR-11, RNF-06). A IPSS precisa de um registo auditável das decisões do técnico social e de uma ativação que só ocorre após formação e primeira viagem acompanhada (BR-08). A aplicação é web responsiva, mobile-first.

## Goals / Non-Goals

**Goals:**
- Recolher candidaturas com validação incremental e retoma de rascunho após perda de ligação.
- Garantir a verificação documental legal e a decisão auditável do técnico social.
- Impedir a ativação de candidatos com documentos inválidos ou seguro em falta (BR-08).
- Gerar o perfil de compatibilidade apenas na ativação (BR-02).

**Non-Goals:**
- Definir o conteúdo programático da formação ou gerir turmas.
- Implementar a autenticação/gestão de identidade da plataforma.
- Alterar a cascata de atribuição de viagens além de disponibilizar o perfil de compatibilidade.

## Decisions

1. **Formulário com rascunho local.**
   O ecrã de candidatura valida os campos obrigatórios incrementalmente e guarda rascunhos em `IndexedDB` para retoma em caso de perda de ligação. *Alternativa considerada:* exigir submissão online contínua — rejeitada por frustrar candidatos em rede instável.

2. **Gestão documental cifrada e acesso por perfil (BR-11, RNF-06).**
   O upload é cifrado para armazenamento em servidores da UE; os documentos são validados quanto a formato e data de validade. Apenas o candidato e o técnico social autorizado acedem aos dados funcionais necessários. *Alternativa considerada:* armazenamento local no dispositivo — rejeitada por risco de perda e de exposição.

3. **Máquina de estados do voluntário.**
   `CANDIDATO` → `EM_VERIFICACAO` → `EM_FORMACAO` → `ATIVO`, com transição para `RECUSADO` a partir da verificação. A transição para `ATIVO` exige carta e seguro válidos, termo assinado, formação inicial e primeira viagem acompanhada (BR-08). As transições são aplicadas no servidor. *Alternativa considerada:* estados editáveis pelo técnico — rejeitada por permitir saltar requisitos legais.

4. **Verificação legal auditável.**
   O técnico social confirma os documentos contra a Lei n.º 71/98; o resultado fica registado com autor, timestamp e justificação (obrigatória em caso de recusa). *Alternativa considerada:* aprovação automática por algoritmo — rejeitada por exigir validação humana legal.

5. **Perfil de compatibilidade gerado na ativação.**
   Ao ativar o voluntário, é gerado o perfil usado pela cascata de atribuição (BR-02), incluindo viatura própria ou acompanhamento pedonal. *Alternativa considerada:* gerar o perfil na submissão — rejeitada por permitir atribuições a candidatos não verificados.

6. **Registo presencial/telefónico pelo técnico social (A1).**
   O mesmo modelo de candidatura suporta o registo em nome do candidato, com indicação da origem e do autor. *Alternativa considerada:* fluxo separado — rejeitada por duplicar regras de validação documental.

## Risks / Trade-offs

- **Documentos pessoais expostos** → cifra, acesso por perfil, retenção restrita e auditoria de acessos (BR-11, RNF-06).
- **Candidatura incompleta por falha de rede** → rascunho local em `IndexedDB` e retoma.
- **Ativação indevida com documentos caducados** → validação automática de validade e bloqueio no servidor (BR-08).
- **Decisões sem rasto** → `VerificationRecord` com autor, timestamp e justificação obrigatória na recusa.
- **Duplicação de candidaturas** → deteção por contacto/documento e aviso ao técnico social.
