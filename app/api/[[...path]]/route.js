import { supabase, testConnection, initializeFoodAiData } from '../../../lib/supabase.js';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Finnish cities - all major cities in Finland
const FINNISH_CITIES = [
  'Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Oulu', 'Turku', 'Jyväskylä', 
  'Lahti', 'Kuopio', 'Pori', 'Kouvola', 'Joensuu', 'Lappeenranta', 'Hämeenlinna',
  'Vaasa', 'Seinäjoki', 'Rovaniemi', 'Mikkeli', 'Kotka', 'Salo', 'Porvoo'
];

// Finnish cuisine types
const FINNISH_CUISINES = [
  'Suomalainen', 'Pizza', 'Sushi', 'Kiinalainen', 'Intialainen', 'Thai', 'Italiana',
  'Hampurilainen', 'Kebab', 'Meksikkolainen', 'Aasialainen', 'Vegan', 'Kasvis',
  'Kala', 'Liha', 'Salaatti', 'Keitto', 'Grill', 'Fast Food', 'Jälkiruoka'
];

// Mock Finnish restaurants
const FINNISH_RESTAURANTS = [
  { 
    id: 'rest_1', 
    name: 'Ravintola Savoy', 
    city: 'Helsinki', 
    district: 'Keskusta',
    cuisine_types: ['Suomalainen', 'Fine Dining'], 
    rating: 4.8, 
    latitude: 60.1699, 
    longitude: 24.9384 
  },
  { 
    id: 'rest_2', 
    name: 'Pizzeria da Mario', 
    city: 'Helsinki', 
    district: 'Kallio',
    cuisine_types: ['Pizza', 'Italiana'], 
    rating: 4.3, 
    latitude: 60.1841, 
    longitude: 24.9511 
  },
  { 
    id: 'rest_3', 
    name: 'Sushi Zen', 
    city: 'Tampere', 
    district: 'Keskusta',
    cuisine_types: ['Sushi', 'Japanilainen'], 
    rating: 4.6, 
    latitude: 61.4981, 
    longitude: 23.7608 
  },
  { 
    id: 'rest_4', 
    name: 'Golden Dragon', 
    city: 'Turku', 
    district: 'Keskusta',
    cuisine_types: ['Kiinalainen', 'Aasialainen'], 
    rating: 4.4, 
    latitude: 60.4518, 
    longitude: 22.2666 
  },
  { 
    id: 'rest_5', 
    name: 'Burger Palace', 
    city: 'Oulu', 
    district: 'Keskusta',
    cuisine_types: ['Hampurilainen', 'Fast Food'], 
    rating: 4.2, 
    latitude: 65.0121, 
    longitude: 25.4651 
  },
  { 
    id: 'rest_6', 
    name: 'Kebab King', 
    city: 'Jyväskylä', 
    district: 'Keskusta',
    cuisine_types: ['Kebab', 'Turkkilainen'], 
    rating: 4.1, 
    latitude: 62.2426, 
    longitude: 25.7473 
  },
  { 
    id: 'rest_7', 
    name: 'Thai Garden', 
    city: 'Lahti', 
    district: 'Keskusta',
    cuisine_types: ['Thai', 'Aasialainen'], 
    rating: 4.5, 
    latitude: 60.9827, 
    longitude: 25.6612 
  },
  { 
    id: 'rest_8', 
    name: 'Ravintola Aino', 
    city: 'Kuopio', 
    district: 'Keskusta',
    cuisine_types: ['Suomalainen', 'Eurooppalainen'], 
    rating: 4.7, 
    latitude: 62.8924, 
    longitude: 27.6780 
  }
];

// Finnish food providers
const FINNISH_PROVIDERS = [
  { 
    id: 'wolt', 
    name: 'Wolt', 
    logo_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop', 
    color: '#00C2E8',
    commission_rate: 8.50
  },
  { 
    id: 'foodora', 
    name: 'Foodora', 
    logo_url: 'https://images.unsplash.com/photo-1555992336-03a23a47b61e?w=100&h=100&fit=crop', 
    color: '#E91E63',
    commission_rate: 7.20
  },
  { 
    id: 'resq', 
    name: 'ResQ Club', 
    logo_url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=100&h=100&fit=crop', 
    color: '#4CAF50',
    commission_rate: 12.00
  }
];

// Finnish food items
const FINNISH_FOOD_ITEMS = [
  'Lohikeitto', 'Karjalanpiirakka', 'Poronkäristys', 'Mustikkapiirakka', 'Korvapuusti',
  'Margherita Pizza', 'Pepperoni Pizza', 'Quattro Stagioni', 'Calzone',
  'Nigiri Sushi', 'Maki Roll', 'Sashimi', 'Temaki', 'California Roll',
  'Cheeseburger', 'Big Burger', 'Chicken Burger', 'Fish Burger', 'Veggie Burger',
  'Kebab', 'Falafel', 'Gyros', 'Shawarma', 'Iskender',
  'Pad Thai', 'Green Curry', 'Tom Yum', 'Massaman Curry', 'Som Tam',
  'Chicken Tikka Masala', 'Biryani', 'Naan', 'Samosa', 'Dal',
  'Sweet & Sour Chicken', 'Kung Pao', 'Chow Mein', 'Fried Rice', 'Spring Rolls',
  'Caesar Salaatti', 'Tonnisalaatti', 'Kreikkalainen Salaatti'
];

// Auto-create Supabase tables if they don't exist
async function ensureSupabaseTables() {
  try {
    // Test if tables exist by querying providers
    const { data, error } = await supabase
      .from('providers')
      .select('count')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
      // Tables don't exist, create them with basic structure
      console.log('Creating Supabase tables...');
      
      // Note: We can't create tables directly via client, but we can insert seed data
      // The tables should be created manually via SQL Editor
      await seedSupabaseData();
      return false; // Tables still need manual creation
    }
    
    return true; // Tables exist
  } catch (err) {
    console.error('Error checking Supabase tables:', err);
    return false;
  }
}

// Seed Supabase with initial data
async function seedSupabaseData() {
  try {
    // Check if providers already exist
    const { data: existingProviders } = await supabase
      .from('providers')
      .select('id')
      .limit(1);

    if (!existingProviders || existingProviders.length === 0) {
      // Insert providers
      await supabase.from('providers').insert([
        {
          id: 'wolt',
          name: 'Wolt',
          logo_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop',
          color: '#00C2E8',
          website: 'https://wolt.com',
          commission_rate: 8.50,
          is_active: true
        },
        {
          id: 'foodora',
          name: 'Foodora',
          logo_url: 'https://images.unsplash.com/photo-1555992336-03a23a47b61e?w=100&h=100&fit=crop',
          color: '#E91E63',
          website: 'https://foodora.fi',
          commission_rate: 7.20,
          is_active: true
        },
        {
          id: 'resq',
          name: 'ResQ Club',
          logo_url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=100&h=100&fit=crop',
          color: '#4CAF50',
          website: 'https://resq-club.com',
          commission_rate: 12.00,
          is_active: true
        }
      ]);

      // Insert restaurants
      await supabase.from('restaurants').insert([
        {
          id: 'rest_1',
          name: 'Ravintola Savoy',
          city: 'Helsinki',
          district: 'Keskusta',
          cuisine_types: ['Suomalainen', 'Fine Dining'],
          rating: 4.8,
          latitude: 60.1699,
          longitude: 24.9384,
          is_active: true
        },
        {
          id: 'rest_2',
          name: 'Pizzeria da Mario',
          city: 'Helsinki', 
          district: 'Kallio',
          cuisine_types: ['Pizza', 'Italiana'],
          rating: 4.3,
          latitude: 60.1841,
          longitude: 24.9511,
          is_active: true
        },
        {
          id: 'rest_3',
          name: 'Sushi Zen',
          city: 'Tampere',
          district: 'Keskusta',
          cuisine_types: ['Sushi', 'Japanilainen'],
          rating: 4.6,
          latitude: 61.4981,
          longitude: 23.7608,
          is_active: true
        }
      ]);

      console.log('Supabase seeded with initial data');
    }
  } catch (error) {
    console.error('Error seeding Supabase data:', error);
  }
}

// Generate Finnish offers
function generateFinnishOffers() {
  const offers = [];
  
  FINNISH_RESTAURANTS.forEach(restaurant => {
    FINNISH_PROVIDERS.forEach(provider => {
      const numOffers = Math.floor(Math.random() * 4) + 2; // 2-5 offers
      
      for (let i = 0; i < numOffers; i++) {
        const foodItem = FINNISH_FOOD_ITEMS[Math.floor(Math.random() * FINNISH_FOOD_ITEMS.length)];
        const originalPrice = Math.floor(Math.random() * 25) + 8; // 8-33 EUR
        const discountPercent = Math.floor(Math.random() * 45) + 15; // 15-60% discount
        const discountedPrice = parseFloat((originalPrice * (1 - discountPercent / 100)).toFixed(2));
        
        const endsAt = new Date();
        endsAt.setHours(endsAt.getHours() + Math.floor(Math.random() * 48) + 2);
        
        // Food image URLs
        // High-quality food images from Unsplash
        const foodImageIds = [
          '1546069901-ba9599a7e63c', // Colorful Buddha Bowl
          '1715493926880-a15b1fee7b30', // Pancakes with Blueberries  
          '1555939594-58d7cb561ad1', // Grilled Meat Platter
          '1533777324565-a040eb52facd', // Pasta Spread
          '1604908176997-125f25cc6f3d', // Chicken Tomato Salad
          '1565299624946-b28f40a0ca4b'  // Fallback food image
        ];
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
          description: `Herkullinen ${foodItem.toLowerCase()} ravintola ${restaurant.name}sta`,
          original_price: originalPrice,
          discounted_price: discountedPrice,
          discount_percent: discountPercent,
          currency: 'EUR',
          delivery_fee: Math.floor(Math.random() * 6) + 1, // 1-7 EUR
          min_order_amount: Math.floor(Math.random() * 20) + 15, // 15-35 EUR
          has_pickup: Math.random() > 0.4,
          has_delivery: true,
          starts_at: new Date(),
          ends_at: endsAt,
          image_url: `https://images.unsplash.com/photo-${imageId}?w=400&h=300&fit=crop&auto=format`,
          tags: ['alennus', ...restaurant.cuisine_types.map(c => c.toLowerCase())],
          deep_link: `https://${provider.id}.com/restaurant/${restaurant.id}/offer/${uuidv4()}`,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
          clickCount: Math.floor(Math.random() * 50),
          revenue: parseFloat((Math.random() * 200).toFixed(2))
        });
      }
    });
  });
  
  return offers;
}

// Generate mock admin data
function generateMockAdminData(offers) {
  const totalRevenue = offers.reduce((sum, offer) => sum + (offer.revenue || 0), 0);
  const totalClicks = offers.reduce((sum, offer) => sum + (offer.clickCount || 0), 0);
  const totalConversions = Math.floor(totalClicks * 0.08); // 8% conversion rate
  
  return {
    totalRevenue: totalRevenue.toFixed(2),
    totalClicks,
    totalConversions,
    conversionRate: ((totalConversions / totalClicks) * 100).toFixed(1),
    activeOffers: offers.filter(o => o.is_active).length,
    totalOffers: offers.length,
    revenueGrowth: 12,
    clicksGrowth: 8,
    monthlyRevenue: (totalRevenue * 0.4).toFixed(2),
    weeklyRevenue: (totalRevenue * 0.1).toFixed(2),
    dailyAvgRevenue: (totalRevenue / 30).toFixed(2),
    avgRevenuePerClick: (totalRevenue / totalClicks).toFixed(2),
    expiringOffers: Math.floor(offers.length * 0.1),
    expiredOffers: Math.floor(offers.length * 0.05)
  };
}

export async function GET(request) {
  try {
    const { pathname, searchParams } = new URL(request.url);
    const path = pathname.split('/api/')[1] || '';

    // Ensure Supabase tables exist (attempt to seed if not)
    await ensureSupabaseTables();

    // Generate Finnish offers for demo
    const finnishOffers = generateFinnishOffers();

    switch (path) {
      case 'admin/overview':
        const overviewData = generateMockAdminData(finnishOffers);
        const topOffers = finnishOffers
          .sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
          .slice(0, 10);
        
        const cityStats = FINNISH_CITIES.slice(0, 6).map(city => {
          const cityOffers = finnishOffers.filter(o => o.city === city);
          return {
            name: city,
            offerCount: cityOffers.length,
            clickCount: cityOffers.reduce((sum, o) => sum + (o.clickCount || 0), 0),
            revenue: cityOffers.reduce((sum, o) => sum + (o.revenue || 0), 0).toFixed(2)
          };
        });

        return NextResponse.json({
          data: overviewData,
          topOffers,
          cityStats
        });

      case 'admin/providers':
        const providersData = FINNISH_PROVIDERS.map(provider => {
          const providerOffers = finnishOffers.filter(o => o.provider_id === provider.id);
          const clickCount = providerOffers.reduce((sum, o) => sum + (o.clickCount || 0), 0);
          const revenue = providerOffers.reduce((sum, o) => sum + (o.revenue || 0), 0);
          const conversions = Math.floor(clickCount * 0.08);
          
          return {
            ...provider,
            logoUrl: provider.logo_url,
            commissionRate: provider.commission_rate,
            isActive: true,
            offerCount: providerOffers.length,
            clickCount,
            conversions,
            earned: (revenue * provider.commission_rate / 100).toFixed(2)
          };
        });

        return NextResponse.json({ data: providersData });

      case 'admin/clickouts':
        const mockClickouts = finnishOffers.slice(0, 20).map((offer, index) => ({
          id: uuidv4(),
          offerId: offer.id,
          offerTitle: offer.title,
          providerId: offer.provider_id,
          providerName: offer.provider_name,
          timestamp: new Date(Date.now() - index * 1000 * 60 * 30).toISOString(),
          isConversion: Math.random() > 0.9,
          revenue: Math.random() > 0.9 ? parseFloat((Math.random() * 50).toFixed(2)) : 0
        }));

        return NextResponse.json({ data: mockClickouts });

      case 'admin/commissions':
        const mockCommissions = Array.from({ length: 15 }, (_, index) => {
          const offer = finnishOffers[Math.floor(Math.random() * finnishOffers.length)];
          const provider = FINNISH_PROVIDERS.find(p => p.id === offer.provider_id);
          const grossAmount = parseFloat((Math.random() * 100 + 20).toFixed(2));
          const commissionAmount = parseFloat((grossAmount * (provider?.commission_rate || 8) / 100).toFixed(2));
          
          return {
            id: uuidv4(),
            offerId: offer.id,
            offerTitle: offer.title,
            providerId: offer.provider_id,
            providerName: offer.provider_name,
            externalConversionId: `conv_${Math.random().toString(36).substr(2, 9)}`,
            grossAmount: grossAmount.toFixed(2),
            commissionAmount: commissionAmount.toFixed(2),
            currency: 'EUR',
            status: ['pending', 'approved', 'canceled'][Math.floor(Math.random() * 3)],
            occurredAt: new Date(Date.now() - index * 1000 * 60 * 60 * Math.random() * 24).toISOString(),
            reportedAt: new Date(Date.now() - index * 1000 * 60 * 60 * Math.random() * 12).toISOString()
          };
        });

        return NextResponse.json({ data: mockCommissions });

      case 'offers':
        const city = searchParams.get('city') || '';
        const cuisine = searchParams.get('cuisine') || '';
        const minDiscount = parseInt(searchParams.get('minDiscount')) || 0;
        const maxPrice = parseInt(searchParams.get('maxPrice')) || 100;
        const provider = searchParams.get('provider') || '';
        const sortBy = searchParams.get('sortBy') || 'discount';
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 12;

        let filteredOffers = finnishOffers.filter(offer => {
          const matchesCity = !city || city === 'all' || offer.city.toLowerCase().includes(city.toLowerCase());
          const matchesCuisine = !cuisine || cuisine === 'all' || 
            offer.cuisine_types.some(c => c.toLowerCase().includes(cuisine.toLowerCase()));
          const matchesDiscount = offer.discount_percent >= minDiscount;
          const matchesPrice = offer.discounted_price <= maxPrice;
          const matchesProvider = !provider || provider === 'all' || offer.provider_id === provider;
          
          return matchesCity && matchesCuisine && matchesDiscount && matchesPrice && matchesProvider;
        });

        // Sort offers
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
        return NextResponse.json(FINNISH_PROVIDERS);

      case 'cities':
        const cities = [...new Set(FINNISH_RESTAURANTS.map(r => r.city))];
        return NextResponse.json(cities);

      case 'cuisines':
        const cuisines = [...new Set(FINNISH_RESTAURANTS.flatMap(r => r.cuisine_types))];
        return NextResponse.json(cuisines);

      case 'stats':
        const totalOffers = finnishOffers.length;
        const averageDiscount = Math.round(finnishOffers.reduce((sum, offer) => sum + offer.discount_percent, 0) / totalOffers);
        const totalSavings = finnishOffers.reduce((sum, offer) => sum + (offer.original_price - offer.discounted_price), 0);
        
        return NextResponse.json({
          totalOffers,
          activeProviders: FINNISH_PROVIDERS.length,
          averageDiscount,
          totalSavings: Math.round(totalSavings),
          cities: [...new Set(FINNISH_RESTAURANTS.map(r => r.city))].length
        });

      default:
        return NextResponse.json({ 
          message: 'FoodAi API - Suomen Ruokatarjousten Vertailupalvelu',
          status: 'Supabase integraatio toiminnassa...'
        });
    }
  } catch (error) {
    console.error('API Virhe:', error);
    return NextResponse.json({ error: 'Sisäinen palvelinvirhe' }, { status: 500 });
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
        
        // Try to save to Supabase, fallback to console log
        try {
          const { data, error } = await supabase
            .from('clickouts')
            .insert([{
              offer_id: offerId,
              provider_id: providerId,
              user_id: userId || null,
              ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
              user_agent: request.headers.get('user-agent') || '',
              referer: request.headers.get('referer') || '',
              clicked_at: new Date().toISOString()
            }])
            .select();

          if (error) throw error;
          
          console.log('Clickout saved to Supabase:', data);
        } catch (supabaseError) {
          // Fallback to console log if Supabase fails
          console.log('Clickout tracked (Supabase unavailable):', {
            offerId,
            providerId,
            userId,
            timestamp: new Date().toISOString()
          });
        }
        
        return NextResponse.json({ success: true, clickoutId: uuidv4() });

      default:
        return NextResponse.json({ error: 'Ei löydetty' }, { status: 404 });
    }
  } catch (error) {
    console.error('POST API Virhe:', error);
    return NextResponse.json({ error: 'Sisäinen palvelinvirhe' }, { status: 500 });
  }
}