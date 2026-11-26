# Design: UC-02-S1

## Contexto

Apresentar os meios de transporte compatíveis com as necessidades
de mobilidade do utente e permitir a seleção do meio de transporte,
criando duas viagens independentes de ida e regresso.

## Decisões técnicas e arquitetura

- Aplicar o ADR-001 e reutilizar os módulos dos slices anteriores.
- Filtrar os meios de transporte segundo o perfil de mobilidade (BR-02).
- Ordenar os meios compatíveis segundo a cascata definida na BR-04:
  1. Voluntário (0 euros).
  2. Viatura adaptada de parceiro.
  3. Operador profissional.
- Garantir o tempo de resposta previsto no RNF-03.
- Criar as viagens de ida e regresso numa única transação SQLite.
- Atribuir identificadores e estados independentes às duas viagens (BR-05).
- Impedir a duplicação de viagens quando a confirmação é repetida.

## Módulos envolvidos

- Aplicação do utente e familiar.
- API REST.
- Triagem e alocação em cascata.
- Gestão de viagens.
- Persistência em SQLite.

## Interface de serviços

- GET /pedidos/{id}/opcoes — Consultar meios de transporte compatíveis.
- POST /pedidos/{id}/selecao — Confirmar a seleção do transporte.
- GET /pedidos/{id} — Consultar o pedido registado.

## Entidades envolvidas

- TripRequest: pedido de acompanhamento.
- Trip: viagem associada ao pedido.
- direction: OUTBOUND ou RETURN.
- Meio de transporte selecionado.
- Estado individual de cada viagem.

## Testes

Utilizar Playwright Test para verificar os cenários:

- TC-UC02-01: Filtragem por compatibilidade e ordenação em cascata.
- TC-UC02-03: Criação independente das viagens de ida e regresso
  após a seleção do transporte.

Respeitar os dados e resultados esperados da SRS.
Executar também os testes dos slices anteriores.
