import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Plus,
  Search,
  Filter,
  Upload,
  Download,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

export default function ProductManagement() {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  const products = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    name: `Baby Product ${i + 1}`,
    sku: `SKU-00${i + 1}`,
    category: ["Clothing", "Feeding", "Toys", "Nursery"][i % 4],
    brand: ["BabyComfort", "SafeFeed", "SmartBaby"][i % 3],
    price: Math.floor(Math.random() * 1000000) + 200000,
    stock: Math.floor(Math.random() * 100) + 5,
    status: i % 5 === 0 ? "Hết hàng" : "Còn hàng",
    image: "🧸",
  }));

  const toggleProduct = (id: number) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    setSelectedProducts(
      selectedProducts.length === products.length
        ? []
        : products.map((p) => p.id),
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Quản lí sản phẩm</h1>
          <p className="text-muted-foreground">
            Quản lý danh mục sản phẩm của bạn
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/admin/products/import">
              <Upload className="size-4 mr-2" />
              Nhập danh sách sản phẩm
            </Link>
          </Button>
          <Button variant="outline">
            <Download className="size-4 mr-2" />
            Xuất danh sách sản phẩm
          </Button>
          <Button className="bg-accent hover:bg-accent/90" asChild>
            <Link to="/admin/products/new">
              <Plus className="size-4 mr-2" />
              Thêm sản phẩm mới{" "}
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm thông tin sản phẩm...."
                className="pl-10"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                <SelectItem value="clothing">Quần áo</SelectItem>
                <SelectItem value="feeding">Đồ chơi</SelectItem>
                <SelectItem value="toys">Sữa</SelectItem>
                <SelectItem value="nursery">Gia dụng</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="in-stock">Có sẳn</SelectItem>
                <SelectItem value="out-of-stock">Hết hàng</SelectItem>
                <SelectItem value="low-stock">Số lượng còn ít</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <Card className="mb-4 border-accent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {selectedProducts.length} sản phẩm đã chọn
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Chỉnh sửa hàng loạt
                </Button>
                <Button variant="outline" size="sm">
                  Xuất file danh sách đã chọn
                </Button>
                <Button variant="destructive" size="sm">
                  Xóa những sản phẩm đã chọn
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProducts.length === products.length}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Thương hiệu</TableHead>
                <TableHead>Đơn giá</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => toggleProduct(product.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-lg bg-secondary flex items-center justify-center text-2xl flex-shrink-0">
                        {product.image}
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.sku}
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell className="font-medium">
                    {product.price.toLocaleString()} ₫
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        product.stock < 10
                          ? "bg-destructive/10 text-destructive"
                          : ""
                      }
                    >
                      {product.stock}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        product.status === "Còn hàng"
                          ? "bg-success"
                          : "bg-destructive"
                      }
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/product/${product.id}`}>
                            <Eye className="size-4 mr-2" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/products/${product.id}/edit`}>
                            <Edit className="size-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-muted-foreground">
          Showing 1 to {products.length} of 856 products
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="default" size="sm" className="bg-primary">
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            3
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
