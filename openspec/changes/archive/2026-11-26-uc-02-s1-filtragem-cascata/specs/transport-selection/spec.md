# Delta Spec: Transport Selection (UC-02-S1)

## Purpose
Permitir a seleção de quem transporta o utente com base no perfil funcional e criar as viagens de ida e regresso.

## ADDED Requirements

### Requirement: UC-02-REQ-01 — Filtragem por Compatibilidade e Ordenação em Cascata
The system SHALL filter available transport means by user mobility requirements (BR-02), sort compatible options strictly by priority cascade (Voluntário, Viatura Adaptada, Operador Profissional, BR-04) within 3 seconds (RNF-03), and display costs.

#### Scenario: TC-UC02-01 — Filtragem por compatibilidade e ordenação em cascata
- **GIVEN** existe o pedido #PED-104 («A escolher o meio») para 24/11/2026 às 10:30 com perfil «Bengala», existindo disponíveis 1 voluntário particular compatível, 1 viatura adaptada de parceiro e 1 operador profissional
- **WHEN** o utente acede ao ecrã «Quem o pode levar» para o pedido #PED-104
- **THEN** em menos de 3 segundos (RNF-03), o sistema apresenta as opções ordenadas rigorosamente pela cascata da regra BR-04: 1.º Voluntário (recomendado, custo 0,00 €), 2.º Viatura Adaptada de Parceiro e 3.º Operador Profissional

### Requirement: UC-02-REQ-02 — Criação Independente de Viagens de Ida e Regresso
Upon confirmation of the chosen transport option, the system SHALL update the request state to «Confirmado» and SHALL create two independent trips (outbound and return) in the database (BR-05).

#### Scenario: TC-UC02-03 — Criação independente das viagens de ida e de regresso após seleção
- **GIVEN** as opções de transporte compatíveis para o pedido #PED-104 são apresentadas ao utente
- **WHEN** o utente seleciona a opção recomendada (Voluntário Carlos Mendes) e confirma a marcação
- **THEN** o pedido #PED-104 transita para «Confirmado» e são criadas duas viagens autónomas na base de dados (BR-05): viagem de ida #VG-201 (recolha às 09:45) e viagem de regresso #VG-202 (em modo estafeta flexível), notificando o voluntário e a coordenação
