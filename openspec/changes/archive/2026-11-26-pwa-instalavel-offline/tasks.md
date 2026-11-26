# Tasks

## 1. Manifesto e ícones

- [x] 1.1 Criar `public/manifest.webmanifest` com nome, `short_name`, `start_url` `/`, `scope` `/`, `display` `standalone`, `lang` `pt-PT`, cores de tema/fundo e ícones 192/512 com variante `maskable`, e ligar o manifesto, a cor de tema e o ícone touch em `index.html`; verificar que `npm run build` copia os ficheiros para `dist` e que o HTML gerado contém as referências
- [x] 1.2 Gerar os ícones PNG em `public/icons/` (192, 512, maskable 512 e apple-touch 180); verificar que os quatro ficheiros existem no `dist` com as dimensões esperadas
- [x] 1.3 TC-RNF08-01 — adicionar `tests/tc-rnf08-01.spec.ts` validando manifesto, ícones e metadados HTML; verificar que o teste passa com `npm run test:e2e -- tests/tc-rnf08-01.spec.ts`

## 2. Instalação pelo navegador

- [x] 2.1 Implementar em `src/App.tsx` o tratamento de `beforeinstallprompt` e `appinstalled` com botão «Instalar aplicação» e `data-testid="install-button"`; verificar que o botão só aparece quando o navegador disponibiliza o prompt e desaparece após a instalação
- [x] 2.2 TC-RNF08-02 — adicionar `tests/tc-rnf08-02.spec.ts` com um evento `beforeinstallprompt` sintético, confirmando que o botão guarda e invoca o prompt e que o evento `appinstalled` esconde o botão; verificar que o teste passa

## 3. Service worker e interface offline

- [x] 3.1 Criar `public/sw.js` com cache versionada, navegação *network-first* com fallback para `/index.html`, recursos estáticos *cache-first* com atualização em segundo plano, exclusão das respostas da API, `skipWaiting` e limpeza de caches antigas; verificar que o ficheiro é servido em `/sw.js` pelo Express
- [x] 3.2 Registar o service worker em `src/main.tsx` apenas em produção; verificar que a aplicação compilada fica controlada pelo service worker com `navigator.serviceWorker.ready`
- [x] 3.3 TC-RNF08-03 — adicionar `tests/tc-rnf08-03.spec.ts` que abre a aplicação com rede, coloca o browser offline, recarrega e confirma que os separadores e o formulário continuam visíveis; verificar que o teste passa
- [x] 3.4 TC-RNF08-04 — adicionar `tests/tc-rnf08-04.spec.ts` confirmando que uma resposta `GET /pedidos/{id}/opcoes` não é reutilizada offline enquanto a interface abre da cache; verificar que o teste passa

## 4. Fila de pedidos IndexedDB

- [x] 4.1 Validar em `src/offline.ts` e `src/App.tsx` que um pedido pendente sobrevive a recarregamento offline, mantém o `submissionId` e só sai da fila após sincronização com sucesso; verificar que o cenário TC-UC01-05 continua a passar
- [x] 4.2 TC-RNF08-05 — adicionar `tests/zz-tc-rnf08-05.spec.ts` com submissão offline para 28/11/2026 às 09:30, recarregamento sem rede e restabelecimento da ligação, confirmando pedido único no servidor e fila vazia; verificar que o teste passa

## 5. Validação final

- [x] 5.1 Executar `npm run build` e `npm run test:e2e`; verificar que a compilação e todos os testes Playwright existentes e novos passam

## Workflow follow-up

- Rever as alterações e sincronizar/arquivar a change depois da validação, conforme o processo do projeto.
