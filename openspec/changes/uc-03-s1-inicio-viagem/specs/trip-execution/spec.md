# Delta Spec: Trip Execution (UC-03-S1)

## Purpose

Permitir ao voluntário iniciar a viagem atribuída e comprovar presencialmente a recolha do utente no domicílio, com registo de hora e localização, contingência manual e tratamento da ausência do utente.

## ADDED Requirements

### Requirement: UC-03-REQ-01 — Início de Viagem e Verificação de Mobilidade
The system SHALL present the assigned trip details and verify strict mobility compatibility (BR-02) before allowing the volunteer to start the trip, recording the initial timestamp and GPS coordinates.

#### Scenario: TC-UC03-03 — Verificação de mobilidade no início da viagem
- **GIVEN** que o voluntário abre os detalhes da viagem atribuída
- **WHEN** o voluntário tenta iniciar a deslocação
- **THEN** o sistema verifica a compatibilidade do perfil de mobilidade (BR-02)
- **AND** permite que a viagem avance registando as coordenadas iniciais e o timestamp

### Requirement: UC-03-REQ-02 — Check-in Presencial à Porta do Utente
The system SHALL validate the physical presence of the user through QR/NFC scan of the MobiCare card and record timestamp and GPS coordinates upon pickup. When the physical reader fails, the system SHALL allow a manual confirmation with the card number and a justification. The system SHALL also handle the user's absence after a 10-minute tolerance window.

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
