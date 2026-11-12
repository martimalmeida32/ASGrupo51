# Design: UC-04-S1

## Decisões Técnicas e Arquitetura
1. **Agendamento com Cron / Worker:** Processamento em segundo plano que monitoriza as consultas ativas e calcula o gatilho de `planned_end - 25 min`.
2. **Notificações:** Envio de SMS e notificação in-app garantindo que o utente é informado antes da saída da consulta.
