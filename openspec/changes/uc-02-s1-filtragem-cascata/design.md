# Design: UC-02-S1

## Context

Ver `proposal.md` para a motivação e `specs/transport-selection/spec.md` para os requisitos. O pedido criado por UC-01 chega a esta slice no estado «A escolher o meio», com destino, data/hora da consulta e perfil de mobilidade. Os meios disponíveis vêm de três origens: voluntários (UC-09), viaturas adaptadas de parceiros (UC-11) e operadores profissionais. A escolha tem de respeitar a compatibilidade (BR-02), a cascata de prioridade (BR-04) e a independência entre ida e regresso (BR-05), com resposta em menos de 3 segundos (RNF-03). O ecrã é usado por utentes seniores e familiares, na app mobile-first (RNF-01).

## Goals / Non-Goals

**Goals:**
- Produzir uma lista única e consistente de opções compatíveis, ordenada pela cascata, com custo e recomendação.
- Confirmar a escolha de forma atómica, sem dupla atribuição do mesmo meio.
- Criar as viagens de ida e regresso como registos independentes e notificar os intervenientes.
- Garantir o orçamento de 3 segundos na apresentação das opções.

**Non-Goals:**
- Regras de exclusividade para maca/cuidados e avisos de TNUD/Táxi Municipal (UC-02-S2).
- Tratamento completo de indisponibilidade, recálculo e opção já atribuída (UC-02-S3), além da proteção mínima contra dupla atribuição.
- Execução da viagem, check-in e conclusão (UC-03); pedido de regresso em estafeta (UC-04).
- Cálculo tarifário detalhado de parceiros e operadores para além do custo apresentado ao utente.

## Decisions

1. **Read model único `TransportOption`.**
   Uma projeção agrega voluntários, viaturas adaptadas de parceiros e operadores profissionais num formato comum (`type`, `sourceId`, `available`, `compatible`, `cost`, `recommended`), permitindo uma única ordenação e resposta. *Alternativa considerada:* consultar cada tipo e juntar no cliente — rejeitada por produzir ordenação inconsistente e exceder o orçamento de RNF-03.

2. **Filtragem de compatibilidade no servidor.**
   A compatibilidade entre o perfil de mobilidade do pedido e as capacidades do meio (ex.: cadeira de rodas, oxigénio, bengala) é avaliada no servidor; meios sem dados suficientes são excluídos (fail closed). *Alternativa considerada:* filtrar no cliente — rejeitada por expor opções irrelevantes e permitir escolhas inválidas.

3. **Cascata como ranking explícito.**
   `VOLUNTEER = 1`, `ADAPTED_VEHICLE = 2`, `PROFESSIONAL = 3`; dentro do mesmo nível, desempate estável por distância e disponibilidade. A opção recomendada é a primeira disponível na cascata. *Alternativa considerada:* pontuação ponderada por custo/proximidade — rejeitada por violar a prioridade fixa de BR-04.

4. **Custo calculado e fotografado na confirmação.**
   O custo por opção é calculado na consulta (voluntário 0,00 €) e o valor apresentado é guardado no pedido no momento da confirmação, evitando divergência posterior. *Alternativa considerada:* recalcular apenas na apresentação — rejeitada por permitir que o valor confirmado difira do mostrado.

5. **Confirmação atómica com verificação de disponibilidade.**
   A confirmação revalida a disponibilidade e a compatibilidade e usa uma atualização condicional (compare-and-set) sobre o recurso escolhido, numa transação que também transita o pedido para «Confirmado» e cria as viagens. Se o meio já não estiver disponível, nada é criado e a lista é recarregada. *Alternativa considerada:* confiar na disponibilidade lida no ecrã — rejeitada por permitir dupla atribuição.

6. **Ida e regresso como viagens independentes.**
   São criados dois `Trip` com `direction` (`OUTBOUND`, `RETURN`), estados e horários próprios: ida com hora ajustada à consulta e regresso em modo estafeta (BR-05). *Alternativa considerada:* uma única viagem com dois segmentos — rejeitada por contrariar BR-05 e dificultar a gestão operacional.

7. **Idempotência da confirmação.**
   A confirmação leva uma chave de idempotência; reenvios devolvem o resultado já criado em vez de duplicar viagens. *Alternativa considerada:* deduplicação por pedido — insuficiente quando o utilizador reconfirma após erro de rede.

8. **Notificação e cache.**
   As notificações são emitidas via outbox após o commit. A lista de opções usa uma cache curta por pedido (TTL ~30s) invalidada na atribuição, suportada por índices de disponibilidade e compatibilidade. *Alternativa considerada:* sem cache — arrisca exceder RNF-03 em picos.

9. **Autorização por perfil.**
   Apenas o requerente autorizado, o familiar/cuidador associado e a coordenação podem ver e confirmar opções (BR-11, RNF-06).

## Risks / Trade-offs

- **Disponibilidade desatualizada entre ver e confirmar** → revalidação e compare-and-set na confirmação; em conflito, nada é criado e a lista recarrega.
- **Custo divergente** → snapshot do custo na confirmação.
- **Perfil de mobilidade incompleto** → exclusão do meio (fail closed) em vez de assumir compatibilidade.
- **Orçamento de 3 segundos** → índices dedicados, consulta paralela às três origens e cache curta.
- **Dupla atribuição do mesmo voluntário/viatura** → verificação transacional de sobreposição de horários e restrição de unicidade.
- **Retry da confirmação** → chave de idempotência.
- **Falha de notificação após commit** → evento persistido com retry; o pedido e as viagens mantêm-se válidos.
- **Cache com opções obsoletas** → TTL curto e invalidação imediata na atribuição.

## Migration Plan

- Criar a tabela `Trip` (ou equivalente) com `request_id`, `direction`, `mode`, `assigned_means`, `planned_at` e estado.
- Adicionar ao `TripRequest` o meio escolhido, o custo confirmado e a chave de idempotência da confirmação.
- A projeção de opções é derivada em tempo de consulta, sem migração de dados; índices de disponibilidade são adicionados.
- Deploy aditivo e compatível; rollback remove a tabela e as colunas novas e mantém os pedidos em «A escolher o meio».
