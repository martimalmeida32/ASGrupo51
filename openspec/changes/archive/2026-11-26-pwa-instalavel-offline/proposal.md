# Proposal

## Why

O ADR-001 prevê uma aplicação do utente responsiva e instalável como PWA e o RNF-08 exige compatibilidade com Android e iOS recentes. A aplicação já guarda pedidos em IndexedDB e sincroniza-os ao recuperar a rede (TC-UC01-05), mas não possui manifesto, ícones, service worker nem fluxo de instalação: sem estes elementos não é instalável e a interface deixa de abrir quando o dispositivo está offline.

## What Changes

- Adicionar o manifesto da aplicação, os ícones de instalação e os metadados de tema no `index.html`.
- Registar um service worker que sirva a interface a partir de cache quando não existe rede, sem cachear respostas da API.
- Expor um botão «Instalar aplicação» quando o navegador disponibiliza o evento `beforeinstallprompt`.
- Garantir que os pedidos pendentes em IndexedDB sobrevivem a um recarregamento offline e continuam a sincronizar uma única vez com o mesmo `submissionId`.
- Adicionar testes Playwright para manifesto, instalação, funcionamento offline e preservação da fila de pedidos.
- Registar os requisitos e cenários numa nova capability `pwa-install-offline`, sem alterar o contrato da API REST.

## Capabilities

### New Capabilities

- `pwa-install-offline`: manifesto, instalação pelo navegador, disponibilidade da interface offline e continuidade da sincronização de pedidos em IndexedDB.

### Modified Capabilities

- Nenhuma. O comportamento existente de registo e sincronização de pedidos (UC-01-REQ-04) é preservado; a nova capability cobre apenas a disponibilidade da interface e a instalação.

## Impact

- `index.html`, `src/main.tsx` e `src/App.tsx` (metadados, registo do service worker e botão de instalação).
- Novos recursos estáticos em `public/`: manifesto, ícones PNG e service worker.
- `src/offline.ts` e `src/App.tsx` (fila IndexedDB existente, revalidada após recarregamento offline).
- Novos testes em `tests/`; a configuração Playwright e o servidor Express não mudam.
- ADR-001 e RNF-08 (E5) permanecem aplicáveis; não é necessário um novo ADR.
