# \# Design: UC-01-S3

# 

# \## Contexto

# 

# Validar a antecedência mínima dos pedidos, sinalizar possíveis

# apoios públicos e permitir o registo de pedidos sem ligação à Internet.

# 

# \## Decisões técnicas e arquitetura

# 

# \- Aplicar o ADR-001 e reutilizar os módulos dos slices anteriores.

# \- Implementar o bloqueio de pedidos com antecedência inferior a 24 horas (BR-01).

# \- Apresentar uma mensagem informativa e o contacto telefónico da IPSS.

# \- Sinalizar potenciais apoios TNUD ou Táxi Municipal para triagem (BR-10).

# \- Utilizar IndexedDB para guardar pedidos pendentes no navegador (RNF-05).

# \- Sincronizar automaticamente os pedidos quando a ligação regressar.

# \- Utilizar um identificador estável por submissão para evitar duplicados.

# \- Manter SQLite como base de dados do servidor.

# 

# \## Módulos envolvidos

# 

# \- Aplicação do utente e familiar.

# \- API REST.

# \- Pedidos e triagem.

# \- Motor de sincronização offline.

# \- Persistência em IndexedDB e SQLite.

# 

# \## Interface de serviços

# 

# \- POST /pedidos — Registar e sincronizar pedidos.

# \- GET /pedidos/{id} — Consultar o pedido registado.

# 

# \## Entidades envolvidas

# 

# \- TripRequest.

# \- Perfil de mobilidade.

# \- Indicador de potencial elegibilidade para apoio público.

# \- Identificador de submissão.

# \- Estado local: Pendente de sincronização.

# 

# \## Testes

# 

# Utilizar Playwright Test para verificar os cenários:

# 

# \- TC-UC01-02: Bloqueio de pedido com antecedência inferior a 24 horas.

# \- TC-UC01-03: Sinalização de possível elegibilidade para apoio público.

# \- TC-UC01-05: Gravação local em IndexedDB e sincronização automática

# &#x20; sem duplicação de pedidos.

# 

# Respeitar os dados e resultados esperados da SRS.

# Executar também os testes dos slices anteriores.

