# Tasks

## 1. Modelo de Dados e Estados

- [ ] 1.1 Criar modelo `VolunteerApplication` (contactos, zona, disponibilidade, perfil de ingresso, viatura/pedonal) e verificar que a migração cria a tabela
- [ ] 1.2 Criar modelo `VolunteerDocument` com tipo, validade e estado de verificação e verificar a persistência de cada tipo (`DRIVING_LICENSE`, `INSURANCE`, `VOLUNTEER_TERM`)
- [ ] 1.3 Configurar a máquina de estados do voluntário (`CANDIDATO`, `EM_VERIFICACAO`, `EM_FORMACAO`, `ATIVO`, `RECUSADO`) e verificar que transições inválidas são rejeitadas

## 2. Formulário e Submissão

- [ ] 2.1 Criar formulário de candidatura com validação de campos obrigatórios e rascunho local e verificar a retoma após fechar a aplicação
- [ ] 2.2 Implementar upload cifrado da carta de condução, seguro e termo de voluntariado (BR-08) e verificar o acesso restrito por perfil
- [ ] 2.3 Validar formato e data de validade dos documentos no momento da submissão e verificar o cenário TC-UC09-06
- [ ] 2.4 Registar a candidatura no estado «Candidato» e notificar a coordenação da IPSS e verificar o cenário TC-UC09-01
- [ ] 2.5 Permitir o registo presencial ou por telefone pelo técnico social (A1) e verificar o cenário TC-UC09-02

## 3. Verificação e Ativação

- [ ] 3.1 Criar painel do técnico social para verificação documental (Lei n.º 71/98) e verificar a listagem de candidaturas pendentes
- [ ] 3.2 Implementar decisão de aprovação/recusa com justificação e registo de auditoria e verificar os cenários TC-UC09-03 e TC-UC09-04
- [ ] 3.3 Implementar registo da formação inicial e da primeira viagem acompanhada e verificar a transição para «Ativo»
- [ ] 3.4 Gerar perfil de compatibilidade na ativação (BR-02, BR-08) e verificar o cenário TC-UC09-05

## 4. Privacidade e Testes

- [ ] 4.1 Garantir minimização de dados, acesso por perfil e retenção restrita (BR-11, RNF-06) e verificar o cenário TC-UC09-07
- [ ] 4.2 Implementar testes unitários para os cenários TC-UC09-01 a TC-UC09-07 e verificar que toda a suite passa
