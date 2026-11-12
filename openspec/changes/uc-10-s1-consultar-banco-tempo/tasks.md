# Tasks

## 1. Modelo de Dados e Ledger

- [ ] 1.1 Criar modelo `TimeBankAccount` para voluntários e familiares diretos e verificar que as migrações criam a tabela com chave por titular
- [ ] 1.2 Criar modelo `TimeBankMovement` com tipos `CREDIT`, `DEBIT`, `TRANSFER_OUT`, `TRANSFER_IN`, `REDEMPTION` e `CERTIFICATE` e verificar a persistência de cada tipo em teste unitário
- [ ] 1.3 Implementar o cálculo do saldo a partir do ledger e verificar que o saldo é reconstruído corretamente após uma sequência mista de movimentos

## 2. Extrato e Histórico (UC-10-S1)

- [ ] 2.1 Criar ecrã móvel «Banco de Tempo» com saldo total disponível e verificar a renderização responsiva em viewport móvel
- [ ] 2.2 Listar o histórico detalhado de cada crédito de 1,5 horas por viagem concluída (BR-07) e verificar que 4 viagens mostram 4 entradas a 1,5h
- [ ] 2.3 Implementar crédito idempotente de 1,5 horas por viagem concluída e verificar que a sincronização repetida do mesmo `trip_id` não duplica horas
- [ ] 2.4 Restringir a consulta aos dados do próprio voluntário (BR-11) e verificar que outro utilizador autenticado recebe acesso negado

## 3. Transferência de Horas (UC-10-S2)

- [ ] 3.1 Criar gestão de familiares diretos associados à conta do voluntário e verificar a associação e remoção de um familiar
- [ ] 3.2 Implementar «Transferir Horas» com débito do voluntário e crédito do familiar e verificar o cenário TC-UC10-02 (4,5h − 3,0h = 1,5h)
- [ ] 3.3 Registar o movimento de transferência no extrato de ambas as contas e verificar que ambas as entradas referenciam a mesma operação
- [ ] 3.4 Garantir atomicidade da transferência e verificar que uma falha simulada no crédito reverte o débito

## 4. Resgate de Benefícios e Validação de Saldo (UC-10-S3, E1)

- [ ] 4.1 Criar catálogo de benefícios municipais/locais e despesas de viagem elegíveis e verificar a listagem com `required_hours`
- [ ] 4.2 Implementar resgate de benefícios com validação do saldo disponível (BR-07) e verificar um resgate com saldo suficiente
- [ ] 4.3 Bloquear operações com saldo insuficiente, exibir «Saldo insuficiente» e manter o saldo inalterado (E1) e verificar o cenário TC-UC10-03

## 5. Certificado Oficial (UC-10-S3, A1)

- [ ] 5.1 Implementar «Exportar Certificado Oficial» em PDF timbrado da Associação Acompanhar e verificar o download do ficheiro gerado
- [ ] 5.2 Incluir total de horas creditadas e carimbo/assinatura de autenticação (Lei n.º 71/98) e verificar o conteúdo do PDF
- [ ] 5.3 Registar a emissão do certificado no histórico do voluntário e verificar que o evento `CERTIFICATE` aparece no extrato

## 6. Privacidade e Testes

- [ ] 6.1 Garantir acesso restrito ao extrato e ao certificado do próprio voluntário (BR-11, RNF-06) e verificar as regras de autorização em teste de integração
- [ ] 6.2 Implementar testes unitários para os cenários TC-UC10-01, TC-UC10-02, TC-UC10-03 e TC-UC10-04 e verificar que toda a suite passa
