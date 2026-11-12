# Delta Spec: Telephone Request — UC-06-S3

## Purpose

Garantir que o registo telefónico bloqueia pedidos inválidos, exclui urgências médicas agudas com orientação para o 112 e encaminha para a coordenação os pedidos para os quais não existe meio compatível.

## ADDED Requirements

### Requirement: UC-06-REQ-08 — Bloqueio por Campos Obrigatórios em Falta
When a mandatory field is missing, the system SHALL not register the request, SHALL mark the missing field, and SHALL keep the technician on the registration screen so the data can be corrected or the call cancelled (E1).

#### Scenario: E1 — Registo bloqueado por campo obrigatório em falta
- **GIVEN** que o técnico social está a registar um pedido telefónico e falta o destino ou a hora da consulta
- **WHEN** tenta submeter o pedido
- **THEN** o sistema assinala o campo em falta e não cria qualquer pedido
- **AND** mantém o técnico no ecrã de registo para correção ou cancelamento

### Requirement: UC-06-REQ-09 — Bloqueio por Antecedência Inferior a 24 Horas Sem Exceção
When the consultation is less than 24 hours away and no urgent exception has been authorized, the system SHALL block the registration (BR-01), SHALL show the warning «Violação de BR-01: antecedência mínima de 24 horas», SHALL not create any request, and SHALL keep the technician on the screen to adjust the date or cancel.

#### Scenario: TC-UC06-01 — Bloqueio de pedido telefónico com 18h30 de antecedência sem exceção
- **GIVEN** que o técnico social está autenticado no Portal Web em 20/11/2026 às 15:00 e atende o utente já registado #MC-0087 sem justificação de urgência excecional
- **WHEN** insere o destino «Hospital de São Sebastião (Feira)» para 21/11/2026 às 09:30 e tenta avançar sem ativar exceção
- **THEN** o sistema impede o registo com o aviso «Violação de BR-01: antecedência mínima de 24 horas»
- **AND** não cria qualquer pedido e mantém o técnico no ecrã para ajuste de data ou cancelamento

### Requirement: UC-06-REQ-10 — Bloqueio por Urgência Médica Aguda
When an acute medical emergency is detected during the needs collection, the system SHALL immediately block the registration according to BR-12, SHALL show the highlighted alert «Ligar de imediato para o 112 — transporte não compatível com MobiCare», and SHALL end the flow without registering a request.

#### Scenario: TC-UC06-02 — Bloqueio imediato por urgência médica aguda com orientação para o 112
- **GIVEN** que o técnico social está a registar um pedido telefónico no Portal Web para um utente sénior
- **WHEN** durante a recolha das necessidades seleciona ou sinaliza o indicador «Urgência médica aguda (dor torácica / falta de ar súbita)»
- **THEN** o sistema bloqueia imediatamente a criação do pedido segundo BR-12 e apresenta o alerta destacado «Ligar de imediato para o 112 — transporte não compatível com MobiCare»
- **AND** encerra o fluxo sem registar pedido

### Requirement: UC-06-REQ-11 — Contingência Sem Meio Disponível
When the cascade returns no compatible transport means for the requested time, the system SHALL warn the technician, SHALL hand the request to the coordination queue in the «Sem opção» state (UC-07), SHALL notify the coordination, and SHALL end the registration without a selected means (E4, BR-02).

#### Scenario: E4 — Pedido encaminhado para a coordenação por falta de meio
- **GIVEN** que o técnico social validou o pedido e nenhum voluntário, parceiro ou operador profissional compatível está disponível na hora pedida
- **WHEN** o sistema conclui a alocação em cascata sem qualquer opção
- **THEN** o sistema avisa o técnico e coloca o pedido no estado «Sem opção» para a coordenação (UC-07)
- **AND** notifica a coordenação e termina o registo sem meio escolhido
