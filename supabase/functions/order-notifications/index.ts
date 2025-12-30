import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  orderId: string;
  newStatus: string;
  customerEmail: string;
  customerName: string;
  trackingToken: string;
  deliveryAddress?: string;
  district?: string;
  deliveryWindow?: string;
  totalAmount?: number;
}

// Brand colors from logo
const BRAND_COLORS = {
  kusiOrange: "#F7941D",
  petBlue: "#5B7C99",
  heartGreen: "#8DC63F",
  heartTeal: "#00A79D",
  darkText: "#1f2937",
  mutedText: "#4b5563",
  lightText: "#9ca3af",
};

const getStatusEmailContent = (
  status: string,
  customerName: string,
  trackingUrl: string,
  deliveryWindow?: string,
  totalAmount?: number
) => {
  const name = customerName || "Cliente";
  
  const headerHtml = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: ${BRAND_COLORS.kusiOrange}; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; font-size: 28px;">
        🐾 <span style="color: ${BRAND_COLORS.kusiOrange};">Kusi</span> <span style="color: ${BRAND_COLORS.petBlue};">Pet</span>
      </h1>
      <p style="color: ${BRAND_COLORS.heartTeal}; font-size: 12px; margin-top: 5px; font-style: italic;">
        El ecosistema inteligente para el bienestar total de tu mascota
      </p>
    </div>
  `;

  const footerHtml = `
    <p style="color: ${BRAND_COLORS.lightText}; font-size: 14px; text-align: center;">
      ¿Tienes dudas? Escríbenos por WhatsApp al +51 997 227 638
    </p>
    
    <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; text-align: center;">
      <p style="color: ${BRAND_COLORS.lightText}; font-size: 12px;">
        © 2024 Kusi Pet - Lima, Perú
      </p>
    </div>
  `;
  
  switch (status) {
    case "confirmado":
      return {
        subject: "🐾 ¡Tu pedido Kusi Pet está confirmado!",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            ${headerHtml}
            
            <h2 style="color: ${BRAND_COLORS.darkText};">¡Hola ${name}!</h2>
            
            <p style="color: ${BRAND_COLORS.mutedText}; font-size: 16px; line-height: 1.6;">
              ¡Listo! <strong>Tu pedido Kusi Pet está confirmado</strong>. Estamos preparando todo con mucho cariño para ti y tu mascota.
            </p>
            
            ${totalAmount ? `<p style="color: ${BRAND_COLORS.mutedText}; font-size: 16px;"><strong>Total del pedido:</strong> S/ ${totalAmount.toFixed(2)}</p>` : ""}
            
            <p style="color: ${BRAND_COLORS.mutedText}; font-size: 16px; line-height: 1.6;">
              Te avisaremos cuando tu pedido salga en ruta. 🚚
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${trackingUrl}" style="background-color: ${BRAND_COLORS.kusiOrange}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Seguir mi pedido
              </a>
            </div>
            
            ${footerHtml}
          </div>
        `,
      };

    case "en_ruta":
      return {
        subject: "🚚 ¡Tu pedido Kusi Pet va en camino!",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            ${headerHtml}
            
            <h2 style="color: ${BRAND_COLORS.darkText};">¡${name}, tu pedido va en camino! 🚚</h2>
            
            <p style="color: ${BRAND_COLORS.mutedText}; font-size: 16px; line-height: 1.6;">
              Tu pedido Kusi Pet ya salió de nuestro almacén y va directo hacia ti.
            </p>
            
            ${deliveryWindow ? `
            <div style="background-color: #fef3c7; border-left: 4px solid ${BRAND_COLORS.kusiOrange}; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="color: #92400e; font-size: 16px; margin: 0;">
                <strong>⏰ Estimamos la entrega hoy entre:</strong><br/>
                ${deliveryWindow}
              </p>
            </div>
            ` : ""}
            
            <p style="color: ${BRAND_COLORS.mutedText}; font-size: 16px; line-height: 1.6;">
              Si tienes dudas sobre tu entrega, no dudes en contactarnos.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${trackingUrl}" style="background-color: ${BRAND_COLORS.kusiOrange}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Ver estado de mi pedido
              </a>
            </div>
            
            ${footerHtml}
          </div>
        `,
      };

    case "entregado":
      return {
        subject: "✅ ¡Tu pedido Kusi Pet fue entregado!",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            ${headerHtml}
            
            <h2 style="color: ${BRAND_COLORS.darkText};">¡Gracias por confiar en Kusi Pet, ${name}! 🎉</h2>
            
            <p style="color: ${BRAND_COLORS.mutedText}; font-size: 16px; line-height: 1.6;">
              Tu pedido fue entregado exitosamente. Esperamos que tu mascota disfrute mucho de sus productos.
            </p>
            
            <div style="background-color: #d1fae5; border-left: 4px solid ${BRAND_COLORS.heartGreen}; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
              <p style="color: #065f46; font-size: 18px; margin: 0;">
                ✅ <strong>Pedido entregado</strong>
              </p>
            </div>
            
            <p style="color: ${BRAND_COLORS.mutedText}; font-size: 16px; line-height: 1.6;">
              <strong>¿Cómo te fue?</strong> Tu opinión nos ayuda a seguir mejorando. Cuéntanos tu experiencia respondiendo a este correo o por WhatsApp.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://wa.me/51997227638?text=Hola%20Kusi%20Pet!%20Quiero%20dejar%20un%20comentario%20sobre%20mi%20pedido" style="background-color: #25d366; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                💬 Dejar comentario por WhatsApp
              </a>
            </div>
            
            <p style="color: ${BRAND_COLORS.lightText}; font-size: 14px; text-align: center;">
              ¡Gracias por ser parte de la familia Kusi Pet! 🐶🐱
            </p>
            
            <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; text-align: center;">
              <p style="color: ${BRAND_COLORS.lightText}; font-size: 12px;">
                © 2024 Kusi Pet - Lima, Perú
              </p>
            </div>
          </div>
        `,
      };

    default:
      return null;
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Order notifications function called");
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotificationRequest = await req.json();
    console.log("Received payload:", JSON.stringify(payload));

    const {
      orderId,
      newStatus,
      customerEmail,
      customerName,
      trackingToken,
      deliveryWindow,
      totalAmount,
    } = payload;

    if (!orderId || !newStatus || !customerEmail || !trackingToken) {
      console.error("Missing required fields:", { orderId, newStatus, customerEmail, trackingToken });
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build tracking URL
    const appUrl = Deno.env.get("APP_URL") || "https://iutazpnzotceakqgvzyz.lovableproject.com";
    const trackingUrl = `${appUrl}/tracking/${trackingToken}`;
    console.log("Tracking URL:", trackingUrl);

    // Get email content based on status
    const emailContent = getStatusEmailContent(
      newStatus,
      customerName,
      trackingUrl,
      deliveryWindow,
      totalAmount
    );

    if (!emailContent) {
      console.log(`No email configured for status: ${newStatus}`);
      return new Response(
        JSON.stringify({ message: `No notification configured for status: ${newStatus}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending email to ${customerEmail} for status ${newStatus}`);
    
    const emailResponse = await resend.emails.send({
      from: "Kusi Pet <onboarding@resend.dev>",
      to: [customerEmail],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification sent for status: ${newStatus}`,
        emailId: emailResponse.data?.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in order-notifications function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);