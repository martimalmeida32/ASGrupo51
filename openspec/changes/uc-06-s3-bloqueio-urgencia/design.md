# Design: UC-06-S3

## Context

Ver `proposal.md` para a motivação e `specs/telephone-request/spec.md` para os requisitos. O assistente de registo telefónico de UC-06-S1/S2 já valida BR-01 e oferece uma exceção justificada, e a escolha de meio usa o motor de cascata do UC-02. Esta slice fecha os caminhos de erro: campos obrigatórios, falta de antecedência sem exceção, urgência médica aguda e ausência de meio compatível.

## Goals / Non-Goals

**Goals:**
- Bloquear cedo e com mensagens claras, sem criar pedidos inválidos.
- Dar prioridade à segurança: perante urgência médica aguda, orientar para o 112 antes de qualquer outra validação.
- Entregar à coordenação, de forma recuperável, os pedidos que ficam sem meio.
- Deixar rasto auditável de cada bloqueio e encaminhamento.

**Non-Goals:**
- Triagem clínica ou atendimento pré-hospitalar; a orientação é apenas para o 112.
- Atribuição manual ou gestão da fila «Sem opção» no painel da coordenação (UC-07).
- Alterações à exceção de urgência justificada de UC-06-S2.
- Recalcular a cascata para cenários de indisponibilidade súbita já tratados em UC-02 (E2).

## Decisions

1. **Pipeline de validação server-side com ordem safety-first.**
   A submissão corre os gates por esta ordem: (1) urgência médica aguda, (2) campos obrigatórios, (3) BR-01 sem exceção, (4) disponibilidade. A urgência é avaliada primeiro para que o alerta do 112 nunca seja atrasado por um campo em falta. *Alternativa considerada:* validar campos primeiro — rejeitada por adiar a orientação de emergência.

2. **Urgência detetada por indicador explícito, não por texto livre.**
   O bloco de necessidades inclui o indicador «Urgência médica aguda (dor torácica / falta de ar súbita)»; quando marcado, o sistema bloqueia e apresenta o alerta com o texto definido, sem criar pedido. *Alternativa considerada:* analisar texto livre ou notas do técnico — rejeitada por ser pouco fiável e por alargar o âmbito clínico.

3. **Bloqueios que não persistem pedido.**
   Campos em falta, BR-01 sem exceção e urgência médica devolvem um resultado de bloqueio com motivo e não criam pedido; o rascunho mantém-se para correção ou cancelamento. *Alternativa considerada:* guardar pedidos inválidos como rascunhos de pedido — rejeitada por poluir a fila da coordenação e a contagem de pedidos.

4. **E4 persiste o pedido em «Sem opção».**
   Quando a cascata termina sem opções, o pedido é criado no estado «Sem opção» (ou transitado para ele, se já existir) e entregue à fila de UC-07; ao contrário dos bloqueios, este pedido é recuperável e tem de sobreviver à chamada. *Alternativa considerada:* terminar sem pedido — rejeitada por deixar a coordenação sem nada para tratar.

5. **Handoff idempotente para a coordenação.**
   O encaminhamento grava estado, motivo `NO_COMPATIBLE_MEANS`, momento e técnico numa operação idempotente e enfileira a notificação da coordenação via outbox. Repetições não duplicam pedidos nem notificações. *Alternativa considerada:* notificar de forma síncrona — rejeitada por acoplar o registo a um serviço externo.

6. **Mensagens exatas e acessíveis.**
   Os avisos usam os textos da SRS, com contraste elevado, foco no alerta e um botão de chamada para o 112 (sem marcação automática). *Alternativa considerada:* mensagens genéricas — rejeitadas por não cumprirem os critérios de aceitação.

7. **Auditoria por código de motivo.**
   Cada tentativa bloqueada ou encaminhada regista técnico, momento, pedido/rascunho e um código (`FIELDS_MISSING`, `BR01_NOT_MET`, `MEDICAL_EMERGENCY`, `NO_MEANS_HANDOFF`), sem guardar detalhe clínico além do indicador. O acesso é restrito. *Alternativa considerada:* log de aplicação — rejeitada por não ser consultável nem imutável.

8. **Reavaliação da disponibilidade antes da confirmação.**
   Se o meio desaparecer entre a cascata e a confirmação, a cascata é recalculada; se ficar vazia, aplica-se E4. *Alternativa considerada:* confiar no resultado anterior — rejeitada por permitir confirmações impossíveis.

## Risks / Trade-offs

- **Urgência não assinalada pelo técnico** → indicador visível no bloco de necessidades e formação; o sistema não faz diagnóstico clínico.
- **Falso positivo de urgência** → o técnico pode desmarcar o indicador e continuar um pedido normal; não existe autorização de exceção para emergência.
- **Dados de saúde na auditoria** → guardar apenas o código e o indicador, com acesso restrito (BR-11).
- **Fila da coordenação sobrecarregada** → contadores e ordenação por prioridade e hora em UC-07; o handoff não bloqueia a chamada.
- **Corrida entre cascata e confirmação** → recalcular disponibilidade antes de confirmar.
- **Inconsistência entre bloqueio e E4** → estados explícitos: bloqueios não persistem pedido, E4 persiste em «Sem opção».
- **Mensagem do 112 interpretada como atendimento** → texto esclarece que o MobiCare não substitui o 112 e não efetua a chamada.

## Migration Plan

- Adicionar o estado «Sem opção» ao ciclo de vida do pedido e a transição de encaminhamento para UC-07.
- Adicionar a tabela de auditoria de bloqueios e encaminhamentos com índices por pedido e por técnico.
- Configurar o template de notificação da coordenação e o indicador de urgência no bloco de necessidades.
- Deploy aditivo; sem backfill.
- Rollback: desativar o handoff automático e o indicador de urgência; pedidos já em «Sem opção» permanecem visíveis para tratamento manual.
