# Tasks

## 1. Pipeline de Validação

- [ ] 1.1 Implementar a validação server-side ordenada (urgência médica → campos obrigatórios → BR-01 → disponibilidade) e verificar que o alerta de urgência é avaliado antes das restantes regras
- [ ] 1.2 Validar os campos obrigatórios com erro por campo e verificar que nenhum pedido é criado quando falta o destino ou a hora (E1)
- [ ] 1.3 Bloquear pedidos com menos de 24 horas sem exceção, mostrar «Violação de BR-01: antecedência mínima de 24 horas» e verificar o caso TC-UC06-01 sem pedido criado e com o rascunho preservado
- [ ] 1.4 Adicionar o indicador «Urgência médica aguda (dor torácica / falta de ar súbita)» e verificar o bloqueio imediato com alerta para o 112 e encerramento sem pedido (TC-UC06-02)
- [ ] 1.5 Tornar o alerta do 112 acessível, com contraste elevado, foco no alerta e chamada por toque sem marcação automática, e verificar com teclado e leitor de ecrã

## 2. Encaminhamento para a Coordenação

- [ ] 2.1 Adicionar o estado «Sem opção» ao ciclo de vida do pedido e verificar a transição a partir da ausência de meios
- [ ] 2.2 Criar o pedido em «Sem opção» quando a cascata não devolve opções, notificar a coordenação e verificar que aparece na fila de UC-07
- [ ] 2.3 Tornar o encaminhamento idempotente e verificar que repetir a operação não duplica o pedido nem a notificação
- [ ] 2.4 Recalcular a disponibilidade antes da confirmação e verificar que um meio que desaparece entretanto leva ao encaminhamento E4

## 3. Auditoria e Mensagens

- [ ] 3.1 Registar cada bloqueio e encaminhamento com técnico, momento e código de motivo e verificar os quatro códigos previstos
- [ ] 3.2 Restringir o acesso à auditoria e não guardar detalhe clínico além do indicador e verificar que perfis não autorizados são impedidos (BR-11)
- [ ] 3.3 Aplicar os textos exatos dos avisos de bloqueio e de encaminhamento e verificar a sua apresentação no ecrã

## 4. Testes

- [ ] 4.1 Implementar o teste automatizado TC-UC06-01 e verificar que passa
- [ ] 4.2 Implementar o teste automatizado TC-UC06-02 e verificar que passa
- [ ] 4.3 Implementar um teste para o bloqueio por campo obrigatório em falta (E1) e verificar que nenhum pedido é persistido
- [ ] 4.4 Implementar um teste para o encaminhamento sem meio (E4) e verificar que o pedido fica em «Sem opção» e a coordenação notificada
- [ ] 4.5 Executar a suite de testes e o lint do projeto e verificar que terminam sem erros
