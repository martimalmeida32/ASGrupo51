# Delta Spec: Trip Request (UC-01-S2)

## Purpose
Permitir ao utente sénior ou familiar agendar deslocações recorrentes semanais e introduzir destinos de saúde não listados no catálogo.

## ADDED Requirements

### Requirement: UC-01-REQ-02 — Recorrência Semanal e Destino Não Listado
When the requester introduces a destination not listed in the catalog and selects weekly recurrence, the system SHALL flag the requests for prior validation and create the series of 5 weekly requests in the «A escolher o meio» state (BR-01, BR-02).

#### Scenario: TC-UC01-04 — Criação de pedido recorrente semanal para 4 semanas e destino não listado
- **GIVEN** a familiar Joana Silva encontra-se autenticada no formulário de pedido em 20/11/2026
- **WHEN** introduz manualmente o destino «Clínica Fisioterapia Ria (Aveiro)», seleciona a data inicial de 27/11/2026 às 11:00, ativa «Repetir semanalmente por 4 semanas» e marca necessidade «Bengala»
- **THEN** o sistema sinaliza as deslocações com a etiqueta «Destino não listado - validação prévia» e gera automaticamente 5 pedidos semanais consecutivos (27/11, 04/12, 11/12, 18/12 e 25/12 às 11:00) todos no estado inicial «A escolher o meio»
