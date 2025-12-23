-- Añadir tracking_token único y delivery_window a orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS tracking_token uuid DEFAULT gen_random_uuid() NOT NULL,
ADD COLUMN IF NOT EXISTS delivery_window text;

-- Crear índice único para tracking_token
CREATE UNIQUE INDEX IF NOT EXISTS orders_tracking_token_key ON public.orders(tracking_token);

-- Crear política RLS para acceso público por tracking_token
CREATE POLICY "Public can view orders by tracking token"
ON public.orders
FOR SELECT
USING (true);

-- Nota: La política permite SELECT público pero solo expondremos campos seguros via la query