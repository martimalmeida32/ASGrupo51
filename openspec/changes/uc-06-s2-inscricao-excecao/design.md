# Design: UC-06-S2

## Contexto

Permitir ao técnico da IPSS inscrever um novo utente,
atribuir um cartão MobiCare e autorizar excecionalmente
um pedido com antecedência inferior a 24 horas.

## Decisões técnicas e arquitetura

- Aplicar o ADR-001 e reutilizar a consola do técnico.
- Desenvolver o formulário de inscrição em React com TypeScript.
- Gerar um identificador único de cartão MobiCare no formato MC-nnnn.
- Associar o cartão ao perfil do utente.
- Preparar a identificação por QR/NFC para incrementos posteriores.
- Permitir uma exceção à BR-01 mediante autorização do técnico
  e apresentação de uma justificação obrigatória.
- Registar a justificação, o técnico responsável e a data da autorização.
- Guardar os dados e o registo de auditoria em SQLite.
- Aplicar a minimização de dados prevista na BR-11.

## Módulos envolvidos

- Consola do técnico.
- API REST e controlo de acesso.
- Gestão de utentes e cartões MobiCare.
- Pedidos e triagem.
- Registo de auditoria.
- Persistência em SQLite.

## Interface de serviços

- POST /utentes — Inscrever um novo utente.
- GET /utentes — Pesquisar o utente inscrito.
- POST /pedidos/telefonicos — Registar um pedido com exceção autorizada.
- GET /pedidos/{id} — Consultar o pedido registado.

## Entidades envolvidas

- Utente.
- Cartão MobiCare.
- Perfil de mobilidade.
- TripRequest.
- Registo de auditoria da exceção.

## Testes

Utilizar Playwright Test para verificar o cenário TC-UC06-04.

Confirmar a inscrição do novo utente, a atribuição do cartão,
a autorização da exceção e o registo da respetiva justificação.

Respeitar os dados e resultados esperados da SRS.
Executar também os testes dos slices anteriores.
