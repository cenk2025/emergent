import { supabase, testConnection, initializeFoodAiData, TURKISH_CITIES, TURKISH_FOOD_CATEGORIES } from '../../../lib/supabase.js';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Türk mutfağı için mock restoranlar
const MOCK_RESTAURANTS = [
  { 
    id: 'rest_1', 
    name: 'Sultanahmet Köftecisi', 
    city: 'İstanbul', 
    district: 'Fatih',
    cuisine_types: ['Türk Mutfağı', 'Kebap'], 
    rating: 4.7, 
    latitude: 41.0082, 
    longitude: 28.9784 
  },
  { 
    id: 'rest_2', 
    name: 'Pandora Patisserie', 
    city: 'İstanbul', 
    district: 'Beşiktaş',
    cuisine_types: ['Tatlı', 'Kahvaltı'], 
    rating: 4.5, 
    latitude: 41.0431, 
    longitude: 29.0097 
  },
  { 
    id: 'rest_3', 
    name: 'Adana Ocakbaşı', 
    city: 'Ankara', 
    district: 'Çankaya',
    cuisine_types: ['Türk Mutfağı', 'Kebap'], 
    rating: 4.6, 
    latitude: 39.9334, 
    longitude: 32.8597 
  },
  { 
    id: 'rest_4', 
    name: 'Dominos Pizza', 
    city: 'İzmir', 
    district: 'Konak',
    cuisine_types: ['Pizza', 'Fast Food'], 
    rating: 4.2, 
    latitude: 38.4192, 
    longitude: 27.1287 
  },
  { 
    id: 'rest_5', 
    name: 'Sushi Time', 
    city: 'İstanbul', 
    district: 'Kadıköy',
    cuisine_types: ['Sushi', 'Japonya'], 
    rating: 4.8, 
    latitude: 40.9892, 
    longitude: 29.0208 
  },
  { 
    id: 'rest_6', 
    name: 'Çiya Sofrası', 
    city: 'İstanbul', 
    district: 'Kadıköy',
    cuisine_types: ['Türk Mutfağı', 'Geleneksel'], 
    rating: 4.9, 
    latitude: 40.9897, 
    longitude: 29.0275 
  }
];

// Türk yemekleri için mock ürünler
const TURKISH_FOOD_ITEMS = [
  'Adana Kebap', 'Urfa Kebap', 'İskender Kebab', 'Döner Kebap', 'Şiş Kebap',
  'Lahmacun', 'Pide', 'Mantı', 'Köfte', 'İnegöl Köfte',
  'Margherita Pizza', 'Pepperoni Pizza', 'Karışık Pizza',
  'Somon Sushi', 'California Roll', 'Teriyaki Tavuk',
  'Cheeseburger', 'Big Mac', 'Tavuk Burger',
  'Pad Thai', 'Green Curry', 'Tom Yum Çorbası',
  'Tavuk Tikka Masala', 'Hint Pilavı', 'Naan Ekmek',
  'Baklava', 'Künefe', 'Sütlaç', 'Kazandibi',
  'Türk Kahvesi', 'Çay', 'Ayran', 'Şalgam'
];

// Mock sağlayıcılar
const MOCK_PROVIDERS = [
  { 
    id: 'yemeksepeti', 
    name: 'Yemeksepeti', 
    logo_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop', 
    color: '#FF6B35' 
  },
  { 
    id: 'getir', 
    name: 'Getir Yemek', 
    logo_url: 'https://images.unsplash.com/photo-1555992336-03a23a47b61e?w=100&h=100&fit=crop', 
    color: '#5D4FB3' 
  },
  { 
    id: 'trendyol', 
    name: 'Trendyol Yemek', 
    logo_url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=100&h=100&fit=crop', 
    color: '#F27A1A' 
  }
];

// Dinamik teklifler oluştur
function generateTurkishOffers() {
  const offers = [];
  
  MOCK_RESTAURANTS.forEach(restaurant => {
    MOCK_PROVIDERS.forEach(provider => {
      const numOffers = Math.floor(Math.random() * 4) + 2; // 2-5 teklif
      
      for (let i = 0; i < numOffers; i++) {
        const foodItem = TURKISH_FOOD_ITEMS[Math.floor(Math.random() * TURKISH_FOOD_ITEMS.length)];
        const originalPrice = Math.floor(Math.random() * 80) + 20; // 20-100 TL
        const discountPercent = Math.floor(Math.random() * 40) + 15; // 15-55% indirim
        const discountedPrice = parseFloat((originalPrice * (1 - discountPercent / 100)).toFixed(2));
        
        const endsAt = new Date();
        endsAt.setHours(endsAt.getHours() + Math.floor(Math.random() * 48) + 2);
        
        // Türkçe yemek resmi URL'leri
        const foodImageIds = [1565299624946, 1555992336, 1498837167922, 1546833017, 1565958011, 1574071318];
        const imageId = foodImageIds[Math.floor(Math.random() * foodImageIds.length)];
        
        offers.push({
          id: uuidv4(),
          provider_id: provider.id,
          provider_name: provider.name,
          provider_logo: provider.logo_url,
          provider_color: provider.color,
          restaurant_id: restaurant.id,
          restaurant_name: restaurant.name,
          city: restaurant.city,
          district: restaurant.district,
          cuisine_types: restaurant.cuisine_types,
          rating: restaurant.rating,
          latitude: restaurant.latitude,
          longitude: restaurant.longitude,
          title: foodItem,
          description: `${restaurant.name} restoranından lezzetli ${foodItem.toLowerCase()}`,
          original_price: originalPrice,
          discounted_price: discountedPrice,
          discount_percent: discountPercent,
          currency: 'TL',
          delivery_fee: Math.floor(Math.random() * 8) + 2, // 2-10 TL
          min_order_amount: Math.floor(Math.random() * 30) + 20, // 20-50 TL
          has_pickup: Math.random() > 0.4,
          has_delivery: true,
          starts_at: new Date(),
          ends_at: endsAt,
          image_url: `https://images.unsplash.com/photo-${imageId}?w=400&h=300&fit=crop&auto=format`,
          tags: ['indirim', ...restaurant.cuisine_types.map(c => c.toLowerCase())],
          deep_link: `https://${provider.id}.com/restaurant/${restaurant.id}/offer/${uuidv4()}`,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    });
  });
  
  return offers;
}

export async function GET(request) {
  try {
    const { pathname, searchParams } = new URL(request.url);
    const path = pathname.split('/api/')[1] || '';

    // Supabase bağlantısını test et
    const connectionStatus = await testConnection();
    if (!connectionStatus.connected) {
      console.warn('Supabase bağlantısı kurulamadı, mock veri kullanılıyor');
    }

    // Mock teklifleri oluştur (geçici olarak)
    const mockOffers = generateTurkishOffers();

    switch (path) {
      case 'offers':
        const city = searchParams.get('city') || '';
        const cuisine = searchParams.get('cuisine') || '';
        const minDiscount = parseInt(searchParams.get('minDiscount')) || 0;
        const maxPrice = parseInt(searchParams.get('maxPrice')) || 500;
        const provider = searchParams.get('provider') || '';
        const sortBy = searchParams.get('sortBy') || 'discount';
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 12;

        let filteredOffers = mockOffers.filter(offer => {
          const matchesCity = !city || city === 'all' || offer.city.toLowerCase().includes(city.toLowerCase());
          const matchesCuisine = !cuisine || cuisine === 'all' || 
            offer.cuisine_types.some(c => c.toLowerCase().includes(cuisine.toLowerCase()));
          const matchesDiscount = offer.discount_percent >= minDiscount;
          const matchesPrice = offer.discounted_price <= maxPrice;
          const matchesProvider = !provider || provider === 'all' || offer.provider_id === provider;
          
          return matchesCity && matchesCuisine && matchesDiscount && matchesPrice && matchesProvider;
        });

        // Sıralama
        filteredOffers.sort((a, b) => {
          switch (sortBy) {
            case 'price':
              return a.discounted_price - b.discounted_price;
            case 'rating':
              return b.rating - a.rating;
            case 'discount':
            default:
              return b.discount_percent - a.discount_percent;
          }
        });

        const startIndex = (page - 1) * limit;
        const paginatedOffers = filteredOffers.slice(startIndex, startIndex + limit);

        return NextResponse.json({
          offers: paginatedOffers,
          total: filteredOffers.length,
          page,
          totalPages: Math.ceil(filteredOffers.length / limit),
          hasMore: startIndex + limit < filteredOffers.length
        });

      case 'providers':
        return NextResponse.json(MOCK_PROVIDERS);

      case 'cities':
        const cities = [...new Set(MOCK_RESTAURANTS.map(r => r.city))];
        return NextResponse.json(cities);

      case 'cuisines':
        const cuisines = [...new Set(MOCK_RESTAURANTS.flatMap(r => r.cuisine_types))];
        return NextResponse.json(cuisines);

      case 'stats':
        const totalOffers = mockOffers.length;
        const averageDiscount = Math.round(mockOffers.reduce((sum, offer) => sum + offer.discount_percent, 0) / totalOffers);
        const totalSavings = mockOffers.reduce((sum, offer) => sum + (offer.original_price - offer.discounted_price), 0);
        
        return NextResponse.json({
          totalOffers,
          activeProviders: MOCK_PROVIDERS.length,
          averageDiscount,
          totalSavings: Math.round(totalSavings),
          cities: [...new Set(MOCK_RESTAURANTS.map(r => r.city))].length
        });

      default:
        return NextResponse.json({ 
          message: 'FoodAi API - Türk Yemek Teklifleri Karşılaştırma Platformu',
          status: 'Supabase entegrasyonu devam ediyor...'
        });
    }
  } catch (error) {
    console.error('API Hatası:', error);
    return NextResponse.json({ error: 'Sunucu Hatası' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { pathname } = new URL(request.url);
    const path = pathname.split('/api/')[1] || '';
    const body = await request.json();

    switch (path) {
      case 'clickouts':
        const { offerId, providerId, userId } = body;
        
        // Supabase'e kaydet (şimdilik mock)
        const clickout = {
          id: uuidv4(),
          offer_id: offerId,
          provider_id: providerId,
          user_id: userId || null,
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          user_agent: request.headers.get('user-agent') || '',
          referer: request.headers.get('referer') || '',
          clicked_at: new Date()
        };

        console.log('Clickout kaydedildi:', clickout);
        
        return NextResponse.json({ success: true, clickoutId: clickout.id });

      default:
        return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });
    }
  } catch (error) {
    console.error('POST API Hatası:', error);
    return NextResponse.json({ error: 'Sunucu Hatası' }, { status: 500 });
  }
}