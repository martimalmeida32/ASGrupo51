# Design: UC-03-S1

## Decisões Técnicas e Arquitetura
1. **Camada Ciber-Física (QR/NFC):** Leitura de cartão físico via Web NFC API com fallback para câmara (HTML5 QR Scanner) e confirmação manual com PIN de segurança.
2. **Resiliência Offline (RNF-05):** Eventos persistidos em IndexedDB/SQLite local e sincronizados de forma idempotente assim que a rede móvel é recuperada.
3. **Geofencing:** Validação de proximidade à morada de recolha num raio de 100 metros.

## Entidades Envolvidas
- `Trip`: Estados `ASSIGNED` -> `IN_TRANSIT` -> `PICKUP_DONE` ou `NO_SHOW`.
- `CheckInEvent`: Timestamp, coordenadas GPS e método (`QR`, `NFC`, `MANUAL`).
