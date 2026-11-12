# Proposal: UC-10-S1 — Consultar Banco de Tempo

## Why
Os voluntários da rede MobiCare acumulam horas por cada viagem concluída, mas não têm forma de consultar o saldo, perceber o que o originou, usá-lo ou comprovar oficialmente o seu contributo. Sem esta capacidade, o Banco de Tempo (BR-07) existe apenas como registo interno e não cumpre o seu papel de reconhecimento e retribuição do voluntariado, incluindo a emissão de certificados exigida pela Lei n.º 71/98.

## What Changes
- Ecrã móvel «Banco de Tempo» com saldo total de horas disponíveis e histórico detalhado de cada crédito de 1,5 horas gerado por viagens concluídas (UC-10-S1, BR-07).
- Transferência de horas para um familiar direto previamente associado, com débito do voluntário, crédito do familiar e registo do movimento no extrato (UC-10-S2).
- Troca de horas por benefícios municipais/locais e submissão de despesas de viagem elegíveis, com validação prévia do saldo (BR-07).
- Bloqueio de transferências ou resgates quando as horas pedidas excedem o saldo disponível, com aviso «Saldo insuficiente» e sem alteração do saldo (E1).
- Emissão e exportação do certificado oficial de voluntariado em PDF, timbrado e assinado digitalmente pela Associação Acompanhar, com o total de horas creditadas (A1, Lei n.º 71/98).
- Registo auditável de todos os movimentos do Banco de Tempo (crédito, débito, transferência, resgate e certificado), com acesso restrito ao próprio voluntário (BR-11, RNF-06).

## Capabilities

### New Capabilities
- `time-bank`: Consulta de saldo e histórico de horas, transferência para familiares diretos, resgate de benefícios e emissão do certificado oficial de voluntariado.

### Modified Capabilities
<!-- Sem alterações a requisitos de capacidades existentes: o projeto ainda não tem specs principais. -->

## Impact
- Novos modelos de dados: `TimeBankAccount`, `TimeBankMovement`, `FamilyMember`, `Benefit` e `VolunteerCertificate`.
- Novo ecrã mobile-first do Banco de Tempo na aplicação do voluntário e respetivos fluxos de transferência, resgate e certificado.
- Integração com a conclusão de viagens para crédito automático e idempotente de 1,5 horas por viagem (BR-07), incluindo eventos sincronizados após modo offline (RNF-05).
- Geração de PDF no servidor com timbre e assinatura/carimbo de autenticação da Associação Acompanhar.
- Controlo de acesso por perfil e registo de auditoria dos movimentos (BR-11, RNF-06).
