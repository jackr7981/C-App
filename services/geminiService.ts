import { GoogleGenAI, Type, Schema } from "@google/genai";

// Schema for menu analysis
const menuSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    meal_type: { type: Type.STRING, enum: ["Breakfast", "Lunch", "Dinner"] },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING, enum: ["main", "side", "dessert", "beverage", "fruit"] },
          estimated_calories: { type: Type.INTEGER },
          dietary_flags: {
            type: Type.OBJECT,
            properties: {
              contains_pork: { type: Type.BOOLEAN },
              contains_beef: { type: Type.BOOLEAN },
              contains_shellfish: { type: Type.BOOLEAN },
              vegetarian: { type: Type.BOOLEAN },
              halal_compliant: { type: Type.BOOLEAN },
            },
            required: ["contains_pork", "contains_beef", "vegetarian", "halal_compliant"]
          },
        },
        required: ["name", "category", "estimated_calories", "dietary_flags"]
      }
    }
  },
  required: ["meal_type", "items"]
};

// Schema for crew roster extraction
const crewRosterSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    crew_members: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          rank: { type: Type.STRING },
          crew_id: { type: Type.STRING },
          nationality: { type: Type.STRING },
        },
        required: ["name", "rank"]
      }
    }
  },
  required: ["crew_members"]
};

// Extracted from Guidelines for Overweight Prevention Onboard Merchant Ships (Pages 8-9)
const MARITIME_CALORIE_GUIDELINES = `
Use the following Maritime Nutrition Guidelines for calorie estimation. Assume standard portion sizes as defined below:

MEAT & FISH (Per 100g / Standard Portion):
- Beef (roast): 280 Kcal/100g (Portion ~107g = 300 Kcal)
- Chicken: 200 Kcal/100g (Portion ~110g = 220 Kcal)
- Pork: 290 Kcal/100g (Portion ~110g = 320 Kcal)
- Bacon (fried): 500 Kcal/100g (2 rashers = 250 Kcal)
- Sausage (pork fried): 320 Kcal/100g (Portion ~78g = 250 Kcal)
- Salmon (fresh): 180 Kcal/100g (Portion ~122g = 220 Kcal)
- Ham: 240 Kcal/100g
- Lamb (roast): 300 Kcal/100g

STARCHES & GRAINS (Per 100g / Standard Portion):
- Rice (white boiled): 140 Kcal/100g (Portion ~300g = 420 Kcal)
- Pasta (boiled): 110 Kcal/100g (Portion ~300g = 330 Kcal)
- Potatoes (boiled): 70 Kcal/100g (Portion ~300g = 210 Kcal)
- Bread (white thick slice): 240 Kcal/100g (1 slice ~40g = 96 Kcal)
- Noodles (boiled): 70 Kcal/100g (Portion ~250g = 175 Kcal)

DAIRY & EGGS:
- Eggs: 150 Kcal/100g (1 average egg ~60g = 90 Kcal)
- Cheese (average): 440 Kcal/100g (Portion ~25g = 110 Kcal)
- Milk (whole): 70 Kcal/100g
- Yogurt (natural): 60 Kcal/100g (1 small pot = 90 Kcal)

FRUIT & VEG (Per 100g):
- Apple: 44 Kcal
- Banana: 65 Kcal (1 medium ~165g = 107 Kcal)
- Broccoli: 32 Kcal
- Peas: 148 Kcal
- Carrots/Mixed Veg: ~35-50 Kcal

NOTE: A complete hot meal (main + side + dessert) typically delivers ~885 Kcal (30-35% of daily need).
`;

export const analyzeMenuImage = async (base64Image: string): Promise<any> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key not found");

    const ai = new GoogleGenAI({ apiKey });
    
    // Using gemini-3-flash-preview as it supports responseSchema and multimodal input.
    // gemini-2.5-flash-image does NOT support JSON mode.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: `Analyze this menu image. Extract items and flag dietary restrictions.
          
          ESTIMATE CALORIES based strictly on these Maritime Guidelines:
          ${MARITIME_CALORIE_GUIDELINES}
          
          If an item is not listed, estimate using similar ingredients based on standard maritime serving sizes.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: menuSchema
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Return mock data fallback if API fails or key is missing for demo purposes
    return null;
  }
};

export const analyzeCrewRoster = async (base64Image: string): Promise<any> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key not found");

    const ai = new GoogleGenAI({ apiKey });

    // Using gemini-3-flash-preview as it supports responseSchema and multimodal input.
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                { text: "Extract crew roster information from this document image." }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: crewRosterSchema
        }
    });
    
    if (response.text) {
        return JSON.parse(response.text);
    }
    return null;

  } catch (error) {
    console.error("Roster Analysis Error", error);
    return null;
  }
}