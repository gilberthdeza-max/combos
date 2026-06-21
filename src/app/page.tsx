'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Search, MessageCircle, X, ShieldAlert, Sparkles } from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { Combo } from '@/lib/mockData';

export default function Home() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [whatsappNumber] = useState('59077155');

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedCombos = await dataService.getCombos();
        setCombos(fetchedCombos);
      } catch (error) {
        console.error('Failed to load combos:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredCombos = combos.filter(
    (combo) =>
      combo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      combo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getWhatsAppLink = (combo: Combo) => {
    const text = encodeURIComponent(
      `¡Hola! Estoy interesado en comprar el combo: *${combo.name}* por el precio de *$${combo.price}*. ¿Tienen disponibilidad?`
    );
    return `https://wa.me/${whatsappNumber}?text=${text}`;
  };

  return (
    <div className="min-h-screen pb-12 safe-bottom">
      {/* Premium Glassmorphic Header */}
      <header className="sticky top-0 z-40 glass-header px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-500/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-amber-500 bg-clip-text text-transparent">
              ComboExpress
            </h1>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Mobile Delivery Catalog</p>
          </div>
        </div>

        <Link
          href="/admin"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors flex items-center gap-1.5"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-gray-500" />
          Admin
        </Link>
      </header>

      {/* Hero Banner */}
      <div className="mx-4 mt-6 p-5 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 text-white relative overflow-hidden shadow-xl shadow-indigo-600/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-indigo-500/30 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-indigo-950 uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" /> Exclusivo
          </span>
          <h2 className="text-2xl font-bold tracking-tight mb-1">Combos Familiares y de Aseo</h2>
          <p className="text-xs text-indigo-100 max-w-[280px]">
            Elige tu combo favorito, revisa su contenido y ordénalo en segundos a través de WhatsApp.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 mt-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar combos (ej. comida, aseo)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-400 text-sm"
          />
        </div>
      </div>

      {/* Combo Listings */}
      <main className="px-4 mt-6">
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Combos Disponibles ({filteredCombos.length})
        </h3>

        {loading ? (
          /* Skeleton Loader */
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass rounded-2xl p-3 flex gap-3 animate-pulse">
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-xl flex-shrink-0"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCombos.length === 0 ? (
          <div className="text-center py-12 glass rounded-2xl p-6">
            <p className="text-gray-500 dark:text-gray-400 text-sm">No se encontraron combos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCombos.map((combo) => (
              <div
                key={combo.id}
                onClick={() => setSelectedCombo(combo)}
                className="glass rounded-2xl p-3 flex gap-4 cursor-pointer hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all group duration-200"
              >
                <div className="relative w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                  {combo.image_url ? (
                    <img
                      src={combo.image_url}
                      alt={combo.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                      <ShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-indigo-600 text-white font-bold text-xs px-2 py-0.5 rounded-full shadow-md">
                    ${combo.price}
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                  <div>
                    <h4 className="font-bold text-base text-gray-900 dark:text-slate-100 leading-tight truncate">
                      {combo.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                      {combo.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-1 rounded-md">
                      {combo.products?.length || 0} productos
                    </span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:translate-x-1 transition-transform duration-200 flex items-center gap-0.5">
                      Ver detalle &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Detail Bottom Sheet / Modal */}
      {selectedCombo && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            onClick={() => setSelectedCombo(null)} 
            className="absolute inset-0 cursor-pointer"
          />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-950 rounded-t-3xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[85vh] flex flex-col z-10 border-t border-gray-100 dark:border-gray-900">
            {/* Top Bar Indicator */}
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto my-3 flex-shrink-0"></div>

            <button
              onClick={() => setSelectedCombo(null)}
              className="absolute top-4 right-4 z-10 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white backdrop-blur-sm transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="overflow-y-auto flex-1 pb-24">
              <div className="relative w-full h-56 bg-gray-200 dark:bg-gray-800">
                {selectedCombo.image_url ? (
                  <img
                    src={selectedCombo.image_url}
                    alt={selectedCombo.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute bottom-4 left-4 bg-indigo-600 text-white font-bold text-lg px-3 py-1 rounded-xl shadow-lg">
                  ${selectedCombo.price}
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                  {selectedCombo.name}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                  {selectedCombo.description}
                </p>

                <div className="mt-6">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Productos Incluidos ({selectedCombo.products?.length || 0})
                  </h4>

                  {selectedCombo.products && selectedCombo.products.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {selectedCombo.products.map((product, idx) => (
                        <div
                          key={product.id + '-' + idx}
                          className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-900"
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="font-bold text-sm text-gray-800 dark:text-slate-200 truncate">
                              {product.name}
                            </h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Este combo no contiene productos definidos.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Floating Order Button */}
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-white via-white to-transparent dark:from-slate-950 dark:via-slate-950 pb-6 border-t border-gray-100/50 dark:border-gray-900/50 flex gap-3">
              <a
                href={getWhatsAppLink(selectedCombo)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#25d366] hover:bg-[#20ba5a] active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-[#25d366]/20 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <MessageCircle className="w-5 h-5 fill-white text-[#25d366]" />
                Pedir por WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
