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
          region: string | null; 
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
          region: string | null; 
          created_at?: string;
          updated_at?: string;
        };
      };
      audio_samples: {
        Row: {
          id: string;
          bird_id: string | null;
          audio_url: string;
          duration: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          bird_id?: string | null;
          audio_url: string;
          duration?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          bird_id?: string | null;
          audio_url?: string;
          duration?: number;
          created_at?: string;
        };
      };
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
    };
  };
}

export type Bird = Database['public']['Tables']['birds']['Row'];
export type AudioSample = Database['public']['Tables']['audio_samples']['Row'];
export type Detection = Database['public']['Tables']['detections']['Row'];
