import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const client = new MongoClient(process.env.MONGO_URL);
let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db(process.env.DB_NAME || 'foodai');
  }
  return db;
}

// Mock providers data
const mockProviders = [
  { id: 'wolt', name: 'Wolt', logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop', color: '#00C2E8' },
  { id: 'foodora', name: 'Foodora', logo: 'https://images.unsplash.com/photo-1555992336-03a23a47b61e?w=100&h=100&fit=crop', color: '#E91E63' },
  { id: 'resq', name: 'ResQ Club', logo: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=100&h=100&fit=crop', color: '#4CAF50' }
];

// Mock restaurants data
const mockRestaurants = [
  { id: uuidv4(), name: 'Pizza Palace', city: 'Helsinki', cuisine: ['Italian', 'Pizza'], rating: 4.5, lat: 60.1699, lon: 24.9384 },
  { id: uuidv4(), name: 'Sushi Master', city: 'Helsinki', cuisine: ['Japanese', 'Sushi'], rating: 4.7, lat: 60.1695, lon: 24.9354 },
  { id: uuidv4(), name: 'Burger Kingdom', city: 'Helsinki', cuisine: ['American', 'Burgers'], rating: 4.3, lat: 60.1715, lon: 24.9417 },
  { id: uuidv4(), name: 'Thai Garden', city: 'Tampere', cuisine: ['Thai', 'Asian'], rating: 4.4, lat: 61.4981, lon: 23.7608 },
  { id: uuidv4(), name: 'Café Bistro', city: 'Turku', cuisine: ['European', 'Cafe'], rating: 4.2, lat: 60.4518, lon: 22.2666 },
  { id: uuidv4(), name: 'Indian Spice', city: 'Helsinki', cuisine: ['Indian', 'Curry'], rating: 4.6, lat: 60.1642, lon: 24.9410 }
];

// Generate mock offers with realistic Finnish food data
function generateMockOffers() {
  const foodItems = [
    'Margherita Pizza', 'Pepperoni Pizza', 'Salmon Sushi Roll', 'Chicken Teriyaki Bowl',
    'Classic Cheeseburger', 'Bacon Burger', 'Pad Thai', 'Green Curry', 'Fish & Chips',
    'Caesar Salad', 'Chicken Tikka Masala', 'Naan Bread Set', 'Pasta Carbonara',
    'Mushroom Risotto', 'Grilled Salmon', 'Beef Steak', 'Vegetable Curry', 'Chicken Wings'
  ];
  
  const offers = [];
  
  mockRestaurants.forEach(restaurant => {
    mockProviders.forEach(provider => {
      // Generate 2-4 offers per restaurant per provider
      const numOffers = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < numOffers; i++) {
        const item = foodItems[Math.floor(Math.random() * foodItems.length)];
        const originalPrice = Math.floor(Math.random() * 20) + 8; // 8-28 EUR
        const discountPercent = Math.floor(Math.random() * 40) + 10; // 10-50% discount
        const discountedPrice = parseFloat((originalPrice * (1 - discountPercent / 100)).toFixed(2));
        
        const endsAt = new Date();
        endsAt.setHours(endsAt.getHours() + Math.floor(Math.random() * 24) + 1);
        
        offers.push({
          id: uuidv4(),
          providerId: provider.id,
          providerName: provider.name,
          providerLogo: provider.logo,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          city: restaurant.city,
          cuisine: restaurant.cuisine,
          rating: restaurant.rating,
          lat: restaurant.lat,
          lon: restaurant.lon,
          title: item,
          description: `Delicious ${item.toLowerCase()} from ${restaurant.name}`,
          originalPrice,
          discountedPrice,
          discountPercent,
          currency: 'EUR',
          deliveryFee: Math.floor(Math.random() * 5) + 1, // 1-6 EUR
          pickup: Math.random() > 0.3,
          delivery: true,
          endsAt,
          imageUrl: `https://images.unsplash.com/photo-${1565299624946 + Math.floor(Math.random() * 1000)}?w=400&h=300&fit=crop&auto=format`,
          tags: ['discount', ...restaurant.cuisine.map(c => c.toLowerCase())],
          deepLink: `https://${provider.id}.com/restaurant/${restaurant.id}/offer/${uuidv4()}`,
          status: 'active',
          insertedAt: new Date(),
          updatedAt: new Date()
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
    const db = await connectDB();

    // Generate fresh mock data for demo
    const mockOffers = generateMockOffers();

    switch (path) {
      case 'offers':
        const city = searchParams.get('city') || '';
        const cuisine = searchParams.get('cuisine') || '';
        const minDiscount = parseInt(searchParams.get('minDiscount')) || 0;
        const maxPrice = parseInt(searchParams.get('maxPrice')) || 100;
        const provider = searchParams.get('provider') || '';
        const sortBy = searchParams.get('sortBy') || 'discount'; // discount, price, rating
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 12;

        let filteredOffers = mockOffers.filter(offer => {
          const matchesCity = !city || offer.city.toLowerCase().includes(city.toLowerCase());
          const matchesCuisine = !cuisine || offer.cuisine.some(c => c.toLowerCase().includes(cuisine.toLowerCase()));
          const matchesDiscount = offer.discountPercent >= minDiscount;
          const matchesPrice = offer.discountedPrice <= maxPrice;
          const matchesProvider = !provider || offer.providerId === provider;
          
          return matchesCity && matchesCuisine && matchesDiscount && matchesPrice && matchesProvider;
        });

        // Sort offers
        filteredOffers.sort((a, b) => {
          switch (sortBy) {
            case 'price':
              return a.discountedPrice - b.discountedPrice;
            case 'rating':
              return b.rating - a.rating;
            case 'discount':
            default:
              return b.discountPercent - a.discountPercent;
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
        return NextResponse.json(mockProviders);

      case 'cities':
        const cities = [...new Set(mockRestaurants.map(r => r.city))];
        return NextResponse.json(cities);

      case 'cuisines':
        const cuisines = [...new Set(mockRestaurants.flatMap(r => r.cuisine))];
        return NextResponse.json(cuisines);

      case 'stats':
        const totalOffers = mockOffers.length;
        const averageDiscount = Math.round(mockOffers.reduce((sum, offer) => sum + offer.discountPercent, 0) / totalOffers);
        const totalSavings = mockOffers.reduce((sum, offer) => sum + (offer.originalPrice - offer.discountedPrice), 0);
        
        return NextResponse.json({
          totalOffers,
          activeProviders: mockProviders.length,
          averageDiscount,
          totalSavings: Math.round(totalSavings),
          cities: mockRestaurants.length
        });

      default:
        return NextResponse.json({ message: 'FoodAi API - Finnish Food Deals Aggregator' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { pathname } = new URL(request.url);
    const path = pathname.split('/api/')[1] || '';
    const body = await request.json();
    const db = await connectDB();

    switch (path) {
      case 'clickouts':
        const { offerId, providerId, userId } = body;
        
        const clickout = {
          id: uuidv4(),
          offerId,
          providerId,
          userId: userId || null,
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || '',
          referer: request.headers.get('referer') || '',
          timestamp: new Date()
        };

        // In production, store in database
        console.log('Clickout tracked:', clickout);
        
        return NextResponse.json({ success: true, clickoutId: clickout.id });

      default:
        return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }
  } catch (error) {
    console.error('POST API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}