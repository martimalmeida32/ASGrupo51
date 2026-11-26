# ADR-001 — Tecnologias da aplicação e testes do primeiro incremento

## Estado

Proposto para revisão pelo Grupo 51 na Iteração 4.

## Contexto

O MobiCare permite registar pedidos de transporte pela aplicação do utente ou por telefone, através da consola do técnico. Os dois canais devem aplicar as mesmas regras de antecedência, triagem e seleção de transporte. Se o utente perder a ligação, o pedido deve ficar guardado no dispositivo e ser sincronizado quando a rede regressar, sem criar duplicados (RNF-05).

## Decisão proposta

- Desenvolver a aplicação do utente e a consola do técnico em React com TypeScript, partilhando os componentes dos formulários de pedido. A aplicação do utente será responsiva e instalável como PWA.
- Usar uma API REST em Node.js com Express para centralizar as regras de negócio partilhadas pela aplicação do utente e pela consola do técnico.
- Usar SQLite no servidor do piloto e IndexedDB no navegador para guardar pedidos pendentes de sincronização. Cada pedido mantém o mesmo identificador nas tentativas de envio.
- Usar Playwright Test para automatizar os cenários do primeiro incremento. Cada teste começa pelo ID do caso da SRS e verifica os dados de entrada e o resultado esperado.

## Alternativas consideradas
Foi considerada a utilização de HTML, CSS e JavaScript sem framework. A proposta de React com TypeScript permite reutilizar componentes e partilhar as definições dos dados do pedido entre a aplicação do utente e a consola do técnico.

Uma aplicação renderizada no servidor simplificaria os formulários, mas continuaria a exigir código no navegador para registar pedidos sem rede. O desenvolvimento de aplicações nativas para Android e iOS aumentaria o esforço de implementação e teste, mantendo-se a necessidade de uma interface web para o técnico.

## Consequências

O utente e o técnico passam a usar as mesmas validações. Uma alteração à regra das 24 horas pode ser feita na API e verificada nos dois canais. A equipa terá de testar a recuperação da ligação, incluindo o caso em que o servidor recebe o pedido, mas a confirmação não chega ao dispositivo. A utilização de React com TypeScript introduz uma etapa de compilação do frontend e permite detetar incompatibilidades de tipos durante o desenvolvimento.

Antes de aprovar esta decisão, o grupo deve rever o TC-UC01-05. O caso de teste refere SQLite local, enquanto o desenho prevê IndexedDB no navegador. O critério de aceitação a preservar é que o pedido fique disponível após a recuperação da rede e seja criado uma única vez no servidor.