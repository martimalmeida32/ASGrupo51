# telephone-request Specification

## Purpose
Permitir o registo de pedidos de transporte via chamada telefónica por técnicos sociais da IPSS.

## Requirements

### Requirement: UC-06-REQ-01 — Registo Telefónico Assistido e Confirmação por SMS
The system SHALL let the social technician identify a registered utente, reuse their mobility profile (BR-11), record the appointment destination and time, present compatible transport options (BR-02, BR-04), create independent outbound and return trips (BR-05), and send an SMS confirmation to the user within 5 seconds (RNF-02).

#### Scenario: TC-UC06-03 — Registo telefónico completo com aviso TNUD/Táxi e confirmação por SMS
- **GIVEN** o técnico social atende a utente Maria Ferreira (cartão #MC-0205, telemóvel 912345678, perfil «Acompanhante») em 20/11/2026 às 10:00
- **WHEN** o técnico seleciona a consulta para o «Centro de Saúde de Aveiro» em 25/11/2026 às 15:00, transmite verbalmente o aviso de direitos a apoio público (BR-10), seleciona o voluntário compatível sugerido pela cascata e clica em «Confirmar Pedido»
- **THEN** o pedido é registado no estado «Confirmado» com criação independente de ida e regresso (BR-05), aplicando minimização de dados (BR-11), e o serviço externo envia um SMS de confirmação para o 912345678 com data, hora e ponto de encontro em menos de 5 segundos (RNF-02)

### Requirement: UC-06-REQ-02 — Inscrição Presencial de Utente e Exceção Urgente
The system SHALL allow the registration of a new utente with issuance of a physical MobiCare card (#MC-nnnn) and authorize an emergency trip request with less than 24 hours notice when justified by the social technician (BR-01, BR-11).

#### Scenario: TC-UC06-04 — Inscrição inicial de novo utente com cartão MobiCare e autorização de pedido urgente (< 24h)
- **GIVEN** um idoso sem registo prévio comparece no balcão da Junta de Freguesia em 20/11/2026 às 14:00 com marcação médica para 21/11/2026 às 10:00 (20h de antecedência), existindo um condutor disponível a título excecional
- **WHEN** o técnico recolhe os dados essenciais (BR-11), associa um novo cartão físico #MC-0310, seleciona «Exceção urgente autorizada pela coordenação» e introduz a fundamentação
- **THEN** o utente fica criado no sistema com o cartão #MC-0310 ativo, o registo de auditoria guarda a justificação da exceção à regra BR-01 e o pedido avança de imediato para a fase de alocação de transporte

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
