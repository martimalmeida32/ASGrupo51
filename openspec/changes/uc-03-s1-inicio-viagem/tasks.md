# Tasks

## 1. Modelo de Dados e Rastreabilidade
- [ ] 1.1 Adicionar campos de check-in à porta (`pickup_at`, `pickup_coords`, `pickup_method`) no modelo `Trip`
- [ ] 1.2 Configurar enum de métodos de check-in (`NFC`, `QR`, `MANUAL`)

## 2. Interface Móvel do Voluntário
- [ ] 2.1 Criar ecrã de detalhe da viagem com morada, hora e requisitos de mobilidade (BR-02)
- [ ] 2.2 Implementar botão «Iniciar Viagem» com registo de geolocalização
- [ ] 2.3 Implementar leitor de QR/NFC para validação do cartão físico MobiCare
- [ ] 2.4 Desenvolver modal de contingência manual caso o leitor falhe (A3)
- [ ] 2.5 Implementar temporizador de tolerância de espera de 10 minutos (E1)

## 3. Notificações e Validação
- [ ] 3.1 Integrar envio de notificação/SMS ao familiar no momento da recolha
- [ ] 3.2 Implementar testes unitários para os cenários TC-UC03-01, TC-UC03-02 e TC-UC03-04