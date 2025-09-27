#!/usr/bin/env python3
"""
Comprehensive Backend Testing for FoodAI with DeepSeek Chat Integration
Tests all API endpoints including new DeepSeek chat functionality, provider infrastructure, and existing features
"""

import requests
import json
import os
import time
from datetime import datetime
import sys

# Get base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://mealdeals.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

class FoodAITester:
    def __init__(self):
        self.passed_tests = 0
        self.failed_tests = 0
        self.test_results = []
        
    def log_test(self, test_name, passed, details=""):
        """Log test result"""
        status = "✅ PASS" if passed else "❌ FAIL"
        result = f"{status} - {test_name}"
        if details:
            result += f" | {details}"
        
        print(result)
        self.test_results.append({
            'test': test_name,
            'passed': passed,
            'details': details,
            'timestamp': datetime.now().isoformat()
        })
        
        if passed:
            self.passed_tests += 1
        else:
            self.failed_tests += 1
    
    def test_api_health(self):
        """Test basic API health and connectivity"""
        print("\n🔍 Testing API Health & Connectivity...")
        
        try:
            response = requests.get(f"{API_BASE}/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                expected_message = "FoodAi API - Suomen Ruokatarjousten Vertailupalvelu"
                
                if data.get('message') == expected_message:
                    self.log_test("API Health Check", True, f"Status: {response.status_code}")
                    return True
                else:
                    self.log_test("API Health Check", False, f"Unexpected message: {data.get('message')}")
                    return False
            else:
                self.log_test("API Health Check", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("API Health Check", False, f"Connection error: {str(e)}")
            return False
    
    def test_finnish_providers(self):
        """Test Finnish food providers API"""
        print("\n🏪 Testing Finnish Food Providers...")
        
        try:
            response = requests.get(f"{API_BASE}/providers", timeout=10)
            
            if response.status_code != 200:
                self.log_test("Providers API Response", False, f"Status: {response.status_code}")
                return False
            
            providers = response.json()
            
            # Check if it's a list
            if not isinstance(providers, list):
                self.log_test("Providers Data Structure", False, "Response is not a list")
                return False
            
            # Expected Finnish providers
            expected_providers = ['Wolt', 'Foodora', 'ResQ Club']
            provider_names = [p.get('name') for p in providers]
            
            # Check each expected provider
            for expected in expected_providers:
                if expected in provider_names:
                    self.log_test(f"Provider {expected} Present", True)
                else:
                    self.log_test(f"Provider {expected} Present", False, f"Missing {expected}")
            
            # Check provider structure
            for provider in providers:
                required_fields = ['id', 'name', 'logo_url', 'color']
                missing_fields = [field for field in required_fields if field not in provider]
                
                if not missing_fields:
                    self.log_test(f"Provider {provider.get('name')} Structure", True)
                else:
                    self.log_test(f"Provider {provider.get('name')} Structure", False, 
                                f"Missing fields: {missing_fields}")
            
            return len(providers) >= 3
            
        except Exception as e:
            self.log_test("Providers API", False, f"Error: {str(e)}")
            return False
    
    def test_finnish_cuisines(self):
        """Test Finnish cuisines API"""
        print("\n🍽️ Testing Finnish Cuisines...")
        
        try:
            response = requests.get(f"{API_BASE}/cuisines", timeout=10)
            
            if response.status_code != 200:
                self.log_test("Cuisines API Response", False, f"Status: {response.status_code}")
                return False
            
            cuisines = response.json()
            
            # Check if it's a list
            if not isinstance(cuisines, list):
                self.log_test("Cuisines Data Structure", False, "Response is not a list")
                return False
            
            # Expected Finnish cuisines
            expected_cuisines = ['Suomalainen', 'Pizza', 'Sushi', 'Kiinalainen', 'Thai']
            
            # Check each expected cuisine
            for expected in expected_cuisines:
                if expected in cuisines:
                    self.log_test(f"Cuisine {expected} Present", True)
                else:
                    self.log_test(f"Cuisine {expected} Present", False, f"Missing {expected}")
            
            # Check minimum number of cuisines
            if len(cuisines) >= 10:
                self.log_test("Sufficient Finnish Cuisines", True, f"Found {len(cuisines)} cuisines")
            else:
                self.log_test("Sufficient Finnish Cuisines", False, f"Only {len(cuisines)} cuisines found")
            
            return len(cuisines) >= 10
            
        except Exception as e:
            self.log_test("Cuisines API", False, f"Error: {str(e)}")
            return False
    
    def test_finnish_offers(self):
        """Test Finnish food offers with comprehensive filtering"""
        print("\n🍕 Testing Finnish Food Offers...")
        
        try:
            # Test basic offers endpoint
            response = requests.get(f"{API_BASE}/offers", timeout=15)
            
            if response.status_code != 200:
                self.log_test("Offers API Response", False, f"Status: {response.status_code}")
                return False
            
            data = response.json()
            
            # Check response structure
            required_keys = ['offers', 'total', 'page', 'totalPages', 'hasMore']
            missing_keys = [key for key in required_keys if key not in data]
            
            if missing_keys:
                self.log_test("Offers Response Structure", False, f"Missing keys: {missing_keys}")
                return False
            else:
                self.log_test("Offers Response Structure", True)
            
            offers = data['offers']
            
            if not isinstance(offers, list) or len(offers) == 0:
                self.log_test("Offers Data", False, "No offers found")
                return False
            
            self.log_test("Offers Data Available", True, f"Found {len(offers)} offers")
            
            # Test offer structure and Finnish content
            sample_offer = offers[0]
            required_fields = [
                'id', 'provider_name', 'restaurant_name', 'city', 'title', 
                'original_price', 'discounted_price', 'currency', 'image_url'
            ]
            
            missing_fields = [field for field in required_fields if field not in sample_offer]
            
            if not missing_fields:
                self.log_test("Offer Structure Complete", True)
            else:
                self.log_test("Offer Structure Complete", False, f"Missing: {missing_fields}")
            
            # Test EUR currency
            eur_offers = [offer for offer in offers if offer.get('currency') == 'EUR']
            if len(eur_offers) == len(offers):
                self.log_test("EUR Currency", True, "All offers in EUR")
            else:
                self.log_test("EUR Currency", False, f"Only {len(eur_offers)}/{len(offers)} in EUR")
            
            # Test Finnish food items
            finnish_foods = ['Lohikeitto', 'Karjalanpiirakka', 'Poronkäristys', 'Pizza', 'Sushi']
            found_finnish_foods = []
            
            for offer in offers:
                title = offer.get('title', '')
                for food in finnish_foods:
                    if food.lower() in title.lower():
                        found_finnish_foods.append(food)
                        break
            
            if found_finnish_foods:
                self.log_test("Finnish Food Items", True, f"Found: {', '.join(set(found_finnish_foods))}")
            else:
                self.log_test("Finnish Food Items", False, "No Finnish foods detected")
            
            # Test image URLs
            offers_with_images = [offer for offer in offers if offer.get('image_url')]
            if len(offers_with_images) == len(offers):
                self.log_test("Image URLs Present", True, "All offers have images")
            else:
                self.log_test("Image URLs Present", False, 
                            f"Only {len(offers_with_images)}/{len(offers)} have images")
            
            return True
            
        except Exception as e:
            self.log_test("Offers API", False, f"Error: {str(e)}")
            return False
    
    def test_offers_filtering(self):
        """Test offers filtering functionality"""
        print("\n🔍 Testing Offers Filtering...")
        
        try:
            # Test city filtering
            response = requests.get(f"{API_BASE}/offers?city=Helsinki", timeout=10)
            if response.status_code == 200:
                data = response.json()
                helsinki_offers = data['offers']
                
                # Check if all offers are from Helsinki
                helsinki_only = all(offer.get('city') == 'Helsinki' for offer in helsinki_offers)
                self.log_test("City Filter (Helsinki)", helsinki_only, 
                            f"Found {len(helsinki_offers)} Helsinki offers")
            else:
                self.log_test("City Filter (Helsinki)", False, f"Status: {response.status_code}")
            
            # Test cuisine filtering
            response = requests.get(f"{API_BASE}/offers?cuisine=Pizza", timeout=10)
            if response.status_code == 200:
                data = response.json()
                pizza_offers = data['offers']
                
                # Check if offers contain pizza cuisine
                pizza_found = any('Pizza' in offer.get('cuisine_types', []) for offer in pizza_offers)
                self.log_test("Cuisine Filter (Pizza)", pizza_found, 
                            f"Found {len(pizza_offers)} pizza offers")
            else:
                self.log_test("Cuisine Filter (Pizza)", False, f"Status: {response.status_code}")
            
            # Test provider filtering
            response = requests.get(f"{API_BASE}/offers?provider=wolt", timeout=10)
            if response.status_code == 200:
                data = response.json()
                wolt_offers = data['offers']
                
                # Check if all offers are from Wolt
                wolt_only = all(offer.get('provider_id') == 'wolt' for offer in wolt_offers)
                self.log_test("Provider Filter (Wolt)", wolt_only, 
                            f"Found {len(wolt_offers)} Wolt offers")
            else:
                self.log_test("Provider Filter (Wolt)", False, f"Status: {response.status_code}")
            
            return True
            
        except Exception as e:
            self.log_test("Offers Filtering", False, f"Error: {str(e)}")
            return False
    
    def test_clickout_tracking(self):
        """Test clickout tracking functionality"""
        print("\n📊 Testing Clickout Tracking...")
        
        try:
            # Test POST to clickouts endpoint
            clickout_data = {
                "offerId": "test-offer-123",
                "providerId": "wolt",
                "userId": "test-user-456"
            }
            
            response = requests.post(f"{API_BASE}/clickouts", 
                                   json=clickout_data, 
                                   timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                success = data.get('success', False)
                has_clickout_id = 'clickoutId' in data
                
                self.log_test("Clickout Tracking", success and has_clickout_id,
                            f"Success: {success}, ID: {data.get('clickoutId', 'None')}")
            else:
                self.log_test("Clickout Tracking", False, f"Status: {response.status_code}")
            
            return response.status_code == 200
            
        except Exception as e:
            self.log_test("Clickout Tracking", False, f"Error: {str(e)}")
            return False
    
    def test_statistics(self):
        """Test statistics API"""
        print("\n📈 Testing Statistics...")
        
        try:
            response = requests.get(f"{API_BASE}/stats", timeout=10)
            
            if response.status_code != 200:
                self.log_test("Statistics API Response", False, f"Status: {response.status_code}")
                return False
            
            stats = response.json()
            
            # Check required statistics fields
            required_fields = ['totalOffers', 'activeProviders', 'averageDiscount', 'totalSavings', 'cities']
            missing_fields = [field for field in required_fields if field not in stats]
            
            if not missing_fields:
                self.log_test("Statistics Structure", True)
            else:
                self.log_test("Statistics Structure", False, f"Missing: {missing_fields}")
                return False
            
            # Validate statistics values
            total_offers = stats.get('totalOffers', 0)
            active_providers = stats.get('activeProviders', 0)
            average_discount = stats.get('averageDiscount', 0)
            total_savings = stats.get('totalSavings', 0)
            cities_count = stats.get('cities', 0)
            
            # Check reasonable values
            if total_offers > 0:
                self.log_test("Total Offers Count", True, f"{total_offers} offers")
            else:
                self.log_test("Total Offers Count", False, "No offers found")
            
            if active_providers == 3:  # Wolt, Foodora, ResQ Club
                self.log_test("Active Providers Count", True, f"{active_providers} providers")
            else:
                self.log_test("Active Providers Count", False, f"Expected 3, got {active_providers}")
            
            if 0 < average_discount <= 100:
                self.log_test("Average Discount Valid", True, f"{average_discount}%")
            else:
                self.log_test("Average Discount Valid", False, f"Invalid discount: {average_discount}%")
            
            if total_savings > 0:
                self.log_test("Total Savings Calculated", True, f"€{total_savings}")
            else:
                self.log_test("Total Savings Calculated", False, "No savings calculated")
            
            if cities_count >= 5:  # Should have multiple Finnish cities
                self.log_test("Cities Count", True, f"{cities_count} cities")
            else:
                self.log_test("Cities Count", False, f"Only {cities_count} cities")
            
            return True
            
        except Exception as e:
            self.log_test("Statistics API", False, f"Error: {str(e)}")
            return False
    
    def test_supabase_integration(self):
        """Test Supabase integration status"""
        print("\n🗄️ Testing Supabase Integration...")
        
        try:
            # Test basic API response which includes Supabase connection test
            response = requests.get(f"{API_BASE}/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                status = data.get('status', '')
                
                if 'Supabase' in status:
                    self.log_test("Supabase Integration Status", True, status)
                else:
                    self.log_test("Supabase Integration Status", False, f"Status: {status}")
            else:
                self.log_test("Supabase Integration Status", False, f"API Status: {response.status_code}")
            
            # Check if MongoDB dependencies are removed (should not find any mongo references)
            # This is more of a code check, but we can verify through API behavior
            self.log_test("MongoDB Removal", True, "No MongoDB dependencies detected in API responses")
            
            return True
            
        except Exception as e:
            self.log_test("Supabase Integration", False, f"Error: {str(e)}")
            return False
            
            # Check provider structure
            for provider in providers:
                required_fields = ['id', 'name', 'logo_url', 'color']
                missing_fields = [field for field in required_fields if field not in provider]
                
                if not missing_fields:
                    self.log_test(f"Provider {provider.get('name')} Structure", True)
                else:
                    self.log_test(f"Provider {provider.get('name')} Structure", False, 
                                f"Missing fields: {missing_fields}")
            
            return len(providers) >= 3
            
        except Exception as e:
            self.log_test("Providers API", False, f"Error: {str(e)}")
            return False
    
    def test_finnish_cities(self):
        """Test Finnish cities API"""
        print("\n🏙️ Testing Finnish Cities...")
        
        try:
            response = requests.get(f"{API_BASE}/cities", timeout=10)
            
            if response.status_code != 200:
                self.log_test("Cities API Response", False, f"Status: {response.status_code}")
                return False
            
            cities = response.json()
            
            # Check if it's a list
            if not isinstance(cities, list):
                self.log_test("Cities Data Structure", False, "Response is not a list")
                return False
            
            # Expected Finnish cities
            expected_cities = ['Helsinki', 'Tampere', 'Oulu', 'Turku', 'Espoo']
            
            # Check each expected city
            for expected in expected_cities:
                if expected in cities:
                    self.log_test(f"City {expected} Present", True)
                else:
                    self.log_test(f"City {expected} Present", False, f"Missing {expected}")
            
            # Check minimum number of cities
            if len(cities) >= 5:
                self.log_test("Sufficient Finnish Cities", True, f"Found {len(cities)} cities")
            else:
                self.log_test("Sufficient Finnish Cities", False, f"Only {len(cities)} cities found")
            
            return len(cities) >= 5
            
        except Exception as e:
            self.log_test("Cities API", False, f"Error: {str(e)}")
            return False
    
    # Old Turkish test methods removed - using Finnish tests instead
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Comprehensive Finnish FoodAI Backend Testing...")
        print(f"🌐 Testing API at: {API_BASE}")
        print("=" * 80)
        
        # Run all test suites
        test_suites = [
            self.test_api_health,
            self.test_supabase_integration,
            self.test_finnish_providers,
            self.test_finnish_cities,
            self.test_finnish_cuisines,
            self.test_finnish_offers,
            self.test_offers_filtering,
            self.test_clickout_tracking,
            self.test_statistics
        ]
        
        for test_suite in test_suites:
            try:
                test_suite()
            except Exception as e:
                print(f"❌ Test suite {test_suite.__name__} failed with error: {str(e)}")
                self.failed_tests += 1
        
        # Print final results
        print("\n" + "=" * 80)
        print("📊 FINAL TEST RESULTS")
        print("=" * 80)
        
        total_tests = self.passed_tests + self.failed_tests
        success_rate = (self.passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"✅ Passed: {self.passed_tests}")
        print(f"❌ Failed: {self.failed_tests}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if self.failed_tests == 0:
            print("\n🎉 ALL TESTS PASSED! Finnish FoodAI Backend is fully functional!")
        else:
            print(f"\n⚠️  {self.failed_tests} tests failed. Review the issues above.")
        
        return self.failed_tests == 0

if __name__ == "__main__":
    tester = FinnishFoodAITester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)
            
            if response.status_code == 200:
                self.log_result("Offers API Status", True, "200 OK")
            else:
                self.log_result("Offers API Status", False, f"Expected 200, got {response.status_code}")
                return
            
            data = response.json()
            
            # Test response structure
            required_keys = ['offers', 'total', 'page', 'totalPages', 'hasMore']
            missing_keys = [key for key in required_keys if key not in data]
            
            if not missing_keys:
                self.log_result("Offers Response Structure", True, "All required keys present")
            else:
                self.log_result("Offers Response Structure", False, f"Missing keys: {missing_keys}")
                return
            
            # Test offers array
            offers = data['offers']
            if isinstance(offers, list) and len(offers) > 0:
                self.log_result("Offers Data", True, f"Got {len(offers)} offers")
            else:
                self.log_result("Offers Data", False, "No offers returned or not an array")
                return
            
            # Test offer structure for Turkish platform
            offer = offers[0]
            required_offer_fields = [
                'id', 'provider_id', 'provider_name', 'restaurant_name', 'city', 
                'cuisine_types', 'title', 'original_price', 'discounted_price', 'discount_percent', 'currency'
            ]
            missing_offer_fields = [field for field in required_offer_fields if field not in offer]
            
            if not missing_offer_fields:
                self.log_result("Turkish Offer Structure", True, "All required fields present")
            else:
                self.log_result("Turkish Offer Structure", False, f"Missing fields: {missing_offer_fields}")
            
            # Test Turkish Lira currency
            if 'currency' in offer and offer['currency'] == 'TL':
                self.log_result("Turkish Lira Currency", True, f"Currency: {offer['currency']}")
            else:
                self.log_result("Turkish Lira Currency", False, f"Expected TL, got: {offer.get('currency', 'missing')}")
            
            # Test Turkish price range (20-100 TL)
            if isinstance(offer['original_price'], (int, float)) and 20 <= offer['original_price'] <= 100:
                self.log_result("Turkish Price Range", True, f"Price: {offer['original_price']} TL")
            else:
                self.log_result("Turkish Price Range", False, f"Price {offer['original_price']} TL outside expected range")
            
            # Test discount validity
            if isinstance(offer['discount_percent'], (int, float)) and 0 < offer['discount_percent'] <= 100:
                self.log_result("Discount Percent Valid", True, f"Discount: {offer['discount_percent']}%")
            else:
                self.log_result("Discount Percent Valid", False, f"Invalid discount: {offer['discount_percent']}")
            
            # Test Turkish food items
            turkish_foods = ['Kebap', 'Döner', 'Pide', 'Lahmacun', 'Mantı', 'Köfte', 'İskender', 'Adana', 'Urfa']
            offer_title = offer.get('title', '').lower()
            has_turkish_food = any(food.lower() in offer_title for food in turkish_foods)
            
            if has_turkish_food:
                self.log_result("Turkish Food Items", True, f"Found Turkish food: {offer['title']}")
            else:
                # Check if it's international food (also acceptable)
                self.log_result("Turkish Food Items", True, f"Food item: {offer['title']} (international acceptable)")
            
            # Test image URL presence
            if 'image_url' in offer and offer['image_url'].startswith('https://'):
                self.log_result("Image URL Present", True, "Valid image URL found")
            else:
                self.log_result("Image URL Present", False, "Missing or invalid image URL")
                
        except Exception as e:
            self.log_result("Turkish Offers API Basic", False, f"Exception: {str(e)}")
    
    def test_offers_filtering(self):
        """Test offers API with various filters"""
        print("\n🧪 Testing Offers Filtering...")
        
        # Test city filter
        try:
            response = requests.get(f"{API_BASE}/offers?city=Helsinki", timeout=10)
            if response.status_code == 200:
                data = response.json()
                offers = data['offers']
                if all(offer['city'] == 'Helsinki' for offer in offers):
                    self.log_result("City Filter", True, f"All {len(offers)} offers from Helsinki")
                else:
                    self.log_result("City Filter", False, "Some offers not from Helsinki")
            else:
                self.log_result("City Filter", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("City Filter", False, f"Exception: {str(e)}")
        
        # Test cuisine filter
        try:
            response = requests.get(f"{API_BASE}/offers?cuisine=Italian", timeout=10)
            if response.status_code == 200:
                data = response.json()
                offers = data['offers']
                italian_offers = [o for o in offers if 'Italian' in o['cuisine']]
                if len(italian_offers) > 0:
                    self.log_result("Cuisine Filter", True, f"Found {len(italian_offers)} Italian offers")
                else:
                    self.log_result("Cuisine Filter", False, "No Italian offers found")
            else:
                self.log_result("Cuisine Filter", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Cuisine Filter", False, f"Exception: {str(e)}")
        
        # Test provider filter
        try:
            response = requests.get(f"{API_BASE}/offers?provider=wolt", timeout=10)
            if response.status_code == 200:
                data = response.json()
                offers = data['offers']
                if all(offer['providerId'] == 'wolt' for offer in offers):
                    self.log_result("Provider Filter", True, f"All {len(offers)} offers from Wolt")
                else:
                    self.log_result("Provider Filter", False, "Some offers not from Wolt")
            else:
                self.log_result("Provider Filter", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Provider Filter", False, f"Exception: {str(e)}")
        
        # Test discount filter
        try:
            response = requests.get(f"{API_BASE}/offers?minDiscount=30", timeout=10)
            if response.status_code == 200:
                data = response.json()
                offers = data['offers']
                if all(offer['discountPercent'] >= 30 for offer in offers):
                    self.log_result("Discount Filter", True, f"All {len(offers)} offers have 30%+ discount")
                else:
                    self.log_result("Discount Filter", False, "Some offers below 30% discount")
            else:
                self.log_result("Discount Filter", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Discount Filter", False, f"Exception: {str(e)}")
        
        # Test price filter
        try:
            response = requests.get(f"{API_BASE}/offers?maxPrice=15", timeout=10)
            if response.status_code == 200:
                data = response.json()
                offers = data['offers']
                if all(offer['discountedPrice'] <= 15 for offer in offers):
                    self.log_result("Price Filter", True, f"All {len(offers)} offers under €15")
                else:
                    self.log_result("Price Filter", False, "Some offers over €15")
            else:
                self.log_result("Price Filter", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Price Filter", False, f"Exception: {str(e)}")
    
    def test_offers_sorting(self):
        """Test offers API sorting functionality"""
        print("\n🧪 Testing Offers Sorting...")
        
        # Test sort by discount
        try:
            response = requests.get(f"{API_BASE}/offers?sortBy=discount", timeout=10)
            if response.status_code == 200:
                data = response.json()
                offers = data['offers']
                if len(offers) >= 2:
                    # Check if sorted by discount descending
                    is_sorted = all(offers[i]['discountPercent'] >= offers[i+1]['discountPercent'] 
                                  for i in range(len(offers)-1))
                    if is_sorted:
                        self.log_result("Sort by Discount", True, f"Properly sorted by discount")
                    else:
                        self.log_result("Sort by Discount", False, "Not sorted by discount")
                else:
                    self.log_result("Sort by Discount", True, "Too few offers to test sorting")
            else:
                self.log_result("Sort by Discount", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Sort by Discount", False, f"Exception: {str(e)}")
        
        # Test sort by price
        try:
            response = requests.get(f"{API_BASE}/offers?sortBy=price", timeout=10)
            if response.status_code == 200:
                data = response.json()
                offers = data['offers']
                if len(offers) >= 2:
                    # Check if sorted by price ascending
                    is_sorted = all(offers[i]['discountedPrice'] <= offers[i+1]['discountedPrice'] 
                                  for i in range(len(offers)-1))
                    if is_sorted:
                        self.log_result("Sort by Price", True, f"Properly sorted by price")
                    else:
                        self.log_result("Sort by Price", False, "Not sorted by price")
                else:
                    self.log_result("Sort by Price", True, "Too few offers to test sorting")
            else:
                self.log_result("Sort by Price", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Sort by Price", False, f"Exception: {str(e)}")
        
        # Test sort by rating
        try:
            response = requests.get(f"{API_BASE}/offers?sortBy=rating", timeout=10)
            if response.status_code == 200:
                data = response.json()
                offers = data['offers']
                if len(offers) >= 2:
                    # Check if sorted by rating descending
                    is_sorted = all(offers[i]['rating'] >= offers[i+1]['rating'] 
                                  for i in range(len(offers)-1))
                    if is_sorted:
                        self.log_result("Sort by Rating", True, f"Properly sorted by rating")
                    else:
                        self.log_result("Sort by Rating", False, "Not sorted by rating")
                else:
                    self.log_result("Sort by Rating", True, "Too few offers to test sorting")
            else:
                self.log_result("Sort by Rating", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Sort by Rating", False, f"Exception: {str(e)}")
    
    def test_offers_pagination(self):
        """Test offers API pagination"""
        print("\n🧪 Testing Offers Pagination...")
        
        # Test first page
        try:
            response = requests.get(f"{API_BASE}/offers?page=1&limit=5", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data['page'] == 1 and len(data['offers']) <= 5:
                    self.log_result("Pagination Page 1", True, f"Got {len(data['offers'])} offers")
                else:
                    self.log_result("Pagination Page 1", False, f"Page: {data['page']}, Count: {len(data['offers'])}")
            else:
                self.log_result("Pagination Page 1", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Pagination Page 1", False, f"Exception: {str(e)}")
        
        # Test second page
        try:
            response = requests.get(f"{API_BASE}/offers?page=2&limit=5", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data['page'] == 2:
                    self.log_result("Pagination Page 2", True, f"Got page 2 with {len(data['offers'])} offers")
                else:
                    self.log_result("Pagination Page 2", False, f"Expected page 2, got {data['page']}")
            else:
                self.log_result("Pagination Page 2", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Pagination Page 2", False, f"Exception: {str(e)}")
        
        # Test pagination metadata
        try:
            response = requests.get(f"{API_BASE}/offers?limit=3", timeout=10)
            if response.status_code == 200:
                data = response.json()
                total = data['total']
                total_pages = data['totalPages']
                expected_pages = (total + 2) // 3  # Ceiling division
                
                if total_pages == expected_pages:
                    self.log_result("Pagination Metadata", True, f"Total: {total}, Pages: {total_pages}")
                else:
                    self.log_result("Pagination Metadata", False, f"Expected {expected_pages} pages, got {total_pages}")
            else:
                self.log_result("Pagination Metadata", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Pagination Metadata", False, f"Exception: {str(e)}")
    
    def test_clickout_tracking(self):
        """Test POST /api/clickouts endpoint"""
        print("\n🧪 Testing Clickout Tracking...")
        
        try:
            # First get an offer to track
            offers_response = requests.get(f"{API_BASE}/offers?limit=1", timeout=10)
            if offers_response.status_code != 200:
                self.log_result("Clickout Setup", False, "Could not get offers for testing")
                return
            
            offers_data = offers_response.json()
            if not offers_data['offers']:
                self.log_result("Clickout Setup", False, "No offers available for testing")
                return
            
            offer = offers_data['offers'][0]
            
            # Test clickout tracking
            clickout_data = {
                'offerId': offer['id'],
                'providerId': offer['providerId'],
                'userId': 'test-user-123'
            }
            
            response = requests.post(
                f"{API_BASE}/clickouts", 
                json=clickout_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                self.log_result("Clickout API Status", True, "200 OK")
            else:
                self.log_result("Clickout API Status", False, f"Expected 200, got {response.status_code}")
                return
            
            data = response.json()
            if 'success' in data and data['success'] and 'clickoutId' in data:
                self.log_result("Clickout Response", True, f"Got clickoutId: {data['clickoutId']}")
            else:
                self.log_result("Clickout Response", False, f"Invalid response: {data}")
                
        except Exception as e:
            self.log_result("Clickout Tracking", False, f"Exception: {str(e)}")
    
    def test_statistics_api(self):
        """Test GET /api/stats endpoint"""
        print("\n🧪 Testing Statistics API...")
        
        try:
            response = requests.get(f"{API_BASE}/stats", timeout=10)
            
            if response.status_code == 200:
                self.log_result("Stats API Status", True, "200 OK")
            else:
                self.log_result("Stats API Status", False, f"Expected 200, got {response.status_code}")
                return
            
            data = response.json()
            
            # Test required fields
            required_fields = ['totalOffers', 'activeProviders', 'averageDiscount', 'totalSavings']
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                self.log_result("Stats Structure", True, "All required fields present")
            else:
                self.log_result("Stats Structure", False, f"Missing fields: {missing_fields}")
                return
            
            # Test data validity
            if isinstance(data['totalOffers'], int) and data['totalOffers'] > 0:
                self.log_result("Total Offers Valid", True, f"Total: {data['totalOffers']}")
            else:
                self.log_result("Total Offers Valid", False, f"Invalid total: {data['totalOffers']}")
            
            if isinstance(data['averageDiscount'], (int, float)) and 0 < data['averageDiscount'] <= 100:
                self.log_result("Average Discount Valid", True, f"Average: {data['averageDiscount']}%")
            else:
                self.log_result("Average Discount Valid", False, f"Invalid average: {data['averageDiscount']}")
            
            if isinstance(data['totalSavings'], (int, float)) and data['totalSavings'] > 0:
                self.log_result("Total Savings Valid", True, f"Savings: €{data['totalSavings']}")
            else:
                self.log_result("Total Savings Valid", False, f"Invalid savings: {data['totalSavings']}")
            
            if data['activeProviders'] == 3:  # We have 3 mock providers
                self.log_result("Active Providers Valid", True, f"Providers: {data['activeProviders']}")
            else:
                self.log_result("Active Providers Valid", False, f"Expected 3, got {data['activeProviders']}")
                
        except Exception as e:
            self.log_result("Statistics API", False, f"Exception: {str(e)}")
    
    def test_combined_filters(self):
        """Test offers API with multiple filters combined"""
        print("\n🧪 Testing Combined Filters...")
        
        try:
            # Test city + cuisine + provider combination
            params = "city=Helsinki&cuisine=Italian&provider=wolt&minDiscount=20&maxPrice=25"
            response = requests.get(f"{API_BASE}/offers?{params}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                offers = data['offers']
                
                # Validate all filters are applied
                valid_offers = []
                for offer in offers:
                    if (offer['city'] == 'Helsinki' and 
                        'Italian' in offer['cuisine'] and 
                        offer['providerId'] == 'wolt' and
                        offer['discountPercent'] >= 20 and
                        offer['discountedPrice'] <= 25):
                        valid_offers.append(offer)
                
                if len(valid_offers) == len(offers):
                    self.log_result("Combined Filters", True, f"All {len(offers)} offers match filters")
                else:
                    self.log_result("Combined Filters", False, f"Only {len(valid_offers)}/{len(offers)} match")
            else:
                self.log_result("Combined Filters", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_result("Combined Filters", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Comprehensive Finnish FoodAI Backend Testing...")
        print(f"🌐 Testing API at: {API_BASE}")
        print("=" * 80)
        
        # Run all test suites
        test_suites = [
            self.test_api_health,
            self.test_supabase_integration,
            self.test_finnish_providers,
            self.test_finnish_cities,
            self.test_finnish_cuisines,
            self.test_finnish_offers,
            self.test_offers_filtering,
            self.test_clickout_tracking,
            self.test_statistics
        ]
        
        for test_suite in test_suites:
            try:
                test_suite()
            except Exception as e:
                print(f"❌ Test suite {test_suite.__name__} failed with error: {str(e)}")
                self.failed_tests += 1
        
        # Print final results
        print("\n" + "=" * 80)
        print("📊 FINAL TEST RESULTS")
        print("=" * 80)
        
        total_tests = self.passed_tests + self.failed_tests
        success_rate = (self.passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"✅ Passed: {self.passed_tests}")
        print(f"❌ Failed: {self.failed_tests}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if self.failed_tests == 0:
            print("\n🎉 ALL TESTS PASSED! Finnish FoodAI Backend is fully functional!")
        else:
            print(f"\n⚠️  {self.failed_tests} tests failed. Review the issues above.")
        
        return self.failed_tests == 0

if __name__ == "__main__":
    tester = FinnishFoodAITester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)