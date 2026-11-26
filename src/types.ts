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
  seriesId: string;
  customDestination: boolean;
  validationLabel: string | null;
  publicSupportEligible: boolean;
  publicSupportMessage: string | null;
  notification: NotificationInfo | null;
  options: TransportOption[];
  selection: SelectionInfo | null;
  trips: TripInfo[];
  requests?: PedidoResponse[];
}
