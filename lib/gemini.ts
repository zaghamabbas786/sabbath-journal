import { GoogleGenerativeAI } from '@google/generative-ai';
import { StepAnswer } from '@/types';

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing in environment variables.');
  }
  return new GoogleGenerativeAI(apiKey);
};

const getModel = () => {
  const client = getAiClient();
  return client.getGenerativeModel({ model: 'gemini-1.5-flash-002' });
};

export const generateGentleNudge = async (
  currentStepId: number, 
  previousAnswers: StepAnswer[]
): Promise<string | null> => {
  try {
    const model = getModel();
    const context = previousAnswers.map(a => `User wrote for step ${a.stepId}: "${a.answer}"`).join("\n");
    
    const stepPrompts: Record<number, string> = {
      1: "Help the user find something small to be grateful for if they are struggling.",
      2: "The user needs help imagining God seeing them physically and emotionally without judgment. Provide a gentle 1-sentence starting phrase.",
      3: "The user needs help articulating their internal monologue from God's perspective. Provide a gentle 1-sentence starting phrase.",
      4: "The user needs to feel understood. Provide a compassionate phrase from God's perspective acknowledging difficulty or desire.",
      5: "The user needs to sense God's presence. Provide a tender phrase about God being near.",
      6: "The user needs a resource (peace, wisdom, etc). Suggest a specific spiritual gift they might receive right now."
    };

    const specificInstruction = stepPrompts[currentStepId] || "Provide a gentle spiritual prompt.";

    const prompt = `
      You are a compassionate spiritual director assisting a user with Immanuel Journaling.
      The user is currently on Step ${currentStepId}.
      
      Previous Context:
      ${context}
      
      Task: ${specificInstruction}
      
      Tone: Tender, ancient, minimal, Jesus-centered.
      Output: Return ONLY one short, italicized suggestion sentence. Do not add explanations.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error generating nudge:", error);
    return null;
  }
};

export const generateBlessing = async (entry: StepAnswer[]): Promise<string | null> => {
  try {
    const model = getModel();
    const context = entry.map(a => `Step ${a.stepId}: ${a.answer}`).join("\n");
    
    const prompt = `
      Read this journal entry based on the Immanuel Method (Gratitude, God Sees, Hears, Understands, Is With, Has Resources).
      
      Journal:
      ${context}
      
      Task: Write a very short, poetic closing blessing (2-3 lines) summarizing the gift God gave them in the final step.
      Tone: Sacred, warm, benediction-like.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error generating blessing:", error);
    return null;
  }
};

export const generateScriptureDeclaration = async (entry: StepAnswer[]): Promise<{ lie: string; truth: string } | null> => {
  try {
    const model = getModel();
    const context = entry.map(a => `Step ${a.stepId} (${a.prompt}): "${a.answer}"`).join("\n");

    const prompt = `
      Analyze this Immanuel Journaling session context:
      ${context}

      Identify the specific lie the user has been believing (often revealed in the "God Hears" or "God Understands" steps).
      Identify the specific counter-truth God revealed (often in "God Is With You" or "God Has Resources").

      Return a valid JSON object with exactly two string fields:
      1. "lie": The content of the lie. (e.g., "I am entirely alone and responsible for everything")
      2. "truth": The content of the truth, incorporating biblical language or a scripture reference if it fits naturally. (e.g., "my Provider who knows my needs before I ask")

      Do not include the prefixes "I reject the lie that" or "Instead I declare that my Father is". Just the core message.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    if (!text) return null;
    
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error generating declaration:", error);
    return null;
  }
};

