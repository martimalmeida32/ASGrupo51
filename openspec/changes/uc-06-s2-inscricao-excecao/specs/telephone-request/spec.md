# Delta Spec: Telephone Request — UC-06-S2

## Purpose

Permitir que o técnico social inscreva um novo utente e emita o cartão físico MobiCare, registe destinos não listados, autorize pedidos urgentes com menos de 24 horas mediante justificação e encaminhe o utente para apoios públicos, mantendo o registo telefónico completo e auditável.

## ADDED Requirements

### Requirement: UC-06-REQ-04 — Inscrição Inicial e Emissão de Cartão Físico
The system SHALL let the social technician create an initial utente record during the telephone or counter registration, collecting only the minimum mandatory data (BR-11). The system SHALL issue a physical MobiCare card with a unique card number in the format #MC-nnnn and a QR/NFC payload linked to that utente. The system SHALL associate the initial mobility profile to the card and SHALL mark the utente's first trip as guaranteed accompaniment.

#### Scenario: TC-UC06-04 — Inscrição de novo utente com emissão do cartão #MC-0310
- **GIVEN** que um novo utente sem registo prévio comparece no balcão da Junta/IPSS em 20/11/2026 às 14:00 com marcação hospitalar urgente para 21/11/2026 às 10:00
- **WHEN** o técnico regista apenas os dados mínimos obrigatórios (BR-11) e emite o cartão físico #MC-0310
- **THEN** o utente fica registado com o cartão #MC-0310 e o respetivo perfil de mobilidade associado
- **AND** a primeira viagem do utente fica marcada como acompanhamento garantido

### Requirement: UC-06-REQ-05 — Destino Não Listado
When the health unit is not in the destination list, the system SHALL let the technician type the destination and SHALL accept it as «destino não listado», continuing the registration without inventing a catalogue entry. The system SHALL mark the destination as pending validation by the coordination (UC-07) and SHALL keep that mark visible on the request.

#### Scenario: A2 — Registo de destino não listado
- **GIVEN** que o técnico social está a registar um pedido telefónico e a unidade de saúde indicada pelo utente não consta da lista de destinos
- **WHEN** o técnico escreve o destino e continua o registo
- **THEN** o sistema aceita o destino como «destino não listado» e mantém o pedido em curso
- **AND** o destino fica sinalizado para validação pela coordenação (UC-07)

### Requirement: UC-06-REQ-06 — Exceção de Urgência com Menos de 24 Horas
The system SHALL block requests whose advance notice is less than 24 hours (BR-01) unless the technician authorizes an urgent exception with a non-empty justification. The system SHALL record in the request audit log the authorizing technician, the date and time, and the justification for the exception. After a justified authorization, the system SHALL advance the request to the means assignment step.

#### Scenario: TC-UC06-04 — Autorização justificada de pedido urgente com 20 horas de antecedência
- **GIVEN** que o novo utente tem uma marcação para 21/11/2026 às 10:00 e existe um voluntário excecional disponível
- **WHEN** o técnico assinala «Exceção urgente autorizada», introduz a justificação e submete o pedido
- **THEN** o registo de auditoria guarda a justificação da exceção à BR-01
- **AND** o pedido avança para a atribuição do meio

### Requirement: UC-06-REQ-07 — Encaminhamento Informativo para TNUD e Táxi Municipal
When the utente may be entitled to public support, the system SHALL present the informative referral to the TNUD and the Táxi Municipal (BR-10) before the request is confirmed. The system SHALL record that the referral was presented and whether the utente chose to proceed with the MobiCare request.

#### Scenario: TC-UC06-03 — Aviso TNUD/Táxi apresentado e decisão da utente registada
- **GIVEN** que a utente Maria Ferreira é elegível para apoio público e o técnico está a registar o pedido para o Centro de Saúde de Aveiro
- **WHEN** o técnico lê o aviso de TNUD/Táxi Municipal e a utente decide prosseguir com o pedido MobiCare
- **THEN** o sistema regista que o encaminhamento foi apresentado e que a utente optou por prosseguir
- **AND** o registo do pedido continua após essa decisão
