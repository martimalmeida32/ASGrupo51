# Design

## Context

A aplicação já usa React/TypeScript com Vite e é servida pelo Express a partir de `dist`. A fila de pedidos offline existe em `src/offline.ts` (base `mobicare-offline`, store `pedidos-pendentes`) e `src/App.tsx` sincroniza ao receber o evento `online`; o servidor garante idempotência por `submission_id` em `POST /pedidos`. Não existe manifesto, ícone, service worker nem tratamento de `beforeinstallprompt`. A motivação e o alcance estão em `proposal.md`; o contrato observável está em `specs/pwa-install-offline/spec.md`.

Os módulos do E5 afetados são a apresentação (interface do utente), a persistência e a sincronização. Nenhuma operação da API REST é alterada: `POST /pedidos`, `GET /pedidos/{id}/opcoes` e `POST /pedidos/{id}/selecao` mantêm-se idênticos. O ADR-001 continua aplicável, pelo que não é necessário um novo ADR.

## Goals / Non-Goals

**Goals:**

- Tornar a aplicação instalável em navegadores modernos, com manifesto, ícones e fluxo de instalação.
- Permitir abrir e usar a interface sem rede após uma primeira visita com ligação.
- Preservar a fila IndexedDB e a sincronização idempotente existente após recarregamentos offline.

**Non-Goals:**

- Alterar regras de negócio, contrato da API ou esquema SQLite.
- Cifrar a base local ou implementar notificações push e atualizações automáticas de conteúdo.
- Garantir o evento `beforeinstallprompt` em navegadores iOS, que dependem de «Adicionar ao ecrã inicial».

## Decisions

- **Recursos estáticos em `public/`.** O Vite copia `manifest.webmanifest`, os ícones PNG e `sw.js` para a raiz de `dist`, onde o Express já serve ficheiros estáticos. Alternativa rejeitada: gerar os recursos apenas no servidor, o que duplicaria a configuração de build e teste.
- **Precache derivado do HTML e cache em tempo de execução.** Durante a instalação, o service worker lê `/index.html`, extrai os URLs com hash de `/assets/` e guarda o shell e os ícones na cache versionada. A navegação usa *network-first* (recaindo para `/index.html`) e os recursos estáticos usam *cache-first* com atualização em segundo plano. Assim funciona com os nomes gerados pelo Vite sem um plugin de build. Alternativa rejeitada: adicionar `vite-plugin-pwa`, que introduziria uma dependência e uma etapa de geração de precache.
- **A API nunca entra na cache.** Pedidos com `destination` vazio ou caminho fora de `/assets/`, `/icons/`, manifesto e ícones são deixados ao navegador. Isto impede que opções de transporte ou pedidos antigos sejam devolvidos como atuais. O service worker usa `skipWaiting` e `clients.claim` para evitar uma versão desatualizada presa em abas abertas.
- **Registo apenas em produção.** `src/main.tsx` regista `/sw.js` quando `import.meta.env.PROD` é verdadeiro, evitando cache stale no servidor de desenvolvimento do Vite.
- **Botão de instalação reativo.** Um hook em `src/App.tsx` guarda o `beforeinstallprompt`, mostra o botão com `data-testid="install-button"` e esconde-o após `appinstalled` ou recusa do utilizador. O evento é sintético nos testes Playwright porque o Chrome headless não o emite de forma fiável.
- **Fila inalterada.** Não há migração de esquema IndexedDB: o `submissionId` continua a ser a chave e é reenviado em cada tentativa. Ao iniciar, `App` relê a fila e tenta sincronizar; após um recarregamento offline a fila reaparece e só é esvaziada depois de `POST /pedidos` e `GET /pedidos/{id}/opcoes` bem-sucedidos. Um pedido recebido mas sem confirmação é reenviado com o mesmo `submissionId` e a idempotência do servidor impede duplicados.

## Risks / Trade-offs

- [Primeira visita requer rede] → O service worker e a cache só existem após essa visita; o botão de instalação e os testes garantem que a instalação acontece depois do carregamento inicial.
- [Cache desatualizada entre versões] → O nome da cache é versionado e as caches antigas são removidas no evento `activate`.
- [Limitações do iOS] → Sem `beforeinstallprompt`, o utilizador usa «Adicionar ao ecrã inicial»; o manifesto e o ícone touch cobrem esse caminho.
- [Falha ao sincronizar depois de o servidor gravar] → O pedido permanece na fila com o mesmo identificador; a restrição `UNIQUE(submission_id)` do SQLite devolve o resultado original sem criar duplicado.

## Migration Plan

Não existem alterações de dados. O rollout consiste em compilar (`npm run build`) e reiniciar o Express para servir os novos ficheiros em `dist`. Para reverter, basta remover o registo do service worker e os recursos de PWA e reconstruir; os pedidos pendentes permanecem em IndexedDB e continuam a sincronizar.
