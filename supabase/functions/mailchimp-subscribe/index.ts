import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscribeRequest {
  name: string;
  email: string;
  petType: string;
}

// Input validation constants
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_PET_TYPE_LENGTH = 50;
const VALID_PET_TYPES = ["perro", "gato", "ambos", "otro"];

// Sanitize string by trimming and removing potentially dangerous characters
function sanitizeString(input: string | undefined | null): string {
  if (!input) return '';
  // Trim whitespace, remove null bytes, and limit length
  return input.trim().replace(/\0/g, '').replace(/[<>]/g, '');
}

// Validate email format with stricter regex
function isValidEmail(email: string): boolean {
  // More comprehensive email regex that handles most valid cases
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= MAX_EMAIL_LENGTH;
}

// Validate and sanitize subscription input
function validateSubscriptionInput(body: SubscribeRequest): { valid: boolean; error?: string; sanitized?: SubscribeRequest } {
  const { name, email, petType } = body;

  // Validate name
  if (!name || typeof name !== 'string') {
    return { valid: false, error: "Name is required" };
  }
  const sanitizedName = sanitizeString(name);
  if (sanitizedName.length < 2) {
    return { valid: false, error: "Name must be at least 2 characters" };
  }
  if (sanitizedName.length > MAX_NAME_LENGTH) {
    return { valid: false, error: `Name must be less than ${MAX_NAME_LENGTH} characters` };
  }

  // Validate email
  if (!email || typeof email !== 'string') {
    return { valid: false, error: "Email is required" };
  }
  const sanitizedEmail = sanitizeString(email).toLowerCase();
  if (!isValidEmail(sanitizedEmail)) {
    return { valid: false, error: "Invalid email format" };
  }

  // Validate petType
  if (!petType || typeof petType !== 'string') {
    return { valid: false, error: "Pet type is required" };
  }
  const sanitizedPetType = sanitizeString(petType).toLowerCase();
  if (sanitizedPetType.length > MAX_PET_TYPE_LENGTH) {
    return { valid: false, error: `Pet type must be less than ${MAX_PET_TYPE_LENGTH} characters` };
  }
  // Normalize to valid pet types
  const normalizedPetType = VALID_PET_TYPES.includes(sanitizedPetType) ? sanitizedPetType : "otro";

  return {
    valid: true,
    sanitized: {
      name: sanitizedName,
      email: sanitizedEmail,
      petType: normalizedPetType,
    }
  };
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: SubscribeRequest = await req.json();
    
    // Validate and sanitize input
    const validation = validateSubscriptionInput(body);
    
    if (!validation.valid || !validation.sanitized) {
      console.error("Validation error:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { name, email, petType } = validation.sanitized;

    const apiKey = Deno.env.get("MAILCHIMP_API_KEY");
    const listId = Deno.env.get("MAILCHIMP_LIST_ID");
    const serverPrefix = Deno.env.get("MAILCHIMP_SERVER_PREFIX");

    if (!apiKey || !listId || !serverPrefix) {
      console.error("Missing Mailchimp configuration");
      return new Response(
        JSON.stringify({ error: "Mailchimp configuration missing" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Subscribing user to Mailchimp list`);

    // Create the subscriber data with sanitized inputs
    const subscriberData = {
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: name,
        PETTYPE: petType,
      },
      tags: ["kusi-pet-community", `pet-${petType}`],
    };

    const mailchimpUrl = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members`;
    
    const response = await fetch(mailchimpUrl, {
      method: "POST",
      headers: {
        "Authorization": `apikey ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscriberData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      // Check if it's a "member exists" error
      if (responseData.title === "Member Exists") {
        console.log("Member already exists, returning success");
        return new Response(
          JSON.stringify({ success: true, message: "Member already subscribed" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      console.error("Mailchimp API error:", responseData.title);
      return new Response(
        JSON.stringify({ error: "Failed to subscribe. Please try again." }),
        { status: response.status, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Successfully subscribed user");
    return new Response(
      JSON.stringify({ success: true, message: "Subscribed successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in mailchimp-subscribe function:", errorMessage);
    return new Response(
      JSON.stringify({ error: "An error occurred. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
