import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Trash2, Image, X, Loader2, Star, Upload, GripVertical } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_main: boolean;
  sort_order: number;
  created_at: string;
}

interface ProductImagesProps {
  productId: string;
  productName: string;
  onMainImageChange?: (url: string | null) => void;
}

const MAX_IMAGES = 4;

export function ProductImages({ productId, productName, onMainImageChange }: ProductImagesProps) {
  const { user } = useAuth();
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, [productId]);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('is_main', { ascending: false })
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setImages(data as ProductImage[]);
      
      // Notify parent of main image
      const mainImage = data?.find(img => img.is_main) || data?.[0];
      onMainImageChange?.(mainImage?.image_url || null);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (images.length >= MAX_IMAGES) {
      toast.error(`Solo puedes tener ${MAX_IMAGES} imágenes por producto`);
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
      const fileName = `${user.id}/${productId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('productos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('productos')
        .getPublicUrl(fileName);

      // Insert into product_images
      const isMain = images.length === 0;
      const { error: insertError } = await supabase.from('product_images').insert({
        product_id: productId,
        image_url: urlData.publicUrl,
        is_main: isMain,
        sort_order: images.length,
      });

      if (insertError) throw insertError;

      toast.success('Imagen agregada');
      fetchImages();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSetMain = async (imageId: string) => {
    try {
      await supabase
        .from('product_images')
        .update({ is_main: false })
        .eq('product_id', productId);

      const { error } = await supabase
        .from('product_images')
        .update({ is_main: true })
        .eq('id', imageId);

      if (error) throw error;
      toast.success('Imagen principal actualizada');
      fetchImages();
    } catch (error) {
      console.error('Error setting main image:', error);
      toast.error('Error al actualizar la imagen principal');
    }
  };

  const handleDeleteImage = async (image: ProductImage) => {
    if (!confirm('¿Estás seguro de eliminar esta imagen?')) return;

    try {
      // Extract file path from URL
      const url = new URL(image.image_url);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.findIndex(p => p === 'productos');
      if (bucketIndex !== -1) {
        const filePath = pathParts.slice(bucketIndex + 1).join('/');
        await supabase.storage.from('productos').remove([filePath]);
      }

      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', image.id);

      if (error) throw error;

      if (image.is_main) {
        const remaining = images.filter(i => i.id !== image.id);
        if (remaining.length > 0) {
          await supabase
            .from('product_images')
            .update({ is_main: true })
            .eq('id', remaining[0].id);
        }
      }

      toast.success('Imagen eliminada');
      setSelectedImage(null);
      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Error al eliminar la imagen');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Imágenes ({images.length}/{MAX_IMAGES})
        </span>
        {images.length < MAX_IMAGES && (
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
              type="button"
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
              <span className="ml-1">Subir</span>
            </Button>
          </>
        )}
      </div>

      {images.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center">
          <Image className="mx-auto mb-1 h-6 w-6 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Sin imágenes</p>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="mt-1 h-auto p-0 text-xs"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            Agregar primera imagen
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-muted"
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.image_url}
                alt={productName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              {image.is_main && (
                <div className="absolute left-0.5 top-0.5 rounded-full bg-primary p-0.5">
                  <Star className="h-2.5 w-2.5 fill-primary-foreground text-primary-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-lg overflow-hidden p-0">
          {selectedImage && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 z-10 bg-background/80 backdrop-blur"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              <img
                src={selectedImage.image_url}
                alt={productName}
                className="max-h-[50vh] w-full bg-black object-contain"
              />
              <div className="flex items-center justify-between gap-2 p-3">
                <div>
                  {selectedImage.is_main ? (
                    <span className="flex items-center gap-1 text-sm text-primary">
                      <Star className="h-4 w-4 fill-primary" />
                      Principal
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetMain(selectedImage.id)}
                    >
                      <Star className="mr-1 h-3 w-3" />
                      Hacer principal
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => handleDeleteImage(selectedImage)}
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
