// ─── Supabase table types for OurTable ───────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string | null;
  couple_id: string | null;
  created_at: string;
}

export type PlaceSource = 'manual' | 'maps' | 'instagram';

export interface Place {
  id: string;
  couple_id: string;
  added_by: string;
  name: string;
  notes: string | null;
  url: string | null;
  source: PlaceSource;
  maps_url: string | null;
  latitude: number | null;
  longitude: number | null;
  photo_url: string | null;
  rating: number | null;
  address: string | null;
  visited: boolean;
  user_rating: number | null;
  created_at: string;
}
