import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PetPhoto } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Trash2, Image, X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PetPhotosProps {
  petId: string;
  petName: string;
}

export function PetPhotos({ petId, petName }: PetPhotosProps) {
  const [photos, setPhotos] = useState<PetPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PetPhoto | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, [petId]);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('pet_photos')
        .select('*')
        .eq('pet_id', petId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data as PetPhoto[]);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPhoto = async () => {
    if (!imageUrl.trim()) {
      toast.error('Ingresa la URL de la imagen');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('pet_photos').insert({
        pet_id: petId,
        image_url: imageUrl.trim(),
        notes: notes.trim() || null,
      });

      if (error) throw error;
      toast.success('Foto agregada');
      setIsDialogOpen(false);
      setImageUrl('');
      setNotes('');
      fetchPhotos();
    } catch (error) {
      console.error('Error adding photo:', error);
      toast.error('Error al agregar la foto');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta foto?')) return;

    try {
      const { error } = await supabase
        .from('pet_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;
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
          Fotos
        </h3>
        <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Agregar</span>
        </Button>
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
            onClick={() => setIsDialogOpen(true)}
          >
            Agregar primera foto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-muted"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo.image_url}
                alt={`Foto de ${petName}`}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
            </div>
          ))}
        </div>
      )}

      {/* Add Photo Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar foto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="image_url">URL de la imagen *</Label>
              <Input
                id="image_url"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Pega la URL de una imagen de {petName}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo_notes">Notas (opcional)</Label>
              <Input
                id="photo_notes"
                placeholder="Ej: En el parque, Navidad 2024"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {imageUrl && (
              <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="hero" onClick={handleAddPhoto} disabled={isSaving}>
                {isSaving ? 'Guardando...' : 'Agregar foto'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Viewer Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
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
                className="w-full max-h-[70vh] object-contain bg-black"
              />
              <div className="p-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {selectedPhoto.notes || 'Sin descripción'}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => handleDeletePhoto(selectedPhoto.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
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
