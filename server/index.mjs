import express from 'express';
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { z } from 'zod';
import {
  addDaysToDateTime,
  CUSTOM_DESTINATION_ID,
  CUSTOM_DESTINATION_LABEL,
  CONFIRMED_STATUS,
  CONFIRMED_STATUS_LABEL,
  DESTINATIONS,
  INITIAL_STATUS,
  INITIAL_STATUS_LABEL,
  MOBILITY_NEED_IDS,
  PUBLIC_SUPPORT_LABEL,
  PUBLIC_SUPPORT_MESSAGE,
  getCompatibleOptions,
  mobilityProfileLabel,
  normalizeDateTime,
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
    public_support_flag INTEGER NOT NULL DEFAULT 0
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
    created_at TEXT NOT NULL,
    UNIQUE (request_id, direction)
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

function nowIso() {
  const configured = process.env.MOBICARE_NOW;
  if (configured) {
    const date = new Date(configured);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  return new Date().toISOString();
}

function statusLabel(status) {
  if (status === INITIAL_STATUS) return INITIAL_STATUS_LABEL;
  if (status === CONFIRMED_STATUS) return CONFIRMED_STATUS_LABEL;
  return status;
}

function buildTrips(requestId) {
  return db
    .prepare(
      'SELECT trip_id, direction, transport_option_id, status, pickup_at, created_at FROM trips WHERE request_id = ? ORDER BY trip_id'
    )
    .all(requestId)
    .map((trip) => ({
      tripId: trip.trip_id,
      direction: trip.direction,
      transportOptionId: trip.transport_option_id,
      status: trip.status,
      pickupAt: trip.pickup_at,
      createdAt: trip.created_at
    }));
}

function rowToPedido(row) {
  const needs = JSON.parse(row.mobility_profile);
  const notification = db
    .prepare(
      'SELECT recipient, message, created_at FROM notifications WHERE request_id = ? ORDER BY notification_id LIMIT 1'
    )
    .get(row.request_id);
  const trips = buildTrips(row.request_id);

  return {
    requestId: row.request_id,
    status: statusLabel(row.status),
    mobilityProfile: mobilityProfileLabel(needs),
    destination: row.destination,
    consultationAt: row.consultation_at,
    seriesId: row.series_id ?? `SER-${row.request_id}`,
    customDestination: Boolean(row.custom_destination),
    validationLabel: row.validation_label ?? null,
    publicSupportEligible: Boolean(row.public_support_flag),
    publicSupportMessage: row.public_support_flag ? PUBLIC_SUPPORT_MESSAGE : null,
    notification: notification
      ? {
          recipient: notification.recipient,
          message: notification.message,
          sentAt: notification.created_at
        }
      : null,
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

const app = express();
app.use(express.json());

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
          series_id, custom_destination, validation_label, public_support_flag
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
        publicSupport ? 1 : 0
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

app.use('/pedidos', (_req, res) => res.status(404).json({ error: 'Pedido não encontrado.' }));

app.use(express.static(join(root, 'dist')));
app.get(/.*/, (_req, res) => res.sendFile(join(root, 'dist', 'index.html')));

app.listen(port, '127.0.0.1', () => {
  console.log(`MobiCare API e interface em http://127.0.0.1:${port}`);
});
