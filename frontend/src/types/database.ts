// lib/database.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // Tabel birds (tidak berubah)
      birds: {
        Row: {
          id: string;
          name: string;
          scientific_name: string | null;
          description: string;
          habitat: string | null;
          category: string;
          image_url: string | null;
          region: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          scientific_name?: string | null;
          description: string;
          habitat?: string | null;
          category?: string;
          image_url?: string | null;
          region?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          scientific_name?: string | null;
          description?: string;
          habitat?: string | null;
          category?: string;
          image_url?: string | null;
          region?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Tabel audio_samples dengan tambahan kolom
      audio_samples: {
        Row: {
          id: string;
          bird_id: string | null;
          audio_url: string;
          duration: number;
          created_at: string;
          // Kolom baru
          user_id: string | null;          // ID user yang mengupload
          status: 'pending' | 'approved' | 'rejected' | null; // status persetujuan
          admin_notes: string | null;      // catatan admin (misal alasan ditolak)
          submitted_at: string | null;     // waktu upload (default now())
          approved_at: string | null;      // waktu disetujui
          reviewer_id: string | null;      // ID admin yang menyetujui/menolak
        };
        Insert: {
          id?: string;
          bird_id?: string | null;
          audio_url: string;
          duration?: number;
          created_at?: string;
          user_id?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | null;
          admin_notes?: string | null;
          submitted_at?: string | null;
          approved_at?: string | null;
          reviewer_id?: string | null;
        };
        Update: {
          id?: string;
          bird_id?: string | null;
          audio_url?: string;
          duration?: number;
          created_at?: string;
          user_id?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | null;
          admin_notes?: string | null;
          submitted_at?: string | null;
          approved_at?: string | null;
          reviewer_id?: string | null;
        };
      };

      // Tabel detections (tidak berubah)
      detections: {
        Row: {
          id: string;
          bird_id: string | null;
          confidence_score: number;
          audio_file: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          bird_id?: string | null;
          confidence_score: number;
          audio_file: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          bird_id?: string | null;
          confidence_score?: number;
          audio_file?: string;
          created_at?: string;
        };
      };

      // Tabel profiles untuk data user (opsional tapi sangat disarankan)
      profiles: {
        Row: {
          id: string;            // merujuk ke auth.users(id)
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          role: 'admin' | 'user' | null; // untuk membedakan admin
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'user' | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'user' | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Tipe yang diekspor
export type Bird = Database['public']['Tables']['birds']['Row'];
export type AudioSample = Database['public']['Tables']['audio_samples']['Row'];
export type Detection = Database['public']['Tables']['detections']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];