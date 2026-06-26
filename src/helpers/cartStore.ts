import { create } from "zustand";
import { cartService } from "../services/cart.service";

interface CartState {
  cart: any;
  fetchCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,

  fetchCart: async () => {
    const res = await cartService.getCart();

    set({
      cart: res.data.data,
    });
  },
}));
