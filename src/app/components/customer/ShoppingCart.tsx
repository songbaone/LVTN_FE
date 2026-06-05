import { Link } from "react-router";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Trash2, Plus, Minus } from "lucide-react";
import { Separator } from "../ui/separator";

export default function ShoppingCart() {
  const cartItems = [
    { id: 1, name: "Organic Cotton Onesie Set", price: 450000, quantity: 2, image: "🧸" },
    { id: 2, name: "Baby Monitor", price: 1250000, quantity: 1, image: "📹" },
    { id: 3, name: "Feeding Set", price: 320000, quantity: 3, image: "🍽️" }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 50000;
  const total = subtotal + shipping;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="size-24 rounded-lg bg-secondary flex items-center justify-center text-4xl flex-shrink-0">
                    {item.image}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{item.name}</h3>
                    <p className="text-lg font-bold text-accent">{item.price.toLocaleString()} ₫</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Button variant="ghost" size="icon"><Trash2 className="size-4" /></Button>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon"><Minus className="size-3" /></Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon"><Plus className="size-3" /></Button>
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
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between"><span>Subtotal</span><span>{subtotal.toLocaleString()} ₫</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{shipping.toLocaleString()} ₫</span></div>
                <Separator />
                <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-accent">{total.toLocaleString()} ₫</span></div>
              </div>
              <Button className="w-full mt-6 bg-accent hover:bg-accent/90" asChild>
                <Link to="/checkout">Proceed to Checkout</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
