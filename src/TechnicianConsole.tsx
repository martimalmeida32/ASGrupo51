import { useState } from 'react';
import type { FormEvent } from 'react';
import { pesquisarUtentes, registrarPedidoTelefonico } from './api';
import {
  DESTINATIONS,
  getCompatibleOptions,
  PUBLIC_SUPPORT_LABEL,
  PUBLIC_SUPPORT_MESSAGE
} from '../shared/rules.js';
import type { PedidoResponse, UtenteResponse } from './types';

function formatDateTime(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(iso)) return iso;
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)} às ${iso.slice(11, 16)}`;
}

export default function TechnicianConsole() {
  const [query, setQuery] = useState('');
  const [utente, setUtente] = useState<UtenteResponse | null>(null);
  const [destinationId, setDestinationId] = useState('');
  const [consultationAt, setConsultationAt] = useState('');
  const [optionId, setOptionId] = useState('');
  const [publicSupportRequest, setPublicSupportRequest] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PedidoResponse | null>(null);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchError('');
    setSearching(true);
    try {
      const found = await pesquisarUtentes(query);
      if (found.length === 0) {
        setUtente(null);
        setSearchError('Não foi encontrado nenhum utente com esse cartão ou telefone.');
        return;
      }
      const selected = found[0];
      setUtente(selected);
      setOptionId('');
      setResult(null);
      setQuery(selected.cardId);
    } catch (cause) {
      setSearchError(cause instanceof Error ? cause.message : 'Não foi possível pesquisar o utente.');
    } finally {
      setSearching(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!utente) {
      setError('Identifique primeiro o utente.');
      return;
    }
    if (!destinationId || !consultationAt || !optionId) {
      setError('Preencha o destino, a data da consulta e a opção de transporte.');
      return;
    }

    setLoading(true);
    try {
      const created = await registrarPedidoTelefonico({
        cardId: utente.cardId,
        destinationId,
        consultationAt,
        optionId,
        publicSupportRequest
      });
      setResult(created);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível registar o pedido.');
    } finally {
      setLoading(false);
    }
  }

  const options = utente ? getCompatibleOptions(utente.mobilityNeeds) : [];

  return (
    <>
      <h1>Consola de atendimento telefónico</h1>
      <p className="lead">Identifique o utente registado e confirme o pedido por SMS.</p>

      <form onSubmit={handleSearch} className="card">
        <fieldset>
          <legend>Identificação do utente</legend>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cartão MobiCare ou telemóvel"
            aria-label="Pesquisar utente por cartão ou telefone"
            data-testid="utente-search"
          />
          <button type="submit" className="primary" disabled={searching} data-testid="utente-search-button">
            {searching ? 'A pesquisar…' : 'Pesquisar utente'}
          </button>
        </fieldset>
        {searchError ? (
          <p role="alert" className="error" data-testid="utente-search-error">
            {searchError}
          </p>
        ) : null}
      </form>

      {utente ? (
        <>
          <section className="card result" data-testid="utente-result">
            <h2>Utente identificado</h2>
            <dl>
              <dt>Nome</dt>
              <dd data-testid="telefone-name">{utente.name}</dd>
              <dt>Cartão MobiCare</dt>
              <dd data-testid="telefone-card">#{utente.cardId}</dd>
              <dt>Telemóvel</dt>
              <dd data-testid="telefone-phone">{utente.phone}</dd>
              <dt>Perfil de mobilidade</dt>
              <dd data-testid="telefone-mobility-profile">{utente.mobilityProfile}</dd>
            </dl>
          </section>

          <form onSubmit={handleSubmit} className="card">
            <fieldset>
              <legend>Destino e data da consulta</legend>
              <select
                value={destinationId}
                onChange={(event) => setDestinationId(event.target.value)}
                data-testid="telefone-destination"
              >
                <option value="">Selecione a unidade de saúde</option>
                {DESTINATIONS.map((destination) => (
                  <option key={destination.id} value={destination.id}>
                    {destination.name}
                  </option>
                ))}
              </select>
              <input
                type="datetime-local"
                value={consultationAt}
                onChange={(event) => setConsultationAt(event.target.value)}
                data-testid="telefone-consultation-at"
              />
            </fieldset>

            <fieldset>
              <legend>Aviso de apoio público (BR-10)</legend>
              <label className="choice">
                <input
                  type="checkbox"
                  checked={publicSupportRequest}
                  onChange={(event) => setPublicSupportRequest(event.target.checked)}
                  data-testid="telefone-public-support"
                />
                {PUBLIC_SUPPORT_LABEL}
              </label>
              {publicSupportRequest ? (
                <p className="success" data-testid="telefone-public-support-message">
                  Aviso transmitido verbalmente: {PUBLIC_SUPPORT_MESSAGE}
                </p>
              ) : null}
            </fieldset>

            <fieldset>
              <legend>Opções compatíveis (usando o perfil guardado)</legend>
              <ol className="options-list" data-testid="telefone-options">
                {options.map((option) => (
                  <li key={option.id} data-testid={`telefone-option-${option.id}`}>
                    <input
                      type="radio"
                      name="telefone-transport-option"
                      value={option.id}
                      checked={optionId === option.id}
                      onChange={() => setOptionId(option.id)}
                      data-testid={`select-telefone-${option.id}`}
                    />
                    <strong>{option.label}</strong>
                    {option.recommended ? <span className="badge">Recomendado</span> : null}
                    <span className="cost">Custo para o utente: {option.cost}</span>
                  </li>
                ))}
              </ol>
            </fieldset>

            {error ? (
              <p role="alert" className="error" data-testid="telefone-error">
                {error}
              </p>
            ) : null}

            <button type="submit" className="primary" disabled={loading} data-testid="telefone-confirm">
              {loading ? 'A confirmar…' : 'Confirmar Pedido'}
            </button>
          </form>
        </>
      ) : null}

      {result ? (
        <section className="card result" data-testid="telefone-result">
          <h2>Pedido telefónico confirmado</h2>
          <dl>
            <dt>Número do pedido</dt>
            <dd data-testid="telefone-request-id">#{result.requestId}</dd>
            <dt>Estado</dt>
            <dd data-testid="telefone-request-status">{result.status}</dd>
            <dt>Perfil de mobilidade</dt>
            <dd data-testid="telefone-request-profile">{result.mobilityProfile}</dd>
          </dl>
          <ul className="options-list" data-testid="telefone-trips">
            {result.trips.map((trip) => (
              <li key={trip.tripId} data-testid={`telefone-trip-${trip.direction.toLowerCase()}`}>
                <strong>#{trip.tripId}</strong>
                <span>{trip.direction === 'OUTBOUND' ? 'Ida' : 'Regresso'}</span>
                <span>{trip.status}</span>
                {trip.pickupAt ? <span>Recolha: {formatDateTime(trip.pickupAt)}</span> : null}
              </li>
            ))}
          </ul>
          {result.smsConfirmation ? (
            <p className="success" data-testid="telefone-sms">
              SMS enviado para {result.smsConfirmation.recipient} — {result.smsConfirmation.message}
            </p>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
