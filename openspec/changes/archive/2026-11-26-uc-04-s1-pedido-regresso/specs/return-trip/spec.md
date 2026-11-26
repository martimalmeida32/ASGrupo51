# Delta Spec: Return Trip (UC-04-S1)

## Purpose
Acionar automaticamente o transporte de regresso em estafeta sem esperas desnecessárias para utentes e voluntários.

## ADDED Requirements

### Requirement: UC-04-REQ-01 — Pedido Automático de Regresso em Estafeta
The system SHALL calculate the expected end of consultation as scheduled time plus 45 minutes (BR-06), trigger the return trip request to the assigned transport means exactly 25 minutes before expected end as an independent trip (BR-05) in less than 3 seconds (RNF-03), and notify the user and caregiver.

#### Scenario: TC-UC04-01 — Pedido automático do regresso 25 minutos antes do fim previsto
- **GIVEN** o pedido #PED-104 está confirmado para consulta às 10:30 no Hospital Infante D. Pedro com término previsto para as 11:15, a ida #VG-201 está concluída e a viagem de regresso #VG-202 está pré-atribuída ao voluntário
- **WHEN** o relógio do sistema atinge as 10:50 (exatamente 25 minutos antes do fim previsto da consulta)
- **THEN** em menos de 3 segundos (RNF-03), o sistema aciona a viagem de regresso #VG-202 como etapa autónoma (BR-05), notifica o condutor para iniciar a deslocação e envia SMS e notificação na app ao utente e à familiar com a hora prevista de recolha (BR-06)
