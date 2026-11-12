# Delta Spec: Trip Request — UC-01-S2

## Purpose

Permitir ao utente sénior ou ao seu familiar/cuidador registar pedidos de acompanhamento, incluindo pedidos recorrentes semanais e destinos ainda não constantes do catálogo, deixando-os prontos para a escolha do meio de transporte.

## ADDED Requirements

### Requirement: UC-01-REQ-03 — Recorrência Semanal do Pedido
When the requester selects «Repetir semanalmente», the system SHALL create the submitted request plus four weekly occurrences for the following four weeks (five requests in total), on the same weekday and time, all in the «A escolher o meio» state. The five requests SHALL be linked as a single series, SHALL inherit the destination and the mobility profile, and SHALL each satisfy the minimum advance notice of 24 hours (BR-01) and mobility compatibility (BR-02). The system SHALL create the series atomically: if any occurrence fails validation, no occurrence is created and the requester is informed. Each occurrence SHALL have a weekly reminder.

#### Scenario: TC-UC01-04 — Geração de 5 pedidos semanais a partir de um pedido recorrente
- **GIVEN** que o familiar está autenticado no formulário «Pedir acompanhamento» e a data atual é 20/11/2026 às 09:00
- **WHEN** introduz o destino «Clínica Fisioterapia Ria (Aveiro)», seleciona a consulta para 27/11/2026 às 11:00, ativa «Repetir semanalmente», marca «Bengala» e submete
- **THEN** o sistema gera exatamente 5 pedidos para 27/11, 04/12, 11/12, 18/12 e 25/12, todos às 11:00 e no estado «A escolher o meio»
- **AND** os 5 pedidos ficam ligados na mesma série, com o perfil de mobilidade «Bengala» e lembretes semanais
- **AND** cada ocorrência cumpre a antecedência mínima de 24 horas (BR-01)

### Requirement: UC-01-REQ-04 — Destino Não Listado
When the health unit destination is not in the catalog, the system SHALL let the requester type the destination manually and SHALL accept it as a «destino não listado». The system SHALL tag the resulting requests with «destino não listado», SHALL place the destination in a coordination validation queue, and SHALL NOT block the request creation while validation is pending. Once the coordination confirms or corrects the destination, the system SHALL store the validated unit and SHALL remove the «destino não listado» tag from the associated requests.

#### Scenario: TC-UC01-04 — Destino não listado sinalizado para validação
- **GIVEN** que o familiar está no passo de seleção do destino em 20/11/2026 e a unidade pretendida não consta do catálogo
- **WHEN** introduz manualmente o destino «Clínica Fisioterapia Ria (Aveiro)» e prossegue com o pedido
- **THEN** o sistema aceita o destino como «destino não listado»
- **AND** etiqueta os pedidos criados com «destino não listado»
- **AND** coloca o destino na fila de validação da coordenação sem bloquear a criação dos pedidos
