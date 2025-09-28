/**
 * FoodAI Chat Interface Component
 * 
 * Interactive chat component for the DeepSeek-powered food deals assistant.
 * Features Finnish/English support, streaming responses, and offer integration.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Bot, User, Loader2, X, Minimize2, Maximize2 } from 'lucide-react';

export default function ChatInterface({ 
  isOpen = false, 
  onToggle, 
  language = 'fi',
  compact = false 
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Language texts
  const texts = {
    tr: {
      title: 'FoodAi Asistan',
      subtitle: 'Akıllı yemek önerileri ve fırsatlar',
      placeholder: 'Yemek fırsatları hakkında sor...',
      send: 'Gönder',
      thinking: 'Düşünüyor...',
      welcome: '🤖 Merhaba! Size en iyi yemek fırsatlarını bulmakta yardımcı olacağım.',
      welcomeSubtext: 'Pizza indirimleri, burger fırsatları veya vegan seçenekler hakkında sorabilirsiniz!',
      suggestions: [
        'Yakındaki pizza fırsatları',
        'En iyi burger indirimleri', 
        'Vegan restoran teklifleri',
        'Bugünün özel menüleri'
      ],
      error: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
      minimize: 'Küçült',
      maximize: 'Büyüt',
      close: 'Kapat'
    },
    fi: {
      title: 'FoodAi Avustaja',
      subtitle: 'Kysy ruokatarjouksista ja ravintola-suosituksista',
      placeholder: 'Kysymyksesi ruokatarjouksista...',
      send: 'Lähetä',
      thinking: 'Ajattelee...',
      welcome: '👋 Hei! Autan sinua löytämään parhaita ruokatarjouksia.',
      welcomeSubtext: 'Kysy vaikkapa pizzatarjouksista, lounassuosituksista tai vegaanivaihtoehdoista!',
      suggestions: [
        'Pizzatarjoukset lähellä minua',
        'Parhaat hampurilaisalennukset',
        'Vegaaniravintolan tarjoukset',
        'Tämän päivän lounasspeciaalit'
      ],
      error: 'Pahoittelut, tapahtui virhe. Yritä hetken kuluttua uudelleen.',
      minimize: 'Pienennä',
      maximize: 'Suurenna',
      close: 'Sulje'
    },
    en: {
      title: 'FoodAI Assistant',
      subtitle: 'Ask about food deals and restaurant recommendations',
      placeholder: 'Ask about food deals...',
      send: 'Send',
      thinking: 'Thinking...',
      welcome: '👋 Hello! I can help you find great food deals.',
      welcomeSubtext: 'Try asking about pizza deals, lunch specials, or vegan options!',
      suggestions: [
        'Pizza deals near me',
        'Best burger discounts',
        'Vegetarian restaurant offers',
        'Today\'s lunch specials'
      ],
      error: 'Sorry, an error occurred. Please try again later.',
      minimize: 'Minimize',
      maximize: 'Maximize',
      close: 'Close'
    }
  };

  const t = texts[language] || texts.tr;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: t.welcome + '\n\n' + t.welcomeSubtext,
          timestamp: new Date()
        }
      ]);
    }
  }, [t.welcome, t.welcomeSubtext, messages.length]);

  const handleSendMessage = async (messageText = null) => {
    const messageContent = messageText || input.trim();
    if (!messageContent || isLoading) return;
    
    const userMessage = { 
      role: 'user', 
      content: messageContent,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
          includeOffers: true
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, {
        ...data,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: t.error,
          timestamp: new Date(),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${compact ? 'w-80' : 'w-96'} ${isMinimized ? 'h-16' : 'h-[32rem]'} 
                    transition-all duration-300 ease-in-out`}>
      <Card className="h-full flex flex-col shadow-2xl border-2">
        {/* Header */}
        <CardHeader className="pb-3 bg-gradient-to-r from-[#FFB000] to-[#FF6B35] text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div>
                <CardTitle className="text-lg font-bold">{t.title}</CardTitle>
                {!isMinimized && (
                  <p className="text-sm text-purple-100 mt-1">{t.subtitle}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Chat Content */}
        {!isMinimized && (
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFB000] to-[#FF6B35] 
                                    flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-[#FFB000] to-[#FF6B35] text-white'
                          : message.isError
                          ? 'bg-red-50 border border-red-200 text-red-800'
                          : 'bg-white border border-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      {message.timestamp && (
                        <div className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-orange-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString('fi-FI', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 
                                  flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">{t.thinking}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="px-4 py-2 border-t border-gray-200 bg-white">
                <div className="flex flex-wrap gap-2">
                  {t.suggestions.map((suggestion, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs h-8 hover:bg-purple-50 hover:border-purple-300"
                      disabled={isLoading}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t.placeholder}
                  className="flex-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 
                           hover:to-blue-700 text-white px-4"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}