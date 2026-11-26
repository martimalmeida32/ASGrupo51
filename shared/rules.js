export const MOBILITY_NEEDS = [
  { id: 'cadeira-de-rodas', label: 'Cadeira de rodas' },
  { id: 'oxigenio', label: 'Oxigénio' },
  { id: 'defice-cognitivo', label: 'Défice cognitivo' },
  { id: 'acompanhante', label: 'Acompanhante' },
  { id: 'bengala', label: 'Bengala' },
  { id: 'maca', label: 'Maca' },
  { id: 'cuidados', label: 'Cuidados' }
];

export const MOBILITY_NEED_IDS = MOBILITY_NEEDS.map((need) => need.id);

export const DESTINATIONS = [
  { id: 'hospital-infante-d-pedro', name: 'Hospital Infante D. Pedro (Aveiro)' },
  { id: 'centro-saude-ilhavo', name: 'Centro de Saúde de Ílhavo' },
  { id: 'hospital-sao-joao', name: 'Hospital São João (Porto)' },
  { id: 'centro-saude-aveiro', name: 'Centro de Saúde de Aveiro' }
];

export const INITIAL_STATUS = 'A_ESCOLHER_O_MEIO';
export const INITIAL_STATUS_LABEL = 'A escolher o meio';
export const ADVANCE_LIMIT_MS = 24 * 60 * 60 * 1000;

export function normalizeDateTime(value) {
  if (typeof value !== 'string') return '';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return `${value}:00Z`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)) return `${value}Z`;
  return value;
}

export function validateAdvance(consultationAt, now) {
  const consultation = new Date(normalizeDateTime(consultationAt)).getTime();
  const reference = new Date(now).getTime();

  if (!Number.isFinite(consultation)) {
    return { valid: false, message: 'Data e hora da consulta inválidas.' };
  }

  if (!Number.isFinite(reference)) {
    return { valid: false, message: 'Data de referência inválida.' };
  }

  if (consultation - reference < ADVANCE_LIMIT_MS) {
    return { valid: false, message: 'Antecedência mínima de 24 horas não cumprida' };
  }

  return { valid: true, message: '' };
}

export function mobilityProfileLabel(needIds) {
  return needIds
    .map((id) => MOBILITY_NEEDS.find((need) => need.id === id)?.label ?? id)
    .join(', ');
}

export function getCompatibleOptions(needIds) {
  const needs = new Set(needIds);
  const professional = {
    id: 'operador-profissional',
    label: 'Operador Profissional',
    cost: 'A confirmar',
    recommended: false
  };

  if (needs.has('maca') || needs.has('cuidados')) {
    return [professional];
  }

  return [
    {
      id: 'voluntario',
      label: 'Voluntário',
      cost: '0,00 €',
      recommended: true
    },
    {
      id: 'viatura-adaptada',
      label: 'Viatura Adaptada de Parceiro',
      cost: 'A confirmar',
      recommended: false
    },
    professional
  ];
}
