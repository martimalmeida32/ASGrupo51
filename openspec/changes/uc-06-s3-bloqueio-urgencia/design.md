# Design: UC-06-S3

## Decisões Técnicas e Arquitetura
1. **Triagem Clínica de Risco (BR-12):** Gatilho imediato de bloqueio que impede a persistência na base de dados e aciona banner de emergência para ligação 112.
2. **Enforcement de BR-01:** Bloqueio transacional de submissões telefónicas sem antecedência quando não acompanhadas de justificação validada.
