# Delta Spec: Return Trip (UC-04-S1)

## Purpose

Permitir que o regresso do utente seja pedido automaticamente ao meio escolhido antes do fim previsto da consulta, avisando o utente de quem o vai buscar e acompanhando o estado até «a caminho para o regresso».

## ADDED Requirements

### Requirement: UC-04-REQ-01 — Cálculo do Fim Previsto e Pedido Automático do Regresso
The system SHALL calculate the expected end of the consultation as the scheduled consultation time plus 45 minutes (BR-06). The system SHALL request the return trip #VG-202 to the chosen transport means 25 minutes before the expected end, as a trip independent from the outbound trip (BR-05), and SHALL complete the request in less than 3 seconds (RNF-03). The system SHALL notify the user or companion of who will pick them up and at what time.

#### Scenario: TC-UC04-01 — Pedido automático do regresso 25 minutos antes do fim previsto
- **GIVEN** que o pedido #PED-104 está «Confirmado» para 24/11/2026 às 10:30 no Hospital Infante D. Pedro (Aveiro), a viagem de ida #VG-201 está concluída, o utente António Silva (#MC-0142) fez check-in na unidade e a viagem de regresso #VG-202 está atribuída a um voluntário
- **WHEN** chegam as 10:50 (fim previsto às 11:15)
- **THEN** o sistema pede o regresso #VG-202, como viagem independente da ida (BR-05), às 10:50 e em menos de 3 segundos (RNF-03)
- **AND** o utente é avisado de quem o vai buscar e a que horas

### Requirement: UC-04-REQ-02 — Confirmação do Fim da Consulta e Estado «A Caminho para o Regresso»
The system SHALL let the user, or the companion, confirm in the app that the consultation is ending, and SHALL also accept the health unit's end-of-consultation notice. When the return transport means confirms, the system SHALL set the return trip to the «a caminho para o regresso» state and SHALL show that state to the user, the family and the coordination.

#### Scenario: TC-UC04-01 — Estado «a caminho para o regresso» após confirmação do utente
- **GIVEN** que o pedido #PED-104 está «Confirmado» e o regresso #VG-202 já foi pedido ao meio escolhido
- **WHEN** o utente confirma na app às 11:05 que a consulta está a terminar e o meio de regresso confirma a recolha
- **THEN** o sistema coloca a viagem de regresso no estado «a caminho para o regresso»
- **AND** o utente, o familiar e a coordenação veem esse estado no acompanhamento
