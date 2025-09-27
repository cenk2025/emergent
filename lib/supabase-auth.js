import { createClient } from '@supabase/supabase-js'

// Direct Supabase client for compatibility
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Finnish food categories and cities
export const FINNISH_FOOD_CATEGORIES = [
  'Suomalainen', 'Pizza', 'Sushi', 'Kiinalainen', 'Intialainen', 'Thai', 'Italiana',
  'Hampurilainen', 'Kebab', 'Meksikkolainen', 'Aasialainen', 'Vegan', 'Kasvis',
  'Kala', 'Liha', 'Salaatti', 'Keitto', 'Grill', 'Fast Food', 'Jälkiruoka'
]

export const FINNISH_CITIES = [
  'Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Oulu', 'Turku', 'Jyväskylä', 
  'Lahti', 'Kuopio', 'Pori', 'Kouvola', 'Joensuu', 'Lappeenranta', 'Hämeenlinna',
  'Vaasa', 'Seinäjoki', 'Rovaniemi', 'Mikkeli', 'Kotka', 'Salo', 'Porvoo'
]

// Check if user is admin
export const isAdmin = (userEmail) => {
  return userEmail === 'info@voon.fi'
}

// Test database connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('providers')
      .select('count')
      .limit(1)
    
    if (error && error.code === 'PGRST116') {
      console.log('Tables not yet created, database schema setup needed')
      return { connected: true, tablesExist: false }
    }
    
    console.log('Supabase connection successful!')
    return { connected: true, tablesExist: true }
  } catch (error) {
    console.error('Supabase connection error:', error)
    return { connected: false, tablesExist: false, error: error.message }
  }
}

// Initialize Finnish food data
export const initializeFoodAiData = async () => {
  try {
    const { data: existingProviders } = await supabase
      .from('providers')
      .select('id')
      .limit(1)

    if (!existingProviders || existingProviders.length === 0) {
      await seedFinnishData()
      console.log('Finnish FoodAi data seeded!')
    }
  } catch (error) {
    console.error('Data seeding error:', error)
  }
}

// Seed Finnish data
const seedFinnishData = async () => {
  // Add Finnish providers
  const providers = [
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
  ]

  await supabase.from('providers').insert(providers)

  // Add Finnish restaurants
  const restaurants = [
    {
      id: 'restaurant_1',
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
      id: 'restaurant_2', 
      name: 'Sushi Zen',
      city: 'Helsinki',
      district: 'Kallio',
      cuisine_types: ['Sushi', 'Japanilainen'],
      rating: 4.6,
      latitude: 60.1841,
      longitude: 24.9511,
      is_active: true
    },
    {
      id: 'restaurant_3',
      name: 'Pizzeria Rax',
      city: 'Tampere',
      district: 'Keskusta',
      cuisine_types: ['Pizza', 'Fast Food'],
      rating: 4.2,
      latitude: 61.4981,
      longitude: 23.7608,
      is_active: true
    }
  ]

  await supabase.from('restaurants').insert(restaurants)
}