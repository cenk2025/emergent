'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { MapPin, Clock, Star, Percent, Euro, Truck, ShoppingBag, Search, Filter, Loader2, User, Settings, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function FoodAi() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState([]);
  const [cities, setCities] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [stats, setStats] = useState({});
  
  // Filter states
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [minDiscount, setMinDiscount] = useState([10]);
  const [maxPrice, setMaxPrice] = useState([50]);
  const [sortBy, setSortBy] = useState('discount');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [language, setLanguage] = useState('fi'); // Language state
  
  const { theme, setTheme } = useTheme();
  const { user, isAdmin, signOut } = useAuth();

  // Language texts
  const t = {
    fi: {
      title: 'Löydä parhaat ruokatarjoukset',
      subtitle: 'Vertaile alennuksia Woltista, Foodorasta ja ResQ Clubista. Säästä aikaa ja rahaa.',
      offers: 'Tarjouksia',
      avgDiscount: 'Keskialennus',
      providers: 'Palvelua',
      savings: 'Säästöjä',
      filters: 'Suodattimet',
      clear: 'Tyhjennä',
      city: 'Kaupunki',
      selectCity: 'Valitse kaupunki',
      allCities: 'Kaikki kaupungit',
      cuisine: 'Keittiötyyppi',
      selectCuisine: 'Valitse keittiö',
      allCuisines: 'Kaikki keittiöt',
      service: 'Palvelu',
      selectService: 'Valitse palvelu',
      allServices: 'Kaikki palvelut',
      minDiscount: 'Min. alennus',
      maxPrice: 'Max. hinta',
      sort: 'Järjestys',
      biggestDiscount: 'Suurin alennus',
      lowestPrice: 'Halvin hinta',
      bestRating: 'Paras arvosana',
      offersFound: 'tarjousta löytyi',
      orderNow: 'Tilaa nyt - Säästä',
      previous: 'Edellinen',
      next: 'Seuraava',
      noOffers: 'Ei tarjouksia löytynyt valituilla suodattimilla',
      clearFilters: 'Tyhjennä suodattimet',
      signIn: 'Kirjaudu sisään',
      signOut: 'Kirjaudu ulos',
      admin: 'Admin',
      profile: 'Profiili'
    },
    en: {
      title: 'Find the best food deals',
      subtitle: 'Compare discounts from Wolt, Foodora and ResQ Club. Save time and money.',
      offers: 'Offers',
      avgDiscount: 'Avg Discount',
      providers: 'Providers',
      savings: 'Savings',
      filters: 'Filters',
      clear: 'Clear',
      city: 'City',
      selectCity: 'Select city',
      allCities: 'All cities',
      cuisine: 'Cuisine',
      selectCuisine: 'Select cuisine',
      allCuisines: 'All cuisines',
      service: 'Service',
      selectService: 'Select service',
      allServices: 'All services',
      minDiscount: 'Min. discount',
      maxPrice: 'Max. price',
      sort: 'Sort',
      biggestDiscount: 'Biggest discount',
      lowestPrice: 'Lowest price',
      bestRating: 'Best rating',
      offersFound: 'offers found',
      orderNow: 'Order now - Save',
      previous: 'Previous',
      next: 'Next',
      noOffers: 'No offers found with selected filters',
      clearFilters: 'Clear filters',
      signIn: 'Sign In',
      signOut: 'Sign Out',
      admin: 'Admin',
      profile: 'Profile'
    }
  };

  const texts = t[language];

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [providersRes, citiesRes, cuisinesRes, statsRes] = await Promise.all([
          fetch('/api/providers'),
          fetch('/api/cities'),
          fetch('/api/cuisines'),
          fetch('/api/stats')
        ]);
        
        setProviders(await providersRes.json());
        setCities(await citiesRes.json());
        setCuisines(await cuisinesRes.json());
        setStats(await statsRes.json());
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    
    fetchInitialData();
  }, []);

  // Fetch offers based on filters
  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '12',
          sortBy
        });
        
        if (selectedCity && selectedCity !== 'all') params.append('city', selectedCity);
        if (selectedCuisine && selectedCuisine !== 'all') params.append('cuisine', selectedCuisine);
        if (selectedProvider && selectedProvider !== 'all') params.append('provider', selectedProvider);
        if (minDiscount[0] > 10) params.append('minDiscount', minDiscount[0].toString());
        if (maxPrice[0] < 50) params.append('maxPrice', maxPrice[0].toString());
        
        const response = await fetch(`/api/offers?${params}`);
        const data = await response.json();
        
        setOffers(data.offers || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOffers();
  }, [selectedCity, selectedCuisine, selectedProvider, minDiscount, maxPrice, sortBy, currentPage]);

  const handleClickout = async (offer) => {
    try {
      await fetch('/api/clickouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: offer.id,
          providerId: offer.provider_id
        })
      });
      
      // In production, this would redirect to the actual provider
      window.open(offer.deep_link, '_blank');
    } catch (error) {
      console.error('Error tracking clickout:', error);
    }
  };

  const resetFilters = () => {
    setSelectedCity('all');
    setSelectedCuisine('all');
    setSelectedProvider('all');
    setMinDiscount([10]);
    setMaxPrice([50]);
    setCurrentPage(1);
  };

  const formatTimeRemaining = (endsAt) => {
    const now = new Date();
    const end = new Date(endsAt);
    const diff = end - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-500/10 via-red-500/5 to-pink-500/10 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-2 text-3xl font-bold text-foreground">
              <div className="p-2 bg-orange-500 rounded-lg text-white">
                <Euro className="w-8 h-8" />
              </div>
              FoodAi.fi
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Löydä parhaat ruokatarjoukset
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Vertaile alennuksia Woltista, Foodorasta ja ResQ Clubista. Säästä aikaa ja rahaa.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.totalOffers || 0}</div>
                <div className="text-sm text-muted-foreground">Tarjouksia</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.averageDiscount || 0}%</div>
                <div className="text-sm text-muted-foreground">Keskialennus</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.activeProviders || 0}</div>
                <div className="text-sm text-muted-foreground">Palvelua</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">€{stats.totalSavings || 0}</div>
                <div className="text-sm text-muted-foreground">Säästöjä</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Suodattimet</h3>
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Tyhjennä
                  </Button>
                </div>
                
                <Separator />
                
                {/* City Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kaupunki</label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Valitse kaupunki" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Kaikki kaupungit</SelectItem>
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cuisine Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Keittiötyyppi</label>
                  <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
                    <SelectTrigger>
                      <SelectValue placeholder="Valitse keittiö" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Kaikki keittiöt</SelectItem>
                      {cuisines.map(cuisine => (
                        <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Provider Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Palvelu</label>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="Valitse palvelu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Kaikki palvelut</SelectItem>
                      {providers.map(provider => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Discount Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Min. alennus: {minDiscount[0]}%</label>
                  <Slider
                    value={minDiscount}
                    onValueChange={setMinDiscount}
                    max={60}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Price Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Max. hinta: €{maxPrice[0]}</label>
                  <Slider
                    value={maxPrice}
                    onValueChange={setMaxPrice}
                    max={50}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Sort Options */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Järjestys</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discount">Suurin alennus</SelectItem>
                      <SelectItem value="price">Halvin hinta</SelectItem>
                      <SelectItem value="rating">Paras arvosana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Offers Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {offers.length} tarjousta löytyi
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {offers.map(offer => (
                    <Card key={offer.id} className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
                      <div className="relative">
                        <img 
                          src={offer.imageUrl} 
                          alt={offer.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-green-500 text-white font-bold">
                            -{offer.discountPercent}%
                          </Badge>
                        </div>
                        <div className="absolute top-3 right-3">
                          <div className="flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-sm">
                            <Clock className="w-3 h-3" />
                            {formatTimeRemaining(offer.endsAt)}
                          </div>
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <img 
                            src={offer.provider_logo} 
                            alt={offer.provider_name}
                            className="w-6 h-6 rounded"
                          />
                          <span className="text-sm text-muted-foreground">{offer.provider_name}</span>
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-1">{offer.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{offer.restaurant_name}</p>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{offer.city}</span>
                          <Star className="w-4 h-4 text-yellow-500 ml-2" />
                          <span className="text-sm font-medium">{offer.rating}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          {offer.cuisine_types?.map(c => (
                            <Badge key={c} variant="secondary" className="text-xs">
                              {c}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-lg font-bold text-green-600">
                              €{offer.discounted_price}
                            </span>
                            <span className="text-sm text-muted-foreground line-through ml-2">
                              €{offer.original_price}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {offer.has_delivery && <Truck className="w-4 h-4" />}
                            {offer.has_pickup && <ShoppingBag className="w-4 h-4" />}
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full" 
                          onClick={() => handleClickout(offer)}
                        >
                          Tilaa nyt - Säästä €{(offer.original_price - offer.discounted_price).toFixed(2)}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Edellinen
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Seuraava
                    </Button>
                  </div>
                )}

                {offers.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <div className="text-muted-foreground text-lg mb-4">
                      Ei tarjouksia löytynyt valituilla suodattimilla
                    </div>
                    <Button variant="outline" onClick={resetFilters}>
                      Tyhjennä suodattimet
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}