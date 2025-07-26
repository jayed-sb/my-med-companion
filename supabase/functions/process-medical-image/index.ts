import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;
    
    if (!imageFile) {
      return new Response(JSON.stringify({ error: 'No image file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Convert image to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const imageDataUrl = `data:${imageFile.type};base64,${base64}`;

    console.log('Processing medical image with OpenAI Vision API');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a medical document analysis AI. Extract key information from medical documents including:
            - Patient information (if visible)
            - Doctor/clinic information
            - Date of document
            - Type of document (prescription, lab report, X-ray, etc.)
            - Key medical findings, medications, or results
            - Diagnosis or medical conditions mentioned
            - Any medications with dosages
            
            Return the extracted information in a structured JSON format with the following fields:
            {
              "documentType": "string",
              "doctorName": "string",
              "clinicName": "string", 
              "documentDate": "string (YYYY-MM-DD format if available)",
              "extractedText": "string (main content)",
              "medications": ["array of medications with dosages"],
              "diagnosis": "string",
              "keyFindings": ["array of key medical findings"],
              "recommendations": "string"
            }`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this medical document and extract the key information in the specified JSON format.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageDataUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const extractedContent = data.choices[0].message.content;
    
    // Try to parse as JSON, fallback to plain text if not valid JSON
    let extractedData;
    try {
      extractedData = JSON.parse(extractedContent);
    } catch {
      extractedData = {
        documentType: "Unknown",
        doctorName: "",
        clinicName: "",
        documentDate: "",
        extractedText: extractedContent,
        medications: [],
        diagnosis: "",
        keyFindings: [],
        recommendations: ""
      };
    }

    console.log('Successfully processed medical image');

    return new Response(JSON.stringify({ 
      success: true, 
      extractedData,
      originalFileName: imageFile.name
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-medical-image function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});