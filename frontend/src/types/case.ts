export type CaseStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type BookingRequestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface Case {
  id: string;
  booking_request_id: string;
  lawyer_id: string;
  client_id: string;
  title: string;
  description: string;
  state: CaseStatus;
  attachment_urls: string[];
  lawyer_note: string;
  client_note: string;
  started_at: string;
  ending_time: string;
  create_at: string;
  updated_at: string;
}

export interface BookingRequest {
  id: string;
  client_id: string;
  lawyer_id: string;
  title: string;
  short_description: string;
  desired_start_time: string;
  desired_end_time: string;
  status: BookingRequestStatus;
  decision_at: string | null;
  create_at: string;
  updated_at: string;
}

export interface CaseState {
  cases: Case[];
  pendingCase: BookingRequest[];
  isLoading: boolean;
  error: string | null;
  currentCase: Case | null;
}
