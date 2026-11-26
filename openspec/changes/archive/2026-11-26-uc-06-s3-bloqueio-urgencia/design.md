\# Design: UC-06-S3



\## Contexto



Impedir a criação de pedidos telefónicos que não cumpram

a antecedência mínima de 24 horas sem exceção autorizada,

bem como pedidos relativos a situações de emergência médica.



\## Decisões técnicas e arquitetura



\- Aplicar o ADR-001 e reutilizar a consola do técnico.

\- Reutilizar as validações implementadas nos slices anteriores.

\- Bloquear pedidos com antecedência inferior a 24 horas

&#x20; sem exceção autorizada, segundo a BR-01.

\- Aplicar a regra BR-12 quando o técnico identifica uma

&#x20; situação de urgência médica.

\- Interromper imediatamente a submissão e apresentar

&#x20; uma indicação para contactar o 112.

\- Garantir que os pedidos bloqueados não originam registos

&#x20; de pedidos, viagens ou notificações de confirmação.

\- Aplicar as validações no frontend e no servidor.

\- Preservar o funcionamento das exceções autorizadas

&#x20; implementadas no UC-06-S2.



\## Módulos envolvidos



\- Consola do técnico.

\- API REST.

\- Pedidos e triagem.

\- Validação de regras de negócio.

\- Persistência em SQLite.



\## Interface de serviços



\- POST /pedidos/telefonicos — Validar e registar pedidos telefónicos.

\- GET /pedidos/{id} — Consultar pedidos registados.



\## Testes



Utilizar Playwright Test para verificar os cenários:



\- TC-UC06-01: Bloqueio de pedido telefónico com antecedência

&#x20; insuficiente e sem exceção autorizada.

\- TC-UC06-02: Bloqueio de pedido relativo a uma situação

&#x20; de urgência médica e apresentação da indicação para ligar 112.



Confirmar que os pedidos bloqueados não são persistidos.

Respeitar os dados e resultados esperados da SRS.

Executar também os testes dos slices anteriores.

