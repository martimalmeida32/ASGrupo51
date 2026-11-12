# Delta Spec: Telephone Request (UC-06-S1)

## Purpose
Permitir o registo de pedidos de transporte via chamada telefónica por técnicos sociais da IPSS.

## ADDED Requirements

### Requirement: UC-06-REQ-01 — Registo Telefónico Assistido e Confirmação por SMS
The system SHALL let the social technician identify a registered utente, reuse their mobility profile (BR-11), record the appointment destination and time, present compatible transport options (BR-02, BR-04), create independent outbound and return trips (BR-05), and send an SMS confirmation to the user within 5 seconds (RNF-02).

#### Scenario: TC-UC06-03 — Registo telefónico completo com aviso TNUD/Táxi e confirmação por SMS
- **GIVEN** o técnico social atende a utente Maria Ferreira (cartão #MC-0205, telemóvel 912345678, perfil «Acompanhante») em 20/11/2026 às 10:00
- **WHEN** o técnico seleciona a consulta para o «Centro de Saúde de Aveiro» em 25/11/2026 às 15:00, transmite verbalmente o aviso de direitos a apoio público (BR-10), seleciona o voluntário compatível sugerido pela cascata e clica em «Confirmar Pedido»
- **THEN** o pedido é registado no estado «Confirmado» com criação independente de ida e regresso (BR-05), aplicando minimização de dados (BR-11), e o serviço externo envia um SMS de confirmação para o 912345678 com data, hora e ponto de encontro em menos de 5 segundos (RNF-02)
