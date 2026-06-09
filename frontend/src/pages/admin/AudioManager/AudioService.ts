// components/admin/AudioManager/AudioService.ts
import { supabase } from '../../../lib/supabase';
import { AudioSample } from '../../../types/database';

export class AudioService {
  static async fetchByBirdId(birdId: string): Promise<AudioSample[]> {
    try {
      const { data, error } = await supabase
        .from('audio_samples')
        .select('*')
        .eq('bird_id', birdId)
        .order('created_at', { ascending: true });
      
      if (error) throw new Error(`Gagal memuat data suara: ${error.message}`);
      return data || [];
    } catch (error) {
      console.error('Error in fetchByBirdId:', error);
      throw error;
    }
  }

  static async add(birdId: string, audioUrl: string, duration: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('audio_samples')
        .insert([{
          bird_id: birdId,
          audio_url: audioUrl,
          duration: duration,
        }]);
      
      if (error) throw new Error(`Gagal menyimpan suara: ${error.message}`);
    } catch (error) {
      console.error('Error in add:', error);
      throw error;
    }
  }

  static async delete(audioId: string, audioUrl: string): Promise<void> {
    try {
      // Delete from storage
      if (audioUrl.includes('/bird-audio/')) {
        const filePath = audioUrl.split('/bird-audio/')[1];
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from('bird-audio')
            .remove([filePath]);
          
          if (storageError) throw new Error(`Gagal menghapus file audio: ${storageError.message}`);
        }
      }
      
      // Delete from database
      const { error } = await supabase
        .from('audio_samples')
        .delete()
        .eq('id', audioId);
      
      if (error) throw new Error(`Gagal menghapus data suara: ${error.message}`);
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    }
  }

  static async deleteByBirdId(birdId: string): Promise<void> {
    try {
      // Get all audio files first
      const { data: audioData, error: fetchError } = await supabase
        .from('audio_samples')
        .select('audio_url')
        .eq('bird_id', birdId);
      
      if (fetchError) throw new Error(`Gagal mengambil data suara: ${fetchError.message}`);
      
      if (audioData && audioData.length > 0) {
        // Delete from storage
        for (const audio of audioData) {
          if (audio.audio_url?.includes('/bird-audio/')) {
            const filePath = audio.audio_url.split('/bird-audio/')[1];
            if (filePath) {
              const { error: storageError } = await supabase.storage
                .from('bird-audio')
                .remove([filePath]);
              
              if (storageError) console.error('Error deleting audio file:', storageError);
            }
          }
        }
        
        // Delete from database
        const { error: deleteError } = await supabase
          .from('audio_samples')
          .delete()
          .eq('bird_id', birdId);
        
        if (deleteError) throw new Error(`Gagal menghapus data suara: ${deleteError.message}`);
      }
    } catch (error) {
      console.error('Error in deleteByBirdId:', error);
      throw error;
    }
  }

  static async uploadAudio(file: File, birdId: string): Promise<string> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Anda harus login terlebih dahulu');

      // Validate file before upload
      if (!file.type.startsWith('audio/')) {
        throw new Error('File yang dipilih bukan file audio');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `audio/${birdId}/${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('bird-audio')
        .upload(fileName, file, { 
          cacheControl: '3600', 
          contentType: file.type, 
          upsert: false 
        });
      
      if (error) throw new Error(`Gagal upload file: ${error.message}`);
      
      const { data: { publicUrl } } = supabase.storage
        .from('bird-audio')
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (error) {
      console.error('Error in uploadAudio:', error);
      throw error;
    }
  }

  static getDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const objectUrl = URL.createObjectURL(file);
      
      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(objectUrl);
        resolve(Math.round(audio.duration));
      });
      
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Gagal membaca durasi audio'));
      });
      
      audio.src = objectUrl;
    });
  }
}