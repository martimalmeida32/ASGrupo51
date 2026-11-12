# Tasks

## 1. Acesso e Identificação

- [ ] 1.1 Criar o ecrã de registo telefónico no Portal Web restrito ao perfil «Técnico social» e verificar que um perfil não autorizado é impedido de aceder
- [ ] 1.2 Implementar a pesquisa exata do utente por cartão (#MC-nnnn) e por telemóvel, com confirmação do nome antes de avançar, e verificar os casos de encontrado e não encontrado
- [ ] 1.3 Guardar o rascunho do registo no servidor associado à sessão do técnico e verificar que sobrevive a um recarregamento da página
- [ ] 1.4 Expor apenas os dados necessários ao registo e registar auditoria de cada pesquisa e consulta, verificando que nenhum campo adicional é devolvido

## 2. Registo e Validação

- [ ] 2.1 Implementar o registo do destino a partir da lista de unidades de saúde, da data/hora e das necessidades de mobilidade e acompanhamento, e verificar que os campos obrigatórios são exigidos
- [ ] 2.2 Implementar a validação da antecedência mínima de 24 horas em hora local Europe/Lisbon e verificar os limites de 24h00 e 23h59 (BR-01)
- [ ] 2.3 Implementar a avaliação de elegibilidade para apoio público, o aviso TNUD/Táxi Municipal e o registo da decisão do utente e verificar que o registo só avança após essa decisão (BR-10)
- [ ] 2.4 Normalizar e validar o telemóvel do utente antes da confirmação e verificar que um número inválido impede o avanço com indicação do campo

## 3. Escolha do Meio e Confirmação

- [ ] 3.1 Integrar o motor de compatibilidade e cascata do UC-02 e apresentar as opções ordenadas ao técnico e verificar que o resultado coincide com o do pedido na app
- [ ] 3.2 Permitir escolher o voluntário compatível sugerido e confirmar o pedido e verificar a transição para o estado «Confirmado»
- [ ] 3.3 Criar o pedido e as viagens de ida e regresso independentes na mesma transação e verificar que ambas existem e que nenhuma depende do estado da outra (BR-05)
- [ ] 3.4 Aplicar a chave de idempotência do rascunho à confirmação e verificar que uma submissão repetida não cria pedidos duplicados

## 4. SMS e Testes

- [ ] 4.1 Enfileirar o SMS de confirmação com data, hora e meio atribuído após o commit e verificar o conteúdo e o destinatário 912345678 no caso de teste
- [ ] 4.2 Implementar retry com backoff e registo do estado de entrega e verificar que uma falha do serviço de SMS mantém o pedido «Confirmado» e reenvia
- [ ] 4.3 Implementar o teste automatizado TC-UC06-03 e verificar que passa
- [ ] 4.4 Testar o controlo de acesso por perfil e a auditoria das pesquisas e verificar que não há acesso a dados de outros utentes (BR-11)
- [ ] 4.5 Executar a suite de testes e o lint do projeto e verificar que terminam sem erros
