# Design: UC-10-S1

## Context

Ver `proposal.md` para a motivação. O Banco de Tempo assenta em três factos operacionais do MobiCare: (1) as horas são ganhas exclusivamente pela conclusão de viagens de voluntário, a 1,5h por viagem (BR-07); (2) a aplicação é mobile-first, offline-first e sincroniza eventos quando a ligação é restabelecida (RNF-05); (3) o acesso a dados pessoais e ao certificado é restrito ao próprio voluntário (BR-11, RNF-06). A capacidade `time-bank` é nova e não substitui nenhuma spec existente.

## Goals / Non-Goals

**Goals:**
- Garantir que o saldo de horas é sempre reconstruível e auditável a partir dos movimentos registados.
- Suportar crédito, transferência, resgate e emissão de certificado com validação consistente de saldo.
- Manter o comportamento correto sob repetição de eventos e sincronização offline.

**Non-Goals:**
- Definir o catálogo comercial de benefícios ou negociar parceiros municipais.
- Alterar a lógica de conclusão de viagens ou de atribuição já coberta por outras capacidades.
- Implementar autenticação ou gestão de identidade, reutilizadas da plataforma.

## Decisions

1. **Ledger de movimentos como fonte de verdade.**
   O saldo não é um valor mutável isolado; é calculado a partir dos movimentos (`CREDIT`, `DEBIT`, `TRANSFER_OUT`, `TRANSFER_IN`, `REDEMPTION`, `CERTIFICATE`). Isto garante rastreabilidade e reconstrução do extrato.
   *Alternativa considerada:* guardar apenas um saldo agregado por conta — rejeitada por perder histórico e dificultar auditoria.

2. **Crédito automático e idempotente por viagem (BR-07).**
   A conclusão de uma viagem de voluntário emite um crédito de 1,5h associado ao `trip_id`, com chave de idempotência que impede duplicação em reprocessamentos ou sincronizações offline. Não se aplica a motoristas de parceiros ou operadores.
   *Alternativa considerada:* crédito manual pela IPSS — rejeitada por não escalar e introduzir erro humano.

3. **Transferência atómica entre contas (UC-10-S2).**
   A transferência cria o par `TRANSFER_OUT`/`TRANSFER_IN` numa única transação: débito e crédito são confirmados em conjunto ou revertidos em conjunto.
   *Alternativa considerada:* dois movimentos independentes — rejeitada por permitir saldo inconsistente em caso de falha.

4. **Validação de saldo antes de qualquer operação (BR-07, E1).**
   Transferências, resgates e submissão de despesas elegíveis verificam o saldo disponível. Se as horas pedidas excederem o saldo, a operação é bloqueada com «Saldo insuficiente» e o saldo permanece inalterado.
   *Alternativa considerada:* permitir saldo negativo — rejeitada por contrariar a regra de negócio.

5. **Certificado oficial gerado no servidor (UC-10-S3, A1, Lei n.º 71/98).**
   O PDF é produzido no servidor com timbre da Associação Acompanhar, total de horas creditadas e assinatura/carimbo de autenticação; cada emissão é registada. O ficheiro só é acessível ao próprio voluntário.
   *Alternativa considerada:* geração no cliente — rejeitada por risco de manipulação e por não permitir assinatura confiável.

6. **Privacidade e auditoria por perfil (BR-11, RNF-06).**
   O extrato e o certificado são visíveis apenas ao voluntário autenticado; o familiar associado vê apenas o saldo transferido para a sua conta. O acesso e os movimentos são registados e limitados por perfil.

7. **Experiência mobile-first e resiliente (RNF-05).**
   O ecrã do Banco de Tempo segue o padrão responsivo da aplicação móvel, com leitura em cache do último extrato e sincronização automática quando a ligação é restabelecida.

## Risks / Trade-offs

- **Cálculo de saldo a partir do ledger pode ser custoso com histórico grande** → agregações indexadas por conta e/ou cache de saldo reconciliável com o ledger.
- **Crédito duplicado em sincronização offline** → chave de idempotência baseada em `trip_id` e tipo de movimento.
- **Transferência parcialmente aplicada** → transação única com rollback do par `TRANSFER_OUT`/`TRANSFER_IN`.
- **PDF do certificado exposto a terceiros** → geração no servidor, controlo de acesso por perfil e link/ficheiro de curta duração.
- **Registo de auditoria incompleto** → todos os tipos de movimento são persistidos com autor e timestamp; sem atualizações destrutivas ao histórico.
