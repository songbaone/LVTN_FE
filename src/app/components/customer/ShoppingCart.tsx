import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { ImageWithFallback } from "../figma/ImageWithFallback";

import { toast } from "sonner";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Trash2, Plus, Minus } from "lucide-react";
import { Separator } from "../ui/separator";
import { cartService } from "../../../services/cart.service";
interface CartProduct {
  product_id: number;
  product_name: string;
  slug: string;
  thumbnail: string;
  image_url: string;
}

interface CartVariant {
  variant_id: number;
  sku: string;
  color: string | null;
  size: string | null;
  material: string | null;
  stock_quantity: number;
}

interface CartPricing {
  price: number;
  discount_price: number;
  additional_price: number;
  selling_price: number;
}

interface CartItem {
  cart_item_id: number;
  product: CartProduct;
  variant: CartVariant;
  quantity: number;
  pricing: CartPricing;
}

interface CartData {
  cart_id: number;
  total_unique_items: number;
  total_items: number;
  subtotal_amount: number;
  items: CartItem[];
}

export default function ShoppingCart() {
  const [cartDetail, setCartDetail] = useState<CartData | null>(null);
  const getAllCart = async () => {
    const res = await cartService.getCart();
    if (res.status === 200) {
      const cart: CartData = res.data.data;
      console.log(cart.total_items);
      console.log(cart.subtotal_amount);
      console.log(cart.items);
      setCartDetail(res.data.data);
    }
  };

  useEffect(() => {
    getAllCart();
  }, []);

  const modifyCart = async (cart_item_id: number, quantity: number) => {
    try {
      const res = await cartService.updateCart(cart_item_id, {
        quantity,
      });

      if (res.status === 200) {
        getAllCart();
      }
    } catch (error) {
      console.error("Update cart error:", error);
    }
  };

  const deleteItemCart = async (cart_item_id: number) => {
    try {
      const res = await cartService.deleteCart(cart_item_id);

      if (res.status === 200) {
        getAllCart();

        toast.success("Xóa sản phẩm thành công");
      }
    } catch (error) {
      console.error("delete cart error:", error);

      toast.error("Xóa sản phẩm thất bại");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>
      {cartDetail?.total_items == 0 ? (
        <div className="flex flex-col justify-center items-center gap-3">
          <div className="aspect-square rounded-lg  flex items-center justify-center mb-4 overflow-hidden">
            <ImageWithFallback
              src="/src/app/assets/image/illustration-cart-empty.png"
              className="w-50 h-50 object-cover"
            />
          </div>
          <p>Chưa có sản phẩm nào trong giỏ</p>
          <p>Cùng khám phá hàng ngàn sản phẩm tại BabyStore nhé!</p>
          <Button className="bg-accent hover:bg-accent/90" asChild>
            <Link className="text-white" to="/">
              Khám phá ngay
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartDetail?.items.map((item) => (
              <Card key={item.cart_item_id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="size-20 rounded-lg bg-secondary flex items-center justify-center text-4xl flex-shrink-0">
                      <img
                        src={`http://localhost:3000${item.product.image_url}`}
                        alt=""
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2 text-sm">
                        {item.product.product_name}
                      </h3>{" "}
                      <h3 className="font-semibold mb-2 text-sm">
                        {item.variant.color && (
                          <span>Màu sắc: {item.variant.color}</span>
                        )}
                        {item.variant.size && (
                          <span>Size: {item.variant.size}</span>
                        )}
                        {item.variant.material && (
                          <span>Chất liệu: {item.variant.material}</span>
                        )}
                      </h3>
                      <p className="text-xs line-through font-bold text-gray-500">
                        {item.pricing.price.toLocaleString()} ₫
                      </p>
                      <p className="text-sm font-bold text-accent">
                        {item.pricing.selling_price.toLocaleString()} ₫
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="size-4" />
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xóa sản phẩm?</AlertDialogTitle>

                            <AlertDialogDescription>
                              Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng
                              không?
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>

                            <AlertDialogAction
                              onClick={() => deleteItemCart(item.cart_item_id)}
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <div className="flex items-center gap-2">
                        <Button
                          disabled={item.quantity <= 1}
                          onClick={() =>
                            modifyCart(item.cart_item_id, item.quantity - 1)
                          }
                          variant="outline"
                          size="icon"
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          onClick={() =>
                            modifyCart(item.cart_item_id, item.quantity + 1)
                          }
                          variant="outline"
                          size="icon"
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Hóa đơn của bạn</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Tạm tính</span>
                    <span>
                      {cartDetail?.subtotal_amount.toLocaleString()} ₫
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Giảm giá</span>
                    <span>0 ₫</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">(Đã bao gồm VAT)</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-accent">
                      {cartDetail?.subtotal_amount.toLocaleString()} ₫
                    </span>
                  </div>
                </div>
                <Button
                  className="w-full mt-6 bg-accent hover:bg-accent/90"
                  asChild
                >
                  <Link to="/checkout">Tiến hành đặt hàng</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
