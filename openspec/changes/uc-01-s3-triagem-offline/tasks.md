# Tasks

## 1. Sinalização de Apoio Público

- [ ] 1.1 Adicionar `public_support_flag`, `public_support_reason` e `triage_required` a `TripRequest` e verificar que a migração cria as colunas anuláveis
- [ ] 1.2 Adicionar no passo de mobilidade a indicação de isenção de taxas moderadoras / insuficiência económica e verificar que a flag fica persistida no pedido
- [ ] 1.3 Apresentar o conteúdo versionado sobre TNUD/Táxi Municipal antes da escolha do transporte e verificar a data de atualização visível
- [ ] 1.4 Marcar o pedido para triagem prévia e notificar a coordenação, verificando que o pedido aparece na lista de triagem

## 2. Encaminhamento Telefónico e Antecedência

- [ ] 2.1 Disponibilizar «Pedir por telefone» em todos os passos do fluxo, com o número da IPSS e link `tel:`, e verificar a apresentação em viewport móvel
- [ ] 2.2 Registar o evento de encaminhamento telefónico e terminar o fluxo da app (handoff para UC-06), verificando que nenhum pedido é criado na app
- [ ] 2.3 Acrescentar o número da linha telefónica da IPSS ao erro de antecedência inferior a 24h e verificar o cenário TC-UC01-02

## 3. Resiliência Offline

- [ ] 3.1 Guardar o snapshot completo do pedido numa fila local cifrada com chave de idempotência e verificar a gravação com a rede desligada
- [ ] 3.2 Mostrar o estado «pendente de envio» após a submissão offline e verificar que não é apresentada confirmação falsa
- [ ] 3.3 Sincronizar automaticamente no evento `online`, no arranque e por Background Sync quando suportado, verificando o envio após reconexão
- [ ] 3.4 Reutilizar a chave de idempotência em todos os retries e verificar que a sincronização não cria pedidos duplicados
- [ ] 3.5 Revalidar BR-01 e BR-02 com a hora do servidor na sincronização e verificar que um pedido expirado é marcado como rejeitado e o requerente é notificado
- [ ] 3.6 Eliminar o snapshot local após sincronização bem-sucedida e verificar que os dados não permanecem no dispositivo

## 4. Testes e Verificação

- [ ] 4.1 Implementar testes automatizados para TC-UC01-02, TC-UC01-03 e para o cenário RNF-05 de submissão offline e verificar que passam
- [ ] 4.2 Testar a perda de ligação durante a sincronização e verificar que nenhum pedido é perdido nem duplicado
- [ ] 4.3 Executar a suite de testes e o lint do projeto e verificar que terminam sem erros
