# Design: UC-01-S1

## Context

Ver `proposal.md` para a motivação e `specs/trip-request/spec.md` para os requisitos. O fluxo é usado por utentes seniores e familiares/cuidadores na aplicação web responsiva (mobile-first), com fortes requisitos de usabilidade (RNF-01) e de proteção de dados pessoais (BR-11, RNF-06). O pedido criado é consumido pelo UC-02, que escolhe o meio de transporte. As unidades de saúde de destino vêm de um catálogo. Recorrência, destino não listado, triagem de apoio público e resiliência offline pertencem a UC-01-S2/S3 e ficam fora desta slice.

## Goals / Non-Goals

**Goals:**
- Registar um pedido completo e válido em poucos passos, acessível a utentes 65+.
- Garantir a validação de campos obrigatórios e da antecedência mínima de 24h (BR-01).
- Criar o pedido num estado consistente («A escolher o meio») e entregá-lo à escolha do meio (UC-02).
- Restringir o acesso aos dados do pedido por perfil (BR-11).

**Non-Goals:**
- Implementar a escolha do meio de transporte ou a atribuição de viagens (UC-02).
- Suportar pedidos recorrentes, destinos não listados, triagem TNUD/Táxi Municipal ou modo offline do pedido (UC-01-S2/S3).
- Editar ou cancelar pedidos já criados (UC-07).

## Decisions

1. **`TripRequest` como fonte de verdade do pedido.**
   O pedido é criado com estado inicial `A_ESCOLHER_O_MEIO` e é a referência usada pelo UC-02. *Alternativa considerada:* criar diretamente as viagens de ida/regresso — rejeitada por saltar a escolha do meio e duplicar regras de UC-02.

2. **Destino selecionado a partir de catálogo de unidades de saúde.**
   A pesquisa e seleção usam o catálogo de unidades; destinos não listados são explicitamente fora desta slice (UC-01-S2). *Alternativa considerada:* texto livre — rejeitada por impedir validação e triagem consistente.

3. **Necessidades de mobilidade mapeadas no perfil do utente.**
   As opções (cadeira de rodas, oxigénio, défice cognitivo, acompanhante, bengala, maca ou cuidados) alimentam o perfil de mobilidade associado ao pedido, base da compatibilidade em BR-02. *Alternativa considerada:* guardar apenas texto descritivo — rejeitada por inviabilizar a filtragem automática do UC-02.

4. **Validação no servidor com apoio no cliente.**
   O cliente valida para dar feedback imediato (UX/RNF-01), mas o servidor revalida campos obrigatórios e antecedência mínima (BR-01) antes de criar o pedido; em falha, nada é persistido. *Alternativa considerada:* validação apenas no cliente — rejeitada por ser contornável.

5. **Registo em nome do utente com controlo de acesso.**
   O mesmo modelo guarda quem regista (utente ou familiar/cuidador) e para quem; o acesso é restrito ao requerente autorizado e à coordenação (BR-11, RNF-06). *Alternativa considerada:* modelos separados por tipo de requerente — rejeitada por duplicar regras de validação.

6. **Notificação à coordenação assíncrona.**
   A criação do pedido emite um evento persistido e a notificação é entregue de forma assíncrona com retry, para que uma falha de notificação não impeça o registo. *Alternativa considerada:* notificação síncrona bloqueante — rejeitada por acoplar o pedido a um serviço externo.

7. **Interface mobile-first acessível (RNF-01).**
   Fluxo em poucos passos, letra grande, contraste mínimo 4,5:1 e alvos de toque amplos. *Alternativa considerada:* formulário único denso — rejeitada por contrariar a usabilidade para 65+.

## Risks / Trade-offs

- **Pedidos duplicados por submissões repetidas** → chave de idempotência da submissão e estado do formulário controlado no cliente.
- **Notificação à coordenação atrasada** → evento persistido com retry; o pedido existe mesmo que a notificação falhe.
- **Dados pessoais expostos** → acesso por perfil, minimização de campos e auditoria de acessos (BR-11, RNF-06).
- **Relógio do cliente desviado** → a antecedência de 24h é revalidada com a hora do servidor.
- **Destino escolhido de catálogo desatualizado** → catálogo versionado e validação do identificador da unidade no servidor.
