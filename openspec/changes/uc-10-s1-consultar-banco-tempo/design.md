# Design: UC-10-S1

## Decisões Técnicas e Arquitetura
1. **Ledger de movimentos como fonte de verdade:** O saldo do Banco de Tempo não é um valor mutável isolado; é calculado a partir dos movimentos registados (`CREDIT`, `DEBIT`, `TRANSFER_OUT`, `TRANSFER_IN`, `REDEMPTION`, `CERTIFICATE`). Isto garante rastreabilidade e reconstrução do extrato.
2. **Crédito automático e idempotente (BR-07):** A conclusão de uma viagem de voluntário emite um crédito de 1,5 horas associado ao `trip_id`, garantindo que reprocessamentos ou sincronizações offline não duplicam horas. Não se aplica a motoristas de parceiros ou operadores.
3. **Transferência atómica para familiares (UC-10-S2):** A transferência é uma transação única que cria o par `TRANSFER_OUT`/`TRANSFER_IN`; o débito e o crédito são confirmados em conjunto ou revertidos em conjunto.
4. **Validação de saldo antes da operação (BR-07, E1):** Transferências e resgates verificam o saldo disponível; se as horas pedidas excederem o saldo, a operação é bloqueada com o aviso «Saldo insuficiente» e o saldo permanece inalterado.
5. **Certificado oficial (UC-10-S3, A1, Lei n.º 71/98):** O PDF é gerado no servidor com timbre da Associação Acompanhar, total de horas creditadas e assinatura/carimbo de autenticação; a emissão fica registada no histórico. O ficheiro só é acessível ao próprio voluntário.
6. **Privacidade e acesso (BR-11, RNF-06):** O extrato e o certificado são visíveis apenas ao voluntário autenticado; o familiar associado vê apenas o saldo transferido para a sua conta. O acesso é registado e limitado por perfil.
7. **Experiência mobile-first:** O ecrã do Banco de Tempo segue o padrão responsivo da aplicação móvel, com leitura em cache do último extrato e sincronização automática quando a ligação é restabelecida (RNF-05).

## Entidades Envolvidas
- `TimeBankAccount`: Conta de horas do voluntário ou do familiar direto, com saldo derivado do ledger.
- `TimeBankMovement`: `id`, `account_id`, tipo (`CREDIT` | `DEBIT` | `TRANSFER_OUT` | `TRANSFER_IN` | `REDEMPTION` | `CERTIFICATE`), `hours`, `source_trip_id`, `counterpart_account_id`, `timestamp` e autor.
- `FamilyMember`: Familiar direto associado à conta do voluntário (`volunteer_id`, nome, relação, estado de associação).
- `Benefit`: Benefício municipal/local ou despesa elegível (`name`, parceiro, `required_hours`, estado).
- `VolunteerCertificate`: Registo da emissão do certificado (`volunteer_id`, período, `total_hours`, referência do PDF, `issued_at`, assinatura).
