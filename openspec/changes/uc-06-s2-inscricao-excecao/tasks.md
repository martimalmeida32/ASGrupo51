# Tasks

## 1. Inscrição Inicial e Cartão

- [ ] 1.1 Adicionar o ramo «Nova inscrição» ao assistente telefónico quando a pesquisa não encontra o utente e verificar que o destino, a data e as necessidades já recolhidos se mantêm
- [ ] 1.2 Implementar o formulário com o conjunto mínimo de dados configurável e verificar que nenhum campo clínico é pedido e que os obrigatórios são validados (BR-11)
- [ ] 1.3 Criar a ficha do utente e o perfil de mobilidade inicial na mesma transação e verificar que ambos ficam associados
- [ ] 1.4 Atribuir o número de cartão #MC-nnnn por sequência com restrição única e verificar que submissões concorrentes não geram números repetidos
- [ ] 1.5 Gerar o payload QR/NFC com token opaco assinado, sem dados pessoais, e verificar a leitura do cartão e a revogação/reemissão
- [ ] 1.6 Marcar a primeira viagem como acompanhamento garantido e verificar que a marca é consumida e limpa após a primeira viagem concluída (UC-03)

## 2. Destino Não Listado

- [ ] 2.1 Aceitar o destino escrito quando não existe na lista, guardá-lo como texto livre com «não listado» e verificar que o pedido continua
- [ ] 2.2 Marcar o destino como pendente de validação da coordenação e verificar que a marca fica visível no pedido e na fila de UC-07

## 3. Exceção de Urgência

- [ ] 3.1 Alterar a validação BR-01 para devolver «exceção necessária» abaixo de 24 horas e verificar os limites de 24h00 e 23h59 em Europe/Lisbon
- [ ] 3.2 Implementar o comando de autorização restrito ao perfil «Técnico social», com justificação obrigatória, e verificar que justificação vazia e perfis não autorizados são rejeitados
- [ ] 3.3 Gravar técnico, data/hora e justificação numa entrada de auditoria imutável e verificar que não pode ser alterada
- [ ] 3.4 Verificar que um pedido com exceção autorizada avança para a atribuição do meio e que um pedido sem autorização permanece bloqueado

## 4. Encaminhamento TNUD/Táxi

- [ ] 4.1 Apresentar o aviso TNUD/Táxi com versão e registar a apresentação e a decisão do utente e verificar que «prosseguir» continua o pedido e «recusar» o termina sem pedido
- [ ] 4.2 Verificar que a versão do aviso e a decisão ficam guardadas no pedido para efeitos de BR-10

## 5. Testes

- [ ] 5.1 Implementar o teste automatizado TC-UC06-04 para inscrição com cartão #MC-0310 e exceção urgente justificada e verificar que passa
- [ ] 5.2 Implementar um teste para o destino não listado (A2) e verificar que o pedido continua com a marca de validação pendente
- [ ] 5.3 Testar a tentativa de inscrever um utente já existente e verificar que o aviso de possível duplicado é apresentado antes da criação
- [ ] 5.4 Executar a suite de testes e o lint do projeto e verificar que terminam sem erros
