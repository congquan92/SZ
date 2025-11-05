import { create } from "zustand";
import { CartAPI } from "@/api/cart.api";
import type { CartProduct } from "@/page/type";

interface CartState {
    cartItems: CartProduct[];
    loading: boolean;
    cartCount: number;
    fetchCart: () => Promise<void>;
    updateCartCount: (count: number) => void;
    clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
    cartItems: [],
    loading: false,
    cartCount: 0,

    fetchCart: async () => {
        set({ loading: true });
        try {
            const response = await CartAPI.getCart(100); // Lấy tất cả items
            const items = response.data.data;
            set({
                cartItems: items,
                cartCount: items.length,
                loading: false,
            });
        } catch (error) {
            console.error("Fetch cart failed", error);
            set({ loading: false });
        }
    },

    updateCartCount: (count: number) => {
        set({ cartCount: count });
    },

    clearCart: () => {
        set({ cartItems: [], cartCount: 0 });
    },
}));
