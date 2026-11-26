import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { criarPedido, obterOpcoes } from './api';
import type { PedidoResponse, RequesterType } from './types';
import { DESTINATIONS, MOBILITY_NEEDS } from '../shared/rules.js';

export default function App() {
  const submissionId = useRef(
    globalThis.crypto?.randomUUID?.() ?? `sub-${Date.now()}`
  );
  const [requesterType, setRequesterType] = useState<RequesterType>('proprio-utente');
  const [userId] = useState('MC-0142');
  const [search, setSearch] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [consultationAt, setConsultationAt] = useState('');
  const [mobilityNeeds, setMobilityNeeds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PedidoResponse | null>(null);

  const filteredDestinations = DESTINATIONS.filter((destination) =>
    destination.name.toLocaleLowerCase('pt-PT').includes(search.toLocaleLowerCase('pt-PT'))
  );
  const selectedDestination = DESTINATIONS.find((destination) => destination.id === destinationId);

  function toggleNeed(id: string) {
    setMobilityNeeds((current) =>
      current.includes(id) ? current.filter((need) => need !== id) : [...current, id]
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!destinationId) {
      setError('Selecione uma unidade de saúde de destino.');
      return;
    }
    if (!consultationAt) {
      setError('Indique a data e a hora da consulta.');
      return;
    }
    if (mobilityNeeds.length === 0) {
      setError('Indique pelo menos uma necessidade de mobilidade.');
      return;
    }

    setLoading(true);
    try {
      const created = await criarPedido({
        submissionId: submissionId.current,
        requesterType,
        userId,
        destinationId,
        consultationAt,
        mobilityNeeds
      });
      const options = await obterOpcoes(created.requestId);
      setResult({ ...created, options });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível registar o pedido.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app">
      <header className="topbar">
        <span className="brand">MobiCare</span>
        <span data-testid="authenticated-user" className="user">
          António Silva · Cartão {userId === 'MC-0142' ? '#MC-0142' : userId}
        </span>
      </header>

      <h1>Pedir acompanhamento a consulta</h1>
      <p className="lead">
        Registe o destino, a data da consulta e as necessidades de mobilidade.
      </p>

      <form onSubmit={handleSubmit} className="card">
        <fieldset>
          <legend>Quem está a pedir?</legend>
          <label className="choice">
            <input
              type="radio"
              name="requester"
              value="proprio-utente"
              checked={requesterType === 'proprio-utente'}
              onChange={() => setRequesterType('proprio-utente')}
              data-testid="requester-self"
            />
            Próprio utente
          </label>
          <label className="choice">
            <input
              type="radio"
              name="requester"
              value="familiar-cuidador"
              checked={requesterType === 'familiar-cuidador'}
              onChange={() => setRequesterType('familiar-cuidador')}
              data-testid="requester-family"
            />
            Familiar ou cuidador
          </label>
        </fieldset>

        <fieldset>
          <legend>Unidade de saúde de destino</legend>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pesquisar hospital ou centro de saúde"
            aria-label="Pesquisar unidade de saúde"
            data-testid="destination-search"
          />
          <ul className="options-list">
            {filteredDestinations.map((destination) => (
              <li key={destination.id}>
                <button
                  type="button"
                  className={destination.id === destinationId ? 'option selected' : 'option'}
                  onClick={() => setDestinationId(destination.id)}
                  data-testid={`destination-${destination.id}`}
                >
                  {destination.name}
                </button>
              </li>
            ))}
          </ul>
          {selectedDestination ? (
            <p className="selected" data-testid="selected-destination">
              Destino selecionado: {selectedDestination.name}
            </p>
          ) : null}
        </fieldset>

        <fieldset>
          <legend>Data e hora da consulta</legend>
          <input
            type="datetime-local"
            value={consultationAt}
            onChange={(event) => setConsultationAt(event.target.value)}
            data-testid="consultation-at"
          />
        </fieldset>

        <fieldset>
          <legend>Necessidades de mobilidade</legend>
          <div className="needs">
            {MOBILITY_NEEDS.map((need) => (
              <label className="choice" key={need.id}>
                <input
                  type="checkbox"
                  checked={mobilityNeeds.includes(need.id)}
                  onChange={() => toggleNeed(need.id)}
                  data-testid={`need-${need.id}`}
                />
                {need.label}
              </label>
            ))}
          </div>
        </fieldset>

        {error ? (
          <p role="alert" className="error" data-testid="validation-error">
            {error}
          </p>
        ) : null}

        <button type="submit" className="primary" disabled={loading} data-testid="submit-pedido">
          {loading ? 'A registar…' : 'Confirmar Pedido'}
        </button>
      </form>

      {result ? (
        <section className="card result" aria-live="polite">
          <h2>Pedido registado</h2>
          <dl>
            <dt>Número do pedido</dt>
            <dd data-testid="request-id">#{result.requestId}</dd>
            <dt>Estado</dt>
            <dd data-testid="request-status">{result.status}</dd>
            <dt>Perfil de mobilidade</dt>
            <dd data-testid="mobility-profile">{result.mobilityProfile}</dd>
          </dl>
          <p className="success" data-testid="notification-status">
            Coordenação da IPSS notificada — {result.notification?.recipient ?? 'coordenacao@acompanhar.pt'}
          </p>
          <h3>Opções de transporte compatíveis</h3>
          <ol className="options-list" data-testid="transport-options">
            {result.options.map((option) => (
              <li key={option.id} data-testid="transport-option">
                <strong>{option.label}</strong>
                {option.recommended ? <span className="badge">Recomendado</span> : null}
                <span className="cost">Custo para o utente: {option.cost}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </main>
  );
}
