// components/admin/BirdManager/BirdService.ts
import { supabase } from '../../../lib/supabase';
import { Bird } from '../../../types/database';

export class BirdService {
  static async fetchAll(): Promise<Bird[]> {
    const { data, error } = await supabase
      .from('birds')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async create(birdData: Partial<Bird>): Promise<void> {
    const { error } = await supabase.from('birds').insert([birdData]);
    if (error) throw error;
  }

  static async update(id: string, birdData: Partial<Bird>): Promise<void> {
    const { error } = await supabase
      .from('birds')
      .update({ ...birdData, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  }

  static async delete(id: string): Promise<void> {
    // Get bird data first for image deletion
    const { data: bird } = await supabase
      .from('birds')
      .select('image_url')
      .eq('id', id)
      .single();
    
    // Delete image from storage if exists
    if (bird?.image_url?.includes('/bird-images/')) {
      const filePath = bird.image_url.split('/bird-images/')[1];
      if (filePath) {
        await supabase.storage.from('bird-images').remove([filePath]);
      }
    }
    
    // Delete the bird
    const { error } = await supabase.from('birds').delete().eq('id', id);
    if (error) throw error;
  }

  static async uploadImage(file: File): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Anda harus login terlebih dahulu');

    const fileName = `birds/${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage
      .from('bird-images')
      .upload(fileName, file, { 
        cacheControl: '3600', 
        contentType: file.type, 
        upsert: false 
      });
    
    if (error) throw error;
    return supabase.storage.from('bird-images').getPublicUrl(fileName).data.publicUrl;
  }
}