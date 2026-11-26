# Proposal: UC-01-S2 — Recorrência semanal e destino não listado

## Why
Dar resposta a tratamentos continuados (fisioterapia, hemodiálise) através da marcação em bloco semanal e permitir a introdução manual de destinos de saúde não pré-catalogados, com sinalização para validação da coordenação.

## What Changes
- Geração automática de pedidos recorrentes para as 4 semanas seguintes (A1) (cobre BR-01 e BR-02).
- Introdução manual de unidade de saúde não listada no catálogo com etiqueta para validação posterior (A2).

## Capabilities
### Modified Capabilities
- `trip-request`: Extensão para suporte de pedidos recorrentes e destinos não listados.
