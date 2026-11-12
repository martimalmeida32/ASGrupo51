# Proposal: UC-01-S3 — Triagem de apoio público, antecedência e resiliência offline

## Why
O pedido de acompanhamento falha nos casos em que o utente pode ter direito a apoio público (TNUD/Táxi Municipal), prefere o telefone, ou perde a ligação no momento da submissão. Sem sinalizar a potencial elegibilidade, a coordenação não faz a triagem prévia (BR-10); sem encaminhamento telefónico, o utente fica sem alternativa; e sem resiliência offline, um pedido pode perder-se (RNF-05). Esta slice fecha esses três casos do UC-01.

## What Changes
- Sinalização de potencial direito a TNUD ou Táxi Municipal: registo de uma flag de elegibilidade potencial (ex.: isenção de taxas moderadoras/insuficiência económica), marcação do pedido para triagem prévia e apresentação da informação antes da escolha do transporte (BR-10).
- Encaminhamento telefónico: em qualquer passo, oferta do contacto da linha telefónica da IPSS e encaminhamento do pedido para o UC-06.
- Antecedência insuficiente: bloqueio da criação, aviso «Antecedência mínima de 24 horas não cumprida» e apresentação do número da linha telefónica da IPSS para casos excecionais (BR-01).
- Resiliência offline: quando não há ligação na submissão, o pedido é guardado localmente no dispositivo, o requerente é informado e o envio é feito automaticamente quando a ligação regressar, sem perda de pedidos (RNF-05).
- Reutilização da validação de campos obrigatórios já definida em UC-01-S1 (E1), sem duplicar comportamento.

## Capabilities

### New Capabilities
- `trip-request` (extensão de UC-01-S1/S2): acrescenta a sinalização de apoio público, o encaminhamento telefónico e a resiliência offline ao registo do pedido de acompanhamento.

### Modified Capabilities
<!-- Sem alterações a specs principais: a capability `trip-request` ainda só existe em changes de UC-01. -->

## Impact
- Novos campos no `TripRequest`: `public_support_flag`, `public_support_reason` e `triage_required`.
- Conteúdo informativo versionado sobre TNUD/Táxi Municipal apresentado antes da escolha do transporte.
- Registo do encaminhamento telefónico (A3) e apresentação do contacto da IPSS.
- Fila local de submissão offline no cliente, com chave de idempotência, sincronização automática e estado «pendente de envio».
- Revalidação no servidor da antecedência (BR-01) no momento da sincronização.
- Fora de âmbito: implementar o UC-06 (apenas encaminhamento), integração direta com o SNS/TNUD, determinação automática de elegibilidade, offline de check-in da viagem (UC-03-S3).

## Notes
- A flag de apoio público é indicativa: não decide elegibilidade nem substitui a triagem humana da coordenação.
- O offline desta slice aplica-se à submissão do pedido; o modo offline do check-in pertence a UC-03-S3.
