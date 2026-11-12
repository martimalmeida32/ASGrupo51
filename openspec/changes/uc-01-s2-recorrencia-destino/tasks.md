# Tasks

## 1. Modelo de Dados e Migração

- [ ] 1.1 Criar a entidade `TripSeries` (destino, hora, perfil de mobilidade, dia da semana, tamanho) e adicionar `series_id` e `occurrence_index` a `TripRequest`, verificando que a migração cria a tabela e as colunas
- [ ] 1.2 Adicionar `destination_validation` (`PENDING`, `CONFIRMED`, `CORRECTED`) e derivar a etiqueta «destino não listado» do estado `PENDING`, verificando a etiqueta nos dois estados
- [ ] 1.3 Adicionar a chave de idempotência da submissão com restrição de unicidade e verificar que um segundo insert com a mesma chave é rejeitado

## 2. Recorrência Semanal

- [ ] 2.1 Adicionar a opção «Repetir semanalmente» ao passo da data/hora com pré-visualização das 5 datas, verificando a apresentação em viewport móvel
- [ ] 2.2 Gerar o pedido original mais quatro ocorrências no mesmo dia da semana e hora (5 pedidos no total) e verificar o cenário TC-UC01-04
- [ ] 2.3 Aplicar as validações BR-01 e BR-02 a cada ocorrência e verificar que uma ocorrência inválida impede a série
- [ ] 2.4 Criar a série numa transação única e verificar que uma falha a meio não deixa pedidos persistidos
- [ ] 2.5 Implementar a idempotência da submissão da série e verificar que reenviar o formulário devolve a mesma série sem duplicar pedidos

## 3. Destino Não Listado

- [ ] 3.1 Permitir a introdução manual do destino quando a unidade não existe no catálogo e verificar que o pedido é aceite como «destino não listado»
- [ ] 3.2 Persistir o texto introduzido com `unit_id` nulo e `destination_validation = PENDING` e verificar a etiqueta «destino não listado» nos pedidos criados
- [ ] 3.3 Criar a fila de validação da coordenação com os pedidos pendentes e verificar que o pedido aparece na lista sem bloquear a sua criação
- [ ] 3.4 Implementar a confirmação/correção do destino pela coordenação e verificar que `unit_id` fica associado e a etiqueta é removida

## 4. Lembretes e Notificações

- [ ] 4.1 Agendar o lembrete semanal de cada ocorrência com chave idempotente `(request_id, reminder_date)` e verificar que não há lembretes duplicados
- [ ] 4.2 Notificar a coordenação da criação da série e dos destinos pendentes e verificar a receção da notificação
- [ ] 4.3 Verificar que uma falha de notificação ou de agendamento não impede a criação dos pedidos (evento persistido com retry)

## 5. Testes e Acessibilidade

- [ ] 5.1 Implementar testes automatizados para os dois cenários TC-UC01-04 (série de 5 pedidos e destino não listado) e verificar que passam
- [ ] 5.2 Rever o fluxo móvel de recorrência e destino manual face a RNF-01 (letra grande, contraste, poucos passos) e verificar os critérios
- [ ] 5.3 Executar a suite de testes e o lint do projeto e verificar que terminam sem erros
