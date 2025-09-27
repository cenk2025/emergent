/**
 * Streaming Chat API Route for DeepSeek Food Deals Chatbot
 * 
 * This API route provides streaming responses for real-time chat experience.
 */

import { NextResponse } from 'next/server';
import { generateStreamingFoodDealResponse } from '../../../../lib/deepseek.js';
import { supabase } from '../../../../lib/supabase.js';

/**
 * Handle POST requests for streaming chat completions
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

    let currentOffers = [];
    
    // Fetch current offers for context
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
          .limit(10);

        if (!error && offers) {
          currentOffers = offers.map(offer => ({
            title: offer.title,
            restaurant_name: offer.restaurants?.name || 'Unknown',
            original_price: offer.original_price,
            discounted_price: offer.discounted_price,
            discount_percentage: offer.discount_percentage,
            provider_name: offer.providers?.name || 'Unknown',
            cuisine: offer.restaurants?.cuisine_types?.join(', ') || 'Mixed'
          }));
        }
      } catch (error) {
        console.warn('Failed to fetch offers for streaming context:', error);
      }
    }

    // Get streaming response from DeepSeek
    const stream = await generateStreamingFoodDealResponse(messages, currentOffers);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              const sseData = `data: ${JSON.stringify({ content })}\n\n`;
              controller.enqueue(encoder.encode(sseData));
            }
          }
          // Send completion signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = `data: ${JSON.stringify({ 
            error: 'Streaming keskeytyi',
            details: error.message 
          })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Streaming Chat API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Streaming-palvelu ei ole käytettävissä',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * Handle OPTIONS requests for CORS
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}