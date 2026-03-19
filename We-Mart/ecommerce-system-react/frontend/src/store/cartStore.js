import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      total: 0,

      addItem: (product, quantity = 1) => {
        const items = get().items;
        const productId = product.id || product._id;
        const productImage = product.image || product.image_url || product.image_urls?.[0];
        const existingItem = items.find((item) => {
          // Match by product_id and selectedSize if both exist
          if (item.selectedSize && product.selectedSize) {
            return item.product_id === productId && item.selectedSize === product.selectedSize;
          }
          return item.product_id === productId;
        });

        if (existingItem) {
          existingItem.quantity += quantity;
          set({ items: [...items] });
        } else {
          set({
            items: [
              ...items,
              {
                product_id: productId,
                quantity,
                price: product.price,
                name: product.name,
                image: productImage,
                selectedSize: product.selectedSize || null,
                product: product, // Store full product object for reference
              },
            ],
          });
        }
        get().calculateTotal();
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.product_id !== productId),
        });
        get().calculateTotal();
      },

      updateQuantity: (productId, quantity) => {
        const items = get().items;
        const item = items.find((item) => {
          // Match by product_id and selectedSize if both exist
          const itemId = item.product_id;
          return itemId === productId || itemId === productId.toString();
        });
        if (item) {
          if (quantity <= 0) {
            get().removeItem(productId);
          } else {
            item.quantity = quantity;
            set({ items: [...items] });
            get().calculateTotal();
          }
        }
      },

      clearCart: () => {
        set({ items: [], total: 0 });
      },

      calculateTotal: () => {
        const total = get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        set({ total });
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export { useCartStore };

