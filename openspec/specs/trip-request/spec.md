# Trip Request Specification

## Purpose

Permitir ao utente sénior, ou ao seu familiar/cuidador, registar um pedido de acompanhamento a uma consulta ou exame com destino, data/hora e necessidades de mobilidade, deixando-o pronto para a escolha do meio de transporte.

## Requirements

### Requirement: UC-01-REQ-01 — Registo Completo de Pedido de Acompanhamento

The system SHALL allow the requester to register a trip request for a senior user, specifying the destination, consultation date and time, and mobility needs. Upon validation, the system SHALL create the request in the «A escolher o meio» state, associate the mobility profile (BR-02), notify IPSS coordination and present compatible transport options (UC-02), ensuring data minimization (BR-11) and accessibility (RNF-01).

#### Scenario: TC-UC01-01 — Submissão com sucesso de pedido de acompanhamento com antecedência válida

* **GIVEN** o utente sénior António Silva (cartão #MC-0142) está autenticado na aplicação móvel e a data atual é 20/11/2026 às 09:00
* **WHEN** seleciona «Próprio utente», escolhe o destino «Hospital Infante D. Pedro (Aveiro)», define a consulta para 24/11/2026 às 10:30, marca «Cadeira de rodas» e submete o pedido
* **THEN** o sistema regista o pedido #PED-104 com o estado «A escolher o meio», associa o perfil de mobilidade «Cadeira de rodas», notifica a coordenação da IPSS e apresenta as opções compatíveis no UC-02

### Requirement: UC-01-REQ-02 — Recorrência Semanal e Destino Não Listado

When the requester introduces a destination not listed in the catalog and selects weekly recurrence, the system SHALL flag the requests for prior validation and create the series of 5 weekly requests in the «A escolher o meio» state (BR-01, BR-02).

#### Scenario: TC-UC01-04 — Criação de pedido recorrente semanal para 4 semanas e destino não listado
- **GIVEN** a familiar Joana Silva encontra-se autenticada no formulário de pedido em 20/11/2026
- **WHEN** introduz manualmente o destino «Clínica Fisioterapia Ria (Aveiro)», seleciona a data inicial de 27/11/2026 às 11:00, ativa «Repetir semanalmente por 4 semanas» e marca necessidade «Bengala»
- **THEN** o sistema sinaliza as deslocações com a etiqueta «Destino não listado - validação prévia» e gera automaticamente 5 pedidos semanais consecutivos (27/11, 04/12, 11/12, 18/12 e 25/12 às 11:00) todos no estado inicial «A escolher o meio»

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
- **THEN** a aplicação armazena os dados localmente no IndexedDB com o estado «Pendente de sincronização» (RNF-05) e envia automaticamente o pedido para o servidor central sem duplicação de registos assim que deteta ligação.
