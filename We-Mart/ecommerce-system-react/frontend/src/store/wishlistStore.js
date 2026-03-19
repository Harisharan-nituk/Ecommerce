import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const items = get().items;
        const existingItem = items.find(
          (item) => (item.product_id || item.id) === (product.id || product._id)
        );

        if (existingItem) {
          // Item already in wishlist
          return false;
        }

        set({
          items: [
            ...items,
            {
              product_id: product.id || product._id,
              id: product.id || product._id,
              name: product.name,
              price: product.price,
              image: product.image_url || product.image,
              image_url: product.image_url || product.image,
              brand: product.brand,
              average_rating: product.average_rating || 0,
              total_reviews: product.total_reviews || 0,
            },
          ],
        });
        return true;
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter(
            (item) => (item.product_id || item.id) !== productId
          ),
        });
      },

      isInWishlist: (productId) => {
        return get().items.some(
          (item) => (item.product_id || item.id) === productId
        );
      },

      clearWishlist: () => {
        set({ items: [] });
      },

      getItemCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export { useWishlistStore };
