# Design: UC-03-S1

## Decisões Técnicas e Arquitetura
1. **Camada Ciber-Física (QR/NFC):** A leitura do cartão físico utiliza a Web NFC API em browsers compatíveis e fallback para câmara web (HTML5 QR Scanner).
2. **Resiliência e Tolerância a Falhas (RNF-05):** Caso ocorra quebra de rede no momento do check-in, os dados são persistidos na base de dados local (`IndexedDB`) com carimbo temporal assinado e sincronizados logo que a conectividade for reposta.
3. **Temporizador de Ausência:** A contagem dos 10 minutos de espera (pressuposto) é gerida pelo cliente móvel e confirmada com o servidor.

## Entidades Envolvidas
- `Trip`: Atualização dos estados (`ASSIGNED` -> `IN_TRANSIT` -> `PICKUP_DONE` ou `NO_SHOW`).
- `CheckInEvent`: Registo do evento com `timestamp`, `geo_lat`, `geo_long`, `method` ('QR' | 'NFC' | 'MANUAL').