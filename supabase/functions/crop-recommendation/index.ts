// Types for the RAG system
interface PestDiseaseInfo {
  name: string;
  type: 'pest' | 'disease';
  affects_crops: string[];
  symptoms: string[];
  favorable_conditions: {
    temperature_range?: string;
    humidity_range?: string;
    season?: string[];
  };
  prevention: string[];
  treatment: string[];
}

interface PesticideProduct {
  name: string;
  active_ingredient: string;
  type: 'fungicide' | 'insecticide' | 'herbicide';
  targets: string[];
  application_rate: string;
  application_method: string;
  preharvest_interval_days: number;
  purchase_links: Array<{
    supplier: string;
    url: string;
    price: string;
  }>;
  safety_precautions: string;
  approved_for_organic: boolean;
}

// Sample pest/disease database
const sampleThreats: PestDiseaseInfo[] = [
  {
    name: "Late Blight",
    type: "disease",
    affects_crops: ["tomato", "potato"],
    symptoms: [
      "Dark brown spots on leaves",
      "White fungal growth on leaf undersides",
      "Fruit rot with brown lesions"
    ],
    favorable_conditions: {
      temperature_range: "15-25°C",
      humidity_range: ">70%",
      season: ["spring", "autumn"]
    },
    prevention: [
      "Remove infected plant debris",
      "Avoid overhead watering",
      "Space plants for air circulation"
    ],
    treatment: [
      "Apply copper-based fungicide",
      "Remove and destroy infected leaves",
      "Apply preventative fungicide in wet weather"
    ]
  },
  {
    name: "Aphids",
    type: "pest",
    affects_crops: ["tomato", "cucumber", "pepper", "potato"],
    symptoms: [
      "Curled or yellowing leaves",
      "Sticky honeydew on leaves",
      "Stunted plant growth"
    ],
    favorable_conditions: {
      temperature_range: "18-27°C",
      season: ["spring", "summer"]
    },
    prevention: [
      "Encourage beneficial insects",
      "Use reflective mulch",
      "Remove weeds that harbor aphids"
    ],
    treatment: [
      "Spray with insecticidal soap",
      "Apply neem oil",
      "Release ladybugs"
    ]
  },
  {
    name: "Whitefly",
    type: "pest",
    affects_crops: ["tomato", "cucumber", "potato"],
    symptoms: [
      "White flying insects on undersides",
      "Yellowing leaves",
      "Sooty mold on honeydew"
    ],
    favorable_conditions: {
      temperature_range: "20-30°C",
      humidity_range: ">60%",
      season: ["summer"]
    },
    prevention: [
      "Use yellow sticky traps",
      "Avoid over-fertilizing with nitrogen",
      "Remove infested leaves"
    ],
    treatment: [
      "Apply systemic insecticide",
      "Use insecticidal soap",
      "Introduce parasitic wasps"
    ]
  },
  {
    name: "Colorado Potato Beetle",
    type: "pest",
    affects_crops: ["potato"],
    symptoms: [
      "Yellow-orange beetles with black stripes",
      "Defoliation of plants",
      "Orange egg clusters on leaf undersides"
    ],
    favorable_conditions: {
      temperature_range: "20-30°C",
      season: ["spring", "summer"]
    },
    prevention: [
      "Crop rotation",
      "Hand-pick beetles and egg masses",
      "Use mulch to deter adults"
    ],
    treatment: [
      "Apply targeted insecticide",
      "Use Bacillus thuringiensis (Bt)",
      "Introduce natural predators"
    ]
  }
];

// Sample pesticide database with REAL Georgian suppliers
const samplePesticides: PesticideProduct[] = [
  {
    name: "Ridomil Gold MZ 68 WP",
    active_ingredient: "Metalaxyl-M 4% + Mancozeb 64%",
    type: "fungicide",
    targets: ["late blight", "downy mildew", "early blight"],
    application_rate: "2.5 kg/ha (25g per 100m²)",
    application_method: "foliar spray, apply every 7-10 days",
    preharvest_interval_days: 14,
    purchase_links: [
      {
        supplier: "Agrosphere",
        url: "https://agrosphere.ge/en",
        price: "Contact for pricing"
      },
      {
        supplier: "GREENLAB Tbilisi",
        url: "https://greenlab.ge/en/plant-protection/",
        price: "Contact for pricing"
      }
    ],
    safety_precautions: "Wear gloves and mask. Avoid spraying in windy conditions. Do not apply near water sources.",
    approved_for_organic: false
  },
  {
    name: "Actara 25 WG",
    active_ingredient: "Thiamethoxam 25%",
    type: "insecticide",
    targets: ["aphids", "whiteflies", "thrips", "colorado potato beetle"],
    application_rate: "80-100 g/ha (0.8-1g per 100m²)",
    application_method: "foliar spray or soil drench",
    preharvest_interval_days: 7,
    purchase_links: [
      {
        supplier: "Agrosphere",
        url: "https://agrosphere.ge/en",
        price: "Contact for pricing"
      },
      {
        supplier: "GREENLAB Tbilisi",
        url: "https://greenlab.ge/en/plant-protection/insecticides/",
        price: "Contact for pricing"
      }
    ],
    safety_precautions: "Highly toxic to bees - do not spray during flowering. Use protective equipment.",
    approved_for_organic: false
  },
  {
    name: "Bordeaux Mixture (Copper Sulfate)",
    active_ingredient: "Copper Sulfate 20% + Calcium Hydroxide",
    type: "fungicide",
    targets: ["late blight", "downy mildew", "bacterial diseases"],
    application_rate: "5-10 kg/ha (50-100g per 100m²)",
    application_method: "foliar spray, apply every 10-14 days",
    preharvest_interval_days: 21,
    purchase_links: [
      {
        supplier: "GREENLAB Tbilisi",
        url: "https://greenlab.ge/en/plant-protection/",
        price: "Contact for pricing"
      },
      {
        supplier: "AGROW Agriculture",
        url: "http://agrow.ge/en/",
        price: "Contact for pricing"
      }
    ],
    safety_precautions: "Avoid contact with skin. Do not mix with other products.",
    approved_for_organic: true
  },
  {
    name: "Neem Oil (Organic)",
    active_ingredient: "Azadirachtin 0.3%",
    type: "insecticide",
    targets: ["aphids", "whiteflies", "spider mites", "thrips"],
    application_rate: "2-5 ml per liter of water",
    application_method: "foliar spray, apply every 7 days",
    preharvest_interval_days: 0,
    purchase_links: [
      {
        supplier: "GREENLAB Tbilisi",
        url: "https://greenlab.ge/en/plant-protection/insecticides/",
        price: "Contact for pricing"
      }
    ],
    safety_precautions: "Safe for beneficial insects. Avoid spraying in direct sunlight.",
    approved_for_organic: true
  },
  {
    name: "Copper-based Fungicide",
    active_ingredient: "Copper Hydroxide",
    type: "fungicide",
    targets: ["late blight", "early blight", "bacterial spot"],
    application_rate: "2-3 kg/ha",
    application_method: "foliar spray",
    preharvest_interval_days: 14,
    purchase_links: [
      {
        supplier: "Agrosphere",
        url: "https://agrosphere.ge/en/about",
        price: "Contact for pricing"
      }
    ],
    safety_precautions: "Wear protective equipment. Avoid contact with eyes and skin.",
    approved_for_organic: true
  },
  {
    name: "Insecticidal Soap",
    active_ingredient: "Potassium salts of fatty acids",
    type: "insecticide",
    targets: ["aphids", "whiteflies", "spider mites"],
    application_rate: "15-30 ml per liter of water",
    application_method: "foliar spray, apply every 5-7 days",
    preharvest_interval_days: 0,
    purchase_links: [
      {
        supplier: "GREENLAB Tbilisi",
        url: "https://greenlab.ge/en/",
        price: "Contact for pricing"
      }
    ],
    safety_precautions: "Safe for beneficial insects. Test on small area first.",
    approved_for_organic: true
  }
];

// Sample fertilizer database
const sampleFertilizers = [
  {
    name: "Superphosphate (Single)",
    type: "superphosphate",
    nutrient_content: "18-20% P2O5",
    application_rate: "150-200 kg/ha",
    timing: "Pre-planting, 2-3 weeks before seeding",
    purchase_links: [
      { supplier: "Agrosphere", url: "https://agrosphere.ge/en", price: "Contact for pricing" },
      { supplier: "GREENLAB Tbilisi", url: "https://greenlab.ge/en/fertilizers/", price: "Contact for pricing" }
    ]
  },
  {
    name: "Rock Phosphate",
    type: "phosphate",
    nutrient_content: "28-32% P2O5",
    application_rate: "300-500 kg/ha",
    timing: "Pre-planting",
    purchase_links: [
      { supplier: "AGROW Agriculture", url: "http://agrow.ge/en/", price: "Contact for pricing" }
    ]
  },
  {
    name: "Bone Meal",
    type: "phosphate",
    nutrient_content: "15-25% P2O5",
    application_rate: "200-400 kg/ha",
    timing: "Pre-planting, organic option",
    purchase_links: [
      { supplier: "GREENLAB Tbilisi", url: "https://greenlab.ge/en/fertilizers/", price: "Contact for pricing" }
    ]
  }
];

// Simple recommendation generator using basic logic
function generateRecommendation(cropData: any, soilData: any, weatherData: any, location: any) {
  // Basic suitability assessment
  const tempRange = weatherData.tempMax - weatherData.tempMin;
  const avgTemp = (weatherData.tempMin + weatherData.tempMax) / 2;
  
  let verdict = "Plantable";
  let summary = "";
  
  // Temperature-based assessment
  if (avgTemp < 10 || avgTemp > 35) {
    verdict = "Not recommended";
    summary = `Temperature range (${weatherData.tempMin}-${weatherData.tempMax}°C) is outside optimal growing conditions for ${cropData.cropName}.`;
  } else if (avgTemp < 15 || avgTemp > 30) {
    verdict = "Caution";
    summary = `Temperature range (${weatherData.tempMin}-${weatherData.tempMax}°C) may be challenging for ${cropData.cropName}. Monitor growth closely.`;
  } else {
    summary = `Temperature range (${weatherData.tempMin}-${weatherData.tempMax}°C) is suitable for ${cropData.cropName}.`;
  }

  // Generate recommendations based on crop type and conditions
  const actions = [
    `Prepare soil for ${cropData.cropName} planting`,
    `Monitor soil moisture levels (current humidity: ${weatherData.humidity}%)`,
    `Check weather forecast for optimal planting timing`
  ];

  const soilAmendments = [
    "Test soil pH and nutrient levels",
    "Add organic matter if needed",
    "Ensure proper drainage"
  ];

  const calendar = [
    {
      week: 1,
      tasks: [
        "Prepare planting area",
        "Check soil conditions",
        "Review weather forecast"
      ]
    },
    {
      week: 2,
      tasks: [
        "Plant seeds/seedlings",
        "Water appropriately",
        "Monitor germination"
      ]
    },
    {
      week: 3,
      tasks: [
        "Check plant growth",
        "Monitor for pests",
        "Adjust watering schedule"
      ]
    },
    {
      week: 4,
      tasks: [
        "Continue monitoring",
        "Apply fertilizers if needed",
        "Prepare for next growth phase"
      ]
    }
  ];

  const risks = [
    {
      type: "weather",
      severity: avgTemp > 30 ? "High" : avgTemp < 15 ? "Moderate" : "Low",
      description: `Temperature extremes may affect ${cropData.cropName} growth`,
      mitigation: "Monitor weather conditions and provide protection if needed"
    },
    {
      type: "fungal",
      severity: weatherData.humidity > 80 ? "High" : weatherData.humidity > 60 ? "Moderate" : "Low",
      description: "High humidity may promote fungal diseases",
      mitigation: "Ensure good air circulation and avoid overhead watering"
    }
  ];

  return {
    verdict,
    summary,
    actions,
    soilAmendments,
    calendar,
    risks,
    usedFields: ["weather_data", "crop_data", "location_data"]
  };
}

// Exported HTTP handler for Supabase Edge Function
export default async function handler(req: Request) {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'POST required' }), { 
        status: 405, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const body = await req.json();
    const { cropData, soilData, weatherData, location } = body;

    if (!cropData || !weatherData) {
      return new Response(JSON.stringify({ error: 'Missing cropData or weatherData' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Generate recommendation using basic logic
    const response = generateRecommendation(cropData, soilData, weatherData, location);

    return new Response(JSON.stringify(response), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || String(error) 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}