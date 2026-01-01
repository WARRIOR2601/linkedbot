import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get all ACTIVE agents (not draft, not paused, not error)
    const { data: agents, error: agentsError } = await supabase
      .from("agents")
      .select("*")
      .eq("status", "active");

    if (agentsError) {
      console.error("Error fetching agents:", agentsError);
      throw agentsError;
    }

    console.log(`Found ${agents?.length || 0} active agents`);

    const results: { agentId: string; agentName: string; success: boolean; error?: string; postId?: string }[] = [];
    const now = new Date();
    const currentDay = now.getDay(); // 0-6
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM

    for (const agent of agents || []) {
      try {
        console.log(`Processing agent: ${agent.id} - ${agent.name}`);

        // Check if today is a posting day
        if (agent.preferred_posting_days && !agent.preferred_posting_days.includes(currentDay)) {
          console.log(`Agent ${agent.id} - not a posting day (today: ${currentDay}, preferred: ${agent.preferred_posting_days})`);
          continue;
        }

        // Check if within time window
        if (agent.preferred_time_window_start && agent.preferred_time_window_end) {
          if (currentTime < agent.preferred_time_window_start || currentTime > agent.preferred_time_window_end) {
            console.log(`Agent ${agent.id} - outside time window (now: ${currentTime}, window: ${agent.preferred_time_window_start}-${agent.preferred_time_window_end})`);
            continue;
          }
        }

        // Check posting frequency to prevent duplicates
        if (agent.last_post_at) {
          const lastPost = new Date(agent.last_post_at);
          const hoursSinceLastPost = (now.getTime() - lastPost.getTime()) / (1000 * 60 * 60);
          
          // Daily: at least 20 hours between posts
          if (agent.posting_frequency === "daily" && hoursSinceLastPost < 20) {
            console.log(`Agent ${agent.id} - already posted recently (${hoursSinceLastPost.toFixed(1)}h ago)`);
            continue;
          }
          
          // Weekly: at least 5 days between posts
          if (agent.posting_frequency === "weekly" && hoursSinceLastPost < 120) {
            console.log(`Agent ${agent.id} - weekly limit not reached`);
            continue;
          }
        }

        // Check if there's a user-uploaded image for today
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);

        const { data: existingPost } = await supabase
          .from("posts")
          .select("*")
          .eq("agent_id", agent.id)
          .gte("scheduled_at", todayStart.toISOString())
          .lte("scheduled_at", todayEnd.toISOString())
          .single();

        let userProvidedImageUrl: string | null = null;
        if (existingPost?.image_url && existingPost.status === "draft") {
          // User uploaded an image for this date - use it
          userProvidedImageUrl = existingPost.image_url;
          console.log(`Agent ${agent.id} - using user-provided image`);
        }

        // Fetch agent training data
        const { data: trainingData } = await supabase
          .from("agent_training_data")
          .select("*")
          .eq("agent_id", agent.id)
          .order("created_at", { ascending: false });

        // Fetch user profile
        const { data: profile } = await supabase
          .from("client_ai_profiles")
          .select("*")
          .eq("user_id", agent.user_id)
          .single();

        // Build context from agent fields and training data
        let authorContext = "";
        if (agent.about_user) {
          authorContext += `\nAbout the Author: ${agent.about_user}`;
        }
        if (agent.about_company) {
          authorContext += `\nAbout the Company: ${agent.about_company}`;
        }
        if (agent.target_audience) {
          authorContext += `\nTarget Audience: ${agent.target_audience}`;
        }
        if (profile) {
          authorContext += `
Business Name: ${profile.business_name || "Not specified"}
Industry: ${profile.industry || "Not specified"}
Business Description: ${profile.description || "Not specified"}`;
        }

        let trainingContext = "";
        if (trainingData && trainingData.length > 0) {
          trainingContext = "\n\nTRAINING DATA & WRITING SAMPLES:\n" +
            trainingData.map((t: any) => `[${t.training_type}]: ${t.content}`).join("\n\n");
        }

        // Add sample posts from agent config if available
        if (agent.sample_posts && agent.sample_posts.length > 0) {
          trainingContext += "\n\nSAMPLE POSTS (match this style):\n" +
            agent.sample_posts.map((p: string, i: number) => `Sample ${i + 1}: ${p}`).join("\n\n");
        }

        const modelConfig = AI_MODELS[agent.agent_type] || AI_MODELS.professional;

        // Build image context if user provided an image
        let imageInstructions = "";
        if (userProvidedImageUrl) {
          imageInstructions = `\n\nIMPORTANT: The user has provided a specific image for today's post. Write content that relates to or complements this image.`;
        }

        const systemPrompt = `${modelConfig.systemPrompt}

AUTHOR CONTEXT:
${authorContext}
${trainingContext}

AGENT CONFIGURATION:
- Agent Name: ${agent.name}
- Posting Goal: ${agent.posting_goal || "Build personal brand and engage audience"}
- Tone of Voice: ${agent.tone_of_voice || "Match the style from training data"}
- Topics to cover: ${agent.topics?.join(", ") || "General professional topics"}
${imageInstructions}

OUTPUT FORMAT:
Write a LinkedIn post that feels authentic and personal. 
Do NOT use markdown formatting.
Write in the style learned from the training data.
At the end, suggest 3-5 relevant hashtags on a new line prefixed with "Hashtags:".
Keep emojis minimal and professional (0-3 max).`;

        // Generate post content
        console.log(`Generating post for agent ${agent.id}...`);
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userProvidedImageUrl 
                ? "Generate a LinkedIn post that complements the image the user uploaded. Create something engaging and relevant." 
                : "Generate a LinkedIn post based on the provided context. Create something fresh and engaging that matches the author's style."
              }
            ],
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(`AI error for agent ${agent.id}:`, aiResponse.status, errorText);
          
          // Set agent to error status
          await supabase.from("agents").update({ status: "error" }).eq("id", agent.id);
          
          results.push({ agentId: agent.id, agentName: agent.name, success: false, error: "AI generation failed" });
          continue;
        }

        const aiData = await aiResponse.json();
        const generatedContent = aiData.choices?.[0]?.message?.content || "";

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

        // Generate image if enabled and no user image provided
        let imageUrl = userProvidedImageUrl;
        if (!imageUrl && agent.auto_generate_images) {
          try {
            console.log(`Generating image for agent ${agent.id}...`);
            const imagePrompt = `Create a professional LinkedIn post image that matches this content: "${postContent.slice(0, 200)}". 
Style: ${agent.preferred_image_style || "Clean, professional, suitable for business networking"}. 
Dimensions: LinkedIn post format, 1200x627 aspect ratio.`;

            const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash-image-preview",
                messages: [{ role: "user", content: imagePrompt }],
                modalities: ["image", "text"]
              }),
            });

            if (imageResponse.ok) {
              const imageData = await imageResponse.json();
              imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
              console.log(`Image generated for agent ${agent.id}`);
            }
          } catch (imgError) {
            console.error(`Image generation failed for agent ${agent.id}:`, imgError);
            // Continue without image if allowed
            if (!agent.allow_text_only_posts) {
              console.log(`Agent ${agent.id} requires images - skipping post`);
              continue;
            }
          }
        }

        // If no image and text-only not allowed, skip
        if (!imageUrl && !agent.allow_text_only_posts) {
          console.log(`Agent ${agent.id} - no image available and text-only not allowed`);
          continue;
        }

        // Calculate schedule time within the preferred window
        const scheduleTime = new Date();
        const startHour = parseInt(agent.preferred_time_window_start?.split(":")[0] || "9");
        const endHour = parseInt(agent.preferred_time_window_end?.split(":")[0] || "17");
        const randomHour = startHour + Math.floor(Math.random() * (endHour - startHour));
        const randomMinute = Math.floor(Math.random() * 60);

        scheduleTime.setHours(randomHour, randomMinute, 0, 0);

        // If schedule time is in the past, schedule for tomorrow
        if (scheduleTime <= now) {
          scheduleTime.setDate(scheduleTime.getDate() + 1);
        }

        // Update existing draft post or create new one
        let postResult;
        if (existingPost?.status === "draft") {
          postResult = await supabase
            .from("posts")
            .update({
              content: postContent,
              hashtags,
              image_url: imageUrl,
              status: "scheduled",
              scheduled_at: scheduleTime.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingPost.id)
            .select()
            .single();
        } else {
          postResult = await supabase.from("posts").insert({
            user_id: agent.user_id,
            agent_id: agent.id,
            content: postContent,
            hashtags,
            image_url: imageUrl,
            tags: agent.topics || [],
            ai_model: agent.agent_type,
            post_length: "medium",
            status: "scheduled",
            scheduled_at: scheduleTime.toISOString(),
          }).select().single();
        }

        if (postResult.error) {
          console.error(`Error saving post for agent ${agent.id}:`, postResult.error);
          results.push({ agentId: agent.id, agentName: agent.name, success: false, error: "Failed to save post" });
          continue;
        }

        // Update agent
        await supabase
          .from("agents")
          .update({
            last_post_at: now.toISOString(),
            posts_created: (agent.posts_created || 0) + 1,
          })
          .eq("id", agent.id);

        console.log(`Successfully created post for agent ${agent.id}`);
        results.push({ agentId: agent.id, agentName: agent.name, success: true, postId: postResult.data?.id });
      } catch (agentError) {
        console.error(`Error processing agent ${agent.id}:`, agentError);
        
        // Set agent to error status
        await supabase.from("agents").update({ status: "error" }).eq("id", agent.id);
        
        results.push({
          agentId: agent.id,
          agentName: agent.name,
          success: false,
          error: agentError instanceof Error ? agentError.message : "Unknown error",
        });
      }
    }

    console.log(`Agent run complete. Processed: ${results.length}, Successful: ${results.filter(r => r.success).length}`);

    return new Response(
      JSON.stringify({
        processed: results.length,
        successful: results.filter((r) => r.success).length,
        results,
        timestamp: now.toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in run-agent:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
