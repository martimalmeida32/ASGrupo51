# Tasks

## 1. Modelo de Dados e Ledger
- [ ] 1.1 Criar modelo `TimeBankAccount` para voluntários e familiares diretos
- [ ] 1.2 Criar modelo `TimeBankMovement` com tipos de crédito, débito, transferência, resgate e certificado
- [ ] 1.3 Implementar cálculo do saldo a partir do ledger de movimentos

## 2. Extrato e Histórico (UC-10-S1)
- [ ] 2.1 Criar ecrã móvel «Banco de Tempo» com saldo total disponível
- [ ] 2.2 Listar o histórico detalhado de cada crédito de 1,5 horas por viagem concluída (BR-07)
- [ ] 2.3 Garantir crédito idempotente de 1,5 horas por viagem concluída
- [ ] 2.4 Restringir a consulta aos dados do próprio voluntário (BR-11)

## 3. Transferência de Horas (UC-10-S2)
- [ ] 3.1 Criar gestão de familiares diretos associados à conta do voluntário
- [ ] 3.2 Implementar «Transferir Horas» com débito do voluntário e crédito do familiar
- [ ] 3.3 Registar o movimento de transferência no extrato de ambas as contas
- [ ] 3.4 Garantir atomicidade da transferência entre contas

## 4. Resgate de Benefícios e Validação de Saldo (UC-10-S3, E1)
- [ ] 4.1 Criar catálogo de benefícios municipais/locais e despesas de viagem elegíveis
- [ ] 4.2 Implementar resgate de benefícios com validação do saldo disponível (BR-07)
- [ ] 4.3 Bloquear operações com saldo insuficiente, exibir «Saldo insuficiente» e manter o saldo inalterado (E1)

## 5. Certificado Oficial (UC-10-S3, A1)
- [ ] 5.1 Implementar «Exportar Certificado Oficial» em PDF timbrado da Associação Acompanhar
- [ ] 5.2 Incluir total de horas creditadas e carimbo/assinatura de autenticação (Lei n.º 71/98)
- [ ] 5.3 Registar a emissão do certificado no histórico do voluntário

## 6. Privacidade e Testes
- [ ] 6.1 Garantir acesso restrito ao extrato e certificado do próprio voluntário (BR-11, RNF-06)
- [ ] 6.2 Implementar testes unitários para os cenários TC-UC10-01 a TC-UC10-04
