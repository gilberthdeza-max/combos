'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Package,
  Layers,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Upload,
  X,
  PlusCircle,
  Menu,
  CheckCircle2,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { uploadImage } from '@/lib/cloudinary';
import { Product, Combo } from '@/lib/mockData';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'combos'>('products');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);

  // Product form fields
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [uploadingProdImg, setUploadingProdImg] = useState(false);

  // Combo form fields
  const [comboName, setComboName] = useState('');
  const [comboDesc, setComboDesc] = useState('');
  const [comboPrice, setComboPrice] = useState('');
  const [comboImage, setComboImage] = useState('');
  const [comboProdIds, setComboProdIds] = useState<string[]>([]);
  const [uploadingComboImg, setUploadingComboImg] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const comboFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auth guard
    const auth = localStorage.getItem('admin_session');
    if (auth !== 'true') {
      router.push('/admin/login');
    } else {
      loadData();
    }
  }, [router]);

  async function loadData() {
    setLoading(true);
    try {
      const [fetchedProducts, fetchedCombos] = await Promise.all([
        dataService.getProducts(),
        dataService.getCombos(),
      ]);
      setProducts(fetchedProducts);
      setCombos(fetchedCombos);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    router.push('/admin/login');
  };

  // Product CRUD
  const openAddProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdDesc('');
    setProdImage('');
    setIsProductModalOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdDesc(product.description || '');
    setProdImage(product.image_url || '');
    setIsProductModalOpen(true);
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProdImg(true);
    try {
      const url = await uploadImage(file);
      setProdImage(url);
    } catch (error) {
      alert('Error subiendo imagen. Verifica tu conexión o configuración de Cloudinary.');
    } finally {
      setUploadingProdImg(false);
    }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Update
        const updated = await dataService.updateProduct(editingProduct.id, {
          name: prodName,
          description: prodDesc,
          image_url: prodImage,
        });
        setProducts(products.map((p) => (p.id === editingProduct.id ? updated : p)));
      } else {
        // Create
        const added = await dataService.addProduct({
          name: prodName,
          description: prodDesc,
          image_url: prodImage,
        });
        setProducts([...products, added]);
      }
      setIsProductModalOpen(false);
      // Reload combos in case the product name/image inside a combo was updated
      const fetchedCombos = await dataService.getCombos();
      setCombos(fetchedCombos);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto.');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto? Se quitará de todos los combos que lo contengan.')) return;
    try {
      await dataService.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      // Refresh combos to remove the product relation visually
      const fetchedCombos = await dataService.getCombos();
      setCombos(fetchedCombos);
      setIsProductModalOpen(false);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // Combo CRUD
  const openAddCombo = () => {
    setEditingCombo(null);
    setComboName('');
    setComboDesc('');
    setComboPrice('');
    setComboImage('');
    setComboProdIds([]);
    setIsComboModalOpen(true);
  };

  const openEditCombo = (combo: Combo) => {
    setEditingCombo(combo);
    setComboName(combo.name);
    setComboDesc(combo.description || '');
    setComboPrice(combo.price.toString());
    setComboImage(combo.image_url || '');
    setComboProdIds(combo.products?.map((p) => p.id) || []);
    setIsComboModalOpen(true);
  };

  const handleComboImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingComboImg(true);
    try {
      const url = await uploadImage(file);
      setComboImage(url);
    } catch (error) {
      alert('Error subiendo imagen. Verifica tu conexión o configuración de Cloudinary.');
    } finally {
      setUploadingComboImg(false);
    }
  };

  const toggleProductInCombo = (productId: string) => {
    if (comboProdIds.includes(productId)) {
      setComboProdIds(comboProdIds.filter((id) => id !== productId));
    } else {
      setComboProdIds([...comboProdIds, productId]);
    }
  };

  const saveCombo = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(comboPrice);
    if (isNaN(priceNum)) {
      alert('Por favor introduce un precio válido');
      return;
    }

    try {
      if (editingCombo) {
        // Update
        const updated = await dataService.updateCombo(
          editingCombo.id,
          {
            name: comboName,
            description: comboDesc,
            price: priceNum,
            image_url: comboImage,
          },
          comboProdIds
        );
        setCombos(combos.map((c) => (c.id === editingCombo.id ? updated : c)));
      } else {
        // Create
        const added = await dataService.addCombo(
          {
            name: comboName,
            description: comboDesc,
            price: priceNum,
            image_url: comboImage,
          },
          comboProdIds
        );
        setCombos([added, ...combos]);
      }
      setIsComboModalOpen(false);
    } catch (error) {
      console.error('Error saving combo:', error);
      alert('Error al guardar el combo.');
    }
  };

  const deleteCombo = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este combo?')) return;
    try {
      await dataService.deleteCombo(id);
      setCombos(combos.filter((c) => c.id !== id));
      setIsComboModalOpen(false);
    } catch (error) {
      console.error('Error deleting combo:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 glass-header sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl text-white">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm bg-gradient-to-r from-indigo-600 to-amber-500 bg-clip-text text-transparent">Admin Panel</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Ver Tienda</Link>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-gray-800 p-5 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex md:flex-col md:justify-between
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Logo & Close for Mobile */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-gray-900 dark:text-white leading-tight">ComboExpress</h2>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Panel Administrador</p>
              </div>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => {
                setActiveTab('products');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'products'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40'
              }`}
            >
              <Package className="w-5 h-5" />
              Productos
            </button>

            <button
              onClick={() => {
                setActiveTab('combos');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'combos'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40'
              }`}
            >
              <Layers className="w-5 h-5" />
              Combos
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 mt-6 md:mt-0 space-y-3">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800/30 text-xs font-semibold text-gray-700 dark:text-slate-350 transition-colors"
          >
            Ver catálogo público
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        
        {/* Top bar for Wide Screens */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {activeTab === 'products' ? 'Administrar Productos' : 'Administrar Combos'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {activeTab === 'products'
                ? 'Agrega, edita o elimina los productos que componen tus combos.'
                : 'Crea combos atractivos vinculando los productos y asignando un precio.'}
            </p>
          </div>
          
          <button
            onClick={activeTab === 'products' ? openAddProduct : openAddCombo}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            {activeTab === 'products' ? 'Nuevo Producto' : 'Nuevo Combo'}
          </button>
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-2">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm text-gray-500 font-semibold">Cargando...</p>
          </div>
        ) : (
          <div>
            
            {/* Products Tab View */}
            {activeTab === 'products' && (
              <div>
                {/* Mobile FAB to Add */}
                <div className="md:hidden flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">Mis Productos ({products.length})</h3>
                  <button
                    onClick={openAddProduct}
                    className="bg-indigo-600 p-2 rounded-xl text-white flex items-center gap-1 text-xs font-bold"
                  >
                    <Plus className="w-4 h-4" />
                    Añadir
                  </button>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-16 glass rounded-2xl p-6">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-450">No hay productos creados.</p>
                    <button
                      onClick={openAddProduct}
                      className="mt-3 text-xs font-bold bg-indigo-600 text-white py-2 px-4 rounded-xl hover:bg-indigo-750 transition-colors"
                    >
                      Crear primer producto
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => openEditProduct(product)}
                        className="glass rounded-2xl p-2.5 flex flex-col justify-between cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all group border border-gray-150 dark:border-gray-850"
                      >
                        <div>
                          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 relative mb-3">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-850">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <h4 className="font-bold text-sm text-gray-900 dark:text-slate-100 leading-snug line-clamp-2">
                            {product.name}
                          </h4>
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-1 font-medium">
                          {product.description || 'Sin descripción'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Combos Tab View */}
            {activeTab === 'combos' && (
              <div>
                {/* Mobile FAB to Add */}
                <div className="md:hidden flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">Mis Combos ({combos.length})</h3>
                  <button
                    onClick={openAddCombo}
                    className="bg-indigo-600 p-2 rounded-xl text-white flex items-center gap-1 text-xs font-bold"
                  >
                    <Plus className="w-4 h-4" />
                    Añadir
                  </button>
                </div>

                {combos.length === 0 ? (
                  <div className="text-center py-16 glass rounded-2xl p-6">
                    <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-450">No hay combos creados.</p>
                    <button
                      onClick={openAddCombo}
                      className="mt-3 text-xs font-bold bg-indigo-600 text-white py-2 px-4 rounded-xl hover:bg-indigo-750 transition-colors"
                    >
                      Crear primer combo
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {combos.map((combo) => (
                      <div
                        key={combo.id}
                        onClick={() => openEditCombo(combo)}
                        className="glass rounded-2xl p-3 flex gap-3.5 cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all group border border-gray-150 dark:border-gray-850"
                      >
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                          {combo.image_url ? (
                            <img
                              src={combo.image_url}
                              alt={combo.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                              <ShoppingBag className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute top-1 right-1 bg-indigo-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                            ${combo.price}
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                          <div>
                            <h4 className="font-bold text-sm text-gray-950 dark:text-slate-100 truncate">
                              {combo.name}
                            </h4>
                            <p className="text-xs text-gray-550 dark:text-gray-450 line-clamp-2 mt-1 leading-snug">
                              {combo.description}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md">
                              {combo.products?.length || 0} prod
                            </span>
                            <span className="text-[10px] font-bold text-gray-650 dark:text-gray-355 flex items-center gap-0.5">
                              Editar &rarr;
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </main>

      {/* Product CRUD Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="absolute inset-0" onClick={() => setIsProductModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800 animate-scale-up">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </h3>

            <form onSubmit={saveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Ej. Detergente Líquido 1.5L"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Descripción
                </label>
                <textarea
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Describe brevemente el producto..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Foto del Producto
                </label>
                <div className="flex gap-3 items-center">
                  <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-850 overflow-hidden flex-shrink-0 relative flex items-center justify-center">
                    {prodImage ? (
                      <img src={prodImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-gray-450" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <button
                      type="button"
                      disabled={uploadingProdImg}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold py-2 rounded-xl text-xs transition-colors"
                    >
                      {uploadingProdImg ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" /> Subir Imagen (Cloudinary)
                        </>
                      )}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleProductImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    <input
                      type="text"
                      value={prodImage}
                      onChange={(e) => setProdImage(e.target.value)}
                      placeholder="O pega el link URL de una imagen"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-250 dark:border-gray-800 bg-transparent text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                {editingProduct && (
                  <button
                    type="button"
                    onClick={() => deleteProduct(editingProduct.id)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 dark:text-rose-400 dark:border-rose-950 bg-rose-50/20 hover:bg-rose-50 text-xs font-bold transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Eliminar
                  </button>
                )}
                
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs active:scale-[0.98] transition-all shadow-md"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Combo CRUD Modal */}
      {isComboModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="absolute inset-0" onClick={() => setIsComboModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 z-10 max-h-[92vh] overflow-y-auto border border-gray-100 dark:border-gray-800 animate-scale-up">
            <button
              onClick={() => setIsComboModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5">
              {editingCombo ? 'Editar Combo' : 'Crear Nuevo Combo'}
            </h3>

            <form onSubmit={saveCombo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Nombre del Combo
                  </label>
                  <input
                    type="text"
                    required
                    value={comboName}
                    onChange={(e) => setComboName(e.target.value)}
                    placeholder="Ej. Combo Especial de Aseo"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Precio ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={comboPrice}
                    onChange={(e) => setComboPrice(e.target.value)}
                    placeholder="Ej. 25.50"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Descripción
                </label>
                <textarea
                  value={comboDesc}
                  onChange={(e) => setComboDesc(e.target.value)}
                  placeholder="Describe brevemente qué incluye y para qué sirve este combo..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Foto del Combo
                </label>
                <div className="flex gap-3 items-center">
                  <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-850 overflow-hidden flex-shrink-0 relative flex items-center justify-center">
                    {comboImage ? (
                      <img src={comboImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Layers className="w-8 h-8 text-gray-455" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <button
                      type="button"
                      disabled={uploadingComboImg}
                      onClick={() => comboFileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold py-2 rounded-xl text-xs transition-colors"
                    >
                      {uploadingComboImg ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" /> Subir Imagen (Cloudinary)
                        </>
                      )}
                    </button>
                    <input
                      type="file"
                      ref={comboFileInputRef}
                      onChange={handleComboImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    <input
                      type="text"
                      value={comboImage}
                      onChange={(e) => setComboImage(e.target.value)}
                      placeholder="O pega el link URL de una imagen"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-250 dark:border-gray-800 bg-transparent text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Product Association Checklist */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Asociar Productos al Combo
                </label>
                {products.length === 0 ? (
                  <p className="text-xs text-amber-500">
                    Crea productos primero en la pestaña de Productos para poder agregarlos aquí.
                  </p>
                ) : (
                  <div className="border border-gray-250 dark:border-gray-800 rounded-2xl max-h-44 overflow-y-auto p-2 bg-gray-50/20 space-y-1.5">
                    {products.map((prod) => {
                      const isSelected = comboProdIds.includes(prod.id);
                      return (
                        <div
                          key={prod.id}
                          onClick={() => toggleProductInCombo(prod.id)}
                          className={`
                            flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all text-xs font-semibold
                            ${
                              isSelected
                                ? 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400'
                                : 'border-gray-150 dark:border-gray-850 hover:bg-gray-50/50 text-gray-700 dark:text-slate-300'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white dark:bg-gray-900 border flex-shrink-0">
                              {prod.image_url && <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />}
                            </div>
                            <span className="truncate max-w-[200px]">{prod.name}</span>
                          </div>
                          
                          <div className="flex items-center">
                            {isSelected ? (
                              <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 fill-white dark:fill-transparent" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-700" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                {editingCombo && (
                  <button
                    type="button"
                    onClick={() => deleteCombo(editingCombo.id)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 dark:text-rose-400 dark:border-rose-950 bg-rose-50/20 hover:bg-rose-50 text-xs font-bold transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Eliminar
                  </button>
                )}
                
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs active:scale-[0.98] transition-all shadow-md"
                >
                  Guardar Combo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
