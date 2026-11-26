import express from 'express';
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { z } from 'zod';
import {
  addDaysToDateTime,
  consultaFimPrevisto,
  CUSTOM_DESTINATION_ID,
  CUSTOM_DESTINATION_LABEL,
  CONFIRMED_STATUS,
  CONFIRMED_STATUS_LABEL,
  DESTINATIONS,
  EMERGENCY_112_MESSAGE,
  INITIAL_STATUS,
  INITIAL_STATUS_LABEL,
  MOBILITY_NEED_IDS,
  PUBLIC_SUPPORT_LABEL,
  PUBLIC_SUPPORT_MESSAGE,
  getCompatibleOptions,
  mobilityProfileLabel,
  normalizeDateTime,
  regressoTriggerAt,
  shouldFlagPublicSupport,
  validateAdvance
} from '../shared/rules.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const databaseFile = process.env.MOBICARE_DB ?? join(root, 'data', 'mobicare.db');
const port = Number(process.env.PORT ?? 3001);

if (process.env.MOBICARE_RESET_DB === '1') {
  rmSync(databaseFile, { force: true });
}
mkdirSync(dirname(databaseFile), { recursive: true });

const db = new DatabaseSync(databaseFile);
db.exec(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS trip_requests (
    request_id TEXT PRIMARY KEY,
    submission_id TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    requester_type TEXT NOT NULL,
    destination_id TEXT NOT NULL,
    destination TEXT NOT NULL,
    consultation_at TEXT NOT NULL,
    mobility_profile TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    series_id TEXT,
    custom_destination INTEGER NOT NULL DEFAULT 0,
    validation_label TEXT,
    public_support_flag INTEGER NOT NULL DEFAULT 0,
    planned_end TEXT
  );
  CREATE TABLE IF NOT EXISTS notifications (
    notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id TEXT NOT NULL REFERENCES trip_requests(request_id),
    recipient TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS trips (
    trip_id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL REFERENCES trip_requests(request_id),
    direction TEXT NOT NULL,
    transport_option_id TEXT NOT NULL,
    status TEXT NOT NULL,
    pickup_at TEXT,
    triggered_at TEXT,
    created_at TEXT NOT NULL,
    UNIQUE (request_id, direction)
  );
  CREATE TABLE IF NOT EXISTS sms_messages (
    sms_id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id TEXT NOT NULL REFERENCES trip_requests(request_id),
    recipient TEXT NOT NULL,
    message TEXT NOT NULL,
    sent_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS utentes (
    card_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    mobility_profile TEXT NOT NULL
  );
  INSERT OR IGNORE INTO utentes (card_id, name, phone, mobility_profile)
    VALUES ('MC-0205', 'Maria Ferreira', '912345678', '["acompanhante"]');
  INSERT OR IGNORE INTO utentes (card_id, name, phone, mobility_profile)
    VALUES ('MC-0087', 'Utente Registado', '913000087', '["bengala"]');
  CREATE TABLE IF NOT EXISTS audit_log (
    audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id TEXT REFERENCES trip_requests(request_id),
    card_id TEXT,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    justification TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

const columns = db.prepare('PRAGMA table_info(trip_requests)').all().map((column) => column.name);
if (!columns.includes('series_id')) db.exec('ALTER TABLE trip_requests ADD COLUMN series_id TEXT');
if (!columns.includes('custom_destination')) {
  db.exec('ALTER TABLE trip_requests ADD COLUMN custom_destination INTEGER NOT NULL DEFAULT 0');
}
if (!columns.includes('validation_label')) {
  db.exec('ALTER TABLE trip_requests ADD COLUMN validation_label TEXT');
}
if (!columns.includes('public_support_flag')) {
  db.exec('ALTER TABLE trip_requests ADD COLUMN public_support_flag INTEGER NOT NULL DEFAULT 0');
}
if (!columns.includes('planned_end')) {
  db.exec('ALTER TABLE trip_requests ADD COLUMN planned_end TEXT');
}
const tripColumns = db.prepare('PRAGMA table_info(trips)').all().map((column) => column.name);
if (!tripColumns.includes('triggered_at')) {
  db.exec('ALTER TABLE trips ADD COLUMN triggered_at TEXT');
}

const pedidoSchema = z.object({
  submissionId: z.string().min(1).optional(),
  requesterType: z.enum(['proprio-utente', 'familiar-cuidador']),
  userId: z.string().min(1),
  destinationId: z.string().min(1),
  consultationAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
  mobilityNeeds: z.array(z.enum(MOBILITY_NEED_IDS)).min(1),
  recorrenciaSemanal: z.boolean().optional(),
  customDestination: z.string().min(1).optional(),
  publicSupportRequest: z.boolean().optional()
});

let clockOverride = null;

function nowIso() {
  if (clockOverride) return clockOverride;
  const configured = process.env.MOBICARE_NOW;
  if (configured) {
    const date = new Date(configured);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  return new Date().toISOString();
}

function isTestEnvironment() {
  return process.env.MOBICARE_TEST_CLOCK === '1';
}

function statusLabel(status) {
  if (status === INITIAL_STATUS) return INITIAL_STATUS_LABEL;
  if (status === CONFIRMED_STATUS) return CONFIRMED_STATUS_LABEL;
  return status;
}

function buildTrips(requestId) {
  return db
    .prepare(
      'SELECT trip_id, direction, transport_option_id, status, pickup_at, triggered_at, created_at FROM trips WHERE request_id = ? ORDER BY trip_id'
    )
    .all(requestId)
    .map((trip) => ({
      tripId: trip.trip_id,
      direction: trip.direction,
      transportOptionId: trip.transport_option_id,
      status: trip.status,
      pickupAt: trip.pickup_at,
      triggeredAt: trip.triggered_at,
      createdAt: trip.created_at
    }));
}

function buildNotifications(requestId) {
  return db
    .prepare(
      'SELECT recipient, message, created_at FROM notifications WHERE request_id = ? ORDER BY notification_id'
    )
    .all(requestId)
    .map((notification) => ({
      recipient: notification.recipient,
      message: notification.message,
      sentAt: notification.created_at
    }));
}

function buildSmsConfirmation(requestId) {
  const sms = db
    .prepare(
      'SELECT recipient, message, sent_at FROM sms_messages WHERE request_id = ? ORDER BY sms_id DESC LIMIT 1'
    )
    .get(requestId);
  return sms
    ? { recipient: sms.recipient, message: sms.message, sentAt: sms.sent_at }
    : null;
}

function buildAudit(requestId) {
  return db
    .prepare(
      `SELECT card_id, actor, action, justification, created_at
       FROM audit_log WHERE request_id = ? ORDER BY audit_id`
    )
    .all(requestId)
    .map((item) => ({
      cardId: item.card_id,
      actor: item.actor,
      action: item.action,
      justification: item.justification,
      createdAt: item.created_at
    }));
}

function rowToPedido(row) {
  const needs = JSON.parse(row.mobility_profile);
  const notifications = buildNotifications(row.request_id);
  const notification = notifications[0] ?? null;
  const trips = buildTrips(row.request_id);

  return {
    requestId: row.request_id,
    status: statusLabel(row.status),
    mobilityProfile: mobilityProfileLabel(needs),
    destination: row.destination,
    consultationAt: row.consultation_at,
    plannedEnd: row.planned_end ?? consultaFimPrevisto(row.consultation_at),
    seriesId: row.series_id ?? `SER-${row.request_id}`,
    customDestination: Boolean(row.custom_destination),
    validationLabel: row.validation_label ?? null,
    publicSupportEligible: Boolean(row.public_support_flag),
    publicSupportMessage: row.public_support_flag ? PUBLIC_SUPPORT_MESSAGE : null,
    notification,
    notifications,
    smsConfirmation: buildSmsConfirmation(row.request_id),
    audit: buildAudit(row.request_id),
    options: getCompatibleOptions(needs),
    selection: trips[0]
      ? {
          optionId: trips[0].transportOptionId,
          confirmedAt: trips[0].createdAt
        }
      : null,
    trips
  };
}

function buildSeriesResponse(row) {
  const pedido = rowToPedido(row);
  const rows = db
    .prepare('SELECT * FROM trip_requests WHERE series_id = ? OR request_id = ? ORDER BY request_id')
    .all(pedido.seriesId, row.request_id);

  return { ...pedido, requests: rows.map((item) => rowToPedido(item)) };
}

function findPedido(requestId) {
  const row = db.prepare('SELECT * FROM trip_requests WHERE request_id = ?').get(requestId);
  return row ? rowToPedido(row) : null;
}

function findSubmission(submissionId) {
  const row = db.prepare('SELECT * FROM trip_requests WHERE submission_id = ?').get(submissionId);
  return row ? buildSeriesResponse(row) : null;
}

function enviarSms(requestId, recipient, message, sentAt) {
  db.prepare(
    'INSERT INTO sms_messages (request_id, recipient, message, sent_at) VALUES (?, ?, ?, ?)'
  ).run(requestId, recipient, message, sentAt);
}

function processarRegressos() {
  const startedAt = Date.now();
  const now = nowIso();
  const candidatos = db
    .prepare(
      `SELECT t.trip_id, t.request_id, t.transport_option_id, t.pickup_at,
              r.consultation_at, r.planned_end, r.destination, r.mobility_profile, r.user_id
       FROM trips t
       JOIN trip_requests r ON r.request_id = t.request_id
       WHERE t.direction = 'RETURN'
         AND t.status = 'ESTAFETA_FLEXIVEL'
         AND t.triggered_at IS NULL
         AND r.status = ?
         AND EXISTS (
           SELECT 1 FROM trips o
           WHERE o.request_id = t.request_id
             AND o.direction = 'OUTBOUND'
             AND o.status = 'CONCLUIDA'
         )
       ORDER BY t.trip_id`
    )
    .all(CONFIRMED_STATUS);
  let acionados = 0;

  for (const trip of candidatos) {
    const trigger = regressoTriggerAt(trip.consultation_at);
    const plannedEnd = trip.planned_end ?? consultaFimPrevisto(trip.consultation_at);
    if (!trigger || !plannedEnd || Date.parse(now) < Date.parse(trigger)) continue;

    const options = getCompatibleOptions(JSON.parse(trip.mobility_profile));
    const driver = options.find((option) => option.id === trip.transport_option_id);
    const driverLabel = driver?.label ?? trip.transport_option_id;
    const pickupTime = plannedEnd.slice(11, 16);
    const sentAt = now;

    db.exec('BEGIN');
    try {
      const atualizacao = db
        .prepare(
          `UPDATE trips
           SET status = 'EM_ROTA', pickup_at = ?, triggered_at = ?
           WHERE trip_id = ? AND triggered_at IS NULL`
        )
        .run(plannedEnd, sentAt, trip.trip_id);
      if (atualizacao.changes === 0) {
        db.exec('ROLLBACK');
        continue;
      }

      const insertNotification = db.prepare(
        'INSERT INTO notifications (request_id, recipient, message, created_at) VALUES (?, ?, ?, ?)'
      );
      insertNotification.run(
        trip.request_id,
        'voluntario@acompanhar.pt',
        `Regresso ${trip.trip_id} ativado: inicie a deslocação para ${trip.destination} com recolha prevista às ${pickupTime}.`,
        sentAt
      );
      insertNotification.run(
        trip.request_id,
        'utente@acompanhar.pt',
        `O seu regresso ${trip.trip_id} foi acionado. Recolha prevista às ${pickupTime} por ${driverLabel}.`,
        sentAt
      );
      insertNotification.run(
        trip.request_id,
        'familiar@acompanhar.pt',
        `O regresso de ${trip.user_id} foi acionado. Recolha prevista às ${pickupTime} por ${driverLabel}.`,
        sentAt
      );

      const sms = `MobiCare: regresso ativado, recolha prevista às ${pickupTime} por ${driverLabel}.`;
      enviarSms(trip.request_id, '+351912000014', sms, sentAt);
      enviarSms(trip.request_id, '+351912000015', sms, sentAt);
      db.exec('COMMIT');
      acionados += 1;
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }

  return { now, candidatos: candidatos.length, acionados, durationMs: Date.now() - startedAt };
}

const app = express();
app.use(express.json());

app.get('/utentes', (req, res) => {
  const query = String(req.query.q ?? '').trim().toLocaleLowerCase('pt-PT');
  const digits = query.replace(/\D/g, '');
  const utentes = db
    .prepare('SELECT card_id, name, phone, mobility_profile FROM utentes')
    .all()
    .filter((utente) => {
      if (!query) return true;
      return (
        utente.card_id.toLocaleLowerCase('pt-PT').includes(query) ||
        utente.name.toLocaleLowerCase('pt-PT').includes(query) ||
        utente.phone.includes(digits)
      );
    })
    .map((utente) => ({
      cardId: utente.card_id,
      name: utente.name,
      phone: utente.phone,
      mobilityNeeds: JSON.parse(utente.mobility_profile),
      mobilityProfile: mobilityProfileLabel(JSON.parse(utente.mobility_profile))
    }));
  return res.json({ utentes });
});

const utenteSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(9),
  mobilityNeeds: z.array(z.enum(MOBILITY_NEED_IDS)).min(1)
});

app.post('/utentes', (req, res) => {
  const parsed = utenteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Dados de inscrição inválidos.',
      details: parsed.error.issues.map((issue) => issue.message)
    });
  }

  const usedCards = new Set(
    db.prepare('SELECT card_id FROM utentes').all().map((row) => row.card_id)
  );
  let nextNumber = 310;
  while (usedCards.has(`MC-${String(nextNumber).padStart(4, '0')}`)) nextNumber += 1;
  const cardId = `MC-${String(nextNumber).padStart(4, '0')}`;
  const needs = [...new Set(parsed.data.mobilityNeeds)];
  const phone = parsed.data.phone.replace(/\s/g, '');
  const createdAt = nowIso();

  db.prepare(
    'INSERT INTO utentes (card_id, name, phone, mobility_profile) VALUES (?, ?, ?, ?)'
  ).run(cardId, parsed.data.name.trim(), phone, JSON.stringify(needs));

  return res.status(201).json({
    cardId,
    name: parsed.data.name.trim(),
    phone,
    mobilityNeeds: needs,
    mobilityProfile: mobilityProfileLabel(needs),
    active: true,
    createdAt
  });
});

app.post('/pedidos', (req, res) => {
  const parsed = pedidoSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Dados do pedido inválidos.',
      details: parsed.error.issues.map((issue) => issue.message)
    });
  }

  const input = parsed.data;
  if (input.submissionId) {
    const existing = findSubmission(input.submissionId);
    if (existing) return res.status(200).json(existing);
  }

  const isCustom = input.destinationId === CUSTOM_DESTINATION_ID;
  const customName = input.customDestination?.trim() ?? '';
  const destination = isCustom
    ? { id: CUSTOM_DESTINATION_ID, name: customName }
    : DESTINATIONS.find((item) => item.id === input.destinationId);
  if (!destination || !destination.name) {
    return res.status(400).json({ error: 'A unidade de saúde selecionada não está no catálogo.' });
  }

  const recurrence = input.recorrenciaSemanal === true;
  const dates = recurrence
    ? Array.from({ length: 5 }, (_, index) => addDaysToDateTime(input.consultationAt, index * 7))
    : [input.consultationAt];
  if (dates.some((date) => !date)) {
    return res.status(400).json({ error: 'Data e hora da consulta inválidas.' });
  }

  const reference = nowIso();
  for (const date of dates) {
    const advance = validateAdvance(normalizeDateTime(date), reference);
    if (!advance.valid) return res.status(422).json({ error: advance.message });
  }

  const createdAt = nowIso();
  const count = db.prepare('SELECT COUNT(*) AS total FROM trip_requests').get().total;
  const requestIds = dates.map((_, index) => `PED-${104 + count + index}`);
  const submissionId = input.submissionId ?? randomUUID();
  const seriesId = recurrence ? `SER-${randomUUID().slice(0, 8)}` : null;
  const publicSupport = shouldFlagPublicSupport(
    destination.id,
    destination.name,
    input.publicSupportRequest
  );
  const validationLabel = [
    isCustom ? CUSTOM_DESTINATION_LABEL : null,
    publicSupport ? PUBLIC_SUPPORT_LABEL : null
  ]
    .filter(Boolean)
    .join(' · ') || null;
  const needs = [...new Set(input.mobilityNeeds)];
  const recipient = 'coordenacao@acompanhar.pt';

  try {
    db.exec('BEGIN');
    dates.forEach((date, index) => {
      const requestId = requestIds[index];
      const consultationAt = normalizeDateTime(date);
      const submissionForRow = index === 0 ? submissionId : `${submissionId}-${index}`;
      db.prepare(
        `INSERT INTO trip_requests (
          request_id, submission_id, user_id, requester_type, destination_id,
          destination, consultation_at, mobility_profile, status, created_at,
          series_id, custom_destination, validation_label, public_support_flag, planned_end
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        requestId,
        submissionForRow,
        input.userId,
        input.requesterType,
        destination.id,
        destination.name,
        consultationAt,
        JSON.stringify(needs),
        INITIAL_STATUS,
        createdAt,
        seriesId,
        isCustom ? 1 : 0,
        validationLabel,
        publicSupport ? 1 : 0,
        consultaFimPrevisto(consultationAt)
      );
      db.prepare(
        'INSERT INTO notifications (request_id, recipient, message, created_at) VALUES (?, ?, ?, ?)'
      ).run(requestId, recipient, `Novo pedido ${requestId} para ${destination.name} em ${consultationAt}.`, createdAt);
    });
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  const firstRow = db.prepare('SELECT * FROM trip_requests WHERE request_id = ?').get(requestIds[0]);
  return res.status(201).json(buildSeriesResponse(firstRow));
});

app.post('/pedidos/:id/selecao', (req, res) => {
  const parsed = z.object({ optionId: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Seleção de transporte inválida.',
      details: parsed.error.issues.map((issue) => issue.message)
    });
  }

  const row = db.prepare('SELECT * FROM trip_requests WHERE request_id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Pedido não encontrado.' });

  const pedido = rowToPedido(row);
  const option = pedido.options.find((item) => item.id === parsed.data.optionId);
  if (!option) return res.status(400).json({ error: 'Opção de transporte não compatível.' });

  const existingTrips = buildTrips(row.request_id);
  if (existingTrips.length > 0) {
    return res.status(200).json(buildSeriesResponse(row));
  }

  const createdAt = nowIso();
  const count = db.prepare('SELECT COUNT(*) AS total FROM trips').get().total;
  const pickup = new Date(normalizeDateTime(row.consultation_at));
  pickup.setUTCMinutes(pickup.getUTCMinutes() - 45);
  const pickupAt = pickup.toISOString().slice(0, 16);
  const outboundId = `VG-${201 + count}`;
  const returnId = `VG-${202 + count}`;

  db.exec('BEGIN');
  try {
    db.prepare('UPDATE trip_requests SET status = ? WHERE request_id = ?').run(
      CONFIRMED_STATUS,
      row.request_id
    );
    const insertTrip = db.prepare(
      `INSERT INTO trips (
        trip_id, request_id, direction, transport_option_id, status, pickup_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    insertTrip.run(outboundId, row.request_id, 'OUTBOUND', option.id, 'AGENDADA', pickupAt, createdAt);
    insertTrip.run(returnId, row.request_id, 'RETURN', option.id, 'ESTAFETA_FLEXIVEL', null, createdAt);

    const insertNotification = db.prepare(
      'INSERT INTO notifications (request_id, recipient, message, created_at) VALUES (?, ?, ?, ?)'
    );
    insertNotification.run(
      row.request_id,
      'voluntario@acompanhar.pt',
      `Viagem ${outboundId} atribuída a ${option.label} para ${row.destination}.`,
      createdAt
    );
    insertNotification.run(
      row.request_id,
      'coordenacao@acompanhar.pt',
      `Pedido ${row.request_id} confirmado com ${option.label}; viagens ${outboundId} e ${returnId} criadas.`,
      createdAt
    );
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  const updated = db.prepare('SELECT * FROM trip_requests WHERE request_id = ?').get(row.request_id);
  return res.status(201).json(buildSeriesResponse(updated));
});

app.get('/pedidos/:id/opcoes', (req, res) => {
  const pedido = findPedido(req.params.id);
  if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado.' });
  return res.json({ requestId: pedido.requestId, options: pedido.options });
});

app.get('/pedidos/:id', (req, res) => {
  const pedido = findPedido(req.params.id);
  if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado.' });
  return res.json(pedido);
});

app.post('/viagens/:id/concluir', (req, res) => {
  const trip = db.prepare('SELECT * FROM trips WHERE trip_id = ?').get(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Viagem não encontrada.' });
  if (trip.direction !== 'OUTBOUND') {
    return res.status(400).json({ error: 'Apenas viagens de ida podem ser concluídas.' });
  }
  db.prepare("UPDATE trips SET status = 'CONCLUIDA' WHERE trip_id = ?").run(trip.trip_id);
  return res.json(findPedido(trip.request_id));
});

app.post('/regressos/processar', (_req, res) => {
  if (!isTestEnvironment()) {
    return res.status(404).json({ error: 'Recurso não encontrado.' });
  }
  return res.json(processarRegressos());
});

app.get('/sms', (_req, res) => {
  if (!isTestEnvironment()) {
    return res.status(404).json({ error: 'Recurso não encontrado.' });
  }
  const messages = db
    .prepare(
      'SELECT request_id, recipient, message, sent_at FROM sms_messages ORDER BY sms_id'
    )
    .all()
    .map((item) => ({
      requestId: item.request_id,
      recipient: item.recipient,
      message: item.message,
      sentAt: item.sent_at
    }));
  return res.json({ messages });
});

app.post('/test/clock', (req, res) => {
  if (!isTestEnvironment()) {
    return res.status(404).json({ error: 'Recurso não encontrado.' });
  }
  const parsed = z.object({ now: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Relógio inválido.' });
  const date = new Date(parsed.data.now);
  if (Number.isNaN(date.getTime())) return res.status(400).json({ error: 'Relógio inválido.' });
  clockOverride = date.toISOString();
  return res.json({ now: clockOverride });
});

const telefoneSchema = z.object({
  cardId: z.string().min(1),
  destinationId: z.string().min(1),
  consultationAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
  optionId: z.string().min(1),
  publicSupportRequest: z.boolean().optional(),
  acuteMedicalEmergency: z.boolean().optional(),
  urgencyException: z
    .object({
      authorized: z.literal(true),
      justification: z.string().min(10),
      technician: z.string().min(2).optional()
    })
    .optional()
});

app.post('/pedidos/telefonicos', (req, res) => {
  const parsed = telefoneSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Dados do pedido telefónico inválidos.',
      details: parsed.error.issues.map((issue) => issue.message)
    });
  }

  const input = parsed.data;
  if (input.acuteMedicalEmergency === true) {
    return res.status(422).json({ error: EMERGENCY_112_MESSAGE, emergency: true });
  }

  const utente = db
    .prepare('SELECT * FROM utentes WHERE card_id = ?')
    .get(input.cardId);
  if (!utente) return res.status(404).json({ error: 'Utente não encontrado.' });

  const destination = DESTINATIONS.find((item) => item.id === input.destinationId);
  if (!destination) {
    return res.status(400).json({ error: 'A unidade de saúde selecionada não está no catálogo.' });
  }

  const consultationAt = normalizeDateTime(input.consultationAt);
  const advance = validateAdvance(consultationAt, nowIso());
  const urgencyException = input.urgencyException;
  if (!advance.valid && !urgencyException?.authorized) {
    return res.status(422).json({ error: advance.message });
  }

  const needs = JSON.parse(utente.mobility_profile);
  const option = getCompatibleOptions(needs).find((item) => item.id === input.optionId);
  if (!option) return res.status(400).json({ error: 'Opção de transporte não compatível.' });

  const publicSupport = shouldFlagPublicSupport(
    destination.id,
    destination.name,
    input.publicSupportRequest
  );
  const validationLabel = [
    publicSupport ? PUBLIC_SUPPORT_LABEL : null,
    urgencyException ? 'Exceção urgente autorizada pela coordenação' : 'Registo telefónico'
  ]
    .filter(Boolean)
    .join(' · ');
  const createdAt = nowIso();
  const count = db.prepare('SELECT COUNT(*) AS total FROM trip_requests').get().total;
  const requestId = `PED-${104 + count}`;
  const outboundId = `VG-${201 + count * 2}`;
  const returnId = `VG-${202 + count * 2}`;
  const pickup = new Date(consultationAt);
  pickup.setUTCMinutes(pickup.getUTCMinutes() - 45);
  const pickupAt = pickup.toISOString().slice(0, 16);
  const dataHora = `${input.consultationAt.slice(8, 10)}/${input.consultationAt.slice(5, 7)}/${input.consultationAt.slice(0, 4)} às ${input.consultationAt.slice(11, 16)}`;
  const meetingPoint = `Entrada principal de ${destination.name}`;
  const smsMessage = `MobiCare: pedido confirmado para ${dataHora} em ${destination.name}. ${meetingPoint}. Recolha às ${pickupAt.slice(11, 16)}.`;

  db.exec('BEGIN');
  try {
    db.prepare(
      `INSERT INTO trip_requests (
        request_id, submission_id, user_id, requester_type, destination_id,
        destination, consultation_at, mobility_profile, status, created_at,
        series_id, custom_destination, validation_label, public_support_flag, planned_end
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      requestId,
      randomUUID(),
      utente.card_id,
      'tecnico-ipss',
      destination.id,
      destination.name,
      consultationAt,
      utente.mobility_profile,
      CONFIRMED_STATUS,
      createdAt,
      null,
      0,
      validationLabel,
      publicSupport ? 1 : 0,
      consultaFimPrevisto(consultationAt)
    );

    const insertTrip = db.prepare(
      `INSERT INTO trips (
        trip_id, request_id, direction, transport_option_id, status, pickup_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    insertTrip.run(outboundId, requestId, 'OUTBOUND', option.id, 'AGENDADA', pickupAt, createdAt);
    insertTrip.run(returnId, requestId, 'RETURN', option.id, 'ESTAFETA_FLEXIVEL', null, createdAt);

    const insertNotification = db.prepare(
      'INSERT INTO notifications (request_id, recipient, message, created_at) VALUES (?, ?, ?, ?)'
    );
    insertNotification.run(
      requestId,
      'coordenacao@acompanhar.pt',
      `Pedido telefónico ${requestId} registado para ${utente.name} (${utente.card_id}) com ${option.label}.`,
      createdAt
    );
    insertNotification.run(
      requestId,
      `${utente.phone}@sms`,
      smsMessage,
      createdAt
    );
    enviarSms(requestId, utente.phone, smsMessage, createdAt);
    if (urgencyException) {
      db.prepare(
        `INSERT INTO audit_log (
          request_id, card_id, actor, action, justification, created_at
        ) VALUES (?, ?, ?, ?, ?, ?)`
      ).run(
        requestId,
        utente.card_id,
        urgencyException.technician?.trim() || 'Técnico da IPSS',
        'EXCECAO_BR_01',
        urgencyException.justification.trim(),
        createdAt
      );
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  const created = db.prepare('SELECT * FROM trip_requests WHERE request_id = ?').get(requestId);
  return res.status(201).json(buildSeriesResponse(created));
});

app.use('/pedidos', (_req, res) => res.status(404).json({ error: 'Pedido não encontrado.' }));

app.use(express.static(join(root, 'dist')));
app.get(/.*/, (_req, res) => res.sendFile(join(root, 'dist', 'index.html')));

const returnTimer = setInterval(() => processarRegressos(), 1000);
returnTimer.unref();

app.listen(port, '127.0.0.1', () => {
  console.log(`MobiCare API e interface em http://127.0.0.1:${port}`);
});
