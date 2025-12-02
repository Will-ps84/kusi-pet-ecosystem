import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  notes?: string;
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

    // Parse request body
    const body: OrderRequest = await req.json();
    const { items, delivery_address, district, notes } = body;

    // Validate request
    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "No items in order" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!delivery_address) {
      return new Response(
        JSON.stringify({ error: "Delivery address is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate products exist and have stock
    const productIds = items.map(item => item.product_id);
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

    // Validate stock for each item
    for (const item of items) {
      const product = products?.find(p => p.id === item.product_id);
      if (!product) {
        return new Response(
          JSON.stringify({ error: `Product not found: ${item.product_id}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (product.stock < item.quantity) {
        return new Response(
          JSON.stringify({ error: `Insufficient stock for ${product.name}` }),
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

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        delivery_address,
        district: district || null,
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
      // Try to delete the order if items failed
      await supabase.from("orders").delete().eq("id", order.id);
      return new Response(
        JSON.stringify({ error: "Error creating order items" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update product stock
    for (const item of items) {
      const product = products!.find(p => p.id === item.product_id)!;
      await supabase
        .from("products")
        .update({ stock: product.stock - item.quantity })
        .eq("id", item.product_id);
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
