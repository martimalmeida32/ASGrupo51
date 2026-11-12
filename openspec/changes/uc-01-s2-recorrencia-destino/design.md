# Design: UC-01-S2

## Decisões Técnicas e Arquitetura
1. **Geração em Lote:** Criação transacional dos 5 registos de pedido na base de dados com o mesmo identificador de série recorrente.
2. **Triagem de Destino:** Atribuição automática da flag `custom_destination = true` para triagem antes da atribuição de rota.
