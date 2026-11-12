# Delta Spec: Trip Execution (UC-03-S1)

## Purpose
Permitir ao voluntário iniciar a viagem atribuída e comprovar presencialmente a recolha do utente no domicílio, com registo de hora e localização, geofencing, contingência manual e tratamento da ausência do utente, garantindo rastreabilidade e segurança.

## ADDED Requirements

### Requirement: UC-03-REQ-01 — Check-in Presencial à Porta do Utente por Geofencing e QR
The system SHALL validate the physical presence of the user at the pickup location through QR/NFC scan of the MobiCare card within a 100-meter geofenced radius, record timestamp and GPS coordinates in the audit log (BR-08), transition the trip state to «Em Curso», and notify the registered family member (RNF-01).

#### Scenario: TC-UC03-01 — Check-in presencial com sucesso à porta do utente
- **GIVEN** o voluntário Carlos Mendes (#VOL-042, viatura 45-CD-67) tem a viagem de ida #VG-201 atribuída para recolher o utente António Silva (cartão #MC-0142) em 24/11/2026 às 09:45 na «Rua Dr. Mário Sacramento, 45, Aveiro»
- **WHEN** o voluntário chega à morada às 09:42 (dentro do raio de 100 metros validado por GPS), abre a aplicação e faz o scan do código QR do cartão físico #MC-0142 do utente
- **THEN** o sistema valida a presença, registra as coordenadas GPS e o timestamp no histórico de auditoria (BR-08), passa a viagem #VG-201 para «Em Curso», envia notificação push à filha Joana Silva («O voluntário Carlos iniciou a viagem com o seu familiar») e atualiza o painel da IPSS

#### Scenario: TC-UC03-02 — Tolerância de espera excedida sem comparência do utente [caso de falha]
- **GIVEN** o voluntário Carlos Mendes efetuou check-in de chegada às 09:45 para a viagem #VG-201, mas o utente António Silva não comparece à porta nem atende a campainha ou telefone
- **WHEN** às 09:55 (após esgotar os 10 minutos regulamentares de tolerância e duas tentativas de chamada), o voluntário clica em «Reportar Ausência do Utente»
- **THEN** o sistema regista a não-comparência com coordenadas GPS e histórico de tentativas de contacto (BR-08), cancela a viagem sem penalização para o voluntário, liberta a sua escala, alerta a coordenação da IPSS no UC-07 e envia um SMS de aviso para o contacto de emergência familiar

#### Scenario: TC-UC03-04 — Check-in manual por falha do leitor QR/NFC
- **GIVEN** o voluntário Carlos Mendes encontra-se à porta do utente António Silva, mas a câmara do telemóvel está danificada e não consegue ler o código QR do cartão físico
- **WHEN** seleciona «Confirmação Manual», introduz o número do cartão «#MC-0142», o código PIN verbal facultado pelo utente e indica o motivo «Falha na câmara»
- **THEN** o sistema valida os dados contra o servidor central, regista o início com a flag de auditoria «Validação Manual de Contingência» (BR-08) e passa o estado da viagem para «Em Curso» sem interromper a operação
