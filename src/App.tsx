import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { criarPedido, obterOpcoes } from './api';
import { enqueuePedido, listarPedidosPendentes, removerPedidoPendente } from './offline';
import type { PedidoPendente } from './offline';
import type { CreatePedidoInput, PedidoResponse, RequesterType } from './types';
import {
  CUSTOM_DESTINATION_ID,
  DESTINATIONS,
  IPSS_SUPPORT_PHONE,
  MOBILITY_NEEDS,
  PUBLIC_SUPPORT_LABEL
} from '../shared/rules.js';

function formatDateTime(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(iso)) return iso;
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)} às ${iso.slice(11, 16)}`;
}

export default function App() {
  const submissionId = useRef(
    globalThis.crypto?.randomUUID?.() ?? `sub-${Date.now()}`
  );
  const [requesterType, setRequesterType] = useState<RequesterType>('proprio-utente');
  const [userId] = useState('MC-0142');
  const [search, setSearch] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [customDestination, setCustomDestination] = useState<string | null>(null);
  const [consultationAt, setConsultationAt] = useState('');
  const [mobilityNeeds, setMobilityNeeds] = useState<string[]>([]);
  const [recorrenciaSemanal, setRecorrenciaSemanal] = useState(false);
  const [publicSupportRequest, setPublicSupportRequest] = useState(false);
  const [online, setOnline] = useState(() => navigator.onLine);
  const [pending, setPending] = useState<PedidoPendente[]>([]);
  const [syncMessage, setSyncMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PedidoResponse | null>(null);
  const syncing = useRef(false);

  const filteredDestinations = DESTINATIONS.filter((destination) =>
    destination.name.toLocaleLowerCase('pt-PT').includes(search.toLocaleLowerCase('pt-PT'))
  );
  const selectedDestination =
    destinationId === CUSTOM_DESTINATION_ID
      ? { id: CUSTOM_DESTINATION_ID, name: customDestination ?? '' }
      : DESTINATIONS.find((destination) => destination.id === destinationId);
  const customSearch = search.trim();
  const showCustomOption =
    customSearch.length > 0 &&
    !DESTINATIONS.some(
      (destination) => destination.name.toLocaleLowerCase('pt-PT') === customSearch.toLocaleLowerCase('pt-PT')
    );

  function selectCatalogDestination(id: string) {
    setDestinationId(id);
    setCustomDestination(null);
  }

  function selectCustomDestination() {
    setDestinationId(CUSTOM_DESTINATION_ID);
    setCustomDestination(customSearch);
  }

  function toggleNeed(id: string) {
    setMobilityNeeds((current) =>
      current.includes(id) ? current.filter((need) => need !== id) : [...current, id]
    );
  }

  const refreshPending = useCallback(async () => {
    try {
      setPending(await listarPedidosPendentes());
    } catch {
      setPending([]);
    }
  }, []);

  const syncPendingRequests = useCallback(async () => {
    if (syncing.current || !navigator.onLine) return;
    syncing.current = true;

    try {
      const items = await listarPedidosPendentes();
      if (items.length === 0) {
        setPending([]);
        return;
      }

      setSyncMessage('A sincronizar pedidos guardados…');
      for (const item of items) {
        const created = await criarPedido(item.input);
        const options = await obterOpcoes(created.requestId);
        setResult({ ...created, options });
        await removerPedidoPendente(item.id);
      }
      setPending(await listarPedidosPendentes());
      setSyncMessage('Pedidos sincronizados com sucesso.');
    } catch {
      setSyncMessage('Não foi possível sincronizar. O pedido permanece guardado no dispositivo.');
      await refreshPending();
    } finally {
      syncing.current = false;
    }
  }, [refreshPending]);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      void syncPendingRequests();
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setOnline(navigator.onLine);
    void refreshPending().then(syncPendingRequests);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshPending, syncPendingRequests]);

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

    const input: CreatePedidoInput = {
      submissionId: submissionId.current,
      requesterType,
      userId,
      destinationId,
      consultationAt,
      mobilityNeeds,
      recorrenciaSemanal,
      customDestination: customDestination ?? undefined,
      publicSupportRequest
    };

    if (!navigator.onLine) {
      setLoading(true);
      try {
        await enqueuePedido(input);
        await refreshPending();
        setSyncMessage('Pedido guardado no dispositivo — Pendente de sincronização.');
      } catch {
        setError('Não foi possível guardar o pedido no dispositivo.');
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const created = await criarPedido(input);
      const options = await obterOpcoes(created.requestId);
      setResult({ ...created, options });
      setSyncMessage('');
    } catch (cause) {
      if (!navigator.onLine || cause instanceof TypeError) {
        try {
          await enqueuePedido(input);
          await refreshPending();
          setSyncMessage('Pedido guardado no dispositivo — Pendente de sincronização.');
          return;
        } catch {
          setError('Não foi possível guardar o pedido no dispositivo.');
          return;
        }
      }
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

      <p
        className={online ? 'connection online' : 'connection offline'}
        data-testid="connection-status"
      >
        {online ? 'Ligação disponível' : 'Sem ligação — pedidos guardados no dispositivo'}
      </p>

      {pending.length > 0 || syncMessage ? (
        <section className="card" aria-live="polite" data-testid="offline-panel">
          <h2>Pedidos guardados localmente</h2>
          {syncMessage ? <p className="selected" data-testid="sync-message">{syncMessage}</p> : null}
          <ul className="options-list" data-testid="pending-requests">
            {pending.map((item) => (
              <li
                key={item.id}
                data-testid="pending-request"
                data-submission-id={item.input.submissionId}
              >
                <strong>{formatDateTime(item.input.consultationAt)}</strong>
                <span>Pendente de sincronização</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

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
                  onClick={() => selectCatalogDestination(destination.id)}
                  data-testid={`destination-${destination.id}`}
                >
                  {destination.name}
                </button>
              </li>
            ))}
            {showCustomOption ? (
              <li>
                <button
                  type="button"
                  className={destinationId === CUSTOM_DESTINATION_ID ? 'option selected' : 'option'}
                  onClick={selectCustomDestination}
                  data-testid="destination-custom"
                >
                  Usar «{customSearch}» como destino não listado
                </button>
              </li>
            ) : null}
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
          <label className="choice">
            <input
              type="checkbox"
              checked={recorrenciaSemanal}
              onChange={(event) => setRecorrenciaSemanal(event.target.checked)}
              data-testid="recorrencia-semanal"
            />
            Repetir semanalmente por 4 semanas
          </label>
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
          <label className="choice">
            <input
              type="checkbox"
              checked={publicSupportRequest}
              onChange={(event) => setPublicSupportRequest(event.target.checked)}
              data-testid="public-support-request"
            />
            {PUBLIC_SUPPORT_LABEL}
          </label>
        </fieldset>

        {error ? (
          <p role="alert" className="error" data-testid="validation-error">
            {error}
          </p>
        ) : null}
        {error.includes('Antecedência') ? (
          <p className="error" data-testid="ipss-contact">
            Para casos excecionais, contacte a IPSS:{' '}
            <a href={`tel:${IPSS_SUPPORT_PHONE.replace(/\s/g, '')}`} data-testid="ipss-phone">
              {IPSS_SUPPORT_PHONE}
            </a>
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
          {result.validationLabel ? (
            <p className="selected" data-testid="validation-label">
              {result.validationLabel}
            </p>
          ) : null}
          {result.publicSupportEligible ? (
            <>
              <p className="badge" data-testid="public-support-flag">
                Encaminhado para triagem prévia
              </p>
              <p className="success" data-testid="public-support-message">
                {result.publicSupportMessage}
              </p>
            </>
          ) : null}
          {result.requests && result.requests.length > 1 ? (
            <section className="series">
              <h3>Pedidos da série</h3>
              <p className="selected" data-testid="series-id">
                Série: {result.seriesId}
              </p>
              <ol className="options-list" data-testid="series-requests">
                {result.requests.map((request) => (
                  <li key={request.requestId} data-testid="series-request">
                    <strong data-testid="series-request-id">#{request.requestId}</strong>
                    <span data-testid="series-request-date">
                      {formatDateTime(request.consultationAt)}
                    </span>
                    <span>{request.status}</span>
                    {request.validationLabel ? (
                      <span className="selected" data-testid="series-validation-label">
                        {request.validationLabel}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
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
