/**
 * DeepSeek AI Integration for FoodAI Chatbot
 * 
 * This module handles communication with DeepSeek's AI API to provide
 * intelligent food deal recommendations and restaurant advice.
 */

import OpenAI from 'openai';

// DeepSeek API client (compatible with OpenAI SDK)
export const deepseekClient = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
});

/**
 * Generate AI response for food deal queries
 * @param {Array} messages - Array of chat messages
 * @param {Object} context - Additional context about available offers
 * @returns {Object} AI response message
 */
export const generateFoodDealResponse = async (messages, context = null) => {
  const startTime = Date.now();
  let status = 'success';
  
  try {
    // Enhanced system prompt with Finnish context and current deals
    const systemPrompt = `Olet FoodAI:n avustaja, joka auttaa löytämään parhaita ruokatarjouksia Suomessa. 

KONTEKSTI:
- Palvelemme Suomen markkinoita (Helsinki, Tampere, Turku, Oulu, jne.)
- Integroituna Wolt, Foodora ja ResQ Club palveluihin
- ResQ Club erikoistunut ylijäämäruoan myyntiin ympäristöystävällisesti
- Hinnat euroissa (€), alennus% ja säästöt
- Puhut sujuvaa suomea ja englantia

TEHTÄVÄSI:
✅ Etsi ja suosittele ruokatarjouksia
✅ Vertaile hintoja ja alennuksia  
✅ Anna ravintola-suosituksia sijainnin perusteella
✅ Kerro erikoistarjouksista ja rajoitetuista kaupoista
✅ Auta ruokavaliorajoituksissa (vegan, gluteeniton, jne.)
✅ Selitä toimitus/nouto-vaihtoehdot
✅ Mainitse ympäristövaikutukset (ResQ Club)

TYYLI:
- Ystävällinen ja käytännöllinen
- Anna konkreettisia vinkkejä
- Mainitse hinnat ja säästöt
- Käytä emojeja kohtuudella 🍕🍔🌱
- Vastaa käyttäjän kielellä (suomi/englanti)

${context ? `\nNYKYISET TARJOUKSET:\n${JSON.stringify(context, null, 2)}` : ''}`;

    const response = await deepseekClient.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1000,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const duration = Date.now() - startTime;
    console.log(`DeepSeek API call successful in ${duration}ms`);

    return response.choices[0].message;
  } catch (error) {
    status = 'error';
    const duration = Date.now() - startTime;
    console.error('DeepSeek API Error:', error);
    
    // Log for monitoring
    console.log(`DeepSeek API call failed in ${duration}ms - Status: ${status}`);
    
    // Return a helpful fallback response
    throw new Error('DeepSeek palvelu ei ole tällä hetkellä käytettävissä. Yritä hetken kuluttua uudelleen.');
  }
};

/**
 * Generate streaming response for real-time chat experience
 * @param {Array} messages - Array of chat messages  
 * @param {Object} context - Additional context about available offers
 * @returns {AsyncIterable} Streaming response
 */
export const generateStreamingFoodDealResponse = async (messages, context = null) => {
  try {
    const systemPrompt = `Olet FoodAI:n avustaja, joka auttaa löytämään parhaita ruokatarjouksia Suomessa. 

KONTEKSTI:
- Palvelemme Suomen markkinoita
- Integroituna Wolt, Foodora ja ResQ Club palveluihin
- Hinnat euroissa (€)
- Puhut sujuvaa suomea ja englantia

TEHTÄVÄSI:
✅ Etsi ruokatarjouksia ja anna suosituksia
✅ Vertaile hintoja ja alennuksia
✅ Auta ruokavaliorajoituksissa
✅ Mainitse ympäristövaikutukset

Vastaa lyhyesti ja ytimekkäästi.

${context ? `\nTarjoukset:\n${JSON.stringify(context, null, 2)}` : ''}`;

    const stream = await deepseekClient.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        ...messages
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 800,
    });

    return stream;
  } catch (error) {
    console.error('DeepSeek Streaming Error:', error);
    throw new Error('Streaming-palvelu ei ole käytettävissä');
  }
};

/**
 * Get context-aware response with current offers data
 * @param {Array} messages - Chat messages
 * @param {Array} currentOffers - Current available offers
 * @returns {Object} AI response with offer context
 */
export const generateContextualResponse = async (messages, currentOffers = []) => {
  // Limit offers to prevent token overflow
  const limitedOffers = currentOffers.slice(0, 10).map(offer => ({
    title: offer.title,
    restaurant: offer.restaurant_name,
    originalPrice: offer.original_price,
    discountedPrice: offer.discounted_price,
    discount: offer.discount_percentage,
    provider: offer.provider_name,
    cuisine: offer.cuisine
  }));

  const context = {
    availableOffers: limitedOffers,
    totalOffers: currentOffers.length,
    timestamp: new Date().toISOString()
  };

  return await generateFoodDealResponse(messages, context);
};

/**
 * Health check for DeepSeek API
 * @returns {Promise<boolean>} API availability status
 */
export async function checkDeepSeekHealth() {
  try {
    const response = await deepseekClient.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: 'Test connection'
        }
      ],
      max_tokens: 10,
      temperature: 0
    });

    return response.choices && response.choices.length > 0;
  } catch (error) {
    console.error('DeepSeek health check failed:', error);
    return false;
  }
}

export default {
  generateFoodDealResponse,
  generateStreamingFoodDealResponse,
  generateContextualResponse,
  checkDeepSeekHealth
};