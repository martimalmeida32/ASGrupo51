# Design: UC-09-S1

## Decisões Técnicas e Arquitetura
1. **Formulário de Candidatura:** Ecrã responsivo (mobile-first) com validação incremental dos campos obrigatórios, guardando rascunhos localmente (`IndexedDB`) para retoma em caso de perda de ligação.
2. **Gestão Documental e RGPD (BR-11, RNF-06):** Upload cifrado para armazenamento em servidores da UE, com acesso restrito por perfil e retenção apenas dos dados funcionais necessários; documentos validados quanto a formato e data de validade.
3. **Máquina de Estados do Voluntário:** `CANDIDATO` -> `EM_VERIFICACAO` -> `EM_FORMACAO` -> `ATIVO`, com transição para `RECUSADO` a partir da verificação. A transição para `ATIVO` exige carta e seguro válidos, termo assinado, formação inicial e primeira viagem acompanhada (BR-08).
4. **Verificação Legal:** O técnico social confirma os documentos contra a Lei n.º 71/98 e o resultado fica registado com autor, timestamp e justificação (obrigatória em caso de recusa).
5. **Perfil de Compatibilidade:** Ao ativar o voluntário, é gerado o perfil usado pela cascata de atribuição (BR-02), incluindo viatura própria ou acompanhamento pedonal.

## Entidades Envolvidas
- `VolunteerApplication`: Dados de contacto, zona, disponibilidade, perfil de ingresso, viatura/pedonal, estado e `submitted_at`.
- `VolunteerDocument`: Tipo (`DRIVING_LICENSE` | `INSURANCE` | `VOLUNTEER_TERM`), ficheiro cifrado, `valid_until` e estado de verificação.
- `Volunteer`: Perfil ativado com estado (`CANDIDATO` | `EM_VERIFICACAO` | `EM_FORMACAO` | `ATIVO` | `RECUSADO`), formação e primeira viagem acompanhada.
- `VerificationRecord`: Decisão do técnico social (`APPROVED` | `REJECTED`), `reviewer_id`, `timestamp` e `reason`.
