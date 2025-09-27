import { createClient } from '@supabase/supabase-js'

// SADECE TABLO OLUŞTURMAK İÇİN GEÇİCİ - KULLANDIKTAN SONRA SİLİNECEK
const supabaseUrl = 'https://vfvhmiebamqqdntdvozs.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmdmhtaWViYW1xcWRudGR2b3pzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTAwMTI2NCwiZXhwIjoyMDc0NTc3MjY0fQ._5fzosjYUVTCXJTQY_zqDb1sXhiEUBjK8ZsmbKbl-Bg'

const adminClient = createClient(supabaseUrl, supabaseServiceKey)

// FoodAi için veritabanı şeması
const createFoodAiSchema = async () => {
  console.log('🚀 FoodAi veritabanı şeması oluşturuluyor...')
  
  try {
    // 1. Sağlayıcılar tablosu
    const { error: providersError } = await adminClient.rpc('exec_sql', {
      sql: `
        DROP TABLE IF EXISTS "offers", "restaurants", "providers", "clickouts", "user_profiles" CASCADE;
        
        CREATE TABLE "providers" (
          "id" TEXT PRIMARY KEY,
          "name" TEXT NOT NULL,
          "logo_url" TEXT,
          "color" TEXT DEFAULT '#FF6B35',
          "website" TEXT,
          "api_type" TEXT CHECK (api_type IN ('api', 'scrape', 'feed')) DEFAULT 'scrape',
          "is_active" BOOLEAN DEFAULT true,
          "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE TABLE "restaurants" (
          "id" TEXT PRIMARY KEY,
          "name" TEXT NOT NULL,
          "city" TEXT NOT NULL,
          "district" TEXT,
          "cuisine_types" TEXT[] DEFAULT '{}',
          "rating" DECIMAL(3,2) DEFAULT 0.0,
          "latitude" DECIMAL(10,7),
          "longitude" DECIMAL(10,7),
          "address" TEXT,
          "phone" TEXT,
          "is_active" BOOLEAN DEFAULT true,
          "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE TABLE "offers" (
          "id" TEXT PRIMARY KEY,
          "provider_id" TEXT REFERENCES "providers"("id") ON DELETE CASCADE,
          "restaurant_id" TEXT REFERENCES "restaurants"("id") ON DELETE CASCADE,
          "title" TEXT NOT NULL,
          "description" TEXT,
          "image_url" TEXT,
          "original_price" DECIMAL(10,2) NOT NULL,
          "discounted_price" DECIMAL(10,2) NOT NULL,
          "discount_percent" DECIMAL(5,2) GENERATED ALWAYS AS (
            CASE WHEN original_price > 0 
            THEN ROUND((1 - discounted_price/original_price)*100, 2) 
            ELSE 0 END
          ) STORED,
          "currency" TEXT DEFAULT 'TL',
          "delivery_fee" DECIMAL(10,2) DEFAULT 0,
          "min_order_amount" DECIMAL(10,2) DEFAULT 0,
          "has_pickup" BOOLEAN DEFAULT false,
          "has_delivery" BOOLEAN DEFAULT true,
          "starts_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "ends_at" TIMESTAMP WITH TIME ZONE,
          "deep_link" TEXT NOT NULL,
          "tags" TEXT[] DEFAULT '{}',
          "is_active" BOOLEAN DEFAULT true,
          "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE TABLE "clickouts" (
          "id" BIGSERIAL PRIMARY KEY,
          "offer_id" TEXT REFERENCES "offers"("id") ON DELETE CASCADE,
          "provider_id" TEXT REFERENCES "providers"("id") ON DELETE CASCADE,
          "user_id" TEXT,
          "ip_address" INET,
          "user_agent" TEXT,
          "referer" TEXT,
          "clicked_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE TABLE "user_profiles" (
          "id" TEXT PRIMARY KEY,
          "email" TEXT UNIQUE,
          "name" TEXT,
          "avatar_url" TEXT,
          "favorite_cuisines" TEXT[] DEFAULT '{}',
          "preferred_city" TEXT,
          "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- İndeksler
        CREATE INDEX "idx_offers_provider" ON "offers"("provider_id");
        CREATE INDEX "idx_offers_restaurant" ON "offers"("restaurant_id");
        CREATE INDEX "idx_offers_city" ON "offers"("restaurant_id");
        CREATE INDEX "idx_offers_active_ends" ON "offers"("is_active", "ends_at" DESC);
        CREATE INDEX "idx_offers_discount" ON "offers"("discount_percent" DESC);
        CREATE INDEX "idx_offers_price" ON "offers"("discounted_price" ASC);
        CREATE INDEX "idx_restaurants_city" ON "restaurants"("city");
        CREATE INDEX "idx_restaurants_cuisine" ON "restaurants" USING GIN("cuisine_types");
        CREATE INDEX "idx_clickouts_offer" ON "clickouts"("offer_id");
        CREATE INDEX "idx_clickouts_date" ON "clickouts"("clicked_at" DESC);
        
        -- RLS politikaları (herkese açık)
        ALTER TABLE "providers" ENABLE ROW LEVEL SECURITY;
        ALTER TABLE "restaurants" ENABLE ROW LEVEL SECURITY;
        ALTER TABLE "offers" ENABLE ROW LEVEL SECURITY;
        ALTER TABLE "clickouts" ENABLE ROW LEVEL SECURITY;
        ALTER TABLE "user_profiles" ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Public providers" ON "providers" FOR ALL USING (true);
        CREATE POLICY "Public restaurants" ON "restaurants" FOR ALL USING (true);
        CREATE POLICY "Public offers" ON "offers" FOR ALL USING (true);
        CREATE POLICY "Public clickouts" ON "clickouts" FOR ALL USING (true);
        CREATE POLICY "Public profiles" ON "user_profiles" FOR ALL USING (true);
        
        -- Otomatik timestamp güncelleme fonksiyonu
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW."updated_at" = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';
        
        -- Trigger'ları oluştur
        CREATE TRIGGER "update_providers_updated_at" BEFORE UPDATE ON "providers"
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        CREATE TRIGGER "update_restaurants_updated_at" BEFORE UPDATE ON "restaurants"  
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        CREATE TRIGGER "update_offers_updated_at" BEFORE UPDATE ON "offers"
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        CREATE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "user_profiles"
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `
    })

    if (providersError) {
      console.error('❌ Tablo oluşturma hatası:', providersError)
      return false
    }

    console.log('✅ FoodAi veritabanı şeması başarıyla oluşturuldu!')
    return true

  } catch (error) {
    console.error('❌ Veritabanı kurulum hatası:', error)
    return false
  }
}

// Tabloları oluştur
createFoodAiSchema().then((success) => {
  if (success) {
    console.log('🎉 Veritabanı hazır!')
  } else {
    console.log('❌ Veritabanı kurulumunda hata oluştu')
  }
  process.exit(0)
})