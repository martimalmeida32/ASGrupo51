# Proposal: UC-02-S1 — Filtragem por compatibilidade e cascata

## Why
Depois de criado o pedido «A escolher o meio», o utente precisa de ver apenas os meios compatíveis com o seu perfil de mobilidade, na ordem certa de prioridade e com o custo, para escolher com confiança quem o leva. Sem filtragem, ordenação em cascata e criação explícita das viagens de ida e regresso, a escolha é insegura e o pedido não avança para «Confirmado».

## What Changes
- Apresentação das opções compatíveis com o perfil de mobilidade do pedido (BR-02), excluindo meios incompatíveis.
- Ordenação em cascata: Voluntário, Viatura Adaptada de Parceiro e Operador Profissional (BR-04), com destaque da opção recomendada.
- Apresentação do custo para o utente em cada opção (voluntário com custo 0,00 €).
- Apresentação do conjunto de opções em menos de 3 segundos (RNF-03).
- Seleção e confirmação de uma opção pelo utente.
- Transição do pedido para «Confirmado» e criação separada de duas viagens: ida (#VG-201, hora ajustada à consulta) e regresso (#VG-202, em modo estafeta), conforme BR-05.
- Notificação da coordenação e do meio escolhido após a confirmação.

## Capabilities

### New Capabilities
- `transport-selection`: Filtragem e ordenação em cascata dos meios compatíveis com o perfil de mobilidade e confirmação da escolha com criação das viagens de ida e regresso.

### Modified Capabilities
<!-- Sem alterações a specs principais: o projeto ainda não tem specs principais. -->

## Impact
- Nova consulta de opções sobre voluntários, viaturas adaptadas de parceiros e operadores profissionais, com disponibilidade e compatibilidade de mobilidade.
- Regra de prioridade em cascata (BR-04) e marcação da opção recomendada.
- Novo ecrã «Quem o pode levar» no perfil do utente/familiar, com custo por opção (RNF-01).
- Transição de estado do `TripRequest` de «A escolher o meio» para «Confirmado».
- Criação do modelo de viagens de ida e regresso como registos independentes (BR-05), com hora de ida ajustada à consulta e regresso em estafeta.
- Notificações à coordenação e ao meio escolhido.
- Fora de âmbito: exclusividade de operador para maca/cuidados e avisos TNUD/Táxi Municipal (UC-02-S2); sem opção disponível, opção já atribuída e recálculo (UC-02-S3); realização da viagem (UC-03) e regresso em estafeta (UC-04).
