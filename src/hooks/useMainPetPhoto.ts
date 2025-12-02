import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MainPhoto {
  url: string | null;
  dominantColor: string;
  accentColor: string;
}

export function useMainPetPhoto(petId: string | undefined) {
  const [mainPhoto, setMainPhoto] = useState<MainPhoto>({
    url: null,
    dominantColor: 'hsl(var(--primary))',
    accentColor: 'hsl(var(--primary) / 0.2)',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!petId) {
      setMainPhoto({
        url: null,
        dominantColor: 'hsl(var(--primary))',
        accentColor: 'hsl(var(--primary) / 0.2)',
      });
      setIsLoading(false);
      return;
    }

    fetchMainPhoto();
  }, [petId]);

  const fetchMainPhoto = async () => {
    try {
      // Get main photo or first photo
      const { data, error } = await supabase
        .from('pet_photos')
        .select('image_url, is_main')
        .eq('pet_id', petId)
        .order('is_main', { ascending: false })
        .order('sort_order', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data?.image_url) {
        // Extract dominant color from image
        const colors = await extractColorsFromImage(data.image_url);
        setMainPhoto({
          url: data.image_url,
          dominantColor: colors.dominant,
          accentColor: colors.accent,
        });
      } else {
        setMainPhoto({
          url: null,
          dominantColor: 'hsl(var(--primary))',
          accentColor: 'hsl(var(--primary) / 0.2)',
        });
      }
    } catch (error) {
      console.error('Error fetching main photo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { mainPhoto, isLoading, refetch: fetchMainPhoto };
}

// Simple dominant color extraction using canvas
async function extractColorsFromImage(imageUrl: string): Promise<{ dominant: string; accent: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ dominant: 'hsl(var(--primary))', accent: 'hsl(var(--primary) / 0.2)' });
          return;
        }

        // Sample a small version for performance
        const size = 50;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imageData = ctx.getImageData(0, 0, size, size).data;
        
        // Calculate average color
        let r = 0, g = 0, b = 0, count = 0;
        
        for (let i = 0; i < imageData.length; i += 4) {
          // Skip very dark or very light pixels
          const brightness = (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
          if (brightness > 30 && brightness < 225) {
            r += imageData[i];
            g += imageData[i + 1];
            b += imageData[i + 2];
            count++;
          }
        }

        if (count === 0) {
          resolve({ dominant: 'hsl(var(--primary))', accent: 'hsl(var(--primary) / 0.2)' });
          return;
        }

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        // Convert to HSL
        const hsl = rgbToHsl(r, g, b);
        
        // Create a more saturated/vibrant version for the dominant color
        const dominant = `hsl(${hsl.h}, ${Math.min(hsl.s + 20, 80)}%, ${Math.min(Math.max(hsl.l, 35), 55)}%)`;
        const accent = `hsl(${hsl.h}, ${Math.min(hsl.s + 10, 70)}%, ${Math.min(hsl.l + 30, 90)}%)`;

        resolve({ dominant, accent });
      } catch (error) {
        resolve({ dominant: 'hsl(var(--primary))', accent: 'hsl(var(--primary) / 0.2)' });
      }
    };

    img.onerror = () => {
      resolve({ dominant: 'hsl(var(--primary))', accent: 'hsl(var(--primary) / 0.2)' });
    };

    img.src = imageUrl;
  });
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}
