import { useState } from 'react';
import type { FormEvent } from 'react';
import { inscreverUtente, pesquisarUtentes, registrarPedidoTelefonico } from './api';
import {
  ACUTE_MEDICAL_SYMPTOMS_LABEL,
  ADVANCE_VIOLATION_ALERT,
  DESTINATIONS,
  EMERGENCY_112_MESSAGE,
  getCompatibleOptions,
  MOBILITY_NEEDS,
  PUBLIC_SUPPORT_LABEL,
  PUBLIC_SUPPORT_MESSAGE
} from '../shared/rules.js';
import type {
  PedidoResponse,
  UtenteCreatedResponse,
  UtenteResponse
} from './types';

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
  const [acuteMedicalEmergency, setAcuteMedicalEmergency] = useState(false);
  const [emergency112, setEmergency112] = useState(false);
  const [showInscricao, setShowInscricao] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newNeeds, setNewNeeds] = useState<string[]>([]);
  const [inscricaoResult, setInscricaoResult] = useState<UtenteCreatedResponse | null>(null);
  const [inscricaoError, setInscricaoError] = useState('');
  const [inscrevendo, setInscrevendo] = useState(false);
  const [urgencyException, setUrgencyException] = useState(false);
  const [justification, setJustification] = useState('');
  const [technician, setTechnician] = useState('Técnico da IPSS');
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

  function toggleNewNeed(id: string) {
    setNewNeeds((current) =>
      current.includes(id) ? current.filter((need) => need !== id) : [...current, id]
    );
  }

  function handleAcuteMedicalSymptoms(checked: boolean) {
    setAcuteMedicalEmergency(checked);
    if (checked) {
      setEmergency112(true);
      setError('');
      setResult(null);
    }
  }

  async function handleInscricao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInscricaoError('');
    if (!newName.trim() || newPhone.trim().length < 9 || newNeeds.length === 0) {
      setInscricaoError('Preencha o nome, o telemóvel e pelo menos uma necessidade de mobilidade.');
      return;
    }

    setInscrevendo(true);
    try {
      const created = await inscreverUtente({
        name: newName.trim(),
        phone: newPhone.trim(),
        mobilityNeeds: newNeeds
      });
      setInscricaoResult(created);
      setUtente(created);
      setQuery(created.cardId);
      setOptionId('');
      setResult(null);
      setShowInscricao(false);
    } catch (cause) {
      setInscricaoError(
        cause instanceof Error ? cause.message : 'Não foi possível inscrever o utente.'
      );
    } finally {
      setInscrevendo(false);
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
    if (urgencyException && justification.trim().length < 10) {
      setError('Introduza a fundamentação da exceção urgente (mínimo 10 caracteres).');
      return;
    }

    setLoading(true);
    try {
      const created = await registrarPedidoTelefonico({
        cardId: utente.cardId,
        destinationId,
        consultationAt,
        optionId,
        publicSupportRequest,
        acuteMedicalEmergency,
        urgencyException: urgencyException
          ? {
              authorized: true,
              justification: justification.trim(),
              technician: technician.trim()
            }
          : undefined
      });
      setResult(created);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Não foi possível registar o pedido.';
      if (message.includes('Antecedência mínima')) {
        setError(ADVANCE_VIOLATION_ALERT);
      } else if (message.includes('112')) {
        setAcuteMedicalEmergency(true);
        setEmergency112(true);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  const options = utente ? getCompatibleOptions(utente.mobilityNeeds) : [];

  if (emergency112) {
    return (
      <section
        className="emergency-overlay"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="emergencia-112-title"
        aria-describedby="emergencia-112-message"
        data-testid="emergencia-112"
      >
        <div className="emergency-panel">
          <h1 id="emergencia-112-title">Emergência médica — atendimento interrompido</h1>
          <p className="emergency-message" id="emergencia-112-message" data-testid="emergencia-112-message">
            {EMERGENCY_112_MESSAGE}
          </p>
          <p>Não foi criado nenhum pedido MobiCare.</p>
          <a href="tel:112" className="emergency-call" data-testid="emergencia-112-call">
            Ligar para 112
          </a>
          <button
            type="button"
            className="option"
            onClick={() => {
              setEmergency112(false);
              setAcuteMedicalEmergency(false);
            }}
            data-testid="emergencia-112-close"
          >
            Voltar ao atendimento telefónico
          </button>
        </div>
      </section>
    );
  }

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

      <button
        type="button"
        className="option"
        onClick={() => setShowInscricao((current) => !current)}
        data-testid="abrir-inscricao"
      >
        {showInscricao ? 'Fechar inscrição' : 'Inscrever novo utente'}
      </button>

      {showInscricao ? (
        <form onSubmit={handleInscricao} className="card">
          <fieldset>
            <legend>Inscrição inicial (dados essenciais)</legend>
            <input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Nome do utente"
              aria-label="Nome do utente"
              data-testid="inscricao-name"
            />
            <input
              value={newPhone}
              onChange={(event) => setNewPhone(event.target.value)}
              placeholder="Telemóvel"
              aria-label="Telemóvel do utente"
              data-testid="inscricao-phone"
            />
            <div className="needs">
              {MOBILITY_NEEDS.map((need) => (
                <label className="choice" key={need.id}>
                  <input
                    type="checkbox"
                    checked={newNeeds.includes(need.id)}
                    onChange={() => toggleNewNeed(need.id)}
                    data-testid={`inscricao-need-${need.id}`}
                  />
                  {need.label}
                </label>
              ))}
            </div>
          </fieldset>
          {inscricaoError ? (
            <p role="alert" className="error" data-testid="inscricao-error">
              {inscricaoError}
            </p>
          ) : null}
          <button type="submit" className="primary" disabled={inscrevendo} data-testid="inscricao-submit">
            {inscrevendo ? 'A inscrever…' : 'Inscrever e emitir cartão'}
          </button>
        </form>
      ) : null}

      {inscricaoResult ? (
        <section className="card result" data-testid="inscricao-result">
          <h2>Utente inscrito</h2>
          <p className="success" data-testid="inscricao-card">
            Cartão #{inscricaoResult.cardId} ativo
          </p>
          <p data-testid="inscricao-name-result">{inscricaoResult.name}</p>
          <p data-testid="inscricao-profile-result">{inscricaoResult.mobilityProfile}</p>
        </section>
      ) : null}

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
              <legend>Triagem de sintomas (BR-12)</legend>
              <label className="choice">
                <input
                  type="checkbox"
                  checked={acuteMedicalEmergency}
                  onChange={(event) => handleAcuteMedicalSymptoms(event.target.checked)}
                  data-testid="telefone-sintomas-urgencia"
                />
                {ACUTE_MEDICAL_SYMPTOMS_LABEL}
              </label>
            </fieldset>

            <fieldset>
              <legend>Exceção à antecedência mínima (BR-01)</legend>
              <label className="choice">
                <input
                  type="checkbox"
                  checked={urgencyException}
                  onChange={(event) => setUrgencyException(event.target.checked)}
                  data-testid="telefone-urgencia"
                />
                Exceção urgente autorizada pela coordenação
              </label>
              {urgencyException ? (
                <>
                  <input
                    value={technician}
                    onChange={(event) => setTechnician(event.target.value)}
                    aria-label="Técnico autorizado"
                    data-testid="telefone-tecnico"
                  />
                  <textarea
                    value={justification}
                    onChange={(event) => setJustification(event.target.value)}
                    placeholder="Fundamentação da exceção"
                    aria-label="Fundamentação da exceção"
                    data-testid="telefone-justificacao"
                  />
                </>
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
            {error === ADVANCE_VIOLATION_ALERT ? (
              <>
                <p role="alert" className="error" data-testid="telefone-bloqueio-antecedencia">
                  {ADVANCE_VIOLATION_ALERT}
                </p>
                <p data-testid="telefone-bloqueio-antecedencia-acao">
                  Ajuste a data ou declare uma exceção autorizada.
                </p>
              </>
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
            <dt>Validação</dt>
            <dd data-testid="telefone-validation-label">{result.validationLabel}</dd>
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
          {result.audit.length > 0 ? (
            <section className="card" data-testid="telefone-audit">
              <h3>Auditoria da exceção</h3>
              {result.audit.map((entry) => (
                <p key={`${entry.action}-${entry.createdAt}`} data-testid="telefone-audit-entry">
                  {entry.actor} — {entry.action}: {entry.justification}
                </p>
              ))}
            </section>
          ) : null}
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
