# Proposal: UC-03-S1 — Início de viagem e check-in à porta do utente

## Why
O voluntário precisa de consultar os dados da viagem atribuída, registar o início da deslocação até ao domicílio do utente e comprovar presencialmente a recolha através de leitura de QR/NFC ou contingência manual, garantindo rastreabilidade e segurança para a IPSS e família.

## What Changes
- Consulta dos detalhes da viagem e perfil de mobilidade (BR-02).
- Registo do início da deslocação com timestamp e coordenadas GPS.
- Check-in presencial à porta via leitura QR/NFC do cartão físico MobiCare (raio de 100m).
- Validação manual de contingência perante falha de leitura ótica (código do cartão + PIN).
- Temporizador de tolerância de 10 minutos para não-comparência com alerta à IPSS e familiar.
- Notificação push ao familiar quando o check-in é concluído.

## Capabilities
### New Capabilities
- `trip-execution`: Início de deslocação e validação de recolha porta-a-porta do utente.
