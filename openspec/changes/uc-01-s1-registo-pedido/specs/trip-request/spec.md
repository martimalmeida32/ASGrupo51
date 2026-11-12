# Delta Spec: Trip Request (UC-01-S1)

## Purpose
Permitir ao utente sénior, ou ao seu familiar/cuidador, registar um pedido de acompanhamento a uma consulta ou exame com destino, data/hora e necessidades de mobilidade, deixando-o pronto para a escolha do meio de transporte.

## ADDED Requirements

### Requirement: UC-01-REQ-01 — Registo Completo de Pedido de Acompanhamento
The system SHALL let the requester indicate whether the request is for the senior user or for a family member/caregiver, search and select a health unit destination from the catalog, provide the consultation date and time, and declare the mobility needs (wheelchair, oxygen, cognitive deficit, companion, cane, stretcher or care). On submission, the system SHALL validate the data, create the request in the «A escolher o meio» state, associate the mobility profile (BR-02), notify IPSS coordination, and present compatible transport options in UC-02, while strictly ensuring data minimization (BR-11, RNF-01).

#### Scenario: TC-UC01-01 — Submissão com sucesso de pedido de acompanhamento com antecedência válida
- **GIVEN** o utente sénior António Silva (cartão #MC-0142) está autenticado na aplicação móvel e a data atual é 20/11/2026 às 09:00
- **WHEN** seleciona «Próprio utente», escolhe o destino «Hospital Infante D. Pedro (Aveiro)», define a consulta para 24/11/2026 às 10:30, marca «Cadeira de rodas» e submete o pedido
- **THEN** o sistema regista o pedido #PED-104 com o estado «A escolher o meio», associa o perfil de mobilidade «Cadeira de rodas», notifica a coordenação da IPSS e apresenta as opções compatíveis no UC-02
