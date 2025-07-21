import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const prompt = `You are VoltAssist, an expert AI assistant specializing in electric scooters in India. Your role is to provide helpful, accurate information about electric scooter purchase, usage, maintenance, and troubleshooting.

CONTEXT: You work for an electric scooter company that serves Indian customers. Be knowledgeable about:
- Indian electric scooter brands (Ather, Bajaj Chetak, TVS iQube, Ola S1, etc.)
- Indian market conditions (FAME II subsidies, RTO procedures, monsoon considerations)
- Local pricing in Indian Rupees (₹)
- Indian traffic conditions and regulations
- Charging infrastructure in Indian cities

GUIDELINES:
- Be conversational and helpful
- Use Indian context and examples
- Mention specific models and brands when relevant
- Include practical advice for Indian conditions
- If unsure about technical details, suggest contacting customer support
- Keep responses concise but informative (2-4 sentences)
- Use Indian English and familiar terms

${context ? `PREVIOUS CONTEXT: ${context}` : ''}

USER QUESTION: ${message}

Provide a helpful response about electric scooters:`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 32,
          topP: 1,
          maxOutputTokens: 300,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('No response generated from Gemini');
    }

    const generatedText = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ 
      response: generatedText,
      source: 'gemini'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in gemini-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      source: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});