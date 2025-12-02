-- Add is_main and sort_order columns to pet_photos
ALTER TABLE public.pet_photos 
ADD COLUMN IF NOT EXISTS is_main boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_pet_photos_pet_main ON public.pet_photos(pet_id, is_main);

-- Create product_images table
CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  is_main boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Policies for product_images
CREATE POLICY "Anyone can view product images"
ON public.product_images
FOR SELECT
USING (true);

CREATE POLICY "Vendors can manage own product images"
ON public.product_images
FOR ALL
USING (
  product_id IN (
    SELECT p.id FROM products p
    JOIN vendors v ON p.vendor_id = v.id
    WHERE v.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all product images"
ON public.product_images
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for product_images
CREATE INDEX IF NOT EXISTS idx_product_images_product_main ON public.product_images(product_id, is_main);

-- Create storage policies for mascotas bucket (pet photos)
CREATE POLICY "Users can upload pet photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'mascotas' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own pet photos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'mascotas' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own pet photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'mascotas' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view pet photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'mascotas');

-- Create storage policies for productos bucket (product images)
CREATE POLICY "Vendors can upload product images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'productos' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Vendors can update product images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'productos' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Vendors can delete product images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'productos' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Anyone can view product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'productos');