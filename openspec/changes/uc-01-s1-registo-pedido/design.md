# Design: UC-01-S1

## Contexto

Permitir ao utente ou familiar registar um pedido de acompanhamento
para uma consulta ou exame, de acordo com a SRS.

## Decisões técnicas e arquitetura

- Aplicar as decisões registadas no ADR-001.
- Desenvolver o formulário em React com TypeScript.
- Garantir um contraste mínimo de 4,5:1 (RNF-01).
- Validar os dados na interface e no servidor.
- Garantir a antecedência mínima de 24 horas (BR-01).
- Armazenar apenas os dados necessários ao pedido (BR-11).
- Utilizar SQLite para a persistência no servidor.

## Módulos envolvidos

- Aplicação do utente e familiar.
- API REST e controlo de acesso.
- Pedidos e triagem.
- Catálogo de destinos.
- Perfil de mobilidade.
- Persistência e notificações.

## Interface de serviços

- POST /pedidos — Registar um pedido de acompanhamento.

## Entidades envolvidas

- TripRequest: request_id, user_id, destination, consultation_at,
  mobility_profile e status.
- Estado inicial: A_ESCOLHER_O_MEIO.

## Testes

Utilizar Playwright Test para validar o cenário TC-UC01-01,
respeitando os dados de entrada e os resultados esperados da SRS.