'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { MapPin, Clock, Star, Percent, Truck, ShoppingBag, Search, Filter, Loader2, User, Settings, LogOut, MessageCircle, Zap, TrendingUp, Heart, Award, Sparkles } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import ChatInterface from '@/components/ChatInterface';
import FinnishLogo from '../components/FinnishLogo';
import Footer from '@/components/Footer';

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
  const [maxPrice, setMaxPrice] = useState([200]);
  const [sortBy, setSortBy] = useState('discount');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [language, setLanguage] = useState('fi'); // Finnish by default
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const { theme, setTheme } = useTheme();
  const { user, isAdmin, signOut } = useAuth();

  // Finnish language texts
  const texts = {
    title: 'Löydä parhaat ruokatarjoukset Suomesta',
    subtitle: 'Vertaile tarjouksia Woltista, Foodorasta, ResQ Clubista ja muista. Säästä älykkäästi AI:n avulla.',
    offers: 'Tarjousta',
    avgDiscount: 'Keskim. alennus',
    providers: 'Palvelua',
    savings: 'Säästöjä',
    filters: 'Suodattimet',
    clear: 'Tyhjennä',
    clearFilters: 'Tyhjennä suodattimet',
    city: 'Kaupunki',
    allCities: 'Kaikki kaupungit',
    cuisine: 'Keittiö',
    allCuisines: 'Kaikki keittiöt',
    provider: 'Palvelu',
    allProviders: 'Kaikki palvelut',
    minDiscount: 'Min. alennus',
    maxPrice: 'Max. hinta',
    sort: 'Järjestä',
    search: 'Etsi ruokaa...',
    orderNow: 'Tilaa nyt',
    discount: 'Alennuksen mukaan',
    price: 'Hinnan mukaan',
    rating: 'Arvostelun mukaan',
    newest: 'Uusimmat',
    loading: 'Ladataan tarjouksia...',
    noResults: 'Tarjouksia ei löytynyt',
    tryDifferent: 'Kokeile eri suodattimia',
    admin: 'Ylläpito',
    logout: 'Kirjaudu ulos',
    login: 'Kirjaudu sisään',
    hero: {
      badge: '🔥 Uusi sukupolvi',
      title: 'Älykkäät ruokatarjoukset',
      highlight: 'AI-pohjainen',
      subtitle: 'Löydä, vertaile ja säästä parhailla ruokatarjouksilla tekoälyn avulla!',
      cta: 'Tutustu tarjouksiin',
      features: [
        { icon: Zap, text: 'Välitön vertailu' },
        { icon: TrendingUp, text: 'Jopa 70% alennus' },
        { icon: Heart, text: 'Henkilökohtaiset suositukset' }
      ]
    }
  };

  // Fetch data functions
  const fetchOffers = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sortBy
      });
      
      if (selectedCity !== 'all') params.append('city', selectedCity);
      if (selectedCuisine !== 'all') params.append('cuisine', selectedCuisine);
      if (selectedProvider !== 'all') params.append('provider', selectedProvider);
      if (minDiscount[0] > 10) params.append('minDiscount', minDiscount[0].toString());
      if (maxPrice[0] < 200) params.append('maxPrice', maxPrice[0].toString());
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/offers?${params}`);
      const data = await response.json();
      setOffers(data.offers || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/providers');
      const data = await response.json();
      setProviders(data);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/cities');
      const data = await response.json();
      setCities(data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchCuisines = async () => {
    try {
      const response = await fetch('/api/cuisines');
      const data = await response.json();
      setCuisines(data);
    } catch (error) {
      console.error('Error fetching cuisines:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Effects
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchOffers(),
        fetchProviders(),
        fetchCities(),
        fetchCuisines(),
        fetchStats()
      ]);
      setLoading(false);
    };
    fetchData();
  }, [currentPage, sortBy, selectedCity, selectedCuisine, selectedProvider, minDiscount, maxPrice, searchQuery]);

  // Handlers
  const handleClickout = async (offer) => {
    try {
      await fetch('/api/clickouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: offer.id,
          userId: user?.id || 'anonymous'
        })
      });
      window.open(offer.deep_link, '_blank');
    } catch (error) {
      console.error('Error tracking clickout:', error);
      window.open(offer.deep_link, '_blank');
    }
  };

  const resetFilters = () => {
    setSelectedCity('all');
    setSelectedCuisine('all');
    setSelectedProvider('all');
    setMinDiscount([10]);
    setMaxPrice([200]);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedCity !== 'all' || selectedCuisine !== 'all' || 
    selectedProvider !== 'all' || minDiscount[0] > 10 || maxPrice[0] < 200 || searchQuery;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 border-b border-border backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-3xl font-serif font-normal tracking-tight text-foreground">
                FoodAi
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Language Toggle */}
              <div className="flex items-center gap-2 bg-muted rounded-full p-1">
                <button
                  onClick={() => setLanguage('fi')}
                  className="px-3 py-1 rounded-full text-sm font-medium transition-all bg-background text-primary shadow-sm"
                >
                  FI
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className="px-3 py-1 rounded-full text-sm font-medium transition-all text-muted-foreground hover:text-foreground"
                >
                  EN
                </button>
              </div>

              {/* User Menu */}
              {user ? (
                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <Link href="/admin">
                      <Button variant="outline" size="sm" className="modern-button modern-button-secondary">
                        <Settings className="h-4 w-4 mr-2" />
                        {texts.admin}
                      </Button>
                    </Link>
                  )}
                  <Button onClick={signOut} variant="outline" size="sm" className="modern-button modern-button-secondary">
                    <LogOut className="h-4 w-4 mr-2" />
                    {texts.logout}
                  </Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button className="fast-food-button">
                    <User className="h-4 w-4 mr-2" />
                    {texts.login}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FFB000]/10 via-[#FF6B35]/5 to-[#00D4AA]/10 py-20">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#FFB000]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#FF6B35]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-[#00D4AA]/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="fast-food-badge mb-6 bounce-in">
              {texts.hero.badge}
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 slide-up">
              <span className="fast-food-heading">{texts.hero.title}</span>
              <br />
              <span className="text-4xl md:text-6xl bg-gradient-to-r from-[#FFB000] to-[#FF6B35] bg-clip-text text-transparent">
                {texts.hero.highlight}
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto slide-up" style={{ animationDelay: '0.2s' }}>
              {texts.hero.subtitle}
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mb-8 slide-up" style={{ animationDelay: '0.4s' }}>
              {texts.hero.features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                    <Icon className="h-5 w-5 text-[#FFB000]" />
                    <span className="font-medium text-gray-800">{feature.text}</span>
                  </div>
                );
              })}
            </div>
            
            <Button 
              size="lg"
              className="fast-food-button text-lg px-8 py-4 slide-up"
              style={{ animationDelay: '0.6s' }}
              onClick={() => document.getElementById('offers-section').scrollIntoView({ behavior: 'smooth' })}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              {texts.hero.cta}
            </Button>
          </div>
        </div>
      </section>

      {/* Sliding Partners Section */}
      <section className="partners-section border-b border-gray-100 py-6 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 font-medium mb-2">
              Vertailemme tarjouksia parhaista palveluista
            </p>
            <div className="w-16 h-0.5 bg-gradient-to-r from-[#FFB000] to-[#FF6B35] mx-auto"></div>
          </div>
          
          {/* Sliding logos container */}
          <div className="relative">
            <div className="flex items-center justify-center gap-8 animate-slide">
              {/* First set of logos */}
              <div className="flex items-center gap-8 min-w-max">
                <div className="partner-card flex items-center gap-3 px-4 py-3 rounded-xl">
                  <div className="w-8 h-8 bg-[#00C2E8] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">W</span>
                  </div>
                  <span className="font-semibold text-gray-800">Wolt</span>
                </div>
                
                <div className="partner-card flex items-center gap-3 px-4 py-3 rounded-xl">
                  <div className="w-8 h-8 bg-[#E91E63] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">F</span>
                  </div>
                  <span className="font-semibold text-gray-800">Foodora</span>
                </div>
                
                <div className="partner-card flex items-center gap-3 px-4 py-3 rounded-xl">
                  <div className="w-8 h-8 bg-[#4CAF50] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">R</span>
                  </div>
                  <span className="font-semibold text-gray-800">ResQ Club</span>
                </div>
                
                <div className="partner-card flex items-center gap-3 px-4 py-3 rounded-xl">
                  <div className="w-8 h-8 bg-[#D32F2F] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">K</span>
                  </div>
                  <span className="font-semibold text-gray-800">Kotipizza</span>
                </div>
                
                <div className="partner-card flex items-center gap-3 px-4 py-3 rounded-xl">
                  <div className="w-8 h-8 bg-[#FF6D00] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">K</span>
                  </div>
                  <span className="font-semibold text-gray-800">K-Ruoka</span>
                </div>
                
                <div className="partner-card flex items-center gap-3 px-4 py-3 rounded-xl">
                  <div className="w-8 h-8 bg-[#2E7D32] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">F</span>
                  </div>
                  <span className="font-semibold text-gray-800">Fiksuruoka</span>
                </div>
              </div>
              
              {/* Duplicate set for seamless loop */}
              <div className="flex items-center gap-8 min-w-max">
                <div className="partner-card flex items-center gap-3 px-4 py-3 rounded-xl">
                  <div className="w-8 h-8 bg-[#00C2E8] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">W</span>
                  </div>
                  <span className="font-semibold text-gray-800">Wolt</span>
                </div>
                
                <div className="partner-card flex items-center gap-3 px-4 py-3 rounded-xl">
                  <div className="w-8 h-8 bg-[#E91E63] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">F</span>
                  </div>
                  <span className="font-semibold text-gray-800">Foodora</span>
                </div>
                
                <div className="partner-card flex items-center gap-3 px-4 py-3 rounded-xl">
                  <div className="w-8 h-8 bg-[#4CAF50] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">R</span>
                  </div>
                  <span className="font-semibold text-gray-800">ResQ Club</span>
                </div>
                
                <div className="partner-card flex items-center gap-3 px-4 py-3 rounded-xl">
                  <div className="w-8 h-8 bg-[#D32F2F] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">K</span>
                  </div>
                  <span className="font-semibold text-gray-800">Kotipizza</span>
                </div>
                
                <div className="partner-card flex items-center gap-3 px-4 py-3 rounded-xl">
                  <div className="w-8 h-8 bg-[#FF6D00] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">K</span>
                  </div>
                  <span className="font-semibold text-gray-800">K-Ruoka</span>
                </div>
                
                <div className="partner-card flex items-center gap-3 px-4 py-3 rounded-xl">
                  <div className="w-8 h-8 bg-[#2E7D32] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">F</span>
                  </div>
                  <span className="font-semibold text-gray-800">Fiksuruoka</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center fast-food-card hover:scale-105 transition-transform duration-300">
              <div className="fast-food-icon mx-auto mb-4">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-extrabold text-[#FFB000] mb-2">
                {stats.activeOffers || 0}
              </div>
              <div className="text-sm font-medium text-gray-600">{texts.offers}</div>
            </div>
            
            <div className="text-center fast-food-card hover:scale-105 transition-transform duration-300">
              <div className="fast-food-icon mx-auto mb-4">
                <Percent className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-extrabold text-[#FF6B35] mb-2">
                {stats.avgDiscount || 0}%
              </div>
              <div className="text-sm font-medium text-gray-600">{texts.avgDiscount}</div>
            </div>
            
            <div className="text-center fast-food-card hover:scale-105 transition-transform duration-300">
              <div className="fast-food-icon mx-auto mb-4">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-extrabold text-[#00D4AA] mb-2">
                {stats.activeProviders || 0}
              </div>
              <div className="text-sm font-medium text-gray-600">{texts.providers}</div>
            </div>
            
            <div className="text-center fast-food-card hover:scale-105 transition-transform duration-300">
              <div className="fast-food-icon mx-auto mb-4">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-extrabold text-[#8B5CF6] mb-2">
                {stats.totalSavings || 0} €
              </div>
              <div className="text-sm font-medium text-gray-600">{texts.savings}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8" id="offers-section">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 space-y-6">
            <div className="fast-food-card sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">{texts.filters}</h3>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={resetFilters} size="sm">
                    {texts.clear}
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                {/* Search */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">{texts.search}</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder={texts.search}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-[#FFB000] focus:ring-[#FFB000]"
                    />
                  </div>
                </div>

                {/* City Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">{texts.city}</label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="border-gray-300 focus:border-[#FFB000]">
                      <SelectValue placeholder={texts.allCities} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{texts.allCities}</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cuisine Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">{texts.cuisine}</label>
                  <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
                    <SelectTrigger className="border-gray-300 focus:border-[#FFB000]">
                      <SelectValue placeholder={texts.allCuisines} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{texts.allCuisines}</SelectItem>
                      {cuisines.map((cuisine) => (
                        <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Provider Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">{texts.provider}</label>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger className="border-gray-300 focus:border-[#FFB000]">
                      <SelectValue placeholder={texts.allProviders} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{texts.allProviders}</SelectItem>
                      {providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>{provider.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Discount Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">{texts.minDiscount}: {minDiscount[0]}%</label>
                  <Slider
                    value={minDiscount}
                    onValueChange={setMinDiscount}
                    max={70}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Price Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">{texts.maxPrice}: {maxPrice[0]} €</label>
                  <Slider
                    value={maxPrice}
                    onValueChange={setMaxPrice}
                    max={200}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Sort Options */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">{texts.sort}</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="border-gray-300 focus:border-[#FFB000]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discount">{texts.discount}</SelectItem>
                      <SelectItem value="price">{texts.price}</SelectItem>
                      <SelectItem value="rating">{texts.rating}</SelectItem>
                      <SelectItem value="newest">{texts.newest}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Offers Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-[#FFB000] mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-600">{texts.loading}</p>
                </div>
              </div>
            ) : offers.length === 0 ? (
              <div className="text-center py-20">
                <div className="fast-food-icon mx-auto mb-6 opacity-50">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{texts.noResults}</h3>
                <p className="text-gray-600 mb-6">{texts.tryDifferent}</p>
                {hasActiveFilters && (
                  <Button onClick={resetFilters} className="fast-food-button">
                    {texts.clearFilters}
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {offers.map((offer, index) => (
                    <div key={offer.id} className="fast-food-card group hover:scale-105 transition-all duration-300" 
                         style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="relative overflow-hidden rounded-lg mb-4">
                        <img
                          src={offer.image_url}
                          alt={offer.title}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="fast-food-discount">
                            {offer.discount_percentage}%
                          </Badge>
                        </div>
                        <div className="absolute bottom-2 left-2">
                          <Badge 
                            variant="secondary" 
                            className="bg-white/90 text-gray-800 font-medium"
                          >
                            {providers.find(p => p.id === offer.provider_id)?.name}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-[#FFB000] transition-colors">
                          {offer.title}
                        </h3>
                        
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {offer.description}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{offer.restaurant_name}</span>
                          <div className="flex items-center gap-1 ml-auto">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">{offer.rating || 4.5}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold fast-food-price">
                                {offer.discounted_price.toFixed(2)} €
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                {offer.original_price.toFixed(2)} €
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>25-35 min</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full fast-food-button group-hover:scale-105 transition-transform" 
                          onClick={() => handleClickout(offer)}
                        >
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          {texts.orderNow} {(offer.original_price - offer.discounted_price).toFixed(2)} €
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Edellinen
                    </Button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={currentPage === page ? "fast-food-button" : ""}
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
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Floating Chat Button */}
      {!isChatOpen && (
        <Button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 h-16 w-16 rounded-full bg-gradient-to-r from-[#FFB000] to-[#FF6B35] 
                     hover:from-[#E09900] hover:to-[#E55A2B] shadow-2xl border-4 border-white transition-all duration-300
                     hover:scale-110 float-animation"
          size="lg"
        >
          <MessageCircle className="h-7 w-7 text-white" />
        </Button>
      )}
      
      {/* Chat Interface */}
      <ChatInterface
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        language={language}
        compact={false}
      />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}