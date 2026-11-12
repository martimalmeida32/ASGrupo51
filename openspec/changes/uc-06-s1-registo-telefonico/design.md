# Design: UC-06-S1

## Context

Ver `proposal.md` para a motivação e `specs/telephone-request/spec.md` para os requisitos. O projeto é uma aplicação web responsiva, com o pedido do utente modelado em UC-01/UC-02 e as viagens de ida e regresso criadas de forma independente (BR-05). O técnico social trabalha no Portal Web, onde já se autentica. Esta slice acrescenta o registo assistido por telefone, reutilizando o perfil de mobilidade e o módulo de escolha de meio do UC-02.

## Goals / Non-Goals

**Goals:**
- Registar um pedido completo numa única chamada, com validação imediata e sem perder o trabalho do técnico.
- Reutilizar o perfil e as regras existentes, sem duplicar a lógica do UC-01/UC-02.
- Garantir confirmação por SMS e pedido «Confirmado» de forma atómica e idempotente.

**Non-Goals:**
- Inscrição inicial, cartão físico, destino manual e urgência inferior a 24h (UC-06-S2).
- Bloqueio por urgência médica aguda, campos obrigatórios e contingência sem meio (UC-06-S3).
- Atribuição manual fora da cascata e gestão de exceções (UC-07).
- Alterações ao fluxo da app do utente (UC-01).

## Decisions

1. **Assistente em passos com rascunho no servidor.**
   O registo telefónico segue passos ordenados (identificar utente → destino/data/necessidades → validação → meio → confirmação) e guarda um rascunho no servidor associado à sessão do técnico, para sobreviver a recarregamentos e chamadas interrompidas. *Alternativa considerada:* formulário único livre — rejeitada por dificultar a validação progressiva e o aviso TNUD/Táxi no momento certo.

2. **Identificação por identificador forte com fallback confirmado.**
   A pesquisa faz correspondência exata por número de cartão (#MC-nnnn) e, em alternativa, por telemóvel; o nome só é usado para desambiguar e o técnico confirma a utente antes de avançar. Cada pesquisa é auditada com o id do técnico. *Alternativa considerada:* pesquisa difusa por nome — rejeitada por expor dados de outros utentes (BR-11).

3. **Perfil reutilizado como fotografia no momento da confirmação.**
   O pedido guarda os valores do perfil de mobilidade usados na validação, para que alterações posteriores ao perfil não reescrevam o histórico. *Alternativa considerada:* referência viva ao perfil — rejeitada por tornar o histórico do pedido instável.

4. **Validação server-side na ordem BR-01 → BR-10 → disponibilidade.**
   A antecedência mínima é calculada em hora local Europe/Lisbon e bloqueia o avanço quando inferior a 24 horas (BR-01); em S1 não existe exceção. A elegibilidade para apoio público é avaliada a partir do perfil e, se aplicável, o aviso TNUD/Táxi é apresentado e a escolha do utente é registada antes de continuar (BR-10). *Alternativa considerada:* validar apenas no cliente — rejeitada por contornável e por divergir da app.

5. **Escolha de meio delegada no módulo do UC-02.**
   O assistente invoca o mesmo motor de compatibilidade e cascata usado pelo pedido na app e apresenta ao técnico as opções ordenadas; o técnico escolhe a sugerida e confirma verbalmente. Em S1 não há atribuição manual fora da cascata. *Alternativa considerada:* replicar a cascata no Portal Web — rejeitada por risco de divergência de regras.

6. **Confirmação transacional com chave de idempotência.**
   A confirmação cria o pedido «Confirmado» e as viagens de ida e regresso na mesma transação, com chave de idempotência derivada do rascunho, impedindo duplicados por duplo clique ou reenvio. *Alternativa considerada:* criar viagens em passos separados — rejeitada por deixar pedidos parciais.

7. **SMS via outbox após commit.**
   O SMS com data, hora e meio é enfileirado depois do commit, com template fixo e retry com backoff; o estado de entrega é registado. A falha de SMS não reverte o pedido confirmado. *Alternativa considerada:* envio síncrono durante a confirmação — rejeitada por acoplar a confirmação a um serviço externo.

8. **Telefone normalizado e validado antes de confirmar.**
   O número é normalizado para E.164; se o perfil não tiver um número válido, o técnico corrige-o antes de confirmar. *Alternativa considerada:* permitir confirmar sem SMS — rejeitada por violar o objetivo de confirmação por SMS.

9. **Minimização de dados na vista do técnico.**
   O ecrã mostra apenas identificação, contacto, perfil de mobilidade e elegibilidade para apoio, sem histórico clínico nem dados de outros utentes; o acesso é restrito ao perfil «Técnico social» e auditado. *Alternativa considerada:* reutilizar a vista completa do utente — rejeitada por excesso de dados (BR-11).

## Risks / Trade-offs

- **Identificação da pessoa errada** → exigir cartão ou telemóvel e confirmação do nome antes de avançar; registar auditoria.
- **Submissão duplicada** → chave de idempotência e transação única.
- **Diferença de relógio/fuso no cálculo das 24h** → hora do servidor em Europe/Lisbon e testes nos limites e em mudança de hora.
- **Elegibilidade TNUD/Táxi desatualizada** → aviso informativo e registo da decisão do utente; o técnico mantém a palavra final no S1.
- **Falha do serviço de SMS** → outbox com retry e estado de entrega visível; pedido permanece «Confirmado».
- **Divergência entre app e telefone** → motor do UC-02 partilhado e testes de contrato comuns.
- **Pressão para exceções durante a chamada** → S1 não permite exceções nem atribuição manual; remeter para UC-06-S2/S3 e UC-07.
- **Exposição de dados no Portal** → DTO mínimo, RBAC e auditoria de cada pesquisa.

## Migration Plan

- Adicionar o perfil «Técnico social» com acesso ao novo ecrã de registo telefónico.
- Adicionar índices de pesquisa exata por cartão e por telemóvel e a tabela de rascunhos de registo telefónico.
- Configurar o fornecedor de SMS e o template de confirmação.
- Deploy aditivo, sem alterações destrutivas ao modelo de pedidos e viagens.
- Rollback: desativar a entrada no Portal Web e o worker de SMS; rascunhos e pedidos já confirmados permanecem válidos.
