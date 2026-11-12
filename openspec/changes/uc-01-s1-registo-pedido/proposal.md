# Proposal: UC-01-S1 — Registo completo de pedido de acompanhamento (fluxo básico)

## Why
Permitir ao utente sénior ou familiar registar um pedido de acompanhamento a consulta ou exame com destino, data/hora e necessidades de mobilidade, validando a antecedência mínima e deixando o pedido pronto para a escolha do meio de transporte na plataforma MobiCare.

## What Changes
- Seleção do requerente (próprio utente ou familiar/cuidador).
- Pesquisa e seleção da unidade de saúde de destino a partir do catálogo.
- Indicação da data e hora da consulta.
- Declaração de necessidades de mobilidade (cadeira de rodas, oxigénio, défice cognitivo, acompanhante, bengala, maca ou cuidados).
- Validação da antecedência mínima de 24 horas (BR-01).
- Criação do pedido com estado «A escolher o meio», notificação à IPSS e apresentação das opções compatíveis no UC-02 (BR-02, BR-11, RNF-01).

## Capabilities
### New Capabilities
- `trip-request`: Registo e submissão digital de pedidos de transporte e acompanhamento de mobilidade assistida.
