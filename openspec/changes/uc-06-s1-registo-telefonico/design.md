\# Design: UC-06-S1



\## Contexto



Permitir ao técnico da IPSS registar um pedido de acompanhamento

recebido por telefone, em nome do utente, garantindo a aplicação

das mesmas regras de negócio do canal digital.



\## Decisões técnicas e arquitetura



\- Aplicar o ADR-001 e reutilizar os módulos dos slices anteriores.

\- Desenvolver a consola do técnico em React com TypeScript.

\- Permitir a pesquisa do utente por número de cartão MobiCare ou telefone.

\- Reutilizar o perfil de mobilidade do utente (BR-02).

\- Aplicar as regras de antecedência, triagem e seleção do transporte.

\- Criar as viagens independentes de ida e regresso (BR-05).

\- Guardar o pedido, as viagens e a notificação pendente numa transação SQLite.

\- Enviar o SMS através do adaptador de notificações definido no E5.

\- Utilizar um simulador de SMS durante os testes.

\- Garantir o envio da confirmação em menos de cinco segundos (RNF-02).



\## Módulos envolvidos



\- Consola do técnico.

\- API REST e controlo de acesso.

\- Pedidos e acompanhamento.

\- Perfil de mobilidade.

\- Triagem e alocação em cascata.

\- Gestão de viagens.

\- Persistência em SQLite.

\- Adaptador SMS.



\## Interface de serviços



\- GET /utentes — Pesquisar o utente por cartão ou telefone.

\- POST /pedidos/telefonicos — Registar e confirmar o pedido telefónico.

\- GET /pedidos/{id} — Consultar o pedido registado.



\## Entidades envolvidas



\- Utente.

\- Perfil de mobilidade.

\- TripRequest.

\- Trip: OUTBOUND e RETURN.

\- Notificação SMS.



\## Testes



Utilizar Playwright Test para verificar o cenário TC-UC06-03.



Confirmar o registo do pedido, a criação das duas viagens

independentes e o envio do SMS para 912345678, com data,

hora e ponto de encontro, em menos de cinco segundos.



Respeitar os dados e resultados esperados da SRS.

Executar também os testes dos slices anteriores.

