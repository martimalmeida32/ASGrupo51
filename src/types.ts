export type RequesterType = 'proprio-utente' | 'familiar-cuidador';

export interface CreatePedidoInput {
  submissionId: string;
  requesterType: RequesterType;
  userId: string;
  destinationId: string;
  consultationAt: string;
  mobilityNeeds: string[];
  recorrenciaSemanal?: boolean;
  customDestination?: string;
  publicSupportRequest?: boolean;
}

export interface UtenteResponse {
  cardId: string;
  name: string;
  phone: string;
  mobilityNeeds: string[];
  mobilityProfile: string;
}

export interface UtenteRegistrationInput {
  name: string;
  phone: string;
  mobilityNeeds: string[];
}

export interface UtenteCreatedResponse extends UtenteResponse {
  active: boolean;
  createdAt: string;
}

export interface UrgencyExceptionInput {
  authorized: true;
  justification: string;
  technician?: string;
}

export interface AuditEntry {
  cardId: string;
  actor: string;
  action: string;
  justification: string;
  createdAt: string;
}

export interface CreateTelephonePedidoInput {
  cardId: string;
  destinationId: string;
  consultationAt: string;
  optionId: string;
  publicSupportRequest?: boolean;
  acuteMedicalEmergency?: boolean;
  urgencyException?: UrgencyExceptionInput;
}

export interface TransportOption {
  id: string;
  label: string;
  cost: string;
  recommended: boolean;
}

export interface SelectionInfo {
  optionId: string;
  confirmedAt: string;
}

export interface TripInfo {
  tripId: string;
  direction: 'OUTBOUND' | 'RETURN';
  transportOptionId: string;
  status: string;
  pickupAt: string | null;
  triggeredAt: string | null;
  createdAt: string;
}

export interface NotificationInfo {
  recipient: string;
  message: string;
  sentAt: string;
}

export interface PedidoResponse {
  requestId: string;
  status: string;
  mobilityProfile: string;
  destination: string;
  consultationAt: string;
  plannedEnd: string;
  seriesId: string;
  customDestination: boolean;
  validationLabel: string | null;
  publicSupportEligible: boolean;
  publicSupportMessage: string | null;
  notification: NotificationInfo | null;
  notifications: NotificationInfo[];
  smsConfirmation: NotificationInfo | null;
  audit: AuditEntry[];
  options: TransportOption[];
  selection: SelectionInfo | null;
  trips: TripInfo[];
  requests?: PedidoResponse[];
}
