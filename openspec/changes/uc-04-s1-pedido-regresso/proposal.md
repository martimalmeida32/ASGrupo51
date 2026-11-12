# Proposal: UC-04-S1 — Pedido automático do regresso em estafeta

## Why
Quando a consulta termina, o utente não pode ficar à espera nem prender o voluntário da ida. É preciso calcular o fim previsto da consulta e pedir automaticamente o regresso ao meio escolhido 25 minutos antes, avisando o utente de quem o vai buscar e a que horas. Sem este pedido automático, o regresso depende de iniciativa manual e falha a promessa de estafeta (BR-05, BR-06).

## What Changes
- Cálculo do fim previsto da consulta como hora marcada mais 45 minutos (BR-06).
- Pedido automático da viagem de regresso #VG-202 ao meio escolhido 25 minutos antes do fim previsto (BR-05), como viagem independente da ida.
- Registo do pedido e resposta em menos de 3 segundos (RNF-03).
- Aviso ao utente (ou acompanhante) de quem o vai buscar e a que horas.
- Confirmação de que a consulta está a terminar pelo utente na app, ou aviso da unidade de saúde.
- Confirmação do meio de regresso e passagem ao estado «a caminho para o regresso», visível ao utente, ao familiar e à coordenação.

## Capabilities

### New Capabilities
- `return-trip`: Cálculo do fim previsto da consulta, pedido automático do regresso ao meio escolhido e acompanhamento do estado até «a caminho para o regresso».

### Modified Capabilities
<!-- Sem alterações a specs principais: o projeto ainda não tem specs principais. -->

## Impact
- Novos campos na viagem de regresso: fim previsto da consulta, hora do pedido de regresso e estado do pedido.
- Agendador durável que dispara o pedido 25 minutos antes do fim previsto e sobrevive a reinícios.
- Máquina de estados do regresso (`AGENDADO`, `PEDIDO`, `CONFIRMADO`, `A_CAMINHO`).
- Notificações ao utente com o meio e a hora de recolha, e atualização do estado para utente, familiar e coordenação.
- Ecrã de acompanhamento do regresso com o estado «a caminho para o regresso».
- Fora de âmbito: antecipação/adiamento por alteração do fim da consulta (UC-04-S2), regresso com o mesmo meio da ida (UC-04-S3), contingência sem meio ou utente sem resposta (UC-04-S4), execução/check-in da viagem (UC-03) e monitorização em tempo real (UC-05).
