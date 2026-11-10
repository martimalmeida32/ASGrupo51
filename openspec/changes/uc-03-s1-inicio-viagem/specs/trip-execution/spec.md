# Delta Spec: Trip Execution (UC-03-S1)

## ADDED Requirements

### Requirement: UC-03-REQ-01 — Início de Viagem e Verificação de Mobilidade
The system SHALL present the assigned trip details and verify strict mobility compatibility (BR-02) before allowing the volunteer to start the trip.

### Requirement: UC-03-REQ-02 — Check-in Presencial à Porta do Utente
The system SHALL validate the physical presence of the user through QR/NFC scan of the MobiCare card and record timestamp and GPS coordinates upon pickup.

#### Scenario: TC-UC03-01 — Check-in presencial com sucesso à porta do utente
- **GIVEN** que o voluntário está ativo e habilitado (BR-08) e tem a viagem atribuída
- **WHEN** o voluntário aproxima o dispositivo móvel do cartão físico MobiCare do utente (QR/NFC)
- **THEN** o sistema regista o check-in com coordenadas GPS e timestamp
- **AND** o estado da viagem passa para «Em Curso»
- **AND** é enviada uma notificação ao familiar registado

#### Scenario: TC-UC03-02 — Tolerância de espera excedida sem comparência
- **GIVEN** que o voluntário se encontra no ponto de recolha à hora agendada
- **WHEN** decorrem 10 minutos sem comparência do utente e o voluntário clica em «Reportar Ausência»
- **THEN** o sistema alerta a central da IPSS e o contacto de emergência do familiar
- **AND** liberta o voluntário da escala terminando o serviço sem penalização

#### Scenario: TC-UC03-04 — Check-in manual por falha do leitor QR/NFC
- **GIVEN** que a câmara ou leitor NFC do dispositivo do voluntário não consegue ler o cartão físico
- **WHEN** o voluntário seleciona «Confirmação Manual» e insere o número do cartão com justificação
- **THEN** o sistema regista o check-in com indicação de contingência manual e avança o fluxo