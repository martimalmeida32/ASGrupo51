# Design: UC-04-S1

## Contexto

Acionar automaticamente a viagem de regresso do utente,
25 minutos antes do fim previsto da consulta, mantendo
a independência entre as viagens de ida e regresso.

## Decisões técnicas e arquitetura

- Aplicar o ADR-001 e reutilizar as viagens criadas no UC-02-S1.
- Calcular o fim previsto da consulta segundo a BR-06.
- Utilizar um processo periódico no servidor para identificar
  regressos que devem ser acionados.
- Acionar o regresso 25 minutos antes do fim previsto da consulta.
- Atualizar apenas o estado da viagem de regresso (BR-05).
- Notificar o condutor, o utente e o familiar através dos canais previstos na SRS.
- Utilizar um adaptador de SMS com simulador para os testes.
- Impedir o acionamento e o envio duplicado de notificações.
- Respeitar o tempo de resposta definido no RNF-03.

## Módulos envolvidos

- Gestão de viagens.
- Processo de acionamento do regresso.
- Persistência em SQLite.
- Notificações.
- Adaptador SMS.

## Interface de serviços

- Evento interno: fim previsto da consulta menos 25 minutos.
- GET /pedidos/{id} — Consultar o estado das viagens associadas.

O acionamento automático é efetuado pelo servidor.

## Entidades envolvidas

- TripRequest: pedido de acompanhamento.
- Trip: viagem independente.
- direction: RETURN.
- planned_end: fim previsto da consulta.
- Instante de acionamento do regresso.
- Notificações associadas.

## Testes

Utilizar Playwright Test para verificar o cenário TC-UC04-01.

Controlar o relógio durante o teste para verificar o acionamento
25 minutos antes do fim previsto, sem esperar pelo tempo real.

Confirmar os dados, os estados e as notificações previstos na SRS.
Executar também os testes dos slices anteriores.
