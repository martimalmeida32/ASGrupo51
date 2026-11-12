# Delta Spec: Trip Request (UC-01-S1)

## Purpose

Permitir ao utente sénior ou ao seu familiar/cuidador registar um pedido de acompanhamento a uma consulta, com destino, data/hora e necessidades de mobilidade, deixando-o pronto para escolha do meio de transporte.

## ADDED Requirements

### Requirement: UC-01-REQ-01 — Registo do Pedido de Acompanhamento
The system SHALL let the requester identify whether the request is for the senior user or for a family member/caregiver, select a health unit destination from the catalog, provide the consultation date and time, and declare the mobility needs (wheelchair, oxygen, cognitive deficit, companion, cane, stretcher or care). On submission, the system SHALL validate the data, create the request in the «A escolher o meio» state associated with the user's mobility profile, notify the IPSS coordination, and present the compatible transport options (BR-02). Access to the request data SHALL be restricted by role and limited to the functional data required (BR-11, RNF-06).

#### Scenario: TC-UC01-01 — Submissão com sucesso de pedido de acompanhamento com antecedência válida
- **GIVEN** que o utente sénior António Silva (cartão #MC-0142) está autenticado na app e a data atual é 20/11/2026 às 09:00
- **WHEN** seleciona «Próprio utente», escolhe o destino «Hospital Infante D. Pedro (Aveiro)», define a consulta para 24/11/2026 às 10:30, marca «Cadeira de rodas» e submete o pedido
- **THEN** o sistema regista o pedido #PED-104 com o estado «A escolher o meio»
- **AND** associa o perfil de mobilidade «Cadeira de rodas» ao pedido (BR-02)
- **AND** notifica a coordenação da IPSS
- **AND** apresenta as opções de transporte compatíveis no UC-02
- **AND** apenas o requerente autorizado e a coordenação acedem aos dados do pedido (BR-11)

### Requirement: UC-01-REQ-02 — Validação da Antecedência Mínima
The system SHALL validate that the consultation date and time comply with the minimum advance notice of 24 hours (BR-01) before creating the request. When the advance notice is insufficient or a required field is missing, the system SHALL block the creation, inform the requester, and register no request.

#### Scenario: TC-UC01-02 — Rejeição de pedido com antecedência inferior a 24 horas
- **GIVEN** que a data e hora atuais são 20/11/2026 às 16:00 e o familiar está no ecrã «Pedir acompanhamento»
- **WHEN** seleciona «Centro de Saúde de Ílhavo» para a consulta em 21/11/2026 às 10:00 (antecedência de 18 horas) e tenta submeter
- **THEN** o sistema bloqueia a criação do pedido segundo BR-01
- **AND** exibe o aviso «Antecedência mínima de 24 horas não cumprida»
- **AND** nenhum registo é criado
