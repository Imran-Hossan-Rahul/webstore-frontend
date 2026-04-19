import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req) {
  try {
    const { prompt, text, type, model } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
    }

    const modelName = model || "gemini-2.5-flash"; 
    
    // Construct System Prompt based on type
    let systemInstruction = "";
    if (type === "enhance") {
      systemInstruction = "You are a professional editor. Rewrite the user's text to be more engaging, clear, and professional. Maintain the original meaning but improve flow and vocabulary. Output ONLY the rewritten text.";
    } else if (type === "grammar") {
      systemInstruction = "Fix all grammar, spelling, and punctuation errors in the user's text. Output ONLY the corrected text.";
    } else if (type === "search") {
      systemInstruction = "You are a search assistant. The user will provide a query. Return a refined, keyword-rich version of this query that would work best in a database search. Output ONLY the keywords.";
    } else {
      systemInstruction = "You are a helpful assistant. Output the requested text.";
    }

    const fullPrompt = `${systemInstruction}\n\nUser Text:\n"${text}"\n\nRefined Output:`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
        }
      })
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return NextResponse.json({ success: true, data: generatedText.trim() });

  } catch (error) {
    console.error("AI Generate Error:", error);
    return NextResponse.json({ error: "Generation Failed" }, { status: 500 });
  }
}
