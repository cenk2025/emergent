'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Heart, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Footer() {
  const [showCookieConsent, setShowCookieConsent] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#FFB000] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#FF6B35] rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-[#00D4AA] rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-2xl font-extrabold bg-gradient-to-r from-[#FFB000] to-[#FF6B35] bg-clip-text text-transparent">
                  FoodAi
                </h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Älykkäät ruokatarjoukset Suomessa. Vertailemme parhaat tarjoukset Woltista, 
                Foodorasta ja muista palveluista tekoälyn avulla.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-[#FFB000] transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-[#FFB000] transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-[#FFB000] transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-[#FFB000] transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Palvelut</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-300 hover:text-[#FFB000] transition-colors text-sm">Ruokatarjoukset</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-[#FFB000] transition-colors text-sm">AI-suositukset</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-[#FFB000] transition-colors text-sm">Hintavertailu</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-[#FFB000] transition-colors text-sm">Säästölaskuri</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-[#FFB000] transition-colors text-sm">Ravintolahaku</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Juridiikka</h4>
              <ul className="space-y-2">
                <li><Link href="/kayttoehdot" className="text-gray-300 hover:text-[#FFB000] transition-colors text-sm">Käyttöehdot</Link></li>
                <li><Link href="/tietosuoja" className="text-gray-300 hover:text-[#FFB000] transition-colors text-sm">Tietosuojakäytäntö</Link></li>
                <li><button onClick={() => setShowCookieConsent(true)} className="text-gray-300 hover:text-[#FFB000] transition-colors text-sm text-left">Evästeasetukset</button></li>
                <li><Link href="/saavutettavuus" className="text-gray-300 hover:text-[#FFB000] transition-colors text-sm">Saavutettavuusseloste</Link></li>
                <li><Link href="/ota-yhteytta" className="text-gray-300 hover:text-[#FFB000] transition-colors text-sm">Ota yhteyttä</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Yhteystiedot</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-[#FFB000]" />
                  <span className="text-gray-300 text-sm">info@foodai.fi</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-[#FFB000]" />
                  <span className="text-gray-300 text-sm">+358 40 123 4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-[#FFB000]" />
                  <span className="text-gray-300 text-sm">Helsinki, Suomi</span>
                </div>
              </div>
              
              {/* Newsletter Signup */}
              <div className="mt-6">
                <h5 className="text-sm font-semibold text-white mb-2">Tilaa uutiskirje</h5>
                <div className="flex space-x-2">
                  <input 
                    type="email" 
                    placeholder="Sähköpostiosoite"
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#FFB000] flex-1"
                  />
                  <Button size="sm" className="bg-gradient-to-r from-[#FFB000] to-[#FF6B35] hover:from-[#E09900] hover:to-[#E55A2B] text-white">
                    Tilaa
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400 text-sm">
                © {new Date().getFullYear()} FoodAi. Kaikki oikeudet pidätetään. | Y-tunnus: DEMO (START-UP)
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm flex items-center space-x-1">
                  <span>Tehty</span>
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>Suomessa</span>
                </span>
                <Button
                  onClick={scrollToTop}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-400 hover:text-white hover:border-[#FFB000]"
                >
                  <ArrowUp className="h-4 w-4 mr-1" />
                  Ylös
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      {showCookieConsent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full p-6 shadow-2xl">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Evästeiden käyttö</h3>
                  <p className="text-sm text-gray-600 max-w-2xl">
                    Käytämme välttämättömiä evästeitä sivuston toiminnallisuuden varmistamiseksi ja 
                    tilastollisia evästeitä käyttökokemuksen parantamiseksi. Evästeiden käyttö on 
                    GDPR-asetuksen mukaista.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowCookieConsent(false)}
                    className="text-sm"
                  >
                    Vain välttämättömät
                  </Button>
                  <Button
                    onClick={() => setShowCookieConsent(false)}
                    className="bg-gradient-to-r from-[#FFB000] to-[#FF6B35] hover:from-[#E09900] hover:to-[#E55A2B] text-white text-sm"
                  >
                    Hyväksy kaikki
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}