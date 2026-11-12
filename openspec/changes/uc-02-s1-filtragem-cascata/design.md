# Design: UC-02-S1

## Decisões Técnicas e Arquitetura
1. **Algoritmo de Cascata (BR-04):** Triagem de disponibilidade em 3 níveis (Voluntários particulares a custo 0€ -> Parceiros institucionais -> Operadores profissionais).
2. **Independência Operacional (BR-05):** Cada pedido origina duas entidades `Trip` distintas (uma com `direction = OUTBOUND` e outra com `direction = RETURN`).
