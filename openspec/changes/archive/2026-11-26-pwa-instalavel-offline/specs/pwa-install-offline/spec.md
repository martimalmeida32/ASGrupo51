# Spec Delta

## Purpose

Tornar a aplicação do utente instalável e utilizável sem rede, preservando os pedidos pendentes no dispositivo até à sincronização automática e sem duplicados no servidor.

## ADDED Requirements

### Requirement: RNF-08-REQ-01 — Manifesto e instalação pelo navegador

The application SHALL publish a web manifest with a standalone display mode, pt-PT language, theme and background colors, a root start URL and scope, and install icons of 192 and 512 pixels including a maskable variant. The user interface SHALL offer an install action when the browser exposes an install prompt (RNF-08, ADR-001).

#### Scenario: TC-RNF08-01 — Manifesto e ícones disponíveis no navegador

* **GIVEN** um navegador moderno de Android ou iOS acede à aplicação MobiCare
* **WHEN** o navegador obtém `/manifest.webmanifest` e o documento HTML inicial
* **THEN** o manifesto declara `name`, `short_name`, `start_url` `/`, `scope` `/`, `display` `standalone`, `lang` `pt-PT`, cores de tema e fundo, ícones PNG de 192 e 512 pixéis com `purpose` `any` e uma variante `maskable`, e o HTML referencia o manifesto, a cor de tema e o ícone touch da Apple

#### Scenario: TC-RNF08-02 — Instalação aceite pelo utilizador

* **GIVEN** o navegador disponibiliza o evento `beforeinstallprompt` para a aplicação
* **WHEN** o utilizador seleciona «Instalar aplicação» e aceita o prompt apresentado
* **THEN** a aplicação guarda o evento, apresenta o botão de instalação, invoca o prompt guardado e oculta o botão após a confirmação da instalação

### Requirement: RNF-08-REQ-02 — Interface disponível em modo offline

The application SHALL cache its app shell and serve the interface from cache when the network is unavailable. The service worker SHALL NOT cache REST API responses, so stale order or transport data is never presented as current (ADR-001, RNF-05).

#### Scenario: TC-RNF08-03 — Recarregamento da interface sem ligação

* **GIVEN** a aplicação foi aberta com ligação e o service worker controla a página
* **WHEN** o dispositivo fica sem ligação e a página é recarregada
* **THEN** os separadores «Portal do utente» e «Consola telefónica» e o formulário de pedido continuam visíveis e utilizáveis sem pedidos ao servidor

#### Scenario: TC-RNF08-04 — Respostas da API não são servidas da cache offline

* **GIVEN** a aplicação já consultou `GET /pedidos/{id}/opcoes` com ligação
* **WHEN** a aplicação repete essa consulta sem ligação
* **THEN** o service worker não devolve uma resposta API em cache e a interface mantém os dados locais disponíveis

### Requirement: RNF-08-REQ-03 — Preservação e sincronização da fila de pedidos

The application SHALL retain pending trip requests in IndexedDB across an offline reload and SHALL synchronize them with the same submission identifier when connectivity returns, creating exactly one server record (UC-01, RNF-05, TC-UC01-05).

#### Scenario: TC-RNF08-05 — Pedido pendente sobrevive ao recarregamento offline e sincroniza sem duplicados

* **GIVEN** o dispositivo está sem ligação e o utilizador submete um pedido válido para 28/11/2026 às 09:30
* **WHEN** a página é recarregada sem ligação e, depois, a conectividade é restabelecida
* **THEN** o pedido continua identificado como «Pendente de sincronização» após o recarregamento, é enviado automaticamente com o mesmo identificador de submissão, a fila local fica vazia e o servidor contém apenas um registo para esse pedido
