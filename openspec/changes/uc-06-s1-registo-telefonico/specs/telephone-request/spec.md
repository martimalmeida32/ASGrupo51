# Delta Spec: Telephone Request (UC-06-S1)

## Purpose

Permitir que o técnico social registe, durante uma chamada telefónica, um pedido de acompanhamento em nome de um utente já registado, reutilizando o perfil de mobilidade, validando as regras aplicáveis e confirmando o pedido por SMS.

## ADDED Requirements

### Requirement: UC-06-REQ-01 — Identificação do Utente e Reutilização do Perfil
The system SHALL let an authenticated social technician identify an already registered utente by card number, phone number or name and SHALL reuse that utente's existing mobility profile (A1) without asking the utente to repeat it. The system SHALL display only the data needed to register the request, respecting data minimisation (BR-11), and SHALL make every request step available by telephone so that a utente without the app can complete the same request (RNF-02).

#### Scenario: TC-UC06-03 — Identificação da utente registada e reutilização do perfil
- **GIVEN** que a utente Maria Ferreira (cartão #MC-0205, telemóvel 912345678, perfil «Acompanhante», elegível para apoio público) liga para a IPSS em 20/11/2026 às 10:00
- **WHEN** o técnico social atende a chamada e a identifica pelo cartão #MC-0205
- **THEN** o sistema reutiliza o perfil de mobilidade existente sem pedir os dados novamente
- **AND** apresenta apenas os dados necessários ao registo (BR-11)

### Requirement: UC-06-REQ-02 — Registo Assistido e Validação das Regras
The system SHALL let the technician record the destination from the list of health units, the consultation date and time, and the utente's mobility and accompaniment needs. The system SHALL validate the minimum advance notice of 24 hours (BR-01) and SHALL present the advance notice required for the request to proceed. When the utente is eligible for public support, the system SHALL present the TNUD/Táxi Municipal subsidiarity notice and SHALL only continue after the technician confirms that the utente chose to proceed (BR-10).

#### Scenario: TC-UC06-03 — Registo do destino, data e necessidades com aviso TNUD/Táxi
- **GIVEN** que o técnico social tem o perfil da utente Maria Ferreira aberto no Portal Web
- **WHEN** seleciona «Centro de Saúde de Aveiro» para 25/11/2026 às 15:00 e lê o aviso de TNUD/Táxi Municipal à utente, que decide prosseguir
- **THEN** o sistema aceita o registo por a data cumprir a antecedência mínima de 24 horas (BR-01)
- **AND** regista o destino, a data, a hora e as necessidades de mobilidade e acompanhamento

### Requirement: UC-06-REQ-03 — Meio Compatível, Confirmação e SMS
The system SHALL suggest compatible transport means through the UC-02 selection rules and SHALL let the technician choose and confirm the suggested compatible volunteer with the utente by telephone. On confirmation, the system SHALL set the request to «Confirmado», SHALL create independent outbound and return trips (BR-05), and SHALL send an SMS to the utente's registered phone number with the date, time and assigned means. If the SMS cannot be delivered, the system SHALL keep the request confirmed and retry the delivery.

#### Scenario: TC-UC06-03 — Pedido confirmado com viagens independentes e SMS de confirmação
- **GIVEN** que o técnico social registou o pedido da utente Maria Ferreira para 25/11/2026 às 15:00 no Centro de Saúde de Aveiro
- **WHEN** escolhe o voluntário compatível sugerido pelo UC-02 e confirma o pedido
- **THEN** o pedido fica no estado «Confirmado» com viagens de ida e regresso independentes (BR-05)
- **AND** o serviço externo envia um SMS para 912345678 com a data, a hora e o meio atribuído
