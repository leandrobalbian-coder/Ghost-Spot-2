export type GhostMessage = {
  role: "user" | "bot";
  content: string;
  timestamp: string;
};

export type SuggestedSpot = {
  spot_id: string;
  title: string;
  sector: string;
  location: string;
  price_mxn: number;
  photo_url: string | null;
};

export type Ghost = {
  conv_id: string;
  lead_phone_number: string;
  conv_start_date: string;
  conv_end_date: string;
  lead_name: string | null;
  lead_last_name: string | null;
  lead_email: string | null;
  spot_sector: string | null;
  profile_state: string | null;
  profile_size: string | null;
  profile_budget: string | null;
  last_user_message: string | null;
  messages_count: number;
  user_messages_count: number;
  spot2_links_count: number;
  intent_score: number;
  days_since: number;
  messages: GhostMessage[];
  spots_suggested: SuggestedSpot[];
};

export type Metrics = {
  total_ghosts: number;
  revenue_lost_mxn: number;
  since_date: string;
  as_of_date: string;
  calculation_breakdown: {
    ghosts_count: number;
    lead_to_appointment_rate: number;
    appointment_to_contract_rate: number;
    average_commission_mxn: number;
  };
};

export type WeeklyBreakdown = {
  iso_week: number;
  week_start: string;
  ghosts: number;
  total_convs: number;
  is_post_break: boolean;
};
