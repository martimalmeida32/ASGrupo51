export type RequesterType = 'proprio-utente' | 'familiar-cuidador';

export interface CreatePedidoInput {
  submissionId: string;
  requesterType: RequesterType;
  userId: string;
  destinationId: string;
  consultationAt: string;
  mobilityNeeds: string[];
}

export interface TransportOption {
  id: string;
  label: string;
  cost: string;
  recommended: boolean;
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
  notification: NotificationInfo | null;
  options: TransportOption[];
}
