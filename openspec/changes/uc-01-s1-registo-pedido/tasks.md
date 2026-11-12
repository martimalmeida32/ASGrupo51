# Tasks

## 1. Modelo de Dados e Catálogo

- [ ] 1.1 Criar modelo `TripRequest` com requerente, utente, destino, data/hora da consulta, perfil de mobilidade e estado inicial `A_ESCOLHER_O_MEIO` e verificar que a migração cria a tabela
- [ ] 1.2 Criar o catálogo de unidades de saúde com pesquisa por nome/localidade e verificar a seleção de uma unidade no formulário
- [ ] 1.3 Associar as necessidades de mobilidade (cadeira de rodas, oxigénio, défice cognitivo, acompanhante, bengala, maca, cuidados) ao perfil do utente e verificar a persistência de cada opção (BR-02)

## 2. Formulário Mobile-First

- [ ] 2.1 Criar o ecrã «Pedir acompanhamento» com seleção do requerente (próprio utente ou familiar/cuidador) e verificar a renderização responsiva em viewport móvel (RNF-01)
- [ ] 2.2 Implementar pesquisa e seleção da unidade de saúde de destino e verificar que o destino fica associado ao pedido
- [ ] 2.3 Implementar a indicação da data/hora da consulta e das necessidades de mobilidade e verificar os campos obrigatórios no formulário
- [ ] 2.4 Garantir acessibilidade do ecrã (letra grande, contraste mínimo 4,5:1, poucos passos) e verificar os critérios de RNF-01

## 3. Validação e Criação do Pedido

- [ ] 3.1 Implementar a validação dos campos obrigatórios no cliente e no servidor e verificar que submissões incompletas não criam pedido
- [ ] 3.2 Implementar a validação da antecedência mínima de 24 horas com a hora do servidor (BR-01) e verificar o cenário TC-UC01-02
- [ ] 3.3 Criar o pedido no estado «A escolher o meio» com o perfil de mobilidade associado e verificar o cenário TC-UC01-01
- [ ] 3.4 Implementar idempotência da submissão e verificar que reenvios não criam pedidos duplicados

## 4. Notificação e Integração com UC-02

- [ ] 4.1 Emitir evento de pedido criado e notificar a coordenação da IPSS de forma assíncrona com retry e verificar que uma falha de notificação não impede o registo
- [ ] 4.2 Disponibilizar o pedido às opções compatíveis do UC-02 e verificar que o pedido aparece na lista de pedidos «A escolher o meio»

## 5. Privacidade e Testes

- [ ] 5.1 Restringir o acesso aos dados do pedido ao requerente autorizado e à coordenação (BR-11, RNF-06) e verificar que outro perfil recebe acesso negado
- [ ] 5.2 Implementar testes unitários para os cenários TC-UC01-01 e TC-UC01-02 e verificar que toda a suite passa
