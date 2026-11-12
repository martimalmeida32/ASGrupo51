# Tasks

## 1. Cálculo e Agendamento

- [ ] 1.1 Calcular e persistir `expected_end_at` como hora da consulta mais 45 minutos (BR-06), com valor configurável, e verificar a persistência na viagem de regresso
- [ ] 1.2 Criar a tabela de timers com chave única `(return_trip_id, expected_end_at)` e índice por data de disparo e verificar a criação do timer
- [ ] 1.3 Implementar o worker que dispara o pedido 25 minutos antes do fim previsto, incluindo catch-up de timers vencidos no arranque, e verificar o disparo após reinício
- [ ] 1.4 Garantir idempotência do disparo e verificar que reprocessamentos não criam pedidos duplicados

## 2. Pedido de Regresso e Aviso

- [ ] 2.1 Pedir o regresso #VG-202 ao meio escolhido como viagem independente da ida (BR-05) e verificar a transição para o estado «PEDIDO»
- [ ] 2.2 Avisar o utente de quem o vai buscar e a que horas e verificar a notificação recebida
- [ ] 2.3 Sinalizar a coordenação quando não existe meio atribuído e verificar que o regresso não fica bloqueado em silêncio

## 3. Confirmação e Estado

- [ ] 3.1 Implementar a confirmação do fim da consulta pelo utente na app como comando idempotente e verificar que confirmações repetidas não alteram o resultado
- [ ] 3.2 Aceitar o aviso de fim de consulta emitido pela unidade de saúde e verificar que converge no mesmo comando
- [ ] 3.3 Implementar a aceitação do meio de regresso (`CONFIRMADO`) e a confirmação de deslocação (`A_CAMINHO`) e verificar as transições da máquina de estados
- [ ] 3.4 Mostrar o estado «a caminho para o regresso» ao utente, ao familiar e à coordenação e verificar a sua visibilidade no acompanhamento

## 4. Desempenho e Testes

- [ ] 4.1 Medir o pedido automático e verificar a resposta em menos de 3 segundos (RNF-03)
- [ ] 4.2 Implementar testes automatizados para os dois cenários TC-UC04-01 e verificar que passam
- [ ] 4.3 Testar o catch-up após indisponibilidade do worker e verificar que nenhum regresso fica sem pedido
- [ ] 4.4 Executar a suite de testes e o lint do projeto e verificar que terminam sem erros
