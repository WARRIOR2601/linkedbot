export const AI_MODELS = [
  {
    id: "professional",
    name: "Professional / Thought Leadership",
    description: "Position yourself as an industry expert with data-driven insights",
    icon: "Briefcase",
  },
  {
    id: "hiring",
    name: "Hiring & Culture",
    description: "Showcase your team and company culture authentically",
    icon: "Users",
  },
  {
    id: "comedy",
    name: "Comedy / Relatable",
    description: "Create engaging, humorous content that resonates",
    icon: "Smile",
  },
  {
    id: "storytelling",
    name: "Personal Brand Storytelling",
    description: "Share authentic stories that connect emotionally",
    icon: "BookOpen",
  },
  {
    id: "product",
    name: "Product / Business Updates",
    description: "Announce features, milestones, and company news",
    icon: "Rocket",
  },
  {
    id: "engagement",
    name: "Engagement Booster",
    description: "Drive comments and discussions with engaging content",
    icon: "MessageCircle",
  },
] as const;

export const AVAILABLE_TAGS = [
  "Hiring",
  "AI",
  "StartupLife",
  "Marketing",
  "FounderJourney",
  "Leadership",
  "ProductLaunch",
  "TechTrends",
  "RemoteWork",
  "Innovation",
  "CustomerSuccess",
  "Growth",
  "Entrepreneurship",
  "TeamBuilding",
  "CareerAdvice",
] as const;

export const POST_LENGTHS = [
  { id: "short", name: "Short", description: "100-150 words" },
  { id: "medium", name: "Medium", description: "200-300 words" },
  { id: "long", name: "Long", description: "400-500 words" },
] as const;

export type AIModelId = typeof AI_MODELS[number]["id"];
export type PostLength = typeof POST_LENGTHS[number]["id"];
