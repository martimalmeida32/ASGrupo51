# Tasks

## 1. Modelo de Opções e Compatibilidade

- [ ] 1.1 Criar a projeção `TransportOption` agregando voluntários, viaturas adaptadas de parceiros e operadores profissionais e verificar que devolve as três origens num formato único
- [ ] 1.2 Implementar a filtragem por compatibilidade com o perfil de mobilidade (BR-02), excluindo meios sem dados suficientes, e verificar que meios incompatíveis não aparecem
- [ ] 1.3 Implementar a ordenação em cascata Voluntário > Viatura Adaptada > Operador Profissional (BR-04) com destaque da recomendada e verificar a ordem no cenário TC-UC02-01
- [ ] 1.4 Calcular e apresentar o custo para o utente por opção (voluntário 0,00 €) e verificar os valores apresentados
- [ ] 1.5 Adicionar índices de disponibilidade/compatibilidade e medir a consulta num teste de carga e verificar a apresentação em menos de 3 segundos (RNF-03)

## 2. Ecrã «Quem o pode levar»

- [ ] 2.1 Criar o ecrã «Quem o pode levar» para um pedido em «A escolher o meio» e verificar o carregamento e os estados de erro em viewport móvel
- [ ] 2.2 Apresentar as opções com custo, recomendação e descrição do meio e verificar a legibilidade e o contraste (RNF-01)
- [ ] 2.3 Implementar a seleção e a confirmação da opção pelo utente e verificar que a escolha segue para a confirmação

## 3. Confirmação e Criação de Viagens

- [ ] 3.1 Implementar a confirmação atómica com revalidação de disponibilidade e chave de idempotência e verificar que reenvios não duplicam viagens
- [ ] 3.2 Transitar o pedido de «A escolher o meio» para «Confirmado» e verificar a transição no cenário TC-UC02-03
- [ ] 3.3 Criar as viagens independentes de ida (#VG-201, hora ajustada à consulta) e de regresso (#VG-202, modo estafeta) e verificar os dois registos na base de dados (BR-05)
- [ ] 3.4 Guardar no pedido o meio escolhido e o custo confirmado e verificar que o valor coincide com o apresentado
- [ ] 3.5 Emitir as notificações à coordenação e ao meio escolhido via outbox e verificar a entrega e o retry
- [ ] 3.6 Tratar o conflito em que a opção deixa de estar disponível entre a apresentação e a confirmação e verificar que nada é criado e a lista recarrega

## 4. Testes e Verificação

- [ ] 4.1 Implementar testes automatizados para TC-UC02-01 e TC-UC02-03 e verificar que passam
- [ ] 4.2 Implementar testes de compatibilidade e de cascata com conjuntos de opções mistos e verificar que não surgem opções incompatíveis
- [ ] 4.3 Executar a suite de testes e o lint do projeto e verificar que terminam sem erros
