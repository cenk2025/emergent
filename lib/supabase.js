import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Türk mutfağı için özel veri yapıları
export const TURKISH_FOOD_CATEGORIES = [
  'Türk Mutfağı', 'Kebap', 'Pide & Lahmacun', 'Döner', 'Meze', 'Tatlı',
  'Pizza', 'Burger', 'Sushi', 'Çin Mutfağı', 'İtalyan', 'Hint Mutfağı',
  'Vegan', 'Sağlıklı', 'Fast Food', 'Kahvaltı', 'Çorba', 'Salata'
]

export const TURKISH_CITIES = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 
  'Konya', 'Şanlıurfa', 'Gaziantep', 'Kocaeli', 'Mersin', 'Diyarbakır',
  'Hatay', 'Manisa', 'Kayseri', 'Samsun', 'Balıkesir', 'Kahramanmaraş'
]

// Veritabanı bağlantısını test et
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('providers')
      .select('count')
      .limit(1)
    
    if (error && error.code === 'PGRST116') {
      console.log('Tablolar henüz oluşturulmamış, veritabanı şeması kurulması gerekiyor')
      return { connected: true, tablesExist: false }
    }
    
    console.log('Supabase bağlantısı başarılı!')
    return { connected: true, tablesExist: true }
  } catch (error) {
    console.error('Supabase bağlantı hatası:', error)
    return { connected: false, tablesExist: false, error: error.message }
  }
}

// Başlangıç verilerini yükle
export const initializeFoodAiData = async () => {
  try {
    const { data: existingProviders } = await supabase
      .from('providers')
      .select('id')
      .limit(1)

    if (!existingProviders || existingProviders.length === 0) {
      await seedInitialData()
      console.log('FoodAi başlangıç verileri yüklendi!')
    }
  } catch (error) {
    console.error('Veri yükleme hatası:', error)
  }
}

// Başlangıç verilerini oluştur
const seedInitialData = async () => {
  // Sağlayıcıları ekle
  const providers = [
    {
      id: 'yemeksepeti',
      name: 'Yemeksepeti',
      logo_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop',
      color: '#FF6B35',
      website: 'https://yemeksepeti.com',
      is_active: true
    },
    {
      id: 'getir',
      name: 'Getir',
      logo_url: 'https://images.unsplash.com/photo-1555992336-03a23a47b61e?w=100&h=100&fit=crop',
      color: '#5D4FB3',
      website: 'https://getir.com',
      is_active: true
    },
    {
      id: 'trendyol',
      name: 'Trendyol Yemek',
      logo_url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=100&h=100&fit=crop',
      color: '#F27A1A',
      website: 'https://trendyolyemek.com',
      is_active: true
    }
  ]

  await supabase.from('providers').insert(providers)

  // Restoranları ekle
  const restaurants = [
    {
      id: 'restaurant_1',
      name: 'Sultanahmet Köftecisi',
      city: 'İstanbul',
      district: 'Fatih',
      cuisine_types: ['Türk Mutfağı', 'Kebap'],
      rating: 4.7,
      latitude: 41.0082,
      longitude: 28.9784,
      is_active: true
    },
    {
      id: 'restaurant_2', 
      name: 'Pandora Patisserie',
      city: 'İstanbul',
      district: 'Beşiktaş',
      cuisine_types: ['Tatlı', 'Kahvaltı'],
      rating: 4.5,
      latitude: 41.0431,
      longitude: 29.0097,
      is_active: true
    },
    {
      id: 'restaurant_3',
      name: 'Adana Ocakbaşı',
      city: 'Ankara',
      district: 'Çankaya',
      cuisine_types: ['Türk Mutfağı', 'Kebap'],
      rating: 4.6,
      latitude: 39.9334,
      longitude: 32.8597,
      is_active: true
    }
  ]

  await supabase.from('restaurants').insert(restaurants)
}