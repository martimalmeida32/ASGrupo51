# Proposal: UC-10-S1 — Consultar banco de tempo

## Why
Permitir ao voluntário consultar o saldo de horas creditadas pelas viagens realizadas (1,5 horas por viagem concluída, BR-07), visualizar o histórico que o originou, transferir horas para familiares diretos, trocá-las por benefícios municipais/locais e emitir o certificado oficial de voluntariado, com validação de saldo e proteção de dados (BR-11). O âmbito cobre o UC-10 e os critérios de aceitação TC-UC10-01 a TC-UC10-04 do relatório E4b-SRS.

## What Changes
- Ecrã móvel do Banco de Tempo com saldo total de horas disponíveis e histórico detalhado de cada crédito de 1,5 horas gerado por viagens concluídas (UC-10-S1).
- Transferência de horas para um familiar direto previamente associado, com débito do voluntário, crédito do familiar e registo do movimento no extrato (UC-10-S2).
- Troca de horas por benefícios municipais/locais e submissão de despesas de viagem elegíveis, com validação prévia do saldo (BR-07).
- Bloqueio de transferências ou resgates quando as horas pedidas excedem o saldo disponível, com aviso «Saldo insuficiente» e sem alteração do saldo (E1).
- Emissão e exportação do certificado oficial de voluntariado em PDF, timbrado e assinado digitalmente pela Associação Acompanhar, com o total de horas creditadas (A1, Lei n.º 71/98).
- Registo auditável de todos os movimentos do Banco de Tempo (crédito, débito, transferência, resgate e certificado), com acesso restrito ao próprio voluntário (BR-11).

## Capabilities
### New Capabilities
- `time-bank`: Consulta de saldo e histórico, transferência de horas para familiares, resgate de benefícios e emissão de certificado do Banco de Tempo.
