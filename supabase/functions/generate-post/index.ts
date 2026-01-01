import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_MODELS = {
  professional: {
    name: "Professional / Thought Leadership",
    systemPrompt: `You are a LinkedIn content expert specializing in professional thought leadership posts. 
Write content that positions the author as an industry expert. Use data, insights, and professional language. 
Avoid fluff - be direct and valuable. Include actionable takeaways.`
  },
  hiring: {
    name: "Hiring & Culture",
    systemPrompt: `You are a LinkedIn content expert specializing in hiring and company culture posts.
Write authentic posts about team building, company values, and career opportunities.
Make the company feel human and approachable. Highlight what makes working there special.`
  },
  comedy: {
    name: "Comedy / Relatable",
    systemPrompt: `You are a LinkedIn content expert who creates relatable, humorous content.
Write posts that make people smile or laugh while still being professional.
Use everyday work situations, common frustrations, or industry inside jokes.
Keep it light but avoid being cringe or unprofessional.`
  },
  storytelling: {
    name: "Personal Brand Storytelling",
    systemPrompt: `You are a LinkedIn content expert specializing in personal brand storytelling.
Write authentic, vulnerable stories that connect emotionally with readers.
Share lessons learned, personal growth moments, and genuine experiences.
Make the reader feel something and inspire them.`
  },
  product: {
    name: "Product / Business Updates",
    systemPrompt: `You are a LinkedIn content expert for product and business announcements.
Write exciting updates about products, features, milestones, or company news.
Balance excitement with substance. Include specific details and benefits.
Avoid sounding like a press release - keep it conversational.`
  },
  engagement: {
    name: "Engagement Booster",
    systemPrompt: `You are a LinkedIn content expert focused on driving engagement.
Write posts that encourage comments, shares, and discussions.
Use questions, polls, controversial (but professional) takes, or call-to-actions.
Make people want to share their opinion.`
  }
};

const LENGTH_GUIDES = {
  short: "Keep the post concise - around 100-150 words. Get to the point quickly.",
  medium: "Write a medium-length post - around 200-300 words. Balance depth with readability.",
  long: "Write a longer, in-depth post - around 400-500 words. Include multiple points and examples."
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client to fetch user data
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { aiModel, tags, guidance, postLength } = await req.json();
    console.log("Generating post for user:", user.id, "Model:", aiModel, "Tags:", tags);

    // Fetch user's onboarding profile
    const { data: profile, error: profileError } = await supabase
      .from("client_ai_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return new Response(JSON.stringify({ error: "Could not fetch user profile" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user's AI training updates
    const { data: trainingUpdates } = await supabase
      .from("ai_training_updates")
      .select("content, update_type, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    // Build context from profile and training updates
    const profileContext = `
AUTHOR CONTEXT:
- Business Name: ${profile.business_name || "Not specified"}
- Industry: ${profile.industry || "Not specified"}
- Business Description: ${profile.description || "Not specified"}
- Target Audience: ${profile.target_audience || "Not specified"}
- Content Goals: ${profile.goals?.join(", ") || "Not specified"}
- Tone of Voice: ${profile.tone_of_voice || "Professional"}
- Posting Frequency: ${profile.posting_frequency || "Not specified"}
`;

    let trainingContext = "";
    if (trainingUpdates && trainingUpdates.length > 0) {
      trainingContext = "\n\nADDITIONAL TRAINING CONTEXT:\n" + 
        trainingUpdates.map(u => `[${u.update_type}]: ${u.content}`).join("\n");
    }

    const modelConfig = AI_MODELS[aiModel as keyof typeof AI_MODELS] || AI_MODELS.professional;
    const lengthGuide = LENGTH_GUIDES[postLength as keyof typeof LENGTH_GUIDES] || LENGTH_GUIDES.medium;

    const systemPrompt = `${modelConfig.systemPrompt}

${profileContext}
${trainingContext}

CONTENT REQUIREMENTS:
${lengthGuide}
${tags?.length ? `- Incorporate themes related to: ${tags.join(", ")}` : ""}
${guidance ? `- Additional guidance from user: ${guidance}` : ""}

OUTPUT FORMAT:
Write a LinkedIn post that feels authentic and personal. 
Do NOT use markdown formatting.
At the end, suggest 3-5 relevant hashtags on a new line prefixed with "Hashtags:".
Keep emojis minimal and professional (0-3 max).`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Calling Lovable AI Gateway...");
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate a LinkedIn post based on the provided context and requirements." }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "Failed to generate content" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    const generatedContent = aiResponse.choices?.[0]?.message?.content || "";
    console.log("Generated content length:", generatedContent.length);

    // Parse content and hashtags
    let postContent = generatedContent;
    let hashtags: string[] = [];
    
    const hashtagMatch = generatedContent.match(/Hashtags?:\s*(.+)$/im);
    if (hashtagMatch) {
      postContent = generatedContent.replace(/Hashtags?:\s*.+$/im, "").trim();
      hashtags = hashtagMatch[1]
        .split(/[\s,]+/)
        .map((h: string) => h.replace(/^#/, "").trim())
        .filter((h: string) => h.length > 0);
    }

    return new Response(JSON.stringify({ 
      content: postContent,
      hashtags
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-post:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
