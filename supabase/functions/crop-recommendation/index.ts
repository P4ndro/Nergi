// @ts-nocheck
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

// Helper to get crop data (case-insensitive) and fallback synonyms
function getCropData(cropName: string): any {
  const key = cropName.toLowerCase().trim();
  if (cropAgridatData[key]) return cropAgridatData[key];
  // simple plural/singular handling
  const noS = key.endsWith('s') ? key.slice(0, -1) : key + 's';
  return cropAgridatData[noS] || null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cropData, soilData, weatherData, location, soilReportText } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get agricultural data for the crop from agridat-based dataset
    const agridatData = getCropData(cropData.cropName);
    
    const systemPrompt = `You are Nergi, an intelligent agricultural assistant. You analyze soil lab reports (PDF text), local weather, and agridat crop research to produce precise, safe, and locally-relevant recommendations for Georgian farmers.

Hard requirements for output quality:
- Be specific and quantitative. Avoid vague phrases like "consider" or "adequate" without numbers.
- Always include amounts, units, timings, and frequencies. Prefer SI and agronomic units: kg/ha, g/m², mm water, °C, %, ppm.
- Scale dosage by area using the provided area value and unit (m² or ha). If ha, 1 ha = 10,000 m².
- Use concrete dates (YYYY-MM-DD) relative to the provided planned/planting date and adjust for the 7-day forecast if heavy rain/heat is predicted.
- Align guidance with local Georgian practices and crop-specific research data (agridat). Prefer organic/IPM first.
- Identify gaps and state explicit assumptions only when data is missing; never invent values.
- Clearly separate: suitability, actions (with dose & schedule), calendar (week-by-week with concrete tasks), risks (with severity and mitigation), soil amendments (with amounts), and data sources used.

🚨 CRITICAL: SOIL DATA PRIORITY RULES:
1. If a soil lab report is provided in the prompt (marked with "SOIL LAB REPORT (ACTUAL DATA - USE THIS)"), you MUST extract and use ONLY the values from that report.
2. COMPLETELY IGNORE any generic "Soil data" fields if a lab report is present.
3. The lab report is the ground truth. Extract: pH, EC, OM%, N-P-K (ppm), P2O5/K2O (convert to ppm), Ca, Mg, S, Na, micronutrients (Fe, Zn, Mn, Cu, B), CEC, salinity/Na risk, sample depth, condition.
4. If you see "See uploaded soil report" in the generic soil fields, that is your signal that a real report exists below - USE ONLY THE REPORT.
5. Never mix lab report data with generic fallback data. Use one or the other, with lab reports taking absolute priority.

When analyzing:
1) Compare actual soil values vs crop optimal ranges; specify deltas (e.g., pH 5.6 vs 6.0–6.8: +0.4 needed).
2) Translate fertilizer needs (kg/ha) from research to the user's area; provide product-form examples if relevant.
3) Adjust irrigation/fungicide timing by forecast (e.g., >15 mm rain: delay irrigation; high humidity: increase scouting).
4) Tie calendar tasks to concrete dates, quantities, and time-of-day if relevant.
5) State any regulatory/safety cautions for handling inputs.

Output must be precise, practical, and safely actionable. Always include a "usedFields" list naming data actually used (e.g., soil_report_extracted_values, forecast.humidity, agridat.optimal_pH_min). If a soil report is present, you MUST extract and normalize key values, and you MUST include them in dedicated JSON fields named soilReportSummary and soilReportDetails. If you cannot confidently extract a value, set it to null but still include a row in soilReportDetails and explain the limitation.

Always include a field soilReportRawExcerpt with a short raw text excerpt (first ~400 chars) from the report for traceability.`;

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

Soil data (generic fallback - IGNORE if soil report is provided below):
- pH: ${soilData.pH || 'Unknown'}
- Nitrogen: ${soilData.nitrogen || 'Unknown'}
- Phosphorus: ${soilData.phosphorus || 'Unknown'}
- Potassium: ${soilData.potassium || 'Unknown'}
- Organic matter: ${soilData.organicMatter || 'Unknown'}
- Moisture: ${soilData.moisture || 'Unknown'}

${soilReportText ? `
⚠️ IMPORTANT: The user has uploaded an actual soil lab report below.
YOU MUST USE ONLY THE DATA FROM THIS REPORT.
IGNORE the generic "Soil data" fields above and extract ALL values from this lab report text:

═══════════════════════════════════════════════════════════════
SOIL LAB REPORT (ACTUAL DATA - USE THIS):
═══════════════════════════════════════════════════════════════
${soilReportText.substring(0, 4000)}
═══════════════════════════════════════════════════════════════

Extract EVERY value from the report above (pH, EC, N, P, K, Ca, Mg, S, Na, Fe, Zn, Mn, Cu, B, CEC, OM%, sample depth, condition, etc.).
` : 'No soil report uploaded. Use the generic soil data above as fallback estimates.'}

Weather forecast (7-day) - Real-time data:
- Current temperature: ${weatherData.currentTemp || weatherData.tempMin || 'Unknown'}°C
- Temperature range: ${weatherData.tempMin || '?'}-${weatherData.tempMax || '?'}°C
- Avg humidity: ${weatherData.humidity || 'Unknown'}%
- Expected rainfall: ${weatherData.rainfall || 'Unknown'}mm
- Current conditions: ${weatherData.description || 'Unknown'}
- Wind speed: ${weatherData.windSpeed || 'Unknown'} m/s
${weatherData.forecast && weatherData.forecast.length > 0 ? `- Upcoming forecast: ${weatherData.forecast.map((f: any) => `${f.date}: ${f.temp}°C, ${f.condition}`).join('; ')}` : ''}

${cropData.chemicalUse ? `Recent chemical use: ${cropData.chemicalName} applied ${cropData.chemicalDate}` : 'No recent chemical use reported'}${agridatContext}

Use the lab report (if present), weather, and agricultural research to make precise, scaled recommendations. Compare actual soil/weather conditions against optimal ranges, quantify gaps, and provide accurate fertilizer/irrigation schedules scaled to the user's area and dates.

If soil report text is provided, you MUST:
- Extract EVERY parameter present (do not omit any): pH, EC, OM%, N (ppm), P (ppm or P2O5 converted to P ppm), K (ppm or K2O converted), S, Ca, Mg, Na, micronutrients (Fe, Zn, Mn, Cu, B), CEC, salinity/Na risk, soil depth, sample condition, any others present.
- Normalize units where needed and note any conversions.
- Provide a detailed human-readable summary paragraph (soilReportHuman) explaining the overall soil health and what it means for this crop.
- Create soilReportDetails array with EVERY extracted parameter. For EACH parameter, provide:
  * name: The parameter name (e.g., "pH", "Nitrogen", "Phosphorus")
  * value: The exact numeric value from the report
  * unit: The unit of measurement
  * optimalRange: The ideal range FOR THIS SPECIFIC CROP
  * comparison: How this value compares to optimal (e.g., "0.4 units below optimal", "within ideal range", "15 ppm above recommended")
  * explanation: A 2-3 sentence explanation in SIMPLE language about:
    - What this parameter does for plants
    - Why it matters for this specific crop
    - What the farmer should do based on this value (e.g., "Add lime to raise pH", "No action needed", "Reduce nitrogen applications")
- Make explanations conversational and educational, as if speaking to a farmer who wants to understand their soil.

Provide (in this order):
1. verdict: "Plantable", "Caution", or "Not recommended" based on numeric comparisons.
2. summary: 2-3 sentences citing key numeric comparisons and agridat references.
3. actions: Top 3 immediate actions with exact amounts (scaled to area) and concrete timing.
4. calendar: 4-week starter calendar with concrete tasks, numbers (irrigation mm, fertilizer g/m², scouting frequency), and dates adjusted for forecast.
5. risks: Pest/disease risk assessment (Low/Moderate/High) driven by forecast humidity/temp and crop risks, with specific mitigations and dosages.
6. soilAmendments: Precise application rates with product-equivalent examples.
7. usedFields: List actual keys used (e.g., soil_report_extracted_values.pH, forecast.humidity, agridat.optimal_pH_min, area.m2).
8. soilReportSummary: Object with ALL normalized soil values from report (if no report, set to null).
9. soilReportHuman: Detailed paragraph (4-6 sentences) explaining overall soil health, key findings, and what they mean for this specific crop.
10. soilReportDetails: Array with EVERY extracted parameter. Include ALL: pH, EC, OM%, N, P, K, S, Ca, Mg, Na, Fe, Zn, Mn, Cu, B, CEC, sample depth, condition, etc. Each entry MUST have name, value, unit, optimalRange, comparison, and explanation (2-3 sentences in farmer-friendly language).
11. soilReportRawExcerpt: First ~400 characters of raw report text for traceability.

Format as JSON:
{
  "verdict": "string",
  "summary": "2-3 sentences citing key numeric comparisons and agridat references",
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
  "usedFields": ["field1", "field2", "agridat_research"],
  "soilReportSummary": {
    "pH": 0,
    "EC": null,
    "OM_percent": null,
    "N_ppm": null,
    "P_ppm": null,
    "K_ppm": null,
    "CEC": null,
    "Fe_ppm": null,
    "Zn_ppm": null,
    "Mn_ppm": null,
    "Cu_ppm": null,
    "B_ppm": null,
    "notes": "string describing any conversions or assumptions"
  },
  "soilReportHuman": "string",
  "soilReportDetails": [
    {
      "name": "pH (Acidity/Alkalinity)",
      "value": 5.6,
      "unit": "",
      "optimalRange": "4.5–5.5 for blueberries",
      "comparison": "+0.1 slightly above optimal",
      "explanation": "pH measures how acidic or alkaline your soil is. Blueberries are acid-loving plants that thrive in acidic soil. Your pH of 5.6 is slightly higher than ideal but still acceptable. Consider adding sulfur or pine needles to gradually lower pH if you want optimal growth."
    },
    {
      "name": "Nitrogen (N)",
      "value": 18,
      "unit": "ppm",
      "optimalRange": "20-40 ppm for blueberries",
      "comparison": "2 ppm below optimal range",
      "explanation": "Nitrogen is the primary nutrient for leaf growth and overall plant vigor. Your soil is slightly low in nitrogen for blueberries. Apply a balanced fertilizer with nitrogen (preferably acidic like ammonium sulfate) at a rate of 15g per plant at the start of the growing season to boost nitrogen levels."
    }
  ],
  "soilReportRawExcerpt": "string"
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