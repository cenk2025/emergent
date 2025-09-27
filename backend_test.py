#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for FoodAi Türk Application
Tests all Turkish food platform API endpoints with Supabase integration
"""

import requests
import json
import time
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://savorydeals.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

class FoodAiAPITester:
    def __init__(self):
        self.test_results = {
            'passed': 0,
            'failed': 0,
            'errors': []
        }
        
    def log_result(self, test_name, success, message=""):
        if success:
            self.test_results['passed'] += 1
            print(f"✅ {test_name}: PASSED {message}")
        else:
            self.test_results['failed'] += 1
            self.test_results['errors'].append(f"{test_name}: {message}")
            print(f"❌ {test_name}: FAILED {message}")
    
    def test_providers_api(self):
        """Test GET /api/providers endpoint"""
        print("\n🧪 Testing Providers API...")
        
        try:
            response = requests.get(f"{API_BASE}/providers", timeout=10)
            
            # Test status code
            if response.status_code == 200:
                self.log_result("Providers API Status", True, "200 OK")
            else:
                self.log_result("Providers API Status", False, f"Expected 200, got {response.status_code}")
                return
            
            # Test response structure
            data = response.json()
            if isinstance(data, list):
                self.log_result("Providers Response Type", True, "Returns array")
            else:
                self.log_result("Providers Response Type", False, f"Expected array, got {type(data)}")
                return
            
            # Test provider structure
            if len(data) > 0:
                provider = data[0]
                required_fields = ['id', 'name', 'logo', 'color']
                missing_fields = [field for field in required_fields if field not in provider]
                
                if not missing_fields:
                    self.log_result("Provider Structure", True, f"All required fields present")
                else:
                    self.log_result("Provider Structure", False, f"Missing fields: {missing_fields}")
                
                # Test expected providers
                provider_ids = [p['id'] for p in data]
                expected_providers = ['wolt', 'foodora', 'resq']
                if all(pid in provider_ids for pid in expected_providers):
                    self.log_result("Expected Providers", True, f"Found all: {expected_providers}")
                else:
                    self.log_result("Expected Providers", False, f"Missing some providers")
            else:
                self.log_result("Providers Data", False, "No providers returned")
                
        except Exception as e:
            self.log_result("Providers API", False, f"Exception: {str(e)}")
    
    def test_cities_api(self):
        """Test GET /api/cities endpoint"""
        print("\n🧪 Testing Cities API...")
        
        try:
            response = requests.get(f"{API_BASE}/cities", timeout=10)
            
            if response.status_code == 200:
                self.log_result("Cities API Status", True, "200 OK")
            else:
                self.log_result("Cities API Status", False, f"Expected 200, got {response.status_code}")
                return
            
            data = response.json()
            if isinstance(data, list):
                self.log_result("Cities Response Type", True, "Returns array")
            else:
                self.log_result("Cities Response Type", False, f"Expected array, got {type(data)}")
                return
            
            # Test expected cities
            expected_cities = ['Helsinki', 'Tampere', 'Turku']
            if all(city in data for city in expected_cities):
                self.log_result("Expected Cities", True, f"Found all: {expected_cities}")
            else:
                self.log_result("Expected Cities", False, f"Missing some cities. Got: {data}")
                
        except Exception as e:
            self.log_result("Cities API", False, f"Exception: {str(e)}")
    
    def test_cuisines_api(self):
        """Test GET /api/cuisines endpoint"""
        print("\n🧪 Testing Cuisines API...")
        
        try:
            response = requests.get(f"{API_BASE}/cuisines", timeout=10)
            
            if response.status_code == 200:
                self.log_result("Cuisines API Status", True, "200 OK")
            else:
                self.log_result("Cuisines API Status", False, f"Expected 200, got {response.status_code}")
                return
            
            data = response.json()
            if isinstance(data, list):
                self.log_result("Cuisines Response Type", True, "Returns array")
            else:
                self.log_result("Cuisines Response Type", False, f"Expected array, got {type(data)}")
                return
            
            # Test expected cuisines
            expected_cuisines = ['Italian', 'Japanese', 'American', 'Thai', 'European', 'Indian']
            found_cuisines = [c for c in expected_cuisines if c in data]
            if len(found_cuisines) >= 4:  # At least 4 out of 6
                self.log_result("Expected Cuisines", True, f"Found {len(found_cuisines)}/{len(expected_cuisines)}")
            else:
                self.log_result("Expected Cuisines", False, f"Only found {found_cuisines}")
                
        except Exception as e:
            self.log_result("Cuisines API", False, f"Exception: {str(e)}")
    
    def test_offers_api_basic(self):
        """Test basic GET /api/offers endpoint"""
        print("\n🧪 Testing Basic Offers API...")
        
        try:
            response = requests.get(f"{API_BASE}/offers", timeout=10)
            
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
            
            # Test offer structure
            offer = offers[0]
            required_offer_fields = [
                'id', 'providerId', 'providerName', 'restaurantName', 'city', 
                'cuisine', 'title', 'originalPrice', 'discountedPrice', 'discountPercent'
            ]
            missing_offer_fields = [field for field in required_offer_fields if field not in offer]
            
            if not missing_offer_fields:
                self.log_result("Offer Structure", True, "All required fields present")
            else:
                self.log_result("Offer Structure", False, f"Missing fields: {missing_offer_fields}")
            
            # Test data types and values
            if isinstance(offer['originalPrice'], (int, float)) and offer['originalPrice'] > 0:
                self.log_result("Original Price Valid", True, f"Price: {offer['originalPrice']}")
            else:
                self.log_result("Original Price Valid", False, f"Invalid price: {offer['originalPrice']}")
            
            if isinstance(offer['discountPercent'], (int, float)) and 0 < offer['discountPercent'] <= 100:
                self.log_result("Discount Percent Valid", True, f"Discount: {offer['discountPercent']}%")
            else:
                self.log_result("Discount Percent Valid", False, f"Invalid discount: {offer['discountPercent']}")
                
        except Exception as e:
            self.log_result("Offers API Basic", False, f"Exception: {str(e)}")
    
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
        """Run all backend API tests"""
        print(f"🚀 Starting FoodAi Backend API Tests")
        print(f"📍 Testing against: {API_BASE}")
        print("=" * 60)
        
        # Run all test methods
        self.test_providers_api()
        self.test_cities_api()
        self.test_cuisines_api()
        self.test_offers_api_basic()
        self.test_offers_filtering()
        self.test_offers_sorting()
        self.test_offers_pagination()
        self.test_clickout_tracking()
        self.test_statistics_api()
        self.test_combined_filters()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.test_results['passed']}")
        print(f"❌ Failed: {self.test_results['failed']}")
        print(f"📈 Success Rate: {(self.test_results['passed'] / (self.test_results['passed'] + self.test_results['failed']) * 100):.1f}%")
        
        if self.test_results['errors']:
            print(f"\n🔍 FAILED TESTS:")
            for error in self.test_results['errors']:
                print(f"   • {error}")
        
        print("\n🎯 Backend API testing completed!")
        return self.test_results

if __name__ == "__main__":
    tester = FoodAiAPITester()
    results = tester.run_all_tests()