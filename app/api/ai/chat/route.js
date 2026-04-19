
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { messages, editorContext, model } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key not configured" },
        { status: 500 }
      );
    }

    // Validate and use the selected model
    const allowedModels = ["gemini-2.5-flash", "gemini-2.0-flash-exp"];
    // User explicitly requested 2.5 Flash only
    const modelName = allowedModels.includes(model) ? model : "gemini-2.5-flash";

    // Construct the full history for the API
    // Gemini API expects "parts" array with "text"
    const contents = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const systemInstruction = {
      role: "system",
      parts: [{
        text: `You are an Elite AI Editor & Writing Assistant for a premium content platform. 
The user is currently writing: "${editorContext ? editorContext.substring(0, 5000) : 'an empty document'}". 

Your Goals & Capabilities:
1. Enhance the user's writing to be "Top 1%" quality - engaging, clear, and professional.
2. For "Fix Grammar" or "Enhance Writing", YOU MUST respond directly with the corrected text or use the insertText tool if appropriate. DO NOT say you lack capabilities.
3. For "Generate Tags", output a horizontal list of 5-7 high-impact, SEO-friendly tags (e.g. #React #WebDev) AS PLAIN TEXT.
4. You have access to tools (insertText, addParagraph, etc.) to format the editor directly IF needed, but you can also just reply with normal chat text.
5. Keep your text responses concise, encouraging, and helpful. Always try to fulfill the user's request.`
      }]
    };

    // Define editor control functions for AI
    const tools = [{
      functionDeclarations: [
        {
          name: "insertText",
          description: "Insert text at the current cursor position in the editor",
          parameters: {
            type: "object",
            properties: {
              text: {
                type: "string",
                description: "The text to insert"
              }
            },
            required: ["text"]
          }
        },
        {
          name: "addParagraph",
          description: "Add a new paragraph with the specified text",
          parameters: {
            type: "object",
            properties: {
              text: {
                type: "string",
                description: "The text content of the paragraph"
              }
            },
            required: ["text"]
          }
        },
        {
          name: "addHeading",
          description: "Add a heading with specified level and text",
          parameters: {
            type: "object",
            properties: {
              level: {
                type: "integer",
                description: "Heading level from 1 to 6"
              },
              text: {
                type: "string",
                description: "The heading text"
              }
            },
            required: ["level", "text"]
          }
        },
        {
          name: "addFormattedText",
          description: "Insert text with specific formatting (bold, italic, etc.). Use this when user wants to add formatted text.",
          parameters: {
            type: "object",
            properties: {
              text: {
                type: "string",
                description: "The text content to insert"
              },
              format: {
                type: "string",
                description: "The format to apply to the text",
                enum: ["bold", "italic", "underline", "strike", "code", "normal"]
              }
            },
            required: ["text", "format"]
          }
        },
        {
          name: "insertList",
          description: "Insert a bullet or numbered list",
          parameters: {
            type: "object",
            properties: {
              type: {
                type: "string",
                description: "Type of list",
                enum: ["bullet", "numbered", "task"]
              },
              items: {
                type: "array",
                description: "List items (optional, for pre-populated lists)",
                items: {
                  type: "string"
                }
              }
            },
            required: ["type"]
          }
        },
        {
          name: "clearContent",
          description: "Clear all content from the editor",
          parameters: {
            type: "object",
            properties: {}
          }
        },
        {
          name: "replaceText",
          description: "Replace the user's currently selected text (or the entire content if none selected) with the provided text. Highly recommended for grammar fixes.",
          parameters: {
            type: "object",
            properties: {
              newText: {
                type: "string",
                description: "The corrected or enhanced text to replace the existing selection."
              }
            },
            required: ["newText"]
          }
        }
      ]
    }];

    try {

      // Use v1beta endpoint which supports function calling (tools parameter)
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${apiKey}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          contents,
          systemInstruction,
          tools,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ [Chat] API Error:`, errorData);
        throw new Error(errorData?.error?.message || `API returned ${response.status}`);
      }


      // Parse SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const stream = new ReadableStream({
        async start(controller) {
          try {
            let buffer = '';
            
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || ''; // Keep incomplete line in buffer
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const jsonStr = line.slice(6); // Remove 'data: ' prefix
                    if (jsonStr.trim() === '[DONE]') continue;
                    
                    const data = JSON.parse(jsonStr);
                    const candidate = data?.candidates?.[0];
                    
                    if (!candidate) continue;
                    
                    // Check for function call
                    const functionCall = candidate?.content?.parts?.[0]?.functionCall;
                    if (functionCall) {
                      // Send function call as JSON with special marker
                      const functionData = JSON.stringify({
                        type: 'function_call',
                        name: functionCall.name,
                        args: functionCall.args
                      }) + '\n';
                      controller.enqueue(new TextEncoder().encode(functionData));
                      continue;
                    }
                    
                    // Check for text response
                    const text = candidate?.content?.parts?.[0]?.text;
                    if (text) {
                      // Send text with marker
                      const textData = JSON.stringify({
                        type: 'text',
                        content: text
                      }) + '\n';
                      controller.enqueue(new TextEncoder().encode(textData));
                    }
                  } catch (parseErr) {
                    console.warn('Failed to parse SSE line:', line);
                  }
                }
              }
            }
            
            controller.close();
          } catch (e) {
            console.error('Stream error:', e);
            controller.error(e);
          }
        }
      });

      return new Response(stream, {
        headers: { 
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
      
    } catch (err) {
      console.error(`❌ [Chat] Error:`, err.message);
      throw err;
    }

  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { error: "Chat Failed", details: error.message },
      { status: 500 }
    );
  }
}
