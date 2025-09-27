'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Euro, 
  TrendingUp, 
  Users, 
  MousePointer, 
  ShoppingCart,
  BarChart3,
  ArrowLeft,
  RefreshCw,
  Eye,
  DollarSign,
  Percent,
  Calendar,
  MapPin,
  Star
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState({
    overview: {},
    providers: [],
    clickouts: [],
    commissions: [],
    topOffers: [],
    cityStats: [],
    loading: true
  });

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/');
      return;
    }
  }, [user, isAdmin, loading, router]);

  // Fetch admin data
  useEffect(() => {
    if (user && isAdmin) {
      fetchAdminData();
    }
  }, [user, isAdmin]);

  const fetchAdminData = async () => {
    setDashboardData(prev => ({ ...prev, loading: true }));
    
    try {
      // Fetch all admin data
      const [overviewRes, providersRes, clickoutsRes, commissionsRes] = await Promise.all([
        fetch('/api/admin/overview'),
        fetch('/api/admin/providers'),
        fetch('/api/admin/clickouts'),
        fetch('/api/admin/commissions')
      ]);

      const overview = await overviewRes.json();
      const providers = await providersRes.json();
      const clickouts = await clickoutsRes.json();
      const commissions = await commissionsRes.json();

      setDashboardData({
        overview: overview.data || {},
        providers: providers.data || [],
        clickouts: clickouts.data || [],
        commissions: commissions.data || [],
        topOffers: overview.topOffers || [],
        cityStats: overview.cityStats || [],
        loading: false
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  if (loading || dashboardData.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const { overview, providers, clickouts, commissions, topOffers, cityStats } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Takaisin etusivulle
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">FoodAi Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Tervetuloa, {user?.email}
                </p>
              </div>
            </div>
            <Button onClick={fetchAdminData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Päivitä tiedot
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Kokonaistulot</p>
                  <p className="text-3xl font-bold text-green-600">
                    €{overview.totalRevenue || '0.00'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    +{overview.revenueGrowth || '0'}% tällä kuulla
                  </p>
                </div>
                <Euro className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Klikkaukset</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {overview.totalClicks || '0'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    +{overview.clicksGrowth || '0'}% tällä viikolla
                  </p>
                </div>
                <MousePointer className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Konversiot</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {overview.totalConversions || '0'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {overview.conversionRate || '0'}% konversioprosentti
                  </p>
                </div>
                <ShoppingCart className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aktiiviset tarjoukset</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {overview.activeOffers || '0'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {overview.totalOffers || '0'} tarjousta yhteensä
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Yleiskatsaus</TabsTrigger>
            <TabsTrigger value="providers">Palveluntarjoajat</TabsTrigger>
            <TabsTrigger value="commissions">Komisiot</TabsTrigger>
            <TabsTrigger value="analytics">Analytiikka</TabsTrigger>
            <TabsTrigger value="offers">Tarjoukset</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Clickouts */}
              <Card>
                <CardHeader>
                  <CardTitle>Viimeisimmät klikkaukset</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {clickouts.slice(0, 5).map((clickout, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <div>
                          <p className="font-medium">{clickout.offerTitle || 'Tuntematon tarjous'}</p>
                          <p className="text-sm text-muted-foreground">{clickout.providerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{new Date(clickout.timestamp || Date.now()).toLocaleDateString('fi-FI')}</p>
                          <Badge variant={clickout.isConversion ? 'default' : 'secondary'}>
                            {clickout.isConversion ? 'Konversio' : 'Klikkaus'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Offers */}
              <Card>
                <CardHeader>
                  <CardTitle>Parhaiten toimivat tarjoukset</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topOffers.slice(0, 5).map((offer, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <div>
                          <p className="font-medium">{offer.title}</p>
                          <p className="text-sm text-muted-foreground">{offer.restaurantName} • {offer.city}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{offer.clickCount || 0} klikkausta</p>
                          <p className="text-xs text-muted-foreground">€{offer.revenue || '0.00'} tulot</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* City Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Kaupunkien suorituskyky</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {cityStats.map((city, index) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <h3 className="font-medium">{city.name}</h3>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p>Tarjoukset: {city.offerCount || 0}</p>
                        <p>Klikkaukset: {city.clickCount || 0}</p>
                        <p>Tulot: €{city.revenue || '0.00'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Providers Tab */}
          <TabsContent value="providers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Palveluntarjoajien suorituskyky</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {providers.map((provider, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={provider.logoUrl} 
                            alt={provider.name}
                            className="w-8 h-8 rounded"
                          />
                          <div>
                            <h3 className="font-medium">{provider.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Komissioprosentti: {provider.commissionRate || 0}%
                            </p>
                          </div>
                        </div>
                        <Badge variant={provider.isActive ? 'default' : 'secondary'}>
                          {provider.isActive ? 'Aktiivinen' : 'Ei aktiivinen'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Tarjoukset</p>
                          <p className="font-medium">{provider.offerCount || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Klikkaukset</p>
                          <p className="font-medium">{provider.clickCount || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Konversiot</p>
                          <p className="font-medium">{provider.conversions || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Ansaittu</p>
                          <p className="font-medium text-green-600">€{provider.earned || '0.00'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commissions Tab */}
          <TabsContent value="commissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Komisioiden seuranta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {commissions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Ei komisiotietoja saatavilla
                    </p>
                  ) : (
                    commissions.map((commission, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-medium">{commission.offerTitle}</h3>
                            <p className="text-sm text-muted-foreground">
                              {commission.providerName} • {new Date(commission.occurredAt || Date.now()).toLocaleDateString('fi-FI')}
                            </p>
                          </div>
                          <Badge variant={
                            commission.status === 'approved' ? 'default' : 
                            commission.status === 'pending' ? 'secondary' : 
                            'destructive'
                          }>
                            {commission.status === 'approved' ? 'Hyväksytty' :
                             commission.status === 'pending' ? 'Odottaa' :
                             'Peruutettu'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Bruttoarvo</p>
                            <p className="font-medium">€{commission.grossAmount || '0.00'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Komisio</p>
                            <p className="font-medium text-green-600">€{commission.commissionAmount || '0.00'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Konversio-ID</p>
                            <p className="font-mono text-xs">{commission.externalConversionId}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Klikkausanalytiikka</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Kokonaisklikkaukset</span>
                      <span className="font-bold">{overview.totalClicks || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Konversiot</span>
                      <span className="font-bold text-green-600">{overview.totalConversions || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Konversioprosentti</span>
                      <span className="font-bold">{overview.conversionRate || 0}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Keskimääräinen tuotto/klikkaus</span>
                      <span className="font-bold">€{overview.avgRevenuePerClick || '0.00'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tuottoanalytiikka</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Kuukausitulot</span>
                      <span className="font-bold text-green-600">€{overview.monthlyRevenue || '0.00'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Viikkotulot</span>
                      <span className="font-bold">€{overview.weeklyRevenue || '0.00'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Päivittäinen keskiarvo</span>
                      <span className="font-bold">€{overview.dailyAvgRevenue || '0.00'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Kokonaistuotto</span>
                      <span className="font-bold text-lg">€{overview.totalRevenue || '0.00'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Offers Tab */}
          <TabsContent value="offers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tarjousten hallinta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h3 className="font-medium text-green-800 dark:text-green-200">Aktiiviset tarjoukset</h3>
                      <p className="text-2xl font-bold text-green-600">{overview.activeOffers || 0}</p>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Päättyvät pian</h3>
                      <p className="text-2xl font-bold text-yellow-600">{overview.expiringOffers || 0}</p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <h3 className="font-medium text-red-800 dark:text-red-200">Päättyneet</h3>
                      <p className="text-2xl font-bold text-red-600">{overview.expiredOffers || 0}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Tarjousten yksityiskohtainen hallinta ja muokkaustyökalut lisätään seuraavassa versiossa.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}