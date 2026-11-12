# Design: UC-01-S2

## Context

Ver `proposal.md` para a motivação e `specs/trip-request/spec.md` para os requisitos. Esta slice estende o registo de pedido de UC-01-S1, que já cria um `TripRequest` no estado `A_ESCOLHER_O_MEIO`, valida campos e antecedência (BR-01) e associa o perfil de mobilidade (BR-02). O formulário é mobile-first (RNF-01), usado por utentes seniores e familiares/cuidadores. O catálogo de unidades de saúde é a fonte normal de destinos, e a coordenação da IPSS valida casos que não constam do catálogo.

## Goals / Non-Goals

**Goals:**
- Criar uma série semanal coerente a partir de um único registo, sem repetir trabalho manual.
- Aceitar destinos não catalogados sem bloquear o pedido e sem poluir o catálogo com dados não validados.
- Manter o comportamento de UC-01-S1 intacto para pedidos simples.
- Garantir atomicidade e idempotência na criação de séries.

**Non-Goals:**
- Editar, cancelar ou reagendar ocorrências de uma série (UC-07).
- Escolher o meio de transporte ou atribuir voluntários (UC-02).
- Triagem de apoio público, encaminhamento telefónico ou modo offline do pedido (UC-01-S3).
- Sincronizar o catálogo com fontes externas de unidades de saúde.

## Decisions

1. **Série como entidade explícita (`TripSeries`).**
   A série guarda destino, hora, perfil de mobilidade, dia da semana e tamanho; cada `TripRequest` referencia a série e o índice da ocorrência. *Alternativa considerada:* auto-referência `parent_request_id` — rejeitada por dificultar consultas da série, idempotência e agendamento de lembretes.

2. **Cinco pedidos = pedido original + quatro ocorrências semanais.**
   A expressão «4 semanas seguintes» (A1) é interpretada como quatro repetições adicionais, alinhada com TC-UC01-04, que exige exatamente 5 pedidos. O primeiro pedido submetido conta como ocorrência 1. *Alternativa considerada:* apenas 4 pedidos totais — rejeitada por contradizer o caso de teste.

3. **Criação atómica em transação única.**
   As cinco ocorrências são criadas numa transação; se qualquer uma violar BR-01/BR-02, nenhuma é persistida e o requerente recebe o erro. *Alternativa considerada:* criação parcial com compensação — rejeitada por deixar séries incompletas e confundir a coordenação.

4. **Destino não listado como snapshot em texto livre com estado de validação.**
   O pedido guarda o texto introduzido, `unit_id` nulo e `destination_validation` (`PENDING`, `CONFIRMED`, `CORRECTED`); a etiqueta «destino não listado» deriva do estado `PENDING`. *Alternativa considerada:* criar imediatamente uma unidade no catálogo — rejeitada por introduzir dados não validados na fonte usada pelo UC-02.

5. **Fila de validação como vista sobre pedidos pendentes.**
   A coordenação vê os pedidos com `destination_validation = PENDING` e confirma ou corrige; ao confirmar, associa `unit_id` e muda o estado. *Alternativa considerada:* fluxo de aprovação separado com tabela própria — rejeitada por duplicar estado já existente no pedido.

6. **Reutilização do serviço de validação de UC-01-S1.**
   A validação de campos, antecedência (BR-01) e compatibilidade (BR-02) é aplicada ocorrência a ocorrência pelo mesmo serviço. *Alternativa considerada:* regras próprias para séries — rejeitada por divergir comportamento entre pedido simples e recorrente.

7. **Lembretes agendados por ocorrência após commit.**
   Cada pedido da série gera um lembrete semanal através de evento persistido (outbox) com chave idempotente `(request_id, reminder_date)`. *Alternativa considerada:* agendamento dentro da transação — rejeitada por acoplar a criação a um serviço externo.

8. **Idempotência ao nível da submissão da série.**
   A submissão leva uma chave de idempotência; reenvios devolvem a série já criada em vez de duplicar os cinco pedidos. *Alternativa considerada:* deduplicação por conteúdo — rejeitada por ser ambígua quando existem pedidos legítimos iguais.

## Risks / Trade-offs

- **Séries duplicadas por reenvio** → chave de idempotência na submissão e resposta com a série existente.
- **Falha parcial na criação** → transação atómica; lembretes só são emitidos após commit.
- **Mudança de hora (DST)** → hora local Europe/Lisbon mantida; ocorrências geradas por data local, não por incremento de 168 horas.
- **Destinos não listados em excesso** → fila de validação com limite e priorização pela coordenação; catálogo só é alterado após confirmação.
- **Série criada com destino por validar** → pedidos ficam em «A escolher o meio» e etiquetados; a coordenação é notificada para validar antes da atribuição.
- **Conflito com a delta de UC-01-S1 por partilharem `trip-request`** → requisitos usam IDs distintos (REQ-03/REQ-04) e operação `ADDED`, pelo que qualquer ordem de arquivo preserva ambos os conjuntos.

## Migration Plan

- Adicionar `TripSeries` e as colunas `series_id`, `occurrence_index` e `destination_validation` a `TripRequest`, todas anuláveis para pedidos existentes.
- Pedidos já criados ficam sem série e com `destination_validation = CONFIRMED`, pois usam unidades do catálogo.
- Deploy aditivo, sem backfill; rollback remove as colunas e a tabela novas sem afetar os pedidos existentes.
