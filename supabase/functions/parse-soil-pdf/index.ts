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
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const location = formData.get('location') as string;
    const crop = formData.get('crop') as string;

    if (!file) {
      throw new Error("No file uploaded");
    }

    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // For now, return text extraction with parsing hints
    // In production, you'd use a proper PDF parser
    const textDecoder = new TextDecoder('utf-8');
    const pdfText = textDecoder.decode(uint8Array);
    
    // Simple regex parsing for common soil parameters
    const getNumber = (patterns: string[]): number | null => {
      for (const p of patterns) {
        const re = new RegExp(p, "i");
        const match = pdfText.match(re);
        if (match && match[1]) {
          const val = parseFloat(match[1].replace(",", "."));
          if (!isNaN(val)) return val;
        }
      }
      return null;
    };

    const ph = getNumber([
      'pH[:\\s]*([0-9]+\\.?[0-9]*)',
      'pH\\s*=\\s*([0-9]+\\.?[0-9]*)'
    ]);
    
    const nitrogen = getNumber([
      'Nitrogen\\s*\\(?N\\)?[:\\s]*([0-9]+\\.?[0-9]*)',
      'N[:\\s]*([0-9]+\\.?[0-9]*)'
    ]);
    
    const phosphorus = getNumber([
      'Phosphorus\\s*\\(?P\\)?[:\\s]*([0-9]+\\.?[0-9]*)',
      'P[:\\s]*([0-9]+\\.?[0-9]*)'
    ]);
    
    const potassium = getNumber([
      'Potassium\\s*\\(?K\\)?[:\\s]*([0-9]+\\.?[0-9]*)',
      'K[:\\s]*([0-9]+\\.?[0-9]*)'
    ]);
    
    const organicMatter = getNumber([
      'Organic Matter[:\\s]*([0-9]+\\.?[0-9]*)',
      'Organic\\s*Matter\\s*\\(?%\\)?[:\\s]*([0-9]+\\.?[0-9]*)'
    ]);
    
    const ec = getNumber([
      'Electrical Conductivity[:\\s]*([0-9]+\\.?[0-9]*)',
      'EC[:\\s]*([0-9]+\\.?[0-9]*)'
    ]);

    // Return extracted data
    return new Response(
      JSON.stringify({
        success: true,
        pdf_text: pdfText.substring(0, 5000), // Limit response size
        parsed: {
          ph,
          nitrogen,
          phosphorus,
          potassium,
          organic_matter: organicMatter,
          electrical_conductivity: ec,
          location: location || "Unknown",
          crop: crop || null
        },
        fileName: file.name,
        fileSize: file.size
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in parse-soil-pdf function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        details: "Failed to parse PDF"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

