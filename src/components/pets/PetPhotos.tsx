import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Trash2, Image, X, Loader2, Star, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PetPhoto {
  id: string;
  pet_id: string;
  image_url: string;
  notes: string | null;
  is_main: boolean;
  sort_order: number;
  created_at: string;
}

interface PetPhotosProps {
  petId: string;
  petName: string;
}

const MAX_PHOTOS = 4;

export function PetPhotos({ petId, petName }: PetPhotosProps) {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<PetPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PetPhoto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPhotos();
  }, [petId]);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('pet_photos')
        .select('*')
        .eq('pet_id', petId)
        .order('is_main', { ascending: false })
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPhotos(data as PetPhoto[]);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (photos.length >= MAX_PHOTOS) {
      toast.error(`Solo puedes tener ${MAX_PHOTOS} fotos por mascota`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${petId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('mascotas')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('mascotas')
        .getPublicUrl(fileName);

      // Insert into pet_photos
      const isMain = photos.length === 0; // First photo is main by default
      const { error: insertError } = await supabase.from('pet_photos').insert({
        pet_id: petId,
        image_url: urlData.publicUrl,
        is_main: isMain,
        sort_order: photos.length,
      });

      if (insertError) throw insertError;

      toast.success('Foto agregada');
      fetchPhotos();
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Error al subir la foto');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSetMain = async (photoId: string) => {
    try {
      // First, unset all as main
      await supabase
        .from('pet_photos')
        .update({ is_main: false })
        .eq('pet_id', petId);

      // Then set the selected one as main
      const { error } = await supabase
        .from('pet_photos')
        .update({ is_main: true })
        .eq('id', photoId);

      if (error) throw error;
      toast.success('Foto principal actualizada');
      fetchPhotos();
    } catch (error) {
      console.error('Error setting main photo:', error);
      toast.error('Error al actualizar la foto principal');
    }
  };

  const handleDeletePhoto = async (photo: PetPhoto) => {
    if (!confirm('¿Estás seguro de eliminar esta foto?')) return;

    try {
      // Extract file path from URL
      const url = new URL(photo.image_url);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.findIndex(p => p === 'mascotas');
      if (bucketIndex !== -1) {
        const filePath = pathParts.slice(bucketIndex + 1).join('/');
        await supabase.storage.from('mascotas').remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from('pet_photos')
        .delete()
        .eq('id', photo.id);

      if (error) throw error;

      // If deleted photo was main, set first remaining as main
      if (photo.is_main) {
        const remaining = photos.filter(p => p.id !== photo.id);
        if (remaining.length > 0) {
          await supabase
            .from('pet_photos')
            .update({ is_main: true })
            .eq('id', remaining[0].id);
        }
      }

      toast.success('Foto eliminada');
      setSelectedPhoto(null);
      fetchPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Error al eliminar la foto');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Image className="h-5 w-5 text-primary" />
          Fotos ({photos.length}/{MAX_PHOTOS})
        </h3>
        {photos.length < MAX_PHOTOS && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span className="ml-2 hidden sm:inline">Subir foto</span>
            </Button>
          </>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
          <Image className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No hay fotos de {petName}
          </p>
          <Button
            variant="link"
            size="sm"
            className="mt-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            Agregar primera foto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-muted"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo.image_url}
                alt={`Foto de ${petName}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              {photo.is_main && (
                <div className="absolute left-1 top-1 rounded-full bg-primary p-1">
                  <Star className="h-3 w-3 fill-primary-foreground text-primary-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
            </div>
          ))}
        </div>
      )}

      {/* Photo Viewer Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-2xl overflow-hidden p-0">
          {selectedPhoto && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 z-10 bg-background/80 backdrop-blur"
                onClick={() => setSelectedPhoto(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              <img
                src={selectedPhoto.image_url}
                alt={`Foto de ${petName}`}
                className="max-h-[70vh] w-full bg-black object-contain"
              />
              <div className="flex items-center justify-between gap-2 p-4">
                <div className="flex items-center gap-2">
                  {selectedPhoto.is_main ? (
                    <span className="flex items-center gap-1 text-sm text-primary">
                      <Star className="h-4 w-4 fill-primary" />
                      Foto principal
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetMain(selectedPhoto.id)}
                    >
                      <Star className="mr-1 h-4 w-4" />
                      Establecer como principal
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => handleDeletePhoto(selectedPhoto)}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
