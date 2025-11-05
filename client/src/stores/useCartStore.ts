import { create } from "zustand";
import { CartAPI } from "@/api/cart.api";
import type { CartProduct } from "@/page/type";

interface CartState {
    cartItems: CartProduct[];
    loading: boolean;
    error: string | null;

    // Computed values
    cartCount: number;
    totalAmount: number;

    // Actions
    fetchCart: () => Promise<void>;
    addToCart: (variantId: number, quantity: number) => Promise<void>;
    updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
    removeItem: (cartItemId: number) => Promise<void>;
    clearCart: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useCartStore = create<CartState>((set, get) => {
    // Helper function để tính toán lại giá trị
    const recalculate = () => {
        const { cartItems } = get();
        const cartCount = cartItems.length;
        const totalAmount = cartItems.reduce((sum, item) => sum + item.productVariantResponse.price * item.quantity, 0);
        set({ cartCount, totalAmount });
    };

    return {
        // Initial state
        cartItems: [],
        loading: false,
        error: null,
        cartCount: 0,
        totalAmount: 0,

        setLoading: (loading: boolean) => {
            set({ loading });
        },

        setError: (error: string | null) => {
            set({ error });
        },

        // Lấy giỏ hàng từ server
        fetchCart: async () => {
            set({ loading: true, error: null });
            try {
                const response = await CartAPI.getCart(100);
                const items = response.data.data || [];

                set({ cartItems: items, loading: false });
                recalculate();
            } catch (error) {
                console.error("Lỗi khi tải giỏ hàng:", error);
                set({
                    error: "Không thể tải giỏ hàng",
                    loading: false,
                });
            }
        },

        // Thêm sản phẩm vào giỏ hàng
        addToCart: async (variantId: number, quantity: number) => {
            set({ loading: true, error: null });
            try {
                await CartAPI.addCartItem(variantId, quantity);
                // Reload cart sau khi thêm
                await get().fetchCart();
            } catch (error) {
                console.error("Lỗi khi thêm vào giỏ hàng:", error);
                set({
                    error: "Không thể thêm sản phẩm vào giỏ hàng",
                    loading: false,
                });
                throw error;
            }
        },

        // Cập nhật số lượng sản phẩm
        updateQuantity: async (cartItemId: number, quantity: number) => {
            if (quantity < 1) return;

            set({ loading: true, error: null });
            try {
                await CartAPI.updateCartItem(cartItemId, quantity);

                // Cập nhật local state
                set((state) => ({
                    cartItems: state.cartItems.map((item) => {
                        if (item.id === cartItemId) {
                            const maxQty = item.productVariantResponse.quantity;
                            return {
                                ...item,
                                quantity: Math.min(quantity, maxQty),
                            };
                        }
                        return item;
                    }),
                    loading: false,
                }));

                recalculate();
            } catch (error) {
                console.error("Lỗi khi cập nhật số lượng:", error);
                set({
                    error: "Không thể cập nhật số lượng",
                    loading: false,
                });
                throw error;
            }
        },

        // Xóa sản phẩm khỏi giỏ hàng
        removeItem: async (cartItemId: number) => {
            set({ loading: true, error: null });
            try {
                await CartAPI.deleteCartItem(cartItemId);

                // Cập nhật local state
                set((state) => ({
                    cartItems: state.cartItems.filter((item) => item.id !== cartItemId),
                    loading: false,
                }));

                recalculate();
            } catch (error) {
                console.error("Lỗi khi xóa sản phẩm:", error);
                set({
                    error: "Không thể xóa sản phẩm",
                    loading: false,
                });
                throw error;
            }
        },

        // Xóa toàn bộ giỏ hàng
        clearCart: () => {
            set({
                cartItems: [],
                cartCount: 0,
                totalAmount: 0,
                error: null,
            });
        },
    };
});
