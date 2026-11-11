# Tasks

## 1. Modelo de Dados e Estados
- [ ] 1.1 Criar modelo `VolunteerApplication` (contactos, zona, disponibilidade, perfil de ingresso, viatura/pedonal)
- [ ] 1.2 Criar modelo `VolunteerDocument` com tipo, validade e estado de verificação
- [ ] 1.3 Configurar máquina de estados do voluntário (`CANDIDATO`, `EM_VERIFICACAO`, `EM_FORMACAO`, `ATIVO`, `RECUSADO`)

## 2. Formulário e Submissão
- [ ] 2.1 Criar formulário de candidatura com validação de campos obrigatórios e rascunho local
- [ ] 2.2 Implementar upload da carta de condução, seguro e termo de voluntariado (BR-08)
- [ ] 2.3 Validar formato e data de validade dos documentos no momento da submissão
- [ ] 2.4 Registar a candidatura no estado «Candidato» e notificar a coordenação da IPSS

## 3. Verificação e Ativação
- [ ] 3.1 Criar painel do técnico social para verificação documental (Lei n.º 71/98)
- [ ] 3.2 Implementar decisão de aprovação/recusa com justificação e registo de auditoria
- [ ] 3.3 Implementar registo da formação inicial e da primeira viagem acompanhada
- [ ] 3.4 Gerar perfil de compatibilidade e transição para «Ativo» (BR-02, BR-08)

## 4. Fluxos Alternativos e Privacidade
- [ ] 4.1 Permitir registo de candidaturas presenciais ou por telefone pelo técnico social (A1)
- [ ] 4.2 Garantir minimização de dados, acesso por perfil e retenção restrita (BR-11, RNF-06)
- [ ] 4.3 Implementar testes unitários para os cenários TC-UC09-01 a TC-UC09-07
