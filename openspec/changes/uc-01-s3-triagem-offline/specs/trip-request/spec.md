# Delta Spec: Trip Request — UC-01-S3

## Purpose

Permitir ao utente sénior ou ao seu familiar/cuidador registar pedidos de acompanhamento, incluindo pedidos recorrentes semanais, destinos ainda não catalogados, sinalização de apoio público, encaminhamento telefónico e submissão resiliente a falhas de ligação.

## ADDED Requirements

### Requirement: UC-01-REQ-05 — Encaminhamento Telefónico e Antecedência Insuficiente
At any step of the request, the system SHALL offer the IPSS telephone line so that the requester can complete the request by phone through UC-06, ending the current app flow when that option is chosen. When the consultation is less than 24 hours away, the system SHALL block the creation according to BR-01, show the warning «Antecedência mínima de 24 horas não cumprida», present the IPSS telephone line for exceptional cases, and create no request.

#### Scenario: TC-UC01-02 — Rejeição de pedido com antecedência inferior a 24 horas
- **GIVEN** que a data e hora atuais são 20/11/2026 às 16:00 e o familiar está no ecrã «Pedir acompanhamento»
- **WHEN** seleciona «Centro de Saúde de Ílhavo» para a consulta em 21/11/2026 às 10:00 (antecedência de 18 horas) e tenta submeter
- **THEN** o sistema bloqueia a criação do pedido segundo BR-01
- **AND** exibe o aviso «Antecedência mínima de 24 horas não cumprida»
- **AND** apresenta o número da linha telefónica da IPSS para casos excecionais
- **AND** nenhum registo é criado

### Requirement: UC-01-REQ-06 — Sinalização de Potencial Direito a Apoio Público
When the requester indicates a possible entitlement to TNUD or Táxi Municipal, such as tax exemption or economic insufficiency, the system SHALL record a potential-eligibility flag, SHALL mark the request for prior triage by the coordination, and SHALL display the corresponding public-support information before the transport selection. The flag SHALL NOT determine eligibility by itself and SHALL NOT replace the human triage (BR-10).

#### Scenario: TC-UC01-03 — Sinalização de possível direito a TNUD ou Táxi Municipal
- **GIVEN** que o utente tem 72 anos, residência registada no concelho elegível e está a preencher um pedido para consulta em 26/11/2026 às 14:00
- **WHEN** no passo de necessidades de mobilidade indica isenção de taxas moderadoras / insuficiência económica e avança para o passo 5
- **THEN** o sistema regista a flag de potencial elegibilidade para apoio público (TNUD/Táxi Municipal)
- **AND** assinala o pedido para triagem prévia pela coordenação
- **AND** exibe a informação correspondente antes da escolha de transporte

### Requirement: UC-01-REQ-07 — Resiliência Offline da Submissão
When there is no internet connection at submission, the system SHALL store the complete request locally on the device, SHALL inform the requester that the request is pending, and SHALL send it automatically when the connection returns. On synchronization the system SHALL revalidate the 24-hour advance notice with the server time (BR-01); if the request is no longer valid, the system SHALL mark it as rejected and notify the requester. No request SHALL be lost across a connection failure, and retries SHALL NOT create duplicate requests (RNF-05).

#### Scenario: RNF-05 — Pedido submetido sem ligação é preservado e sincronizado
- **GIVEN** que o familiar preencheu um pedido válido e o dispositivo perdeu a ligação à internet
- **WHEN** submete o pedido sem ligação e mais tarde a ligação é restabelecida
- **THEN** o sistema guarda o pedido localmente e mostra o estado «pendente de envio»
- **AND** envia automaticamente o pedido quando a ligação regressa, sem criar duplicados
- **AND** revalida a antecedência de 24 horas com a hora do servidor antes de o registar
