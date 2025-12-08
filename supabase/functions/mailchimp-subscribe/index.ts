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

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, petType }: SubscribeRequest = await req.json();

    // Validate input
    if (!name || !email || !petType) {
      console.error("Missing required fields:", { name: !!name, email: !!email, petType: !!petType });
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Invalid email format:", email);
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

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

    console.log(`Subscribing ${email} to Mailchimp list ${listId}`);

    // Create the subscriber data
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
        console.log("Member already exists, updating...");
        
        // Update existing member using PATCH
        const updateUrl = `${mailchimpUrl}/${responseData.detail.split(" ")[0]}`;
        const updateResponse = await fetch(mailchimpUrl.replace("/members", `/members/${email.toLowerCase()}`), {
          method: "PATCH",
          headers: {
            "Authorization": `apikey ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            merge_fields: {
              FNAME: name,
              PETTYPE: petType,
            },
            tags: ["kusi-pet-community", `pet-${petType}`],
          }),
        });

        if (updateResponse.ok) {
          console.log("Member updated successfully");
          return new Response(
            JSON.stringify({ success: true, message: "Member updated" }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }

      console.error("Mailchimp API error:", responseData);
      return new Response(
        JSON.stringify({ error: responseData.detail || "Failed to subscribe" }),
        { status: response.status, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Successfully subscribed:", email);
    return new Response(
      JSON.stringify({ success: true, message: "Subscribed successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in mailchimp-subscribe function:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
