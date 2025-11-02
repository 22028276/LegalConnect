export interface VerificationRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  years_of_experience: number;
  current_job_position: string;
  rejection_reason: string | null;
  reviewed_by_admin_id: string | null;
  reviewed_at: string | null;
  create_at: string;
  updated_at: string;
  identity_card_front_url: string;
  identity_card_back_url: string;
  portrait_url: string;
  law_certificate_url: string;
  bachelor_degree_url: string;
}

export interface VerificationRequestWithUser extends VerificationRequest {
  id: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  address?: string;
}
