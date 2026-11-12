# Delta Spec: Trip Request (UC-01-S3)

## Purpose
Assegurar o cumprimento das regras de negócio de antecedência mínima, identificação de apoios estatais e funcionamento em zonas sem cobertura móvel.

## ADDED Requirements

### Requirement: UC-01-REQ-03 — Validação de Antecedência e Sinalização de Apoios Públicos
The system SHALL reject requests with less than 24 hours advance notice according to BR-01, display the IPSS telephone support line, and flag potential eligibility for public healthcare mobility support (BR-10).

#### Scenario: TC-UC01-02 — Rejeição de pedido com antecedência inferior a 24 horas [caso de falha]
- **GIVEN** a data e hora atuais são 20/11/2026 às 16:00 e o familiar encontra-se no ecrã «Pedir acompanhamento»
- **WHEN** seleciona «Centro de Saúde de Ílhavo» para uma consulta em 21/11/2026 às 10:00 (antecedência de apenas 18 horas) e tenta submeter o pedido
- **THEN** o sistema bloqueia a criação do pedido segundo a regra BR-01, exibe o aviso «Antecedência mínima de 24 horas não cumprida», apresenta o número da linha telefónica da IPSS para casos excecionais e nenhum registo é criado na base de dados

#### Scenario: TC-UC01-03 — Sinalização de possível direito a TNUD ou Táxi Municipal
- **GIVEN** o utente tem 72 anos, residência fiscal comprovada no concelho elegível de Aveiro e está a preencher um pedido para consulta em 26/11/2026 às 14:00
- **WHEN** no passo de necessidades de mobilidade, assinala «Isenção de taxas moderadoras por insuficiência económica» e clica em avançar
- **THEN** o sistema regista a flag de potencial elegibilidade para apoio público (TNUD / Táxi Saúde Municipal), assinala o pedido para triagem prévia e exibe a mensagem informativa de encaminhamento prioritário antes da escolha do meio de transporte

### Requirement: UC-01-REQ-04 — Armazenamento Local e Sincronização Offline
The system SHALL locally cache valid trip requests when offline and automatically synchronize them with the central server upon network restoration without data duplication (RNF-05).

#### Scenario: TC-UC01-05 — Gravação local e sincronização automática de pedido em modo offline [caso de falha de rede]
- **GIVEN** o dispositivo móvel do familiar perde a ligação de dados móveis antes da submissão de um pedido válido para 28/11/2026 às 09:30
- **WHEN** o utilizador clica em «Confirmar Pedido» sem rede e, 2 minutos mais tarde, o telemóvel restabelece a conectividade à internet
- **THEN** a aplicação armazena os dados localmente na base SQLite com o estado «Pendente de sincronização» (RNF-05) e envia automaticamente o pedido para o servidor central sem duplicação de registos assim que deteta ligação
