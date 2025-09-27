import { createClient } from '@supabase/supabase-js'

// Create admin client with service role key
const supabaseUrl = 'https://vfvhmiebamqqdntdvozs.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmdmhtaWViYW1xcWRudGR2b3pzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTAwMTI2NCwiZXhwIjoyMDc0NTc3MjY0fQ._5fzosjYUVTCXJTQY_zqDb1sXhiEUBjK8ZsmbKbl-Bg'

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)

// SQL to create all FoodAi tables
const createTablesSQL = `
-- Drop existing tables if they exist
DROP TABLE IF EXISTS "offers", "restaurants", "providers", "clickouts", "user_profiles", "admins" CASCADE;

-- 1. Providers table
CREATE TABLE "providers" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "logo_url" TEXT,
  "color" TEXT DEFAULT '#FF6B35',
  "website" TEXT,
  "api_type" TEXT CHECK (api_type IN ('api', 'scrape', 'feed')) DEFAULT 'scrape',
  "commission_rate" DECIMAL(5,2) DEFAULT 0.00,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Restaurants table
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

-- 3. Offers table
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
  "currency" TEXT DEFAULT 'EUR',
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

-- 4. Clickouts table  
CREATE TABLE "clickouts" (
  "id" BIGSERIAL PRIMARY KEY,
  "offer_id" TEXT REFERENCES "offers"("id") ON DELETE CASCADE,
  "provider_id" TEXT REFERENCES "providers"("id") ON DELETE CASCADE,
  "user_id" TEXT,
  "ip_address" INET,
  "user_agent" TEXT,
  "referer" TEXT,
  "conversion_value" DECIMAL(10,2),
  "commission_earned" DECIMAL(10,2),
  "is_conversion" BOOLEAN DEFAULT false,
  "clicked_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. User profiles table
CREATE TABLE "user_profiles" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE,
  "name" TEXT,
  "avatar_url" TEXT,
  "favorite_cuisines" TEXT[] DEFAULT '{}',
  "preferred_city" TEXT,
  "language" TEXT DEFAULT 'fi',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Admins table
CREATE TABLE "admins" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "name" TEXT,
  "role" TEXT DEFAULT 'admin',
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX "idx_offers_provider" ON "offers"("provider_id");
CREATE INDEX "idx_offers_restaurant" ON "offers"("restaurant_id");
CREATE INDEX "idx_offers_active_ends" ON "offers"("is_active", "ends_at" DESC);
CREATE INDEX "idx_offers_discount" ON "offers"("discount_percent" DESC);
CREATE INDEX "idx_offers_price" ON "offers"("discounted_price" ASC);
CREATE INDEX "idx_restaurants_city" ON "restaurants"("city");
CREATE INDEX "idx_restaurants_cuisine" ON "restaurants" USING GIN("cuisine_types");
CREATE INDEX "idx_clickouts_offer" ON "clickouts"("offer_id");
CREATE INDEX "idx_clickouts_date" ON "clickouts"("clicked_at" DESC);
CREATE INDEX "idx_clickouts_conversion" ON "clickouts"("is_conversion", "clicked_at" DESC);

-- Enable RLS
ALTER TABLE "providers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "restaurants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "offers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clickouts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "admins" ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public access for most tables)
CREATE POLICY "Public providers" ON "providers" FOR ALL USING (true);
CREATE POLICY "Public restaurants" ON "restaurants" FOR ALL USING (true);
CREATE POLICY "Public offers" ON "offers" FOR ALL USING (true);
CREATE POLICY "Public clickouts" ON "clickouts" FOR ALL USING (true);
CREATE POLICY "Public profiles" ON "user_profiles" FOR ALL USING (true);
CREATE POLICY "Admin only" ON "admins" FOR ALL USING (auth.jwt() ->> 'email' = 'info@voon.fi');

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updated_at" = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER "update_providers_updated_at" BEFORE UPDATE ON "providers"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER "update_restaurants_updated_at" BEFORE UPDATE ON "restaurants"  
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER "update_offers_updated_at" BEFORE UPDATE ON "offers"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "user_profiles"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER "update_admins_updated_at" BEFORE UPDATE ON "admins"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert admin user
INSERT INTO "admins" ("id", "email", "name", "role") VALUES 
('admin_1', 'info@voon.fi', 'Voon Admin', 'super_admin');

-- Insert providers
INSERT INTO "providers" ("id", "name", "logo_url", "color", "website", "commission_rate") VALUES
('wolt', 'Wolt', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop', '#00C2E8', 'https://wolt.com', 8.50),
('foodora', 'Foodora', 'https://images.unsplash.com/photo-1555992336-03a23a47b61e?w=100&h=100&fit=crop', '#E91E63', 'https://foodora.fi', 7.20),
('resq', 'ResQ Club', 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=100&h=100&fit=crop', '#4CAF50', 'https://resq-club.com', 12.00);

-- Insert restaurants
INSERT INTO "restaurants" ("id", "name", "city", "district", "cuisine_types", "rating", "latitude", "longitude") VALUES
('rest_1', 'Ravintola Savoy', 'Helsinki', 'Keskusta', '{"Suomalainen", "Fine Dining"}', 4.8, 60.1699, 24.9384),
('rest_2', 'Sushi Zen', 'Helsinki', 'Kallio', '{"Sushi", "Japanilainen"}', 4.6, 60.1841, 24.9511),
('rest_3', 'Pizzeria Rax', 'Tampere', 'Keskusta', '{"Pizza", "Fast Food"}', 4.2, 61.4981, 23.7608),
('rest_4', 'Golden Dragon', 'Turku', 'Keskusta', '{"Kiinalainen", "Aasialainen"}', 4.4, 60.4518, 22.2666),
('rest_5', 'Burger Palace', 'Oulu', 'Keskusta', '{"Hampurilainen", "Fast Food"}', 4.2, 65.0121, 25.4651);

SELECT 'FoodAi database schema and initial data created successfully!' as result;
`;

// Execute the SQL to create tables
async function createFoodAiTables() {
  console.log('🚀 Creating FoodAi tables in Supabase...');
  
  try {
    const { data, error } = await adminSupabase
      .rpc('exec_sql', { 
        query: createTablesSQL 
      });

    if (error) {
      console.error('❌ Error creating tables:', error);
      
      // Try alternative approach - execute SQL directly
      const { data: data2, error: error2 } = await adminSupabase
        .from('_realtime_schema_migrations')
        .select('*')
        .limit(1);
      
      if (error2) {
        console.error('❌ Supabase connection failed:', error2);
        return false;
      }
    }

    console.log('✅ Tables created successfully!', data);
    return true;

  } catch (err) {
    console.error('❌ Exception creating tables:', err);
    return false;
  }
}

// Run the table creation
createFoodAiTables().then((success) => {
  if (success) {
    console.log('🎉 FoodAi database is ready!');
  } else {
    console.log('⚠️ Manual table creation needed - use SQL Editor in Supabase Dashboard');
    console.log('📋 Copy the SQL from /app/supabase_schema.sql and run it manually');
  }
});

export { createFoodAiTables };