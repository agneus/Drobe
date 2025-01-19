import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "@/env/variables";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function analyzePhoto(photoUri: string): Promise<any> {
  try {
    // Prepare the prompt
    const prompt = `
    Analyze this outfit using the following criteria. Be highly critical and detail-oriented in your evaluation:
  
    1. Gender Identification:
       - Clearly identify the gender of the person wearing the outfit based on clothing style and appearance.
  
    2. Fit Rating (out of 10):
       - Evaluate the overall fit of the outfit considering the following aspects:
         * **Color Combination**: Assess how well the colors of the outfit complement each other and the wearer’s skin tone (e.g., fair, olive, dark). Deduct points for clashing or unflattering colors.
         * **Evidence of "Looking Broke"**: Identify signs of old, cheap, or poorly maintained clothing (e.g., visible wear, wrinkles, poor material quality). Penalize for any such evidence.
         * **Fit Quality**: Judge how well the clothing fits the person’s body. Consider proportions, tailoring, and whether the clothing is too loose, tight, or ill-fitting. Adjust for gender norms in fit where applicable.
         * **Outfit Combination**: Evaluate how well individual pieces of the outfit work together as a cohesive ensemble. Look for balance, layering, and whether the accessories complement the main pieces.
       - Provide an average rating of 4 for neutral, uninspired, or average fit.
  
    3. Color Analysis:
       - Analyze the outfit’s color combinations, identifying any clashes or harmonious pairings.
       - Assess how well the colors complement the person’s skin tone, which you must describe (e.g., fair, olive, dark).
       - Penalize for poor contrasts or unflattering matches and highlight effective use of color.
  
    4. Style Recommendations:
       - Offer detailed suggestions on how the person could improve the outfit.
       - Be practical and specific (e.g., "swap the shoes for a neutral color," "add a fitted blazer to elevate the look").
  
    Respond in JSON format with the following structure:
    {
      "gender": "Male",
      "fitRating": 7,
      "colorAnalysis": "The colors work well with the individual’s olive skin tone, though the neon green clashes slightly with the neutral pants.",
      "styleRecommendations": "Consider replacing the neon green shirt with a more muted color and upgrading the shoes to a polished pair."
    }
  `;

    // Convert photo to a base64 string
    const photoBase64 = await fetch(photoUri)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      );

    const photoPart = {
      inlineData: {
        data: photoBase64.replace(/^data:image\/\w+;base64,/, ""),
        mimeType: "image/jpeg",
      },
    };

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Call the API
    const result = await model.generateContent([prompt, photoPart]);

    // Extract and clean the AI response
    const rawText = result.response.text();
    const cleanText = rawText.replace(/```json|```/g, "").trim();

    // Parse JSON response
    try {
      const analysis = JSON.parse(cleanText);
      return analysis; // Return the parsed analysis
    } catch (parseError) {
      console.error("JSON Parsing Error:", parseError);
      throw new Error("Failed to parse AI response");
    }
  } catch (error) {
    console.error("AI API Call Error:", error);
    throw new Error("AI analysis failed");
  }
}
