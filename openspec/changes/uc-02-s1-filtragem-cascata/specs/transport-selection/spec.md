# Delta Spec: Transport Selection (UC-02-S1)

## Purpose

Permitir ao utente ou ao seu familiar escolher, entre os meios compatíveis com o perfil de mobilidade, quem assegura o acompanhamento, ordenando as opções pela cascata de prioridade e criando as viagens de ida e de regresso.

## ADDED Requirements

### Requirement: UC-02-REQ-01 — Filtragem por Compatibilidade e Ordenação em Cascata
When the requester opens the «Quem o pode levar» screen for a request in the «A escolher o meio» state, the system SHALL present only the transport means compatible with the request's mobility profile (BR-02). The system SHALL order the compatible options by the cascade Voluntário, Viatura Adaptada de Parceiro, Operador Profissional (BR-04), SHALL highlight the recommended option, and SHALL show the cost to the user for each option. The options SHALL be presented in less than 3 seconds (RNF-03).

#### Scenario: TC-UC02-01 — Filtragem por compatibilidade e ordenação em cascata
- **GIVEN** que existe o pedido #PED-104 («A escolher o meio») para 24/11/2026 às 10:30 com perfil «Bengala», e existem disponíveis 1 voluntário compatível, 1 viatura adaptada de parceiro e 1 operador profissional
- **WHEN** o utente abre o ecrã «Quem o pode levar» para o pedido #PED-104
- **THEN** em menos de 3 segundos o sistema apresenta apenas opções compatíveis
- **AND** ordena-as por cascata: 1.º Voluntário (recomendado, custo 0,00 €), 2.º Viatura Adaptada de Parceiro e 3.º Operador Profissional

### Requirement: UC-02-REQ-02 — Confirmação da Escolha e Criação das Viagens
When the requester selects a compatible option and confirms the choice, the system SHALL transition the request to «Confirmado» and SHALL create two independent trips: the outbound trip with the time adjusted to the consultation and the return trip in estafeta mode (BR-05). The system SHALL notify the coordination and the selected transport means.

#### Scenario: TC-UC02-03 — Criação independente das viagens de ida e de regresso após seleção
- **GIVEN** que as opções compatíveis para o pedido #PED-104 estão apresentadas ao utente
- **WHEN** o utente seleciona a opção recomendada (Voluntário) e confirma a escolha
- **THEN** o pedido #PED-104 transita para «Confirmado»
- **AND** são criadas duas viagens independentes: a viagem de ida #VG-201, com hora prevista ajustada à consulta, e a viagem de regresso #VG-202, em modo estafeta
- **AND** é enviada notificação à coordenação e ao meio escolhido
