# Design: UC-01-S2

## Contexto

Permitir a criação de pedidos recorrentes com periodicidade semanal
e a introdução de destinos não existentes no catálogo.

## Decisões técnicas e arquitetura

- Aplicar o ADR-001 e reutilizar a estrutura implementada no UC-01-S1.
- Adaptar o formulário existente em React com TypeScript para permitir
  a recorrência semanal e a introdução manual do destino.
- Criar os cinco pedidos numa única transação SQLite.
- Associar todos os pedidos ao mesmo identificador de série recorrente.
- Sinalizar destinos personalizados através de custom_destination = true.
- Encaminhar os destinos não listados para validação prévia.

## Módulos envolvidos

- Aplicação do utente e familiar.
- API REST.
- Pedidos e triagem.
- Gestão de recorrência.
- Persistência em SQLite.

## Interface de serviços

- POST /pedidos — Registar pedidos recorrentes.
- GET /pedidos/{id} — Consultar um pedido registado.

## Entidades envolvidas

- TripRequest.
- Identificador da série recorrente.
- Indicador de destino personalizado.
- Estado inicial: A_ESCOLHER_O_MEIO.

## Testes

Executar o cenário TC-UC01-04 com Playwright Test.

Verificar a criação de cinco pedidos nas datas 27/11, 04/12,
11/12, 18/12 e 25/12 de 2026, às 11h00, com destino à
Clínica Fisioterapia Ria.

Confirmar o estado inicial e a sinalização do destino para
validação prévia.
