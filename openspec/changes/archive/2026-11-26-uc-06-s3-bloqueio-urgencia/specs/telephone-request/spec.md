# Delta Spec: Telephone Request (UC-06-S3)

## Purpose
Garantir o bloqueio de pedidos ilegítimos e o encaminhamento prioritário de situações de emergência de saúde pública para o 112.

## ADDED Requirements

### Requirement: UC-06-REQ-03 — Bloqueio por Antecedência e Exclusão de Urgências Médicas Agudas
The system SHALL block requests without valid 24-hour advance notice when no exception is granted (BR-01) and SHALL immediately abort the request creation displaying emergency 112 guidance upon detection of acute medical symptoms (BR-12).

#### Scenario: TC-UC06-01 — Bloqueio de pedido telefónico com antecedência inferior a 24h sem exceção [caso de falha]
- **GIVEN** o técnico social da IPSS está autenticado no Portal Web em 20/11/2026 às 15:00 e recebe a chamada de um utente registado (#MC-0087)
- **WHEN** o técnico insere o destino «Hospital de São Sebastião (Feira)» para o dia seguinte 21/11/2026 às 09:30 (18h30 de antecedência) e tenta gravar sem marcar exceção
- **THEN** o sistema bloqueia a submissão segundo BR-01, emite o alerta «Violação de antecedência mínima de 24 horas», impede a gravação na base de dados e exige que o técnico ajuste a data ou declare justificação de urgência autorizada

#### Scenario: TC-UC06-02 — Bloqueio imediato por deteção de urgência médica aguda e orientação para 112 [caso de falha]
- **GIVEN** o técnico social está a registar um pedido telefónico de acompanhamento no Portal Web
- **WHEN** durante a triagem dos sintomas, o utente refere dor no peito e falta de ar aguda, levando o técnico a selecionar a opção «Sintomas de urgência médica aguda»
- **THEN** o sistema aborta imediatamente o formulário segundo a regra BR-12, exibe o aviso em ecrã inteiro «Ligar de imediato para o 112 — caso clínico não elegível para transporte MobiCare» e não permite criar nenhum pedido no sistema
