# Design: UC-06-S2

## Context

Ver `proposal.md` para a motivação e `specs/telephone-request/spec.md` para os requisitos. O registo telefónico de UC-06-S1 já corre no Portal Web com um assistente em passos, rascunho no servidor, pesquisa por cartão/telemóvel e validação BR-01/BR-10. Esta slice estende esse assistente com inscrição inicial e cartão físico, destino não listado, exceção de urgência justificada e registo do encaminhamento TNUD/Táxi. O cartão físico já é usado para check-in por QR/NFC em UC-03.

## Goals / Non-Goals

**Goals:**
- Inscrever um novo utente dentro da mesma chamada, sem perder o contexto do pedido.
- Emitir um cartão com identificador único e payload QR/NFC sem dados pessoais.
- Tratar destino não listado e urgência inferior a 24h de forma explícita, rastreável e restrita ao técnico.
- Registar o encaminhamento TNUD/Táxi e a decisão do utente.

**Non-Goals:**
- Produção física e entrega do cartão (processo externo à aplicação).
- Validação do destino não listado e atribuição manual no painel da coordenação (UC-07).
- Bloqueio por urgência médica aguda e contingência sem meio (UC-06-S3).
- Alterações ao fluxo normal de UC-06-S1 para utentes já registados.

## Decisions

1. **Inscrição como ramo do mesmo assistente.**
   Quando a pesquisa não encontra o utente, o técnico abre o ramo «Nova inscrição» dentro do rascunho existente, mantendo destino, data e necessidades já recolhidos. *Alternativa considerada:* ecrã de inscrição separado — rejeitada por obrigar a repetir a chamada e a perder o contexto.

2. **Conjunto mínimo de dados configurável.**
   A ficha inicial recolhe nome, contacto telefónico, morada, perfil de mobilidade e consentimento, sem dados clínicos; a lista de campos obrigatórios é configurável e validada com a IPSS. *Alternativa considerada:* reutilizar todos os campos do modelo de utente — rejeitada por violar BR-11.

3. **Número de cartão sequencial com garantia de unicidade.**
   O número #MC-nnnn é atribuído por sequência na mesma transação que cria a ficha, com restrição única; conflitos são reprocessados. *Alternativa considerada:* número gerado no cliente — rejeitada por colisões.

4. **QR/NFC com token opaco assinado.**
   O cartão contém um token opaco assinado que resolve para o utente no servidor, nunca nome, telefone ou número de utente em texto. O cartão pode ser revogado e reemitido. *Alternativa considerada:* codificar dados do utente no QR — rejeitada por exposição e clonagem (BR-11).

5. **Acompanhamento garantido na primeira viagem como marca persistida.**
   A inscrição grava `first_trip_guaranteed` na ficha; UC-03 consome a marca na primeira viagem e o sistema limpa-a após a conclusão. *Alternativa considerada:* tratar a garantia como regra apenas de apresentação — rejeitada por não ser verificável.

6. **Destino não listado como texto classificado, não como catálogo.**
   O destino escrito é guardado como texto livre com `unlisted = true` e `validation_status = PENDING_COORDINATION`; o pedido continua, sem geocodificação automática nem criação de unidade. *Alternativa considerada:* criar automaticamente uma unidade nova — rejeitada por poluir o catálogo com erros de escrita.

7. **BR-01 devolve «exceção necessária» em vez de falha definitiva.**
   A validação calcula a antecedência em Europe/Lisbon; abaixo de 24h devolve `EXCEPTION_REQUIRED`. A autorização é um comando separado, restrito ao perfil «Técnico social», que exige justificação não vazia e grava técnico, data/hora e motivo numa entrada de auditoria imutável. *Alternativa considerada:* aceitar um campo booleano de urgência no formulário — rejeitada por não deixar rasto verificável.

8. **Encaminhamento TNUD/Táxi com versão e decisão registadas.**
   O aviso apresentado tem versão e data; o sistema grava `referral_presented_at` e a decisão `PROCEED`/`REFUSE`. Recusar termina o registo sem pedido. *Alternativa considerada:* mostrar o aviso apenas como texto informativo — rejeitada por não permitir demonstrar BR-10.

9. **Auditoria append-only de inscrição, cartão, exceção, destino e encaminhamento.**
   Cada evento regista técnico, momento, pedido/rascunho e valores relevantes, sem duplicar dados pessoais. *Alternativa considerada:* log genérico de aplicação — rejeitada por não ser consultável pela coordenação.

## Risks / Trade-offs

- **Minimização insuficiente ou excessiva** → conjunto mínimo validado com a IPSS e configurável; sem campos clínicos.
- **Colisão de números de cartão** → sequência transacional e restrição única com retry.
- **Perda ou clonagem do cartão** → token opaco assinado, revogação e reemissão.
- **Inscrição duplicada de utente já existente** → pesquisa prévia por cartão/telemóvel e aviso de possível duplicado antes de criar.
- **Abuso da exceção de urgência** → justificação obrigatória, restrição de perfil, auditoria imutável e visibilidade na coordenação.
- **Destino escrito incorretamente** → texto confirmado com o utente e validação obrigatória em UC-07 antes da viagem.
- **Marca de primeira viagem não consumida** → teste de integração com UC-03 e visibilidade da marca enquanto estiver ativa.
- **Fuso horário no limite das 24h** → hora do servidor em Europe/Lisbon e testes nos limites.
- **Alteração do aviso TNUD/Táxi** → conteúdo versionado e versão registada com a decisão.

## Migration Plan

- Criar a tabela de cartões com número único, token, estado e referência ao utente.
- Adicionar à ficha do utente `first_trip_guaranteed` e à inscrição a referência ao cartão emitido.
- Adicionar ao pedido `destination_unlisted`, `destination_validation_status`, `exception_justification`, `exception_authorized_by`, `exception_authorized_at`, `referral_version`, `referral_presented_at` e `referral_decision`.
- Criar a tabela de auditoria append-only com índices por pedido e por técnico.
- Deploy aditivo; sem backfill obrigatório.
- Rollback: desativar o ramo de inscrição e os comandos de exceção/encaminhamento; cartões e pedidos já criados permanecem válidos.
