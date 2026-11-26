import express from 'express';
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { z } from 'zod';
import {
  DESTINATIONS,
  INITIAL_STATUS,
  INITIAL_STATUS_LABEL,
  MOBILITY_NEED_IDS,
  getCompatibleOptions,
  mobilityProfileLabel,
  normalizeDateTime,
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
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS notifications (
    notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id TEXT NOT NULL REFERENCES trip_requests(request_id),
    recipient TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

const pedidoSchema = z.object({
  submissionId: z.string().min(1).optional(),
  requesterType: z.enum(['proprio-utente', 'familiar-cuidador']),
  userId: z.string().min(1),
  destinationId: z.string().min(1),
  consultationAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
  mobilityNeeds: z.array(z.enum(MOBILITY_NEED_IDS)).min(1)
});

function nowIso() {
  const configured = process.env.MOBICARE_NOW;
  if (configured) {
    const date = new Date(configured);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  return new Date().toISOString();
}

function rowToPedido(row) {
  const needs = JSON.parse(row.mobility_profile);
  const notification = db
    .prepare(
      'SELECT recipient, message, created_at FROM notifications WHERE request_id = ? ORDER BY notification_id LIMIT 1'
    )
    .get(row.request_id);

  return {
    requestId: row.request_id,
    status: row.status === INITIAL_STATUS ? INITIAL_STATUS_LABEL : row.status,
    mobilityProfile: mobilityProfileLabel(needs),
    destination: row.destination,
    consultationAt: row.consultation_at,
    notification: notification
      ? {
          recipient: notification.recipient,
          message: notification.message,
          sentAt: notification.created_at
        }
      : null,
    options: getCompatibleOptions(needs)
  };
}

function findPedido(requestId) {
  const row = db.prepare('SELECT * FROM trip_requests WHERE request_id = ?').get(requestId);
  return row ? rowToPedido(row) : null;
}

function findSubmission(submissionId) {
  const row = db.prepare('SELECT * FROM trip_requests WHERE submission_id = ?').get(submissionId);
  return row ? rowToPedido(row) : null;
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

  const destination = DESTINATIONS.find((item) => item.id === input.destinationId);
  if (!destination) {
    return res.status(400).json({ error: 'A unidade de saúde selecionada não está no catálogo.' });
  }

  const consultationAt = normalizeDateTime(input.consultationAt);
  const advance = validateAdvance(consultationAt, nowIso());
  if (!advance.valid) {
    return res.status(422).json({ error: advance.message });
  }

  const createdAt = nowIso();
  const count = db.prepare('SELECT COUNT(*) AS total FROM trip_requests').get().total;
  const requestId = `PED-${104 + count}`;
  const submissionId = input.submissionId ?? randomUUID();
  const needs = [...new Set(input.mobilityNeeds)];
  const recipient = 'coordenacao@acompanhar.pt';
  const message = `Novo pedido ${requestId} para ${destination.name} em ${consultationAt}.`;

  try {
    db.exec('BEGIN');
    db.prepare(
      `INSERT INTO trip_requests (
        request_id, submission_id, user_id, requester_type, destination_id,
        destination, consultation_at, mobility_profile, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      requestId,
      submissionId,
      input.userId,
      input.requesterType,
      destination.id,
      destination.name,
      consultationAt,
      JSON.stringify(needs),
      INITIAL_STATUS,
      createdAt
    );
    db.prepare(
      'INSERT INTO notifications (request_id, recipient, message, created_at) VALUES (?, ?, ?, ?)'
    ).run(requestId, recipient, message, createdAt);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  return res.status(201).json(findPedido(requestId));
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
