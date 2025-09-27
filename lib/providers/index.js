/**
 * Provider Manager for FoodAI
 * 
 * This module coordinates all food delivery provider integrations
 * (Wolt, Foodora, ResQ Club) and provides a unified interface.
 */

import woltProvider from './wolt.js';
import foodoraProvider from './foodora.js';
import resqProvider from './resq.js';

// Available providers configuration
export const PROVIDERS = {
  wolt: {
    id: 'wolt',
    name: 'Wolt',
    logo_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop',
    color: '#00c2e8',
    enabled: true,
    api_available: false, // Will be set to true when real API is integrated
    module: woltProvider
  },
  foodora: {
    id: 'foodora',
    name: 'Foodora',
    logo_url: 'https://images.unsplash.com/photo-1555992336-03a23a47b61e?w=100&h=100&fit=crop',
    color: '#e91e63',
    enabled: true,
    api_available: false, // Will be set to true when real API is integrated
    module: foodoraProvider
  },
  resq_club: {
    id: 'resq_club',
    name: 'ResQ Club',
    logo_url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=100&h=100&fit=crop',
    color: '#4caf50',
    enabled: true,
    api_available: false, // Will be set to true when real API is integrated
    module: resqProvider
  }
};

/**
 * Get all enabled providers
 * @returns {Array} Array of provider objects
 */
export function getEnabledProviders() {
  return Object.values(PROVIDERS).filter(provider => provider.enabled);
}

/**
 * Get a specific provider by ID
 * @param {string} providerId - Provider identifier
 * @returns {Object|null} Provider object or null if not found
 */
export function getProvider(providerId) {
  return PROVIDERS[providerId] || null;
}

/**
 * Check API health status for all providers
 * @returns {Promise<Object>} Health status for each provider
 */
export async function checkAllProvidersHealth() {
  const healthChecks = {};
  
  for (const [providerId, provider] of Object.entries(PROVIDERS)) {
    if (provider.enabled && provider.module.checkApiHealth) {
      try {
        healthChecks[providerId] = await provider.module.checkApiHealth();
      } catch (error) {
        console.error(`Health check failed for ${providerId}:`, error);
        healthChecks[providerId] = false;
      }
    } else {
      healthChecks[providerId] = false;
    }
  }
  
  return healthChecks;
}

/**
 * Search offers across all enabled providers
 * @param {string} citySlug - City identifier
 * @param {Object} searchParams - Search parameters
 * @returns {Promise<Object>} Aggregated search results
 */
export async function searchAllProviders(citySlug, searchParams = {}) {
  const { limit = 20, offset = 0, sortBy = 'discount', ...otherParams } = searchParams;
  
  const allOffers = [];
  const providerResults = {};
  const errors = {};
  
  // Fetch offers from each enabled provider
  for (const [providerId, provider] of Object.entries(PROVIDERS)) {
    if (!provider.enabled) continue;
    
    try {
      let result;
      
      // Call appropriate search method based on provider
      if (providerId === 'wolt' && provider.module.searchWoltOffers) {
        result = await provider.module.searchWoltOffers(citySlug, otherParams);
      } else if (providerId === 'foodora' && provider.module.searchFoodoraDeals) {
        result = await provider.module.searchFoodoraDeals(citySlug, otherParams);
      } else if (providerId === 'resq_club' && provider.module.searchResQOffers) {
        result = await provider.module.searchResQOffers(citySlug, otherParams);
      }
      
      if (result && result.offers) {
        // Normalize offer format across providers
        const normalizedOffers = result.offers.map(offer => normalizeOffer(offer, providerId));
        allOffers.push(...normalizedOffers);
        
        providerResults[providerId] = {
          count: result.offers.length,
          total: result.total || result.offers.length,
          hasMore: result.hasMore || false
        };
      }
    } catch (error) {
      console.error(`Error fetching offers from ${providerId}:`, error);
      errors[providerId] = error.message;
      providerResults[providerId] = { count: 0, total: 0, hasMore: false };
    }
  }
  
  // Sort all offers
  if (sortBy === 'discount') {
    allOffers.sort((a, b) => b.discount_percentage - a.discount_percentage);
  } else if (sortBy === 'price') {
    allOffers.sort((a, b) => a.discounted_price - b.discounted_price);
  } else if (sortBy === 'rating') {
    allOffers.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortBy === 'newest') {
    allOffers.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }
  
  // Apply pagination
  const paginatedOffers = allOffers.slice(offset, offset + limit);
  
  return {
    offers: paginatedOffers,
    total: allOffers.length,
    hasMore: offset + limit < allOffers.length,
    providers: providerResults,
    errors: Object.keys(errors).length > 0 ? errors : null
  };
}

/**
 * Normalize offer format across different providers
 * @param {Object} offer - Raw offer from provider
 * @param {string} providerId - Provider identifier
 * @returns {Object} Normalized offer object
 */
function normalizeOffer(offer, providerId) {
  const provider = PROVIDERS[providerId];
  
  // Base normalization - handles common fields
  const normalized = {
    id: offer.id,
    provider: providerId,
    provider_name: provider.name,
    provider_color: provider.color,
    title: offer.title || offer.name,
    description: offer.description,
    original_price: offer.original_price || offer.original_value || 0,
    discounted_price: offer.discounted_price || offer.deal_price || offer.sale_price || 0,
    discount_percentage: offer.discount_percentage || 0,
    image_url: offer.image_url,
    deep_link: offer.deep_link,
    restaurant_name: offer.venue_name || offer.restaurant_name,
    rating: offer.venue_rating || offer.restaurant_rating,
    cuisine: offer.venue_cuisine || offer.restaurant_cuisines || offer.category,
    created_at: offer.created_at || new Date(),
    is_active: offer.is_active !== false
  };
  
  // Provider-specific normalization
  if (providerId === 'wolt') {
    normalized.delivery_time = offer.delivery_time || '25-35 min';
    normalized.minimum_order = offer.min_order || null;
    normalized.has_delivery = offer.has_delivery !== false;
    normalized.has_pickup = offer.has_pickup !== false;
  } else if (providerId === 'foodora') {
    normalized.delivery_time = offer.delivery_time || '30-45 min';
    normalized.minimum_order = offer.min_order_value || null;
    normalized.conditions = offer.conditions;
  } else if (providerId === 'resq_club') {
    normalized.pickup_start = offer.pickup_start;
    normalized.pickup_end = offer.pickup_end;
    normalized.quantity_available = offer.quantity_available;
    normalized.co2_saved = offer.co2_saved;
    normalized.type = 'surplus_food';
    normalized.pickup_instructions = offer.pickup_instructions;
    normalized.environmental_impact = offer.environmental_impact;
  }
  
  return normalized;
}

/**
 * Get provider statistics
 * @returns {Promise<Object>} Statistics for all providers
 */
export async function getProviderStats() {
  const stats = {
    total_providers: Object.keys(PROVIDERS).length,
    enabled_providers: getEnabledProviders().length,
    api_ready_providers: 0,
    provider_status: {}
  };
  
  const healthChecks = await checkAllProvidersHealth();
  
  for (const [providerId, provider] of Object.entries(PROVIDERS)) {
    const isHealthy = healthChecks[providerId] || false;
    
    stats.provider_status[providerId] = {
      name: provider.name,
      enabled: provider.enabled,
      api_available: provider.api_available,
      healthy: isHealthy,
      color: provider.color
    };
    
    if (provider.api_available && isHealthy) {
      stats.api_ready_providers++;
    }
  }
  
  return stats;
}

/**
 * Generate tracking URL for click-outs
 * @param {Object} offer - Offer object
 * @param {string} userId - User identifier (optional)
 * @returns {string} Tracking URL
 */
export function generateTrackingUrl(offer, userId = null) {
  const provider = PROVIDERS[offer.provider];
  
  if (!provider) {
    return offer.deep_link;
  }
  
  // TODO: Implement proper click tracking with database logging
  // For now, return the direct deep link
  return offer.deep_link;
}

export default {
  PROVIDERS,
  getEnabledProviders,
  getProvider,
  checkAllProvidersHealth,
  searchAllProviders,
  getProviderStats,
  generateTrackingUrl
};