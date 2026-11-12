# Design: UC-01-S1

## Decisões Técnicas e Arquitetura
1. **Interface Adaptada (RNF-01):** Interface móvel e web com tipografia de alto contraste (mínimo 4,5:1 WCAG AA) e processo de submissão passo a passo.
2. **Minimização de Dados (BR-11):** Armazenamento estrito dos dados essenciais à viagem e perfil funcional de mobilidade, sem recolha desnecessária de dados clínicos.
3. **Validação Temporal:** Verificação no cliente e no servidor da antecedência de 24 horas relativamente à hora atual do sistema (BR-01).

## Entidades Envolvidas
- `TripRequest`: Registo do pedido (`request_id`, `user_id`, `destination`, `consultation_at`, `mobility_profile`, `status = A_ESCOLHER_O_MEIO`).
