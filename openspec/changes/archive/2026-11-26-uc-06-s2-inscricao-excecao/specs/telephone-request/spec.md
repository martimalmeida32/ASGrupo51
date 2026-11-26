# Delta Spec: Telephone Request (UC-06-S2)

## Purpose
Permitir o acolhimento presencial de novos utentes e o tratamento auditável de casos urgentes excecionais.

## ADDED Requirements

### Requirement: UC-06-REQ-02 — Inscrição Presencial de Utente e Exceção Urgente
The system SHALL allow the registration of a new utente with issuance of a physical MobiCare card (#MC-nnnn) and authorize an emergency trip request with less than 24 hours notice when justified by the social technician (BR-01, BR-11).

#### Scenario: TC-UC06-04 — Inscrição inicial de novo utente com cartão MobiCare e autorização de pedido urgente (< 24h)
- **GIVEN** um idoso sem registo prévio comparece no balcão da Junta de Freguesia em 20/11/2026 às 14:00 com marcação médica para 21/11/2026 às 10:00 (20h de antecedência), existindo um condutor disponível a título excecional
- **WHEN** o técnico recolhe os dados essenciais (BR-11), associa um novo cartão físico #MC-0310, seleciona «Exceção urgente autorizada pela coordenação» e introduz a fundamentação
- **THEN** o utente fica criado no sistema com o cartão #MC-0310 ativo, o registo de auditoria guarda a justificação da exceção à regra BR-01 e o pedido avança de imediato para a fase de alocação de transporte
