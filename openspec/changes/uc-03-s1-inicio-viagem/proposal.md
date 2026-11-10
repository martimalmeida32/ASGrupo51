# Proposal: UC-03-S1 — Início de viagem e check-in à porta do utente

## Why
Permitir ao voluntário visualizar a viagem atribuída, registar o início da deslocação para o domicílio e validar presencialmente a recolha do utente através da leitura do cartão físico MobiCare (QR/NFC) ou confirmação manual de contingência, garantindo rastreabilidade e segurança.

## What Changes
- Implementação da consulta de detalhes da viagem e perfil de mobilidade do utente.
- Registo do início da viagem com timestamp e coordenadas GPS.
- Check-in presencial no domicílio via leitura de código QR ou aproximação NFC do cartão físico MobiCare.
- Mecanismo de contingência manual caso a leitura física falhe.
- Controlo de tempo de tolerância de 10 minutos para ausência do utente com notificação automática à IPSS e familiar.

## Capabilities
### New Capabilities
- `trip-execution`: Início de deslocação e validação de recolha porta-a-porta do utente.