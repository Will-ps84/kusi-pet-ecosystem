import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

interface OrderRequest {
  items: CartItem[];
  delivery_address: string;
  district: string;
  telefono?: string;
  notes?: string;
}

interface StockUpdateResult {
  product_id: string;
  original_stock: number;
}

interface DecrementStockResult {
  success: boolean;
  error?: string;
  new_stock?: number;
  available?: number;
}

// Input validation constants
const MAX_ADDRESS_LENGTH = 500;
const MAX_DISTRICT_LENGTH = 100;
const MAX_NOTES_LENGTH = 500;
const MAX_TELEFONO_LENGTH = 15;
const MAX_ITEMS = 50;
const MAX_QUANTITY_PER_ITEM = 100;

// Phone validation regex - allows optional + and 7-15 digits
const PHONE_REGEX = /^\+?[0-9]{7,15}$/;

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Sanitize string by trimming and removing potentially dangerous characters
function sanitizeString(input: string | undefined | null): string | null {
  if (!input) return null;
  // Trim whitespace and remove null bytes
  return input.trim().replace(/\0/g, '').slice(0, 1000);
}

// Validate and sanitize order input
function validateOrderInput(body: OrderRequest): { valid: boolean; error?: string; sanitized?: OrderRequest } {
  const { items, delivery_address, district, telefono, notes } = body;

  // Validate items array
  if (!items || !Array.isArray(items) || items.length === 0) {
    return { valid: false, error: "No items in order" };
  }

  if (items.length > MAX_ITEMS) {
    return { valid: false, error: `Maximum ${MAX_ITEMS} items per order` };
  }

  // Validate each item
  for (const item of items) {
    if (!item.product_id || typeof item.product_id !== 'string') {
      return { valid: false, error: "Invalid product ID" };
    }
    if (!UUID_REGEX.test(item.product_id)) {
      return { valid: false, error: "Invalid product ID format" };
    }
    if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1) {
      return { valid: false, error: "Invalid quantity" };
    }
    if (item.quantity > MAX_QUANTITY_PER_ITEM) {
      return { valid: false, error: `Maximum ${MAX_QUANTITY_PER_ITEM} units per item` };
    }
  }

  // Validate delivery address
  if (!delivery_address || typeof delivery_address !== 'string') {
    return { valid: false, error: "Delivery address is required" };
  }
  const sanitizedAddress = sanitizeString(delivery_address);
  if (!sanitizedAddress || sanitizedAddress.length < 5) {
    return { valid: false, error: "Delivery address is too short" };
  }
  if (sanitizedAddress.length > MAX_ADDRESS_LENGTH) {
    return { valid: false, error: `Delivery address must be less than ${MAX_ADDRESS_LENGTH} characters` };
  }

  // Validate district (optional but has max length)
  let sanitizedDistrict: string | null = null;
  if (district) {
    if (typeof district !== 'string') {
      return { valid: false, error: "Invalid district format" };
    }
    sanitizedDistrict = sanitizeString(district);
    if (sanitizedDistrict && sanitizedDistrict.length > MAX_DISTRICT_LENGTH) {
      return { valid: false, error: `District must be less than ${MAX_DISTRICT_LENGTH} characters` };
    }
  }

  // Validate telefono (optional but must match format)
  let sanitizedTelefono: string | null = null;
  if (telefono) {
    if (typeof telefono !== 'string') {
      return { valid: false, error: "Invalid phone format" };
    }
    // Remove spaces and dashes for validation
    const cleanPhone = telefono.replace(/[\s-]/g, '');
    if (!PHONE_REGEX.test(cleanPhone)) {
      return { valid: false, error: "Invalid phone number format. Use 7-15 digits, optionally starting with +" };
    }
    sanitizedTelefono = cleanPhone.slice(0, MAX_TELEFONO_LENGTH);
  }

  // Validate notes (optional but has max length)
  let sanitizedNotes: string | null = null;
  if (notes) {
    if (typeof notes !== 'string') {
      return { valid: false, error: "Invalid notes format" };
    }
    sanitizedNotes = sanitizeString(notes);
    if (sanitizedNotes && sanitizedNotes.length > MAX_NOTES_LENGTH) {
      return { valid: false, error: `Notes must be less than ${MAX_NOTES_LENGTH} characters` };
    }
  }

  return {
    valid: true,
    sanitized: {
      items: items.map(item => ({
        product_id: item.product_id.toLowerCase(), // Normalize UUID
        quantity: Math.floor(item.quantity), // Ensure integer
        unit_price: item.unit_price,
      })),
      delivery_address: sanitizedAddress,
      district: sanitizedDistrict || '',
      telefono: sanitizedTelefono || undefined,
      notes: sanitizedNotes || undefined,
    }
  };
}

// Helper function to rollback stock updates
async function rollbackStockUpdates(supabase: SupabaseClient, stockUpdateResults: StockUpdateResult[]) {
  for (const prevResult of stockUpdateResults) {
    await supabase
      .from("products")
      .update({ stock: prevResult.original_stock })
      .eq("id", prevResult.product_id);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Avatar order request received");

    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User authenticated:", user.id);

    // Parse and validate request body
    const body: OrderRequest = await req.json();
    const validation = validateOrderInput(body);

    if (!validation.valid || !validation.sanitized) {
      console.error("Validation error:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { items, delivery_address, district, telefono, notes } = validation.sanitized;

    // Get product IDs for validation
    const productIds = items.map(item => item.product_id);
    
    // Fetch products for pricing info
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price_total_igv, stock")
      .in("id", productIds);

    if (productsError) {
      console.error("Error fetching products:", productsError);
      return new Response(
        JSON.stringify({ error: "Error validating products" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate all products exist
    for (const item of items) {
      const product = products?.find(p => p.id === item.product_id);
      if (!product) {
        return new Response(
          JSON.stringify({ error: "Product not found" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Calculate totals
    const delivery_fee = 7.00;
    let total_products_amount = 0;

    const orderItems = items.map(item => {
      const product = products!.find(p => p.id === item.product_id)!;
      const subtotal = product.price_total_igv * item.quantity;
      total_products_amount += subtotal;
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price_total_igv: product.price_total_igv,
        subtotal,
      };
    });

    const total_amount = total_products_amount + delivery_fee;

    // Calculate estimated delivery date (today + 1 day)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 1);

    console.log("Creating order with total:", total_amount);

    // ATOMIC STOCK UPDATE: Use database function to atomically decrement stock
    // This prevents race conditions by using row-level locking
    const stockUpdateResults: StockUpdateResult[] = [];
    
    for (const item of items) {
      const product = products!.find(p => p.id === item.product_id)!;
      
      // Try using the atomic decrement_stock function
      const { data: stockResult, error: stockError } = await supabase
        .rpc('decrement_stock', { 
          p_product_id: item.product_id, 
          p_quantity: item.quantity 
        });

      const result = stockResult as DecrementStockResult | null;

      if (stockError) {
        console.error("Stock decrement error:", stockError);
        // Rollback any previous stock updates
        await rollbackStockUpdates(supabase, stockUpdateResults);
        return new Response(
          JSON.stringify({ error: `Error updating stock for ${product.name}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!result || result.success === false) {
        // Rollback any previous stock updates
        await rollbackStockUpdates(supabase, stockUpdateResults);
        console.error("Insufficient stock for:", product.name);
        return new Response(
          JSON.stringify({ error: `Insufficient stock for ${product.name}. Please try again.` }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      stockUpdateResults.push({
        product_id: item.product_id,
        original_stock: product.stock,
      });
    }

    // Create the order after stock is successfully reserved
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        delivery_address,
        district: district || null,
        telefono: telefono || null,
        notes: notes || null,
        delivery_fee,
        total_products_amount,
        total_amount,
        payment_method: "efectivo",
        status: "recibido",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      // Rollback stock updates
      await rollbackStockUpdates(supabase, stockUpdateResults);
      return new Response(
        JSON.stringify({ error: "Error creating order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Order created:", order.id);

    // Insert order items
    const orderItemsToInsert = orderItems.map(item => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsToInsert);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      // Rollback: delete order and restore stock
      await supabase.from("orders").delete().eq("id", order.id);
      await rollbackStockUpdates(supabase, stockUpdateResults);
      return new Response(
        JSON.stringify({ error: "Error creating order items" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Order completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          total_products_amount,
          delivery_fee,
          total_amount,
          estimated_delivery: estimatedDelivery.toISOString().split("T")[0],
          items: orderItems.map(item => {
            const product = products!.find(p => p.id === item.product_id)!;
            return {
              name: product.name,
              quantity: item.quantity,
              subtotal: item.subtotal,
            };
          }),
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
