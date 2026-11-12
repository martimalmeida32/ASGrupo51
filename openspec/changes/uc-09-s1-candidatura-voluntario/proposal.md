# Proposal: UC-09-S1 — Candidatura a voluntário e verificação legal

## Why
A rede MobiCare depende de voluntários verificados para transportar e acompanhar pessoas seniores, mas não existe hoje um fluxo que recolha a candidatura, valide os documentos legalmente exigidos e acompanhe o candidato até estar ativo. Sem este processo, a IPSS não consegue garantir o cumprimento da Lei n.º 71/98 nem a regra de elegibilidade do voluntário (BR-08), colocando em risco a segurança dos utentes e a confiança das famílias.

## What Changes
- Formulário de candidatura com contactos, zona geográfica, disponibilidade horária, perfil de ingresso (reformado, estudante, voluntariado corporativo) e características da viatura própria ou acompanhamento pedonal.
- Submissão e validação documental da carta de condução, seguro válido e termo de voluntariado (BR-08).
- Registo da candidatura no estado «Candidato» com notificação automática à coordenação da IPSS.
- Painel de verificação e decisão do técnico social (aprovação ou recusa), com fundamento legal na Lei n.º 71/98 e justificação obrigatória em caso de recusa.
- Registo da formação inicial e da primeira viagem acompanhada, com transição para o estado «Ativo» e criação do perfil de compatibilidade (BR-02).
- Rejeição automática de candidaturas com documentos inválidos, caducados ou seguro obrigatório em falta (BR-08).
- Registo de candidaturas presenciais ou por telefone efetuado pelo técnico social (A1).
- Minimização de dados, acesso por perfil e retenção restrita dos dados e documentos (BR-11, RNF-06).

## Capabilities

### New Capabilities
- `volunteer-onboarding`: Submissão, verificação legal e ativação de candidatos a voluntários da rede MobiCare.

### Modified Capabilities
<!-- Sem alterações a requisitos de capacidades existentes: o projeto ainda não tem specs principais. -->

## Impact
- Novos modelos de dados: `VolunteerApplication`, `VolunteerDocument`, `Volunteer` (estado) e `VerificationRecord`.
- Nova máquina de estados do voluntário: `CANDIDATO` → `EM_VERIFICACAO` → `EM_FORMACAO` → `ATIVO`, com transição para `RECUSADO`.
- Novos ecrãs: formulário de candidatura (mobile-first) e painel de verificação do técnico social.
- Upload cifrado de documentos para armazenamento na UE, com validação de formato e data de validade, acesso restrito por perfil (BR-11, RNF-06).
- Integração com notificações à coordenação da IPSS e com o perfil de compatibilidade usado na atribuição de viagens (BR-02).
