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

export const CUSTOM_DESTINATION_ID = '__custom__';
export const CUSTOM_DESTINATION_LABEL = 'Destino não listado - validação prévia';

export const INITIAL_STATUS = 'A_ESCOLHER_O_MEIO';
export const INITIAL_STATUS_LABEL = 'A escolher o meio';
export const CONFIRMED_STATUS = 'CONFIRMADO';
export const CONFIRMED_STATUS_LABEL = 'Confirmado';
export const TRANSPORT_CASCADE = ['voluntario', 'viatura-adaptada', 'operador-profissional'];
export const ADVANCE_LIMIT_MS = 24 * 60 * 60 * 1000;
export const IPSS_SUPPORT_PHONE = '+351 234 000 000';
export const PUBLIC_SUPPORT_LABEL = 'Isenção de taxas moderadoras por insuficiência económica';
export const PUBLIC_SUPPORT_MESSAGE = 'Encaminhamento prioritário para TNUD / Táxi Saúde Municipal';

export function normalizeDateTime(value) {
  if (typeof value !== 'string') return '';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return `${value}:00Z`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)) return `${value}Z`;
  return value;
}

export function addDaysToDateTime(value, days) {
  const date = new Date(normalizeDateTime(value));
  if (Number.isNaN(date.getTime())) return '';
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 16);
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

export function shouldFlagPublicSupport(destinationId, destinationName, requested) {
  const eligibleIds = new Set([
    'centro-saude-ilhavo',
    'centro-saude-aveiro',
    'hospital-infante-d-pedro'
  ]);
  return requested === true && (eligibleIds.has(destinationId) || /aveiro/i.test(destinationName ?? ''));
}

export function mobilityProfileLabel(needIds) {
  return needIds
    .map((id) => MOBILITY_NEEDS.find((need) => need.id === id)?.label ?? id)
    .join(', ');
}

export function getCompatibleOptions(needIds) {
  const needs = new Set(needIds);
  const options = {
    'operador-profissional': {
      id: 'operador-profissional',
      label: 'Operador Profissional',
      cost: 'A confirmar',
      recommended: false
    },
    voluntario: {
      id: 'voluntario',
      label: 'Voluntário Carlos Mendes',
      cost: '0,00 €',
      recommended: true
    },
    'viatura-adaptada': {
      id: 'viatura-adaptada',
      label: 'Viatura Adaptada de Parceiro',
      cost: 'A confirmar',
      recommended: false
    }
  };

  const allowed = needs.has('maca') || needs.has('cuidados')
    ? ['operador-profissional']
    : TRANSPORT_CASCADE;

  return allowed.map((id) => options[id]);
}
