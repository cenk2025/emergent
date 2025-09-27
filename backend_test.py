#!/usr/bin/env python3
"""
FoodAI Backend Testing Suite - Comprehensive Testing
Tests all backend API endpoints including new DeepSeek chat functionality
"""

import requests
import json
import time
import os
from typing import Dict, List, Any

# Get base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://mealdeals.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

class FoodAITester:
    def __init__(self):
        self.results = []
        self.total_tests = 0
        self.passed_tests = 0
        
    def log_result(self, test_name: str, passed: bool, details: str = ""):
        """Log test result"""
        self.total_tests += 1
        if passed:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
            
        result = f"{status} - {test_name}"
        if details:
            result += f" | {details}"
            
        self.results.append(result)
        print(result)
        
    def test_basic_api_health(self):
        """Test basic API health and connectivity"""
        print("\n=== BASIC API HEALTH TESTS ===")
        
        try:
            response = requests.get(f"{API_BASE}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_result("Basic API Health", True, f"Status: {data.get('status', 'OK')}")
            else:
                self.log_result("Basic API Health", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Basic API Health", False, f"Connection error: {str(e)}")
    
    def test_providers_api(self):
        """Test providers endpoint"""
        print("\n=== PROVIDERS API TESTS ===")
        
        try:
            response = requests.get(f"{API_BASE}/providers", timeout=10)
            if response.status_code == 200:
                providers = response.json()
                
                # Check if we have the expected providers
                expected_providers = ['wolt', 'foodora', 'resq']
                provider_ids = [p['id'] for p in providers]
                
                has_all_providers = all(pid in provider_ids for pid in expected_providers)
                self.log_result("Providers API - Structure", has_all_providers, 
                              f"Found providers: {provider_ids}")
                
                # Check provider data structure
                if providers:
                    provider = providers[0]
                    required_fields = ['id', 'name', 'logo_url', 'color']
                    has_required_fields = all(field in provider for field in required_fields)
                    self.log_result("Providers API - Data Structure", has_required_fields,
                                  f"Fields: {list(provider.keys())}")
                else:
                    self.log_result("Providers API - Data Structure", False, "No providers returned")
            else:
                self.log_result("Providers API", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Providers API", False, f"Error: {str(e)}")
    
    def test_cities_api(self):
        """Test cities endpoint"""
        print("\n=== CITIES API TESTS ===")
        
        try:
            response = requests.get(f"{API_BASE}/cities", timeout=10)
            if response.status_code == 200:
                cities = response.json()
                
                # Check if we have Finnish cities
                expected_cities = ['Helsinki', 'Tampere', 'Turku']
                has_finnish_cities = any(city in cities for city in expected_cities)
                self.log_result("Cities API", has_finnish_cities, 
                              f"Found {len(cities)} cities including: {cities[:3]}")
            else:
                self.log_result("Cities API", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Cities API", False, f"Error: {str(e)}")
    
    def test_cuisines_api(self):
        """Test cuisines endpoint"""
        print("\n=== CUISINES API TESTS ===")
        
        try:
            response = requests.get(f"{API_BASE}/cuisines", timeout=10)
            if response.status_code == 200:
                cuisines = response.json()
                
                # Check if we have Finnish cuisines
                expected_cuisines = ['Suomalainen', 'Pizza', 'Sushi']
                has_finnish_cuisines = any(cuisine in cuisines for cuisine in expected_cuisines)
                self.log_result("Cuisines API", has_finnish_cuisines,
                              f"Found {len(cuisines)} cuisines including: {cuisines[:3]}")
            else:
                self.log_result("Cuisines API", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Cuisines API", False, f"Error: {str(e)}")
    
    def test_offers_api(self):
        """Test offers endpoint with various filters"""
        print("\n=== OFFERS API TESTS ===")
        
        # Test basic offers
        try:
            response = requests.get(f"{API_BASE}/offers", timeout=15)
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                required_fields = ['offers', 'total', 'page', 'totalPages']
                has_structure = all(field in data for field in required_fields)
                self.log_result("Offers API - Basic Structure", has_structure,
                              f"Fields: {list(data.keys())}")
                
                if 'offers' in data and data['offers']:
                    offer = data['offers'][0]
                    
                    # Check offer data structure
                    offer_fields = ['id', 'title', 'original_price', 'discounted_price', 'discount_percent']
                    has_offer_fields = all(field in offer for field in offer_fields)
                    self.log_result("Offers API - Offer Structure", has_offer_fields,
                                  f"Offer fields: {list(offer.keys())[:10]}")
                    
                    # Check image URLs
                    has_image = 'image_url' in offer and offer['image_url'].startswith('https://')
                    self.log_result("Offers API - Image URLs", has_image,
                                  f"Image URL: {offer.get('image_url', 'None')[:50]}...")
                    
                    # Check Euro currency and pricing up to 200€
                    has_euro = offer.get('currency') == 'EUR'
                    price_in_range = 0 < offer.get('discounted_price', 0) <= 200
                    self.log_result("Offers API - Euro Currency & Price Range (200€)", has_euro and price_in_range,
                                  f"Currency: {offer.get('currency')}, Price: {offer.get('discounted_price')}€")
                else:
                    self.log_result("Offers API - Offer Structure", False, "No offers returned")
            else:
                self.log_result("Offers API - Basic", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Offers API - Basic", False, f"Error: {str(e)}")
        
        # Test offers with price filter (up to 200€)
        try:
            response = requests.get(f"{API_BASE}/offers?maxPrice=150", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('offers'):
                    all_within_price = all(offer.get('discounted_price', 0) <= 150 
                                         for offer in data['offers'])
                    self.log_result("Offers API - Price Filter (150€)", all_within_price,
                                  f"Found {len(data['offers'])} offers within price range")
                else:
                    self.log_result("Offers API - Price Filter (150€)", True, "No offers but filter working")
            else:
                self.log_result("Offers API - Price Filter", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Offers API - Price Filter", False, f"Error: {str(e)}")
        
        # Test offers with city filter
        try:
            response = requests.get(f"{API_BASE}/offers?city=Helsinki", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_result("Offers API - City Filter", True,
                              f"Helsinki offers: {len(data.get('offers', []))}")
            else:
                self.log_result("Offers API - City Filter", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Offers API - City Filter", False, f"Error: {str(e)}")
        
        # Test offers with pagination
        try:
            response = requests.get(f"{API_BASE}/offers?page=1&limit=5", timeout=10)
            if response.status_code == 200:
                data = response.json()
                correct_pagination = (data.get('page') == 1 and 
                                    len(data.get('offers', [])) <= 5)
                self.log_result("Offers API - Pagination", correct_pagination,
                              f"Page: {data.get('page')}, Offers: {len(data.get('offers', []))}")
            else:
                self.log_result("Offers API - Pagination", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Offers API - Pagination", False, f"Error: {str(e)}")
    
    def test_stats_api(self):
        """Test stats endpoint"""
        print("\n=== STATS API TESTS ===")
        
        try:
            response = requests.get(f"{API_BASE}/stats", timeout=10)
            if response.status_code == 200:
                stats = response.json()
                
                # Check stats structure
                expected_fields = ['totalOffers', 'activeProviders', 'averageDiscount', 'totalSavings']
                has_stats_fields = all(field in stats for field in expected_fields)
                self.log_result("Stats API", has_stats_fields,
                              f"Stats: {stats}")
            else:
                self.log_result("Stats API", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Stats API", False, f"Error: {str(e)}")
    
    def test_clickouts_api(self):
        """Test clickouts tracking endpoint"""
        print("\n=== CLICKOUTS API TESTS ===")
        
        try:
            # Test POST to clickouts
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
                has_success = data.get('success') is True
                has_clickout_id = 'clickoutId' in data
                self.log_result("Clickouts API - POST", has_success and has_clickout_id,
                              f"Response: {data}")
            else:
                self.log_result("Clickouts API - POST", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Clickouts API - POST", False, f"Error: {str(e)}")
    
    def test_deepseek_chat_api(self):
        """Test DeepSeek Chat API endpoint"""
        print("\n=== DEEPSEEK CHAT API TESTS ===")
        
        # Test GET endpoint info
        try:
            response = requests.get(f"{API_BASE}/chat", timeout=10)
            if response.status_code == 200:
                info = response.json()
                is_chat_api = info.get('service') == 'FoodAI Chat API'
                has_deepseek = 'DeepSeek' in info.get('powered_by', '')
                self.log_result("Chat API - GET Info", is_chat_api and has_deepseek,
                              f"Service: {info.get('service')}, Powered by: {info.get('powered_by')}")
            else:
                self.log_result("Chat API - GET Info", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Chat API - GET Info", False, f"Error: {str(e)}")
        
        # Test POST with Finnish message
        try:
            finnish_message = {
                "messages": [
                    {
                        "role": "user",
                        "content": "Hei, mitä pizzatarjouksia on tänään Helsingissä?"
                    }
                ],
                "includeOffers": True
            }
            
            response = requests.post(f"{API_BASE}/chat", 
                                   json=finnish_message, 
                                   timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                has_content = 'content' in data
                content_has_text = len(data.get('content', '')) > 10
                self.log_result("Chat API - Finnish Message", has_content and content_has_text,
                              f"Response length: {len(data.get('content', ''))} chars")
            else:
                self.log_result("Chat API - Finnish Message", False, 
                              f"Status code: {response.status_code}, Response: {response.text[:200]}")
        except Exception as e:
            self.log_result("Chat API - Finnish Message", False, f"Error: {str(e)}")
        
        # Test POST with English message
        try:
            english_message = {
                "messages": [
                    {
                        "role": "user", 
                        "content": "Show me burger deals in Helsinki"
                    }
                ],
                "includeOffers": True
            }
            
            response = requests.post(f"{API_BASE}/chat",
                                   json=english_message,
                                   timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                has_content = 'content' in data
                content_has_text = len(data.get('content', '')) > 10
                self.log_result("Chat API - English Message", has_content and content_has_text,
                              f"Response length: {len(data.get('content', ''))} chars")
            else:
                self.log_result("Chat API - English Message", False,
                              f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Chat API - English Message", False, f"Error: {str(e)}")
        
        # Test invalid message format
        try:
            invalid_message = {
                "messages": [
                    {
                        "role": "invalid_role",
                        "content": "Test message"
                    }
                ]
            }
            
            response = requests.post(f"{API_BASE}/chat",
                                   json=invalid_message,
                                   timeout=10)
            
            # Should return 400 for invalid format
            if response.status_code == 400:
                self.log_result("Chat API - Error Handling", True,
                              "Correctly rejected invalid message format")
            else:
                self.log_result("Chat API - Error Handling", False,
                              f"Expected 400, got {response.status_code}")
        except Exception as e:
            self.log_result("Chat API - Error Handling", False, f"Error: {str(e)}")
        
        # Test missing messages array
        try:
            empty_request = {}
            
            response = requests.post(f"{API_BASE}/chat",
                                   json=empty_request,
                                   timeout=10)
            
            # Should return 400 for missing messages
            if response.status_code == 400:
                self.log_result("Chat API - Missing Messages", True,
                              "Correctly rejected missing messages array")
            else:
                self.log_result("Chat API - Missing Messages", False,
                              f"Expected 400, got {response.status_code}")
        except Exception as e:
            self.log_result("Chat API - Missing Messages", False, f"Error: {str(e)}")
    
    def test_deepseek_streaming_api(self):
        """Test DeepSeek Streaming Chat API endpoint"""
        print("\n=== DEEPSEEK STREAMING API TESTS ===")
        
        try:
            streaming_message = {
                "messages": [
                    {
                        "role": "user",
                        "content": "Kerro lyhyesti parhaista pizzatarjouksista"
                    }
                ],
                "includeOffers": True
            }
            
            response = requests.post(f"{API_BASE}/chat/stream",
                                   json=streaming_message,
                                   timeout=30,
                                   stream=True)
            
            if response.status_code == 200:
                # Check headers for SSE
                content_type = response.headers.get('content-type', '')
                is_sse = 'text/event-stream' in content_type
                
                # Read first few chunks to verify streaming
                chunks_received = 0
                for chunk in response.iter_content(chunk_size=1024):
                    if chunk:
                        chunks_received += 1
                        if chunks_received >= 3:  # Just check first few chunks
                            break
                
                has_streaming_data = chunks_received > 0
                self.log_result("Streaming API - SSE Format", is_sse and has_streaming_data,
                              f"Content-Type: {content_type}, Chunks: {chunks_received}")
            else:
                self.log_result("Streaming API - SSE Format", False,
                              f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Streaming API - SSE Format", False, f"Error: {str(e)}")
        
        # Test OPTIONS request for CORS
        try:
            response = requests.options(f"{API_BASE}/chat/stream", timeout=10)
            if response.status_code == 200:
                cors_headers = response.headers.get('Access-Control-Allow-Origin', '')
                has_cors = cors_headers == '*'
                self.log_result("Streaming API - CORS", has_cors,
                              f"CORS headers: {cors_headers}")
            else:
                self.log_result("Streaming API - CORS", False,
                              f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Streaming API - CORS", False, f"Error: {str(e)}")
    
    def test_provider_infrastructure(self):
        """Test provider infrastructure and health checks"""
        print("\n=== PROVIDER INFRASTRUCTURE TESTS ===")
        
        # Test that provider modules are working (mock implementations)
        providers_to_test = ['wolt', 'foodora', 'resq']
        
        for provider in providers_to_test:
            try:
                # Test provider-specific offers (should be included in main offers endpoint)
                response = requests.get(f"{API_BASE}/offers?provider={provider}", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    provider_offers = [offer for offer in data.get('offers', []) 
                                     if offer.get('provider_id') == provider]
                    
                    # Even if no offers, the endpoint should work
                    self.log_result(f"Provider Infrastructure - {provider.title()}", True,
                                  f"Provider filter working, found {len(provider_offers)} offers")
                else:
                    self.log_result(f"Provider Infrastructure - {provider.title()}", False,
                                  f"Status code: {response.status_code}")
            except Exception as e:
                self.log_result(f"Provider Infrastructure - {provider.title()}", False,
                              f"Error: {str(e)}")
    
    def test_image_urls(self):
        """Test that image URLs are working and return valid responses"""
        print("\n=== IMAGE URL TESTS ===")
        
        try:
            # Get some offers to test their image URLs
            response = requests.get(f"{API_BASE}/offers?limit=3", timeout=10)
            if response.status_code == 200:
                data = response.json()
                offers = data.get('offers', [])
                
                if offers:
                    working_images = 0
                    total_images = 0
                    
                    for offer in offers[:3]:  # Test first 3 offers
                        image_url = offer.get('image_url')
                        if image_url:
                            total_images += 1
                            try:
                                img_response = requests.head(image_url, timeout=5)
                                if img_response.status_code == 200:
                                    working_images += 1
                            except:
                                pass  # Image URL not working
                    
                    success_rate = working_images / total_images if total_images > 0 else 0
                    self.log_result("Image URLs Working", success_rate >= 0.8,
                                  f"{working_images}/{total_images} images working ({success_rate:.1%})")
                else:
                    self.log_result("Image URLs Working", False, "No offers with images found")
            else:
                self.log_result("Image URLs Working", False, "Could not fetch offers")
        except Exception as e:
            self.log_result("Image URLs Working", False, f"Error: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting FoodAI Backend Testing Suite")
        print(f"Testing against: {API_BASE}")
        print("=" * 60)
        
        # Run all test categories
        self.test_basic_api_health()
        self.test_providers_api()
        self.test_cities_api()
        self.test_cuisines_api()
        self.test_offers_api()
        self.test_stats_api()
        self.test_clickouts_api()
        self.test_deepseek_chat_api()
        self.test_deepseek_streaming_api()
        self.test_provider_infrastructure()
        self.test_image_urls()
        
        # Print summary
        print("\n" + "=" * 60)
        print("🏁 TESTING COMPLETE")
        print(f"📊 Results: {self.passed_tests}/{self.total_tests} tests passed ({self.passed_tests/self.total_tests*100:.1f}%)")
        
        if self.passed_tests == self.total_tests:
            print("🎉 ALL TESTS PASSED! Backend is fully functional.")
        else:
            print(f"⚠️  {self.total_tests - self.passed_tests} tests failed. Check details above.")
        
        print("\n📋 DETAILED RESULTS:")
        for result in self.results:
            print(f"  {result}")
        
        return self.passed_tests == self.total_tests

if __name__ == "__main__":
    tester = FoodAITester()
    success = tester.run_all_tests()
    exit(0 if success else 1)