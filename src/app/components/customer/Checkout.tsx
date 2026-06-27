import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";

export default function Checkout() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin nhận hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2">TÊN NGƯỜI NHẬN</Label>
                  <Input />
                </div>
                <div>
                  <Label className="mb-2">SĐT NGƯỜI NHẬN</Label>
                  <Input />
                </div>
              </div>
              <div>
                <Label className="mb-2">TỈNH/TP</Label>
                <Input />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2">HUYỆN/QUẬN</Label>
                  <Input />
                </div>
                <div>
                  <Label className="mb-2">XÃ/PHƯỜNG</Label>
                  <Input />
                </div>
              </div>

              <div>
                <Label className="mb-2">ĐỊA CHỈ NHẬN HÀNG</Label>
                <Textarea placeholder="Đường, số nhà,..." />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>PHƯƠNG THỨC THANH TOÁN</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup defaultValue="cod">
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod">Thanh toán khi nhận hàng (COD)</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="vnpay" id="vnpay" />
                  <Label htmlFor="vnpay">VNPay</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="momo" id="momo" />
                  <Label htmlFor="momo">MoMo</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>HÓA ĐƠN</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Tổng tiền tạm tính</span>
                  <span>2,270,000 ₫</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span>50,000 ₫</span>
                </div>
                <Separator />
                <div className="flex justify-between  text-lg font-bold items-center">
                  <div className="flex flex-col">
                    <span>Tổng tiền</span>
                    <span className="text-xs font-normal text-gray-400">
                      (Đã gồm VAT và được làm tròn)
                    </span>
                  </div>
                  <span className="text-accent">2,320,000 ₫</span>
                </div>
              </div>
              <Button className="w-full mt-6 bg-accent hover:bg-accent/90 text-lg text-gray-50 py-6">
                Thanh toán
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
