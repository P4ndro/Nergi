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
    const { cropData, soilData, weatherData, location, additionalContext } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const systemPrompt = `You are Nergi, an AI agricultural assistant helping farmers in Georgia. You provide expert advice on crop planting, soil management, and pest control.

Your responses must be:
- Practical and actionable
- Based on local Georgian agricultural practices
- Safety-focused (always prefer organic/IPM methods)
- Specific with measurements and timings
- Structured with clear sections

When analyzing crops:
1. Check soil compatibility (pH, nutrients)
2. Verify planting season for the region
3. Assess pest/disease risks from weather
4. Provide concrete recommendations with amounts and schedules
5. Warn about risks clearly

Always cite which data fields you used in your analysis.`;

    const userPrompt = `Analyze this crop planting request:

Crop: ${cropData.cropName}${cropData.variety ? ` (${cropData.variety})` : ''}
Status: ${cropData.status}
${cropData.status === 'planned' ? `Planned date: ${cropData.plannedDate}` : `Already planted: ${cropData.plantingDate}`}
Area: ${cropData.areaValue} ${cropData.areaUnit}
Method: ${cropData.plantingMethod}
Location: ${location.region} (${location.lat}, ${location.lon})

Soil data:
- pH: ${soilData.pH || 'Unknown'}
- Nitrogen: ${soilData.nitrogen || 'Unknown'}
- Phosphorus: ${soilData.phosphorus || 'Unknown'}
- Potassium: ${soilData.potassium || 'Unknown'}
- Organic matter: ${soilData.organicMatter || 'Unknown'}
- Moisture: ${soilData.moisture || 'Unknown'}

Weather forecast (7-day):
- Avg humidity: ${weatherData.humidity || 'Unknown'}%
- Rainfall: ${weatherData.rainfall || 'Unknown'}mm
- Temp range: ${weatherData.tempMin || '?'}-${weatherData.tempMax || '?'}°C

${cropData.chemicalUse ? `Recent chemical use: ${cropData.chemicalName} applied ${cropData.chemicalDate}` : 'No recent chemical use reported'}

${additionalContext ? `\nAdditional context from uploaded files:\n${additionalContext}` : ''}

Provide:
1. Suitability verdict: "Plantable", "Caution", or "Not recommended"
2. Top 3 immediate actions with specific amounts/timings
3. 4-week starter calendar (week-by-week tasks)
4. Pest/disease risk assessment with severity (Low/Moderate/High)
5. List of data fields used

Format as JSON:
{
  "verdict": "string",
  "summary": "string (2-3 sentences)",
  "actions": ["action1", "action2", "action3"],
  "calendar": [
    {"week": 1, "tasks": ["task1", "task2"]},
    {"week": 2, "tasks": ["task1", "task2"]},
    {"week": 3, "tasks": ["task1", "task2"]},
    {"week": 4, "tasks": ["task1", "task2"]}
  ],
  "risks": [
    {"type": "fungal|insect|weather", "severity": "Low|Moderate|High", "description": "string", "mitigation": "string"}
  ],
  "soilAmendments": ["amendment with amount"],
  "usedFields": ["field1", "field2"]
}`;

    // Use Gemini API directly via Google AI
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: systemPrompt + "\n\n" + userPrompt }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service requires payment. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("AI gateway request failed");
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    
    // Try to parse JSON response
    let recommendation;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                       content.match(/```\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      recommendation = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", e);
      // Return a structured fallback
      recommendation = {
        verdict: "Caution",
        summary: content.substring(0, 300),
        actions: ["Review AI response manually"],
        calendar: [],
        risks: [],
        soilAmendments: [],
        usedFields: [],
        rawResponse: content
      };
    }

    return new Response(
      JSON.stringify(recommendation),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in crop-recommendation function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: "Failed to generate crop recommendation"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});