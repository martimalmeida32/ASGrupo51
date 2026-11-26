# Trip Request Specification

## Purpose

Permitir ao utente sénior, ou ao seu familiar/cuidador, registar um pedido de acompanhamento a uma consulta ou exame com destino, data/hora e necessidades de mobilidade, deixando-o pronto para a escolha do meio de transporte.

## Requirements

### Requirement: UC-01-REQ-01 — Registo Completo de Pedido de Acompanhamento

The system SHALL allow the requester to register a trip request for a senior user, specifying the destination, consultation date and time, and mobility needs. Upon validation, the system SHALL create the request in the «A escolher o meio» state, associate the mobility profile (BR-02), notify IPSS coordination and present compatible transport options (UC-02), ensuring data minimization (BR-11) and accessibility (RNF-01).

#### Scenario: TC-UC01-01 — Submissão com sucesso de pedido de acompanhamento com antecedência válida

* **GIVEN** o utente sénior António Silva (cartão #MC-0142) está autenticado na aplicação móvel e a data atual é 20/11/2026 às 09:00
* **WHEN** seleciona «Próprio utente», escolhe o destino «Hospital Infante D. Pedro (Aveiro)», define a consulta para 24/11/2026 às 10:30, marca «Cadeira de rodas» e submete o pedido
* **THEN** o sistema regista o pedido #PED-104 com o estado «A escolher o meio», associa o perfil de mobilidade «Cadeira de rodas», notifica a coordenação da IPSS e apresenta as opções compatíveis no UC-02

### Requirement: UC-01-REQ-02 — Recorrência Semanal e Destino Não Listado

When the requester introduces a destination not listed in the catalog and selects weekly recurrence, the system SHALL flag the requests for prior validation and create the series of 5 weekly requests in the «A escolher o meio» state (BR-01, BR-02).

#### Scenario: TC-UC01-04 — Criação de pedido recorrente semanal para 4 semanas e destino não listado
- **GIVEN** a familiar Joana Silva encontra-se autenticada no formulário de pedido em 20/11/2026
- **WHEN** introduz manualmente o destino «Clínica Fisioterapia Ria (Aveiro)», seleciona a data inicial de 27/11/2026 às 11:00, ativa «Repetir semanalmente por 4 semanas» e marca necessidade «Bengala»
- **THEN** o sistema sinaliza as deslocações com a etiqueta «Destino não listado - validação prévia» e gera automaticamente 5 pedidos semanais consecutivos (27/11, 04/12, 11/12, 18/12 e 25/12 às 11:00) todos no estado inicial «A escolher o meio»
