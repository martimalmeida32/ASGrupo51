# Delta Spec: Volunteer Onboarding (UC-09-S1)

## ADDED Requirements

### Requirement: UC-09-REQ-01 — Submissão de Candidatura a Voluntário
The system SHALL capture the candidate's contacts, geographic zone, availability, ingress profile and own-vehicle or pedestrian mode, together with the driving license, valid insurance and volunteer agreement, before accepting the application.

#### Scenario: TC-UC09-01 — Submissão de candidatura com dados e documentos válidos
- **GIVEN** que um candidato acede ao formulário de candidatura à rede MobiCare
- **WHEN** preenche contactos, zona geográfica, disponibilidade, perfil de ingresso e modo de acompanhamento e submete a carta de condução, o seguro válido e o termo de voluntariado
- **THEN** o sistema valida os campos obrigatórios e a validade dos documentos (BR-08)
- **AND** regista a candidatura no estado «Candidato»

### Requirement: UC-09-REQ-02 — Registo e Notificação da Candidatura
The system SHALL notify the IPSS coordination whenever a new application is registered, including applications submitted in person or by telephone on behalf of the candidate.

#### Scenario: TC-UC09-02 — Candidatura presencial ou por telefone registada pelo técnico social
- **GIVEN** que o técnico social recebe uma candidatura presencial ou por telefone (A1)
- **WHEN** o técnico social regista os dados e os documentos em nome do candidato
- **THEN** o sistema cria a candidatura no estado «Candidato»
- **AND** avisa a coordenação da IPSS

### Requirement: UC-09-REQ-03 — Verificação Documental e Decisão
The system SHALL allow the social technician to verify the submitted documents under Lei n.º 71/98 and to approve or reject the application with a recorded justification.

#### Scenario: TC-UC09-03 — Aprovação da candidatura após verificação documental
- **GIVEN** que existe uma candidatura no estado «Candidato» com documentos submetidos
- **WHEN** o técnico social verifica a carta de condução, o seguro e o termo de voluntariado (Lei n.º 71/98) e aprova a candidatura
- **THEN** o sistema regista a decisão de aprovação com o autor e o timestamp
- **AND** coloca a candidatura em formação inicial

#### Scenario: TC-UC09-04 — Candidatura recusada após análise da coordenação
- **GIVEN** que o técnico social analisa uma candidatura submetida
- **WHEN** decide recusar a candidatura
- **THEN** o sistema exige e regista a justificação da recusa
- **AND** atualiza o estado do candidato para «Recusado»

### Requirement: UC-09-REQ-04 — Formação Inicial e Ativação do Voluntário
The system SHALL only activate the volunteer after completion of the short training and the first accompanied trip, generating the compatibility profile used in trip assignment.

#### Scenario: TC-UC09-05 — Ativação após formação e primeira viagem acompanhada
- **GIVEN** que a candidatura foi aprovada e o candidato está em formação inicial
- **WHEN** o técnico social registra a conclusão da formação curta e da primeira viagem acompanhada
- **THEN** o sistema passa o candidato ao estado «Ativo»
- **AND** gera o respetivo perfil de compatibilidade para atribuição de viagens (BR-02)

### Requirement: UC-09-REQ-05 — Bloqueio por Incumprimento Legal
The system SHALL reject or block the activation of any candidate whose documents are invalid or expired, or whose mandatory insurance is missing (BR-08).

#### Scenario: TC-UC09-06 — Bloqueio por documentos inválidos ou seguro em falta
- **GIVEN** que o candidato submete documentos inválidos, caducados ou sem seguro obrigatório (E1)
- **WHEN** o sistema ou o técnico social valida a documentação
- **THEN** o sistema bloqueia o avanço da candidatura
- **AND** informa o candidato dos documentos em falta ou inválidos (BR-08)

### Requirement: UC-09-REQ-06 — Minimização e Proteção de Dados
The system SHALL store only the functional data strictly necessary for the application and SHALL restrict access by role in accordance with RGPD (BR-11, RNF-06).

#### Scenario: TC-UC09-07 — Acesso restrito aos dados da candidatura
- **GIVEN** que uma candidatura contém dados pessoais e documentos legais
- **WHEN** um utilizador sem perfil autorizado tenta aceder aos documentos
- **THEN** o sistema nega o acesso
- **AND** apenas o candidato e o técnico social autorizado podem consultar os dados funcionais necessários (BR-11)
