# Proposal: UC-04-S1 — Pedido automático do regresso (fluxo básico)

## Why
Evitar longas esperas no hospital e libertar os voluntários da ida de terem de aguardar durante toda a consulta médica, acionando o transporte de regresso em modo estafeta de forma automatizada 25 minutos antes do término previsto.

## What Changes
- Cálculo do fim previsto da consulta (hora marcada + 45 minutos) (BR-06).
- Disparo automático do pedido de regresso ao meio atribuído 25 minutos antes do fim previsto (BR-05) em menos de 3 segundos (RNF-03).
- Notificação multicanal ao utente e familiar com hora prevista e dados de quem o vai buscar.

## Capabilities
### New Capabilities
- `return-trip`: Gestão e disparo automatizado de viagens de regresso em modelo estafeta.
