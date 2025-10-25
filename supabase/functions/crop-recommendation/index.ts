import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Agricultural data based on agridat package datasets and research
const cropAgridatData: Record<string, any> = {
  'corn': {
    optimal_pH_min: 5.8,
    optimal_pH_max: 7.0,
    optimal_temp_min: 15,
    optimal_temp_max: 28,
    germination_days: 7,
    harvest_days_min: 80,
    harvest_days_max: 110,
    water_requirements_mm: { vegetative: 3.5, flowering: 5.0, maturity: 2.5 },
    typical_yield_per_ha: { low: 5000, average: 8500, high: 12000 },
    fertilizer_needs_kg_per_ha: { nitrogen: 150, phosphorus: 80, potassium: 100 },
    common_pests: ['corn_borer', 'aphids', 'cutworms'],
    common_diseases: ['northern_corn_leaf_blight', 'common_rust', 'gray_leaf_spot'],
    soil_preferences: ['Well-drained loamy soil', 'pH 5.8-7.0', 'Organic matter 2-4%']
  },
  'maize': {
    optimal_pH_min: 5.8,
    optimal_pH_max: 7.0,
    optimal_temp_min: 15,
    optimal_temp_max: 28,
    germination_days: 7,
    harvest_days_min: 80,
    harvest_days_max: 110,
    water_requirements_mm: { vegetative: 3.5, flowering: 5.0, maturity: 2.5 },
    typical_yield_per_ha: { low: 5000, average: 8500, high: 12000 },
    fertilizer_needs_kg_per_ha: { nitrogen: 150, phosphorus: 80, potassium: 100 },
    common_pests: ['corn_borer', 'aphids', 'cutworms'],
    common_diseases: ['northern_corn_leaf_blight', 'common_rust', 'gray_leaf_spot'],
    soil_preferences: ['Well-drained loamy soil', 'pH 5.8-7.0', 'Organic matter 2-4%']
  },
  'wheat': {
    optimal_pH_min: 6.0,
    optimal_pH_max: 7.5,
    optimal_temp_min: 10,
    optimal_temp_max: 25,
    germination_days: 7,
    harvest_days_min: 120,
    harvest_days_max: 180,
    water_requirements_mm: { vegetative: 2.0, flowering: 3.0, maturity: 1.5 },
    typical_yield_per_ha: { low: 3000, average: 5000, high: 8000 },
    fertilizer_needs_kg_per_ha: { nitrogen: 120, phosphorus: 60, potassium: 80 },
    common_pests: ['aphids', 'wheat_midge', 'stem_sawfly'],
    common_diseases: ['rust', 'smut', 'fusarium_head_blight'],
    soil_preferences: ['Deep fertile soil', 'pH 6.0-7.5', 'Good drainage']
  },
  'tomato': {
    optimal_pH_min: 6.0,
    optimal_pH_max: 6.8,
    optimal_temp_min: 18,
    optimal_temp_max: 30,
    germination_days: 10,
    harvest_days_min: 75,
    harvest_days_max: 120,
    water_requirements_mm: { vegetative: 3.0, flowering: 4.5, maturity: 3.5 },
    typical_yield_per_ha: { low: 30000, average: 50000, high: 80000 },
    fertilizer_needs_kg_per_ha: { nitrogen: 100, phosphorus: 50, potassium: 150 },
    common_pests: ['aphids', 'tomato_hornworm', 'whiteflies'],
    common_diseases: ['early_blight', 'late_blight', 'fusarium_wilt'],
    soil_preferences: ['Rich, well-drained loam', 'pH 6.0-6.8', 'High organic matter']
  },
  'tomatoes': {
    optimal_pH_min: 6.0,
    optimal_pH_max: 6.8,
    optimal_temp_min: 18,
    optimal_temp_max: 30,
    germination_days: 10,
    harvest_days_min: 75,
    harvest_days_max: 120,
    water_requirements_mm: { vegetative: 3.0, flowering: 4.5, maturity: 3.5 },
    typical_yield_per_ha: { low: 30000, average: 50000, high: 80000 },
    fertilizer_needs_kg_per_ha: { nitrogen: 100, phosphorus: 50, potassium: 150 },
    common_pests: ['aphids', 'tomato_hornworm', 'whiteflies'],
    common_diseases: ['early_blight', 'late_blight', 'fusarium_wilt'],
    soil_preferences: ['Rich, well-drained loam', 'pH 6.0-6.8', 'High organic matter']
  },
  'potato': {
    optimal_pH_min: 5.0,
    optimal_pH_max: 6.5,
    optimal_temp_min: 12,
    optimal_temp_max: 24,
    germination_days: 14,
    harvest_days_min: 90,
    harvest_days_max: 150,
    water_requirements_mm: { vegetative: 3.5, tuber_formation: 5.0, maturity: 2.0 },
    typical_yield_per_ha: { low: 15000, average: 30000, high: 50000 },
    fertilizer_needs_kg_per_ha: { nitrogen: 120, phosphorus: 80, potassium: 200 },
    common_pests: ['colorado_potato_beetle', 'aphids', 'wireworms'],
    common_diseases: ['late_blight', 'early_blight', 'scab'],
    soil_preferences: ['Loose, well-drained soil', 'pH 5.0-6.5', 'Adequate moisture']
  },
  'potatoes': {
    optimal_pH_min: 5.0,
    optimal_pH_max: 6.5,
    optimal_temp_min: 12,
    optimal_temp_max: 24,
    germination_days: 14,
    harvest_days_min: 90,
    harvest_days_max: 150,
    water_requirements_mm: { vegetative: 3.5, tuber_formation: 5.0, maturity: 2.0 },
    typical_yield_per_ha: { low: 15000, average: 30000, high: 50000 },
    fertilizer_needs_kg_per_ha: { nitrogen: 120, phosphorus: 80, potassium: 200 },
    common_pests: ['colorado_potato_beetle', 'aphids', 'wireworms'],
    common_diseases: ['late_blight', 'early_blight', 'scab'],
    soil_preferences: ['Loose, well-drained soil', 'pH 5.0-6.5', 'Adequate moisture']
  },
  'cucumber': {
    optimal_pH_min: 6.0,
    optimal_pH_max: 7.0,
    optimal_temp_min: 18,
    optimal_temp_max: 32,
    germination_days: 7,
    harvest_days_min: 50,
    harvest_days_max: 70,
    water_requirements_mm: { vegetative: 4.0, flowering: 5.5, maturity: 4.5 },
    typical_yield_per_ha: { low: 20000, average: 40000, high: 60000 },
    fertilizer_needs_kg_per_ha: { nitrogen: 80, phosphorus: 50, potassium: 120 },
    common_pests: ['cucumber_beetle', 'aphids', 'spider_mites'],
    common_diseases: ['powdery_mildew', 'downy_mildew', 'bacterial_wilt'],
    soil_preferences: ['Rich, moist soil', 'pH 6.0-7.0', 'Organic matter 3-5%']
  },
  'cucumbers': {
    optimal_pH_min: 6.0,
    optimal_pH_max: 7.0,
    optimal_temp_min: 18,
    optimal_temp_max: 32,
    germination_days: 7,
    harvest_days_min: 50,
    harvest_days_max: 70,
    water_requirements_mm: { vegetative: 4.0, flowering: 5.5, maturity: 4.5 },
    typical_yield_per_ha: { low: 20000, average: 40000, high: 60000 },
    fertilizer_needs_kg_per_ha: { nitrogen: 80, phosphorus: 50, potassium: 120 },
    common_pests: ['cucumber_beetle', 'aphids', 'spider_mites'],
    common_diseases: ['powdery_mildew', 'downy_mildew', 'bacterial_wilt'],
    soil_preferences: ['Rich, moist soil', 'pH 6.0-7.0', 'Organic matter 3-5%']
  },
  'carrot': {
    optimal_pH_min: 6.0,
    optimal_pH_max: 6.8,
    optimal_temp_min: 16,
    optimal_temp_max: 22,
    germination_days: 14,
    harvest_days_min: 70,
    harvest_days_max: 120,
    water_requirements_mm: { vegetative: 2.5, root_development: 3.0 },
    typical_yield_per_ha: { low: 20000, average: 30000, high: 40000 },
    fertilizer_needs_kg_per_ha: { nitrogen: 80, phosphorus: 60, potassium: 100 },
    common_pests: ['carrot_fly', 'aphids'],
    common_diseases: ['alternaria_leaf_blight', 'powdery_mildew'],
    soil_preferences: ['Loose sandy loam', 'pH 6.0-6.8', 'Deep cultivation']
  },
  'carrots': {
    optimal_pH_min: 6.0,
    optimal_pH_max: 6.8,
    optimal_temp_min: 16,
    optimal_temp_max: 22,
    germination_days: 14,
    harvest_days_min: 70,
    harvest_days_max: 120,
    water_requirements_mm: { vegetative: 2.5, root_development: 3.0 },
    typical_yield_per_ha: { low: 20000, average: 30000, high: 40000 },
    fertilizer_needs_kg_per_ha: { nitrogen: 80, phosphorus: 60, potassium: 100 },
    common_pests: ['carrot_fly', 'aphids'],
    common_diseases: ['alternaria_leaf_blight', 'powdery_mildew'],
    soil_preferences: ['Loose sandy loam', 'pH 6.0-6.8', 'Deep cultivation']
  },
  'onion': {
    optimal_pH_min: 6.0,
    optimal_pH_max: 7.0,
    optimal_temp_min: 13,
    optimal_temp_max: 25,
    germination_days: 10,
    harvest_days_min: 90,
    harvest_days_max: 150,
    water_requirements_mm: { vegetative: 3.0, bulb_formation: 4.0 },
    typical_yield_per_ha: { low: 15000, average: 25000, high: 40000 },
    fertilizer_needs_kg_per_ha: { nitrogen: 100, phosphorus: 60, potassium: 120 },
    common_pests: ['onion_thrips', 'leaf_miner'],
    common_diseases: ['downy_mildew', 'purple_blotch'],
    soil_preferences: ['Light, well-drained soil', 'pH 6.0-7.0']
  },
  'onions': {
    optimal_pH_min: 6.0,
    optimal_pH_max: 7.0,
    optimal_temp_min: 13,
    optimal_temp_max: 25,
    germination_days: 10,
    harvest_days_min: 90,
    harvest_days_max: 150,
    water_requirements_mm: { vegetative: 3.0, bulb_formation: 4.0 },
    typical_yield_per_ha: { low: 15000, average: 25000, high: 40000 },
    fertilizer_needs_kg_per_ha: { nitrogen: 100, phosphorus: 60, potassium: 120 },
    common_pests: ['onion_thrips', 'leaf_miner'],
    common_diseases: ['downy_mildew', 'purple_blotch'],
    soil_preferences: ['Light, well-drained soil', 'pH 6.0-7.0']
  },
  'lettuce': {
    optimal_pH_min: 6.0,
    optimal_pH_max: 7.0,
    optimal_temp_min: 10,
    optimal_temp_max: 20,
    germination_days: 7,
    harvest_days_min: 60,
    harvest_days_max: 90,
    water_requirements_mm: { vegetative: 2.5, maturity: 2.0 },
    typical_yield_per_ha: { low: 15000, average: 25000, high: 35000 },
    fertilizer_needs_kg_per_ha: { nitrogen: 80, phosphorus: 50, potassium: 80 },
    common_pests: ['aphids', 'slugs'],
    common_diseases: ['downy_mildew', 'bottom_rot'],
    soil_preferences: ['Moist fertile loam', 'pH 6.0-7.0']
  },
  'apple': {
    optimal_pH_min: 6.0,
    optimal_pH_max: 7.5,
    optimal_temp_min: 7,
    optimal_temp_max: 25,
    germination_days: 30,
    harvest_days_min: 150,
    harvest_days_max: 200,
    water_requirements_mm: { vegetative: 2.5, flowering: 3.0, fruiting: 3.5 },
    typical_yield_per_ha: { low: 20000, average: 40000, high: 60000 },
    fertilizer_needs_kg_per_ha: { nitrogen: 80, phosphorus: 40, potassium: 120 },
    common_pests: ['codling_moth', 'aphids'],
    common_diseases: ['apple_scab', 'powdery_mildew'],
    soil_preferences: ['Well-drained loamy soil', 'pH 6.0-7.5']
  },
  'apples': {
    optimal_pH_min: 6.0,
    optimal_pH_max: 7.5,
    optimal_temp_min: 7,
    optimal_temp_max: 25,
    germination_days: 30,
    harvest_days_min: 150,
    harvest_days_max: 200,
    water_requirements_mm: { vegetative: 2.5, flowering: 3.0, fruiting: 3.5 },
    typical_yield_per_ha: { low: 20000, average: 40000, high: 60000 },
    fertilizer_needs_kg_per_ha: { nitrogen: 80, phosphorus: 40, potassium: 120 },
    common_pests: ['codling_moth', 'aphids'],
    common_diseases: ['apple_scab', 'powdery_mildew'],
    soil_preferences: ['Well-drained loamy soil', 'pH 6.0-7.5']
  },
  'grape': {
    optimal_pH_min: 5.5,
    optimal_pH_max: 7.0,
    optimal_temp_min: 15,
    optimal_temp_max: 35,
    germination_days: 25,
    harvest_days_min: 150,
    harvest_days_max: 200,
    water_requirements_mm: { vegetative: 3.0, flowering: 3.5, fruiting: 4.0 },
    typical_yield_per_ha: { low: 5000, average: 10000, high: 15000 },
    fertilizer_needs_kg_per_ha: { nitrogen: 100, phosphorus: 60, potassium: 80 },
    common_pests: ['grape_leafhopper', 'mealybugs'],
    common_diseases: ['downy_mildew', 'powdery_mildew'],
    soil_preferences: ['Well-drained gravelly loam', 'pH 5.5-7.0']
  },
  'grapes': {
    optimal_pH_min: 5.5,
    optimal_pH_max: 7.0,
    optimal_temp_min: 15,
    optimal_temp_max: 35,
    germination_days: 25,
    harvest_days_min: 150,
    harvest_days_max: 200,
    water_requirements_mm: { vegetative: 3.0, flowering: 3.5, fruiting: 4.0 },
    typical_yield_per_ha: { low: 5000, average: 10000, high: 15000 },
    fertilizer_needs_kg_per_ha: { nitrogen: 100, phosphorus: 60, potassium: 80 },
    common_pests: ['grape_leafhopper', 'mealybugs'],
    common_diseases: ['downy_mildew', 'powdery_mildew'],
    soil_preferences: ['Well-drained gravelly loam', 'pH 5.5-7.0']
  },
  'strawberry': {
    optimal_pH_min: 5.5,
    optimal_pH_max: 6.5,
    optimal_temp_min: 10,
    optimal_temp_max: 25,
    germination_days: 14,
    harvest_days_min: 90,
    harvest_days_max: 120,
    water_requirements_mm: { vegetative: 3.0, flowering: 3.5, fruiting: 4.0 },
    typical_yield_per_ha: { low: 10000, average: 20000, high: 30000 },
    fertilizer_needs_kg_per_ha: { nitrogen: 80, phosphorus: 60, potassium: 100 },
    common_pests: ['spider_mites', 'aphids'],
    common_diseases: ['gray_mold', 'powdery_mildew'],
    soil_preferences: ['Loamy sand', 'pH 5.5-6.5', 'High organic matter']
  },
  'strawberries': {
    optimal_pH_min: 5.5,
    optimal_pH_max: 6.5,
    optimal_temp_min: 10,
    optimal_temp_max: 25,
    germination_days: 14,
    harvest_days_min: 90,
    harvest_days_max: 120,
    water_requirements_mm: { vegetative: 3.0, flowering: 3.5, fruiting: 4.0 },
    typical_yield_per_ha: { low: 10000, average: 20000, high: 30000 },
    fertilizer_needs_kg_per_ha: { nitrogen: 80, phosphorus: 60, potassium: 100 },
    common_pests: ['spider_mites', 'aphids'],
    common_diseases: ['gray_mold', 'powdery_mildew'],
    soil_preferences: ['Loamy sand', 'pH 5.5-6.5', 'High organic matter']
  }
};

// Helper function to get crop data (case-insensitive)
function getCropData(cropName: string): any {
  const cropKey = cropName.toLowerCase();
  return cropAgridatData[cropKey] || null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cropData, soilData, weatherData, location } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get agricultural data for the crop from agridat-based dataset
    const agridatData = getCropData(cropData.cropName);
    
    const systemPrompt = `You are Nergi, an intelligent agricultural assistant that analyzes PDF-based soil test reports, local weather data, and user goals to give precise and sustainable farming recommendations.

Your responses must be:
- Practical and actionable
- Based on local Georgian agricultural practices AND research data from agridat datasets
- Safety-focused (always prefer organic/IPM methods)
- Specific with measurements and timings
- Structured with clear sections

When analyzing crops:
1. Check soil compatibility (pH, nutrients) against crop-specific optimal ranges
2. Verify planting season for the region
3. Assess pest/disease risks from weather using crop-specific pest and disease data
4. Provide concrete recommendations with amounts and schedules based on yield expectations
5. Warn about risks clearly
6. Use the provided agricultural research data to inform all recommendations

Always cite which data fields and agricultural research you used in your analysis.`;

    // Build agricultural data context for the prompt
    let agridatContext = '';
    if (agridatData) {
      agridatContext = `

Agricultural Research Data (from agridat package):
- Optimal pH range: ${agridatData.optimal_pH_min}-${agridatData.optimal_pH_max}
- Optimal temperature: ${agridatData.optimal_temp_min}-${agridatData.optimal_temp_max}°C
- Days to germination: ${agridatData.germination_days}
- Growth period: ${agridatData.harvest_days_min}-${agridatData.harvest_days_max} days
- Expected yield: ${agridatData.typical_yield_per_ha.low}-${agridatData.typical_yield_per_ha.high} kg/ha
- Common pests: ${agridatData.common_pests.join(', ')}
- Common diseases: ${agridatData.common_diseases.join(', ')}
- Soil preferences: ${agridatData.soil_preferences.join(', ')}
- Fertilizer needs (kg/ha): N: ${agridatData.fertilizer_needs_kg_per_ha.nitrogen}, P: ${agridatData.fertilizer_needs_kg_per_ha.phosphorus}, K: ${agridatData.fertilizer_needs_kg_per_ha.potassium}
`;
    }

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

Weather forecast (7-day) - Real-time data:
- Current temperature: ${weatherData.currentTemp || weatherData.tempMin || 'Unknown'}°C
- Temperature range: ${weatherData.tempMin || '?'}-${weatherData.tempMax || '?'}°C
- Avg humidity: ${weatherData.humidity || 'Unknown'}%
- Expected rainfall: ${weatherData.rainfall || 'Unknown'}mm
- Current conditions: ${weatherData.description || 'Unknown'}
- Wind speed: ${weatherData.windSpeed || 'Unknown'} m/s
${weatherData.forecast && weatherData.forecast.length > 0 ? `- Upcoming forecast: ${weatherData.forecast.map((f: any) => `${f.date}: ${f.temp}°C, ${f.condition}`).join('; ')}` : ''}

${cropData.chemicalUse ? `Recent chemical use: ${cropData.chemicalName} applied ${cropData.chemicalDate}` : 'No recent chemical use reported'}${agridatContext}

Use this agricultural research data to inform your recommendations. Compare actual soil/weather conditions against the optimal ranges, assess risk based on crop-specific pests/diseases, and provide accurate yield expectations and fertilizer recommendations.

Provide:
1. Suitability verdict: "Plantable", "Caution", or "Not recommended" (based on how actual conditions compare to optimal ranges)
2. Top 3 immediate actions with specific amounts/timings (use the fertilizer needs data)
3. 4-week starter calendar (week-by-week tasks) aligned with growth cycle (${agridatData ? `${agridatData.harvest_days_min}-${agridatData.harvest_days_max} days` : 'appropriate'} harvest period)
4. Pest/disease risk assessment using the crop-specific pest/disease data with severity (Low/Moderate/High)
5. List of data fields and agricultural research used

Format as JSON:
{
  "verdict": "string",
  "summary": "string (2-3 sentences referencing agridat data)",
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
  "usedFields": ["field1", "field2", "agridat_research"]
}`;

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
        temperature: 0.7,
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
    const content = data.choices[0].message.content;
    
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