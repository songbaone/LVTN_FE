import { create } from "zustand";
import { cartService } from "../services/cart.service";

export interface CartProduct {
  product_id: number;
  product_name: string;
  slug: string;
  thumbnail: string;
  image_url: string;
}

export interface CartVariant {
  variant_id: number;
  sku: string;
  color: string | null;
  size: string | null;
  material: string | null;
  stock_quantity: number;
}

export interface CartPricing {
  price: number;
  discount_price: number;
  additional_price: number;
  selling_price: number;
}

export interface CartItem {
  cart_item_id: number;
  product: CartProduct;
  variant: CartVariant;
  quantity: number;
  pricing: CartPricing;
}

export interface CartData {
  cart_id: number;
  total_unique_items: number;
  total_items: number;
  subtotal_amount: number;
  items: CartItem[];
}

interface CartState {
  cart: CartData | null;
  loading: boolean;

  fetchCart: () => Promise<void>;
  updateQuantity: (cart_item_id: number, quantity: number) => Promise<void>;
  deleteItem: (cart_item_id: number) => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  loading: false,

  fetchCart: async () => {
    set({ loading: true });

    try {
      const res = await cartService.getCart();

      set({
        cart: res.data.data,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  updateQuantity: async (cart_item_id, quantity) => {
    await cartService.updateCart(cart_item_id, { quantity });

    const res = await cartService.getCart();

    set({
      cart: res.data.data,
    });
  },

  deleteItem: async (cart_item_id) => {
    await cartService.deleteCart(cart_item_id);

    const res = await cartService.getCart();

    set({
      cart: res.data.data,
    });
  },
}));
