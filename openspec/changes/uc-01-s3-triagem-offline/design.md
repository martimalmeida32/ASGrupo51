# Design: UC-01-S3

## Context

Ver `proposal.md` para a motivação e `specs/trip-request/spec.md` para os requisitos. O registo de pedido de UC-01-S1/S2 já valida campos, antecedência (BR-01) e mobilidade (BR-02), cria o pedido em «A escolher o meio» e entrega-o ao UC-02. Esta slice acrescenta três casos: sinalização de apoio público (A4/BR-10), encaminhamento telefónico (A3/E2) e submissão resiliente a falhas de ligação (E3/RNF-05). A aplicação é web responsiva mobile-first e o modo offline-first já é um requisito do produto. Não existe integração direta com o SNS/TNUD na primeira versão: o sistema apenas orienta (BR-10).

## Goals / Non-Goals

**Goals:**
- Sinalizar elegibilidade potencial sem a decidir, alimentando a triagem humana da coordenação.
- Dar sempre uma saída telefónica ao utente, incluindo quando a antecedência é insuficiente.
- Garantir que um pedido submetido sem ligação é preservado, identificado como pendente e sincronizado sem duplicados.
- Manter o comportamento de UC-01-S1/S2 inalterado quando não se aplicam estes casos.

**Non-Goals:**
- Determinar elegibilidade para TNUD/Táxi Municipal ou integrar APIs do SNS.
- Implementar o UC-06 (registo telefónico completo); apenas o encaminhamento e o contacto.
- Offline do check-in ou da conclusão de viagem (UC-03-S3).
- Gestão da fila de triagem pela coordenação para além da marcação do pedido (UC-06/UC-07).

## Decisions

1. **Flag de apoio público informativa, não decisória.**
   Guardar `public_support_flag`, `public_support_reason` e `triage_required` no pedido; a coordenação decide na triagem. *Alternativa considerada:* chamar o serviço TNUD para decidir elegibilidade — rejeitada por não existir integração direta na v1 e por BR-10 exigir apenas orientação.

2. **Conteúdo de apoio público versionado e datado.**
   A informação sobre TNUD/Táxi Municipal é um conteúdo versionado com data de atualização, apresentado antes da escolha do transporte. *Alternativa considerada:* texto fixo no ecrã — rejeitada por ficar desatualizado face às regras dos apoios.

3. **Encaminhamento telefónico permanente em todos os passos.**
   Uma ação «Pedir por telefone» mostra o número da IPSS e um link `tel:`, registando o evento de encaminhamento; o fluxo termina e o pedido segue por UC-06. *Alternativa considerada:* mostrar o número apenas no erro de antecedência — rejeitada por A3 permitir a via telefónica em qualquer passo (RNF-02).

4. **Manter o bloqueio de antecedência e acrescentar o contacto.**
   O bloqueio de BR-01 já existe em UC-01-REQ-02; esta slice apenas acrescenta o número da IPSS para casos excecionais no mesmo erro. *Alternativa considerada:* substituir o bloqueio por um aviso com prosseguimento — rejeitada por contrariar BR-01.

5. **Fila offline local cifrada com chave de idempotência.**
   O cliente guarda o snapshot do pedido numa base local (IndexedDB) cifrada, com chave de idempotência, e tenta o envio no evento `online`, no arranque e por Background Sync quando suportado. *Alternativa considerada:* `localStorage` — rejeitada por limites de tamanho e por não permitir cifra adequada de dados pessoais.

6. **Servidor autoritativo na sincronização.**
   Na sincronização, o servidor revalida BR-01/BR-02 com a sua hora; se o pedido deixou de ser válido, marca-o como rejeitado por expiração e notifica o requerente. *Alternativa considerada:* confiar na hora do dispositivo — rejeitada por relógios desviados e por permitir pedidos inválidos.

7. **Idempotência e ausência de duplicados.**
   A chave de idempotência acompanha o snapshot e é reutilizada em cada retry; o servidor devolve o pedido já criado em vez de criar outro. *Alternativa considerada:* deduplicação por conteúdo — rejeitada por ambiguidade entre pedidos legítimos iguais.

8. **Ciclo de vida dos dados locais.**
   A fila guarda apenas os campos necessários (BR-11/RNF-06), cifra em repouso e elimina o snapshot após sincronização bem-sucedida. *Alternativa considerada:* manter histórico local — rejeitada por aumentar exposição de dados num dispositivo potencialmente partilhado.

## Risks / Trade-offs

- **Relógio do dispositivo desviado** → revalidação no servidor na sincronização e notificação se o pedido expirar.
- **Background Sync indisponível (ex.: iOS)** → tentativa no arranque e ao recuperar foco, com estado «pendente de envio» visível.
- **Dados pessoais no dispositivo** → cifra em repouso, campos mínimos, eliminação após envio e bloqueio de sessão.
- **Quota de armazenamento esgotada** → limite da fila e aviso ao requerente antes de rejeitar a gravação local.
- **Excesso de sinalizações de apoio público** → flag só quando o requerente a indica explicitamente; informação clara de que não é uma decisão de elegibilidade.
- **Informação de apoios desatualizada** → conteúdo versionado com data de atualização visível.
- **Duplicação na sincronização** → chave de idempotência reutilizada em todos os retries.
- **Sobreposição com UC-01-REQ-02 (BR-01)** → requisito distinto e aditivo (REQ-05) com o mesmo caso de teste; S1 garante o bloqueio e S3 acrescenta o contacto telefónico, sem contradição.

## Migration Plan

- Adicionar a `TripRequest` as colunas anuláveis `public_support_flag`, `public_support_reason` e `triage_required`; pedidos existentes ficam com `false`/nulo.
- A fila offline é apenas do cliente; não requer migração de servidor.
- Deploy aditivo e compatível; rollback remove as colunas novas e desativa a fila local sem afetar pedidos já criados.
