import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Separator } from "../ui/separator";

export default function Checkout() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>First Name</Label><Input /></div>
                <div><Label>Last Name</Label><Input /></div>
              </div>
              <div><Label>Phone Number</Label><Input /></div>
              <div><Label>Address</Label><Input /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>City</Label><Input /></div>
                <div><Label>District</Label><Input /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
            <CardContent>
              <RadioGroup defaultValue="cod">
                <div className="flex items-center space-x-2 p-3 border rounded-lg"><RadioGroupItem value="cod" id="cod" /><Label htmlFor="cod">Cash on Delivery (COD)</Label></div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg"><RadioGroupItem value="vnpay" id="vnpay" /><Label htmlFor="vnpay">VNPay</Label></div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg"><RadioGroupItem value="momo" id="momo" /><Label htmlFor="momo">MoMo</Label></div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between"><span>Subtotal</span><span>2,270,000 ₫</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>50,000 ₫</span></div>
                <Separator />
                <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-accent">2,320,000 ₫</span></div>
              </div>
              <Button className="w-full mt-6 bg-accent hover:bg-accent/90 text-lg py-6">Place Order</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
