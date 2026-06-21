import { supabase } from './supabase';
import { MOCK_PRODUCTS, MOCK_COMBOS, Product, Combo } from './mockData';

// Dynamic in-memory or localStorage-based fallback for demo mode
let localProducts: Product[] = [];
let localCombos: Combo[] = [];

const isSupabaseConfigured = (): boolean => {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

const getStorageData = () => {
  if (typeof window === 'undefined') return { products: MOCK_PRODUCTS, combos: MOCK_COMBOS };
  
  const savedProds = localStorage.getItem('combos_app_products');
  const savedCombos = localStorage.getItem('combos_app_combos');
  
  if (!savedProds) {
    localStorage.setItem('combos_app_products', JSON.stringify(MOCK_PRODUCTS));
    localProducts = MOCK_PRODUCTS;
  } else {
    localProducts = JSON.parse(savedProds);
  }

  if (!savedCombos) {
    localStorage.setItem('combos_app_combos', JSON.stringify(MOCK_COMBOS));
    localCombos = MOCK_COMBOS;
  } else {
    localCombos = JSON.parse(savedCombos);
  }

  return { products: localProducts, combos: localCombos };
};

// Initialize local state
if (typeof window !== 'undefined') {
  getStorageData();
}

const saveLocalProducts = (prods: Product[]) => {
  localProducts = prods;
  if (typeof window !== 'undefined') {
    localStorage.setItem('combos_app_products', JSON.stringify(prods));
  }
};

const saveLocalCombos = (combs: Combo[]) => {
  localCombos = combs;
  if (typeof window !== 'undefined') {
    localStorage.setItem('combos_app_combos', JSON.stringify(combs));
  }
};

export const dataService = {
  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured()) {
      getStorageData();
      return localProducts;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching products from Supabase, falling back to local:', error);
      getStorageData();
      return localProducts;
    }
    return data || [];
  },

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    if (!isSupabaseConfigured()) {
      getStorageData();
      const newProduct: Product = {
        ...product,
        id: `p_${Date.now()}`
      };
      saveLocalProducts([...localProducts, newProduct]);
      return newProduct;
    }

    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    if (!isSupabaseConfigured()) {
      getStorageData();
      const updated = localProducts.map(p => p.id === id ? { ...p, ...updates } : p);
      saveLocalProducts(updated);
      
      // Update combos that contain this product
      const updatedCombos = localCombos.map(c => {
        if (c.products) {
          return {
            ...c,
            products: c.products.map(p => p.id === id ? { ...p, ...updates } : p)
          };
        }
        return c;
      });
      saveLocalCombos(updatedCombos);
      
      const prod = updated.find(p => p.id === id);
      if (!prod) throw new Error('Product not found');
      return prod;
    }

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      getStorageData();
      saveLocalProducts(localProducts.filter(p => p.id !== id));
      
      // Remove product from combos containing it
      const updatedCombos = localCombos.map(c => {
        if (c.products) {
          return {
            ...c,
            products: c.products.filter(p => p.id !== id)
          };
        }
        return c;
      });
      saveLocalCombos(updatedCombos);
      return;
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // COMBOS
  async getCombos(): Promise<Combo[]> {
    if (!isSupabaseConfigured()) {
      getStorageData();
      return localCombos;
    }

    // Fetch combos with their associated products
    const { data: combos, error: comboError } = await supabase
      .from('combos')
      .select('*')
      .order('created_at', { ascending: false });

    if (comboError) {
      console.error('Error fetching combos from Supabase, falling back to local:', comboError);
      getStorageData();
      return localCombos;
    }

    const { data: relations, error: relError } = await supabase
      .from('combo_products')
      .select('combo_id, products(*)');

    if (relError) {
      console.error('Error fetching combo relations:', relError);
      return combos || [];
    }

    return (combos || []).map(combo => {
      const relatedProds = (relations as any[])
        .filter(r => r.combo_id === combo.id)
        .map(r => r.products)
        .filter(Boolean) as unknown as Product[];
      return {
        ...combo,
        products: relatedProds
      };
    });
  },

  async addCombo(combo: Omit<Combo, 'id'>, productIds: string[]): Promise<Combo> {
    if (!isSupabaseConfigured()) {
      getStorageData();
      const selectedProducts = localProducts.filter(p => productIds.includes(p.id));
      const newCombo: Combo = {
        ...combo,
        id: `c_${Date.now()}`,
        products: selectedProducts
      };
      saveLocalCombos([newCombo, ...localCombos]);
      return newCombo;
    }

    // 1. Insert combo
    const { data: newCombo, error: comboError } = await supabase
      .from('combos')
      .insert([{
        name: combo.name,
        description: combo.description,
        price: combo.price,
        image_url: combo.image_url
      }])
      .select()
      .single();

    if (comboError) throw comboError;

    // 2. Insert relations
    if (productIds.length > 0) {
      const relations = productIds.map(productId => ({
        combo_id: newCombo.id,
        product_id: productId
      }));
      const { error: relError } = await supabase
        .from('combo_products')
        .insert(relations);

      if (relError) throw relError;
    }

    // 3. Return combo with products
    const selectedProducts = await Promise.all(
      productIds.map(async id => {
        const { data } = await supabase.from('products').select('*').eq('id', id).single();
        return data;
      })
    );

    return {
      ...newCombo,
      products: selectedProducts.filter(Boolean) as Product[]
    };
  },

  async updateCombo(id: string, updates: Partial<Combo>, productIds?: string[]): Promise<Combo> {
    if (!isSupabaseConfigured()) {
      getStorageData();
      
      const comboProducts = productIds 
        ? localProducts.filter(p => productIds.includes(p.id))
        : undefined;

      const updated = localCombos.map(c => {
        if (c.id === id) {
          return {
            ...c,
            ...updates,
            ...(comboProducts ? { products: comboProducts } : {})
          };
        }
        return c;
      });
      saveLocalCombos(updated);

      const found = updated.find(c => c.id === id);
      if (!found) throw new Error('Combo not found');
      return found;
    }

    // 1. Update combo properties
    const { data: updatedCombo, error: comboError } = await supabase
      .from('combos')
      .update({
        name: updates.name,
        description: updates.description,
        price: updates.price,
        image_url: updates.image_url
      })
      .eq('id', id)
      .select()
      .single();

    if (comboError) throw comboError;

    // 2. Update products relation if provided
    if (productIds !== undefined) {
      // Delete old relations
      const { error: delError } = await supabase
        .from('combo_products')
        .delete()
        .eq('combo_id', id);

      if (delError) throw delError;

      // Insert new relations
      if (productIds.length > 0) {
        const relations = productIds.map(pid => ({
          combo_id: id,
          product_id: pid
        }));
        const { error: insError } = await supabase
          .from('combo_products')
          .insert(relations);

        if (insError) throw insError;
      }
    }

    // 3. Fetch products
    const { data: rels } = await supabase
      .from('combo_products')
      .select('products(*)')
      .eq('combo_id', id);

    const prods = (rels || []).map(r => r.products).filter(Boolean) as unknown as Product[];

    return {
      ...updatedCombo,
      products: prods
    };
  },

  async deleteCombo(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      getStorageData();
      saveLocalCombos(localCombos.filter(c => c.id !== id));
      return;
    }

    const { error } = await supabase
      .from('combos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
