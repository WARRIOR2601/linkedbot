import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_MODELS: Record<string, { name: string; systemPrompt: string }> = {
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { agentConfig, count = 3 } = await req.json();

    if (!agentConfig) {
      throw new Error("Agent configuration is required");
    }

    console.log("Generating sample posts for agent config:", agentConfig.name);

    const modelConfig = AI_MODELS[agentConfig.agent_type] || AI_MODELS.professional;

    // Build context from training samples
    let trainingContext = "";
    if (agentConfig.sample_posts && agentConfig.sample_posts.length > 0) {
      trainingContext = `\n\nWRITING STYLE EXAMPLES (learn from these):\n${agentConfig.sample_posts.map((p: string, i: number) => `Example ${i + 1}:\n${p}`).join("\n\n")}`;
    }

    const systemPrompt = `${modelConfig.systemPrompt}

AUTHOR CONTEXT:
- About the person: ${agentConfig.about_user || "Not specified"}
- About the company: ${agentConfig.about_company || "Not specified"}  
- Target audience: ${agentConfig.target_audience || "Not specified"}
- Tone of voice: ${agentConfig.tone_of_voice || "Match the style from examples"}

AGENT CONFIGURATION:
- Agent Name: ${agentConfig.name}
- Agent Type: ${agentConfig.agent_type}
- Posting Goal: ${agentConfig.posting_goal || "Not specified"}
- Topics to cover: ${agentConfig.topics?.join(", ") || "General professional topics"}
${trainingContext}

IMPORTANT INSTRUCTIONS:
- Write in the EXACT style learned from the writing examples if provided
- Each post should feel authentic and personal
- Do NOT use markdown formatting
- Keep emojis minimal and professional (0-3 max per post)
- Posts should be ready to post on LinkedIn as-is
- Make each post unique with a different angle or topic`;

    const userPrompt = `Generate exactly ${count} sample LinkedIn posts based on the provided context. These are PREVIEW posts to show the agent's writing style.

Format your response as JSON with this structure:
{
  "posts": [
    {"content": "First post content here..."},
    {"content": "Second post content here..."},
    {"content": "Third post content here..."}
  ]
}

Make each post unique and showcase different aspects of the agent's personality and topics.`;

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
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("Failed to generate sample posts");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let posts: { content: string }[] = [];
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        posts = parsed.posts || [];
      }
    } catch (parseError) {
      console.error("Failed to parse JSON, extracting posts manually");
      // Fallback: split content into posts
      const lines = content.split("\n\n").filter((l: string) => l.trim().length > 50);
      posts = lines.slice(0, count).map((l: string) => ({ content: l.trim() }));
    }

    console.log(`Generated ${posts.length} sample posts`);

    return new Response(
      JSON.stringify({ posts }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating sample posts:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
