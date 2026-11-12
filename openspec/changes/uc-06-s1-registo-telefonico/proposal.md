# Proposal: UC-06-S1 — Registo telefónico de pedido com confirmação por SMS

## Why
Os utentes seniores infoexcluídos não conseguem usar a app e contactam a IPSS por telefone. Sem um registo assistido, o técnico social não consegue garantir igualdade de acesso (RNF-02) nem validar as mesmas regras do pedido feito na app. Esta slice permite registar o pedido em nome de um utente já registado, reutilizando o perfil de mobilidade, e confirmar por SMS.

## What Changes
- O técnico social autenticado atende a chamada e identifica o utente já registado, reutilizando o perfil de mobilidade existente (A1) e minimizando os dados consultados (BR-11).
- Registo do destino, da data/hora da consulta e das necessidades de mobilidade e acompanhamento.
- Validação das regras aplicáveis: antecedência mínima de 24 horas (BR-01) e subsidiariedade face a TNUD/Táxi Municipal (BR-10), com aviso ao utente.
- Escolha do meio compatível através do UC-02, apresentada ao técnico e confirmada com o utente por telefone.
- Criação do pedido no estado «Confirmado», com viagens de ida e regresso independentes (BR-05).
- Envio de SMS de confirmação ao utente com a data, a hora e o meio atribuído.

## Capabilities

### New Capabilities
- `telephone-request`: Registo assistido, pelo técnico social, de um pedido de acompanhamento para utente já registado, incluindo identificação e reutilização do perfil, validação de regras, escolha do meio e confirmação por SMS.

### Modified Capabilities
<!-- Sem alterações a specs principais: o projeto ainda não tem specs principais. -->

## Impact
- Novo ecrã de registo telefónico no Portal Web, restrito ao perfil de técnico social.
- Pesquisa e reutilização do Utente e do Perfil de Mobilidade, com registo de auditoria e minimização de dados (BR-11).
- Reutilização do módulo de escolha de meio do UC-02 (compatibilidade e cascata) sem duplicar regras.
- Integração com o serviço de SMS para a confirmação ao utente, com retry em caso de falha.
- Criação de pedido e das viagens de ida e regresso segundo os modelos existentes (BR-05).
- Fora de âmbito: inscrição inicial e emissão de cartão físico, destino não listado e exceção de urgência inferior a 24 horas (UC-06-S2); bloqueio por urgência médica e contingência sem meio (UC-06-S3); painel de coordenação (UC-07); pedido feito pelo utente na app (UC-01).
