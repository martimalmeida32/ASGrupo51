# Proposal: UC-01-S3 — Triagem de apoio público, validação de antecedência e resiliência offline

## Why
Garantir o cumprimento estrito da regra de antecedência mínima de 24 horas, sinalizar apoios públicos subsidiários (TNUD/Táxi Municipal) e assegurar que falhas de rede no telemóvel não causam perda de dados de pedidos.

## What Changes
- Bloqueio automático de pedidos com antecedência inferior a 24 horas (BR-01).
- Sinalização de potencial elegibilidade para TNUD ou Táxi Municipal com aviso informativo (BR-10).
- Armazenamento local de pedidos e sincronização automática ao recuperar conectividade (RNF-05).

## Capabilities
### Modified Capabilities
- `trip-request`: Resiliência offline, validações temporais e deteção de apoios públicos.
