-- Add database constraint to prevent negative stock (fixes race condition at DB level)
ALTER TABLE public.products ADD CONSTRAINT products_stock_non_negative CHECK (stock >= 0);

-- Create atomic stock decrement function for race-safe stock updates
CREATE OR REPLACE FUNCTION public.decrement_stock(p_product_id uuid, p_quantity integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_stock integer;
  v_new_stock integer;
BEGIN
  -- Get current stock with row lock
  SELECT stock INTO v_current_stock
  FROM public.products
  WHERE id = p_product_id
  FOR UPDATE;
  
  IF v_current_stock IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Product not found');
  END IF;
  
  IF v_current_stock < p_quantity THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient stock', 'available', v_current_stock);
  END IF;
  
  v_new_stock := v_current_stock - p_quantity;
  
  UPDATE public.products
  SET stock = v_new_stock
  WHERE id = p_product_id;
  
  RETURN jsonb_build_object('success', true, 'new_stock', v_new_stock);
END;
$$;