# Design: UC-04-S1

## Context

Ver `proposal.md` para a motivação e `specs/return-trip/spec.md` para os requisitos. A viagem de ida e a viagem de regresso são criadas de forma independente em UC-02-S1 (BR-05); o regresso #VG-202 já existe como registo próprio, em modo estafeta, e pode ter um meio atribuído. A ida é executada e concluída em UC-03, incluindo o check-in na unidade de saúde. Esta slice automatiza o pedido do regresso antes do fim previsto da consulta e o estado até «a caminho para o regresso». O sistema já usa notificações assíncronas (outbox) e tem requisitos de 3 segundos (RNF-03) e de fuso horário local.

## Goals / Non-Goals

**Goals:**
- Calcular e persistir o fim previsto da consulta (BR-06).
- Disparar o pedido de regresso 25 minutos antes, de forma durável e idempotente (BR-05).
- Avisar o utente de quem o vai buscar e a hora.
- Refletir a confirmação do fim da consulta e o estado «a caminho para o regresso» para utente, familiar e coordenação.

**Non-Goals:**
- Antecipar ou adiar o regresso por alteração do fim da consulta (UC-04-S2).
- Agendar a recolha com o mesmo meio da ida (UC-04-S3).
- Contingência completa sem meio disponível e utente sem resposta (UC-04-S4), além da proteção mínima contra bloqueio silencioso.
- Execução da viagem de regresso e check-in (UC-03) e monitorização em tempo real (UC-05).

## Decisions

1. **Fim previsto persistido e configurável.**
   `expected_end_at = consultation_at + 45 min` (BR-06), guardado na viagem de regresso; o valor é configurável para validação com a IPSS e recalculável em UC-04-S2. *Alternativa considerada:* calcular no momento do disparo — rejeitada por impedir agendamento antecipado e auditoria.

2. **Agendador durável baseado em timers persistidos.**
   Cada regresso agenda um timer `return_trip_id + expected_end_at` numa tabela de timers; um worker dispara os vencidos e faz catch-up dos atrasados após reinícios. *Alternativa considerada:* cron em memória ou fila efémera — rejeitada por perder pedidos em deploys/reinícios.

3. **Idempotência do pedido.**
   Chave única por `(return_trip_id, expected_end_at)` garante que disparos repetidos ou reprocessamentos não criam pedidos duplicados. *Alternativa considerada:* verificação por estado — rejeitada por condições de corrida entre workers.

4. **Regresso independente da ida (BR-05).**
   A viagem de regresso mantém registo, estado e atribuição próprios; nenhuma transição da ida altera o regresso. *Alternativa considerada:* reutilizar a viagem de ida como contentor dos dois segmentos — rejeitada por violar BR-05.

5. **Máquina de estados explícita do regresso.**
   `AGENDADO → PEDIDO → CONFIRMADO → A_CAMINHO`, com transições validadas. Em S1 termina em `A_CAMINHO`. *Alternativa considerada:* estados livres por texto — rejeitada por dificultar consistência e notificações.

6. **Confirmação do fim da consulta como comando idempotente.**
   O utente/acompanhante confirma na app e a unidade de saúde pode emitir o mesmo aviso; ambos convergem no mesmo comando idempotente, que regista `consultation_ended_at`. *Alternativa considerada:* aceitar apenas a app — rejeitada por excluir utentes sem smartphone e por o SRS prever o aviso da unidade.

7. **Pedido ao meio e confirmação de recolha.**
   O pedido é enviado ao meio atribuído; quando o meio aceita, o regresso passa a `CONFIRMADO`; quando confirma a deslocação, passa a `A_CAMINHO`. Se não existir meio atribuído, o sistema sinaliza a coordenação em vez de ficar em silêncio (contingência completa fica em S4). *Alternativa considerada:* bloquear o disparo sem meio — rejeitada por esconder o problema operacional.

8. **Notificações via outbox.**
   O aviso ao utente (quem e a que horas), bem como a atualização de estado para familiar e coordenação, é emitido após commit, com retry. *Alternativa considerada:* notificação síncrona no disparo — rejeitada por acoplar o pedido a um serviço externo e arriscar RNF-03.

9. **Tempo do servidor e fuso Europe/Lisbon.**
   O agendamento e o cálculo usam a hora do servidor em hora local, tratando mudanças de hora. *Alternativa considerada:* hora do dispositivo — rejeitada por desvios.

## Risks / Trade-offs

- **Timer perdido durante indisponibilidade** → catch-up de timers vencidos no arranque e verificação periódica.
- **Disparo duplicado** → chave única de idempotência e transição condicional.
- **Sem meio atribuído** → sinalização imediata à coordenação; resolução completa em S4.
- **Fim previsto errado (45 min)** → valor configurável, validado com a IPSS, e recálculo em S2.
- **Utente não confirma** → o estado mantém-se e a coordenação vê o atraso; escalonamento completo em S4.
- **Falha de notificação** → outbox com retry; o pedido e o estado não dependem da entrega.
- **Mudança de hora (DST)** → cálculo e agendamento em hora local Europe/Lisbon.
- **Sobreposição com UC-03 (check-in)** → a pré-condição de ida concluída e check-in é verificada, mas o estado da ida não é alterado por esta slice.

## Migration Plan

- Adicionar à viagem de regresso `expected_end_at`, `return_requested_at` e `consultation_ended_at` (anuláveis).
- Criar a tabela de timers com chave única `(return_trip_id, expected_end_at)` e índice por data de disparo.
- Viagens de regresso existentes ficam sem timer até lhes ser associado um fim previsto; não há backfill obrigatório.
- Deploy aditivo e compatível; rollback desativa o worker e remove a tabela de timers e as colunas novas sem afetar pedidos confirmados.
