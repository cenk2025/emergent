/**
 * Chat API Route for DeepSeek Food Deals Chatbot
 * 
 * This API route handles chat interactions with the DeepSeek AI assistant
 * for food deal recommendations and restaurant advice.
 */

import { NextResponse } from 'next/server';
import { generateContextualResponse } from '../../../lib/deepseek.js';
import { supabase } from '../../../lib/supabase.js';

/**
 * Handle POST requests for chat completions
 */
export async function POST(request) {
  try {
    const { messages, includeOffers = true } = await request.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Validate messages format
    const isValidMessages = messages.every(msg => 
      msg.role && msg.content && 
      ['user', 'assistant', 'system'].includes(msg.role)
    );

    if (!isValidMessages) {
      return NextResponse.json(
        { error: 'Invalid message format. Each message must have role and content.' },
        { status: 400 }
      );
    }

    let currentOffers = [];
    
    // Fetch current offers to provide context if requested
    if (includeOffers) {
      try {
        const { data: offers, error } = await supabase
          .from('offers')
          .select(`
            *,
            restaurants(name, city, cuisine_types),
            providers(name)
          `)
          .eq('is_active', true)
          .gte('ends_at', new Date().toISOString())
          .order('discount_percentage', { ascending: false })
          .limit(15);

        if (!error && offers) {
          currentOffers = offers.map(offer => ({
            title: offer.title,
            restaurant_name: offer.restaurants?.name || 'Unknown',
            original_price: offer.original_price,
            discounted_price: offer.discounted_price,
            discount_percentage: offer.discount_percentage,
            provider_name: offer.providers?.name || 'Unknown',
            cuisine: offer.restaurants?.cuisine_types?.join(', ') || 'Mixed',
            city: offer.restaurants?.city || 'Unknown'
          }));
        }
      } catch (error) {
        console.warn('Failed to fetch current offers for context:', error);
        // Continue without offers context
      }
    }

    // Generate AI response with current offers context
    const response = await generateContextualResponse(messages, currentOffers);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API Error:', error);
    
    // Determine error type and return appropriate response
    if (error.message.includes('DeepSeek')) {
      return NextResponse.json(
        { 
          error: 'AI-palvelu ei ole tällä hetkellä käytettävissä',
          details: 'DeepSeek API connection failed'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Pyyntöä ei voitu käsitellä',
        details: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * Handle GET requests - return API info
 */
export async function GET() {
  return NextResponse.json({
    service: 'FoodAI Chat API',
    version: '1.0.0',
    powered_by: 'DeepSeek AI',
    endpoints: {
      chat: 'POST /api/chat',
      stream: 'POST /api/chat/stream'
    },
    status: 'operational'
  });
}