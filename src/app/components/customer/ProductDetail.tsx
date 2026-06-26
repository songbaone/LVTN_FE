import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "motion/react";
import {
  Star,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { Separator } from "../ui/separator";
import axios from "axios";
import { get } from "react-hook-form";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { cartService } from "../../../services/cart.service";
import { useCartStore } from "../../../helpers/cartStore";
interface ProductImage {
  image_id: number;
  image_url: string;
  is_main: boolean;
}

interface Category {
  category_id: number;
  category_name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  status: boolean;
}

interface Brand {
  brand_id: number;
  brand_name: string;
  logo_url: string | null;
  country: string;
  description: string | null;
  status: boolean;
}

interface Variants {
  variant_id: number;
  size: string | null;
  color: string | null;
  material: string | null;
  additional_price: number | null;
  stock_quantity: number;
  sku: string;
}

interface Product {
  product_id: number;
  product_name: string;
  slug: string;
  sku: string;

  category_id: number;
  category_name: string;

  brand_id: number;
  brand_name: string;

  description: string | null;
  short_description: string | null;

  thumbnail: string;

  price: number;
  discount_price: number;

  weight: number | null;

  age_from: number | null;
  age_to: number | null;

  status: boolean;

  created_at: string;
  updated_at: string;

  images: ProductImage[];

  variant_count: number;
  total_stock: number;

  total_rate: number;

  reviews: number;
  variants: Variants[];
}

interface dataProductDetail {
  product: Product;
  category: Category;
  brand: Brand;
}
export default function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const [emblaRef] = useEmblaCarousel({
    dragFree: true,
    containScroll: "trimSnaps",
  });
  const [productDetail, setProductDetail] = useState<dataProductDetail | null>(
    null,
  );

  const getDetailProduct = async (product_id: number) => {
    const res = await axios.get(`${API_BASE_URL}/products/${product_id}`);
    console.log("API:", res.data.data.product.images);

    if (res.status === 200) {
      setProductDetail(res.data.data);
    }
  };

  useEffect(() => {
    console.log("product_id_detail:", id);
    if (!id) return;
    const productId = Number(id);
    if (Number.isNaN(productId)) return;
    getDetailProduct(productId);
  }, [id]);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    if (productDetail?.product?.images?.length) {
      const mainImage =
        productDetail.product.images.find((img) => img.is_main) ??
        productDetail.product.images[0];

      setPreviewImage(mainImage.image_url);
    }
  }, [productDetail]);

  const relatedProducts = Array.from({ length: 4 }, (_, i) => ({
    id: i + 10,
    name: `Related Product ${i + 1}`,
    price: 350000,
    rating: 4.5,
    image: ["🍼", "🧸", "👶", "🎀"][i],
  }));

  const reviews = [
    {
      author: "Nguyễn Thu Hương",
      rating: 5,
      date: "2 days ago",
      text: "Excellent quality! My baby loves it. Very soft and comfortable material.",
      verified: true,
    },
    {
      author: "Trần Minh Anh",
      rating: 5,
      date: "1 week ago",
      text: "Great product, fast shipping. Highly recommended!",
      verified: true,
    },
    {
      author: "Lê Thanh Mai",
      rating: 4,
      date: "2 weeks ago",
      text: "Good quality but runs a bit small. Order one size up.",
      verified: true,
    },
  ];

  const hasSize = productDetail?.product?.variants?.some(
    (variant) => variant.size !== null && variant.size !== "",
  );

  const hasColor = productDetail?.product?.variants?.some(
    (variant) => variant.color !== null && variant.color !== "",
  );

  const hasMaterial = productDetail?.product?.variants?.some(
    (variant) => variant.material !== null && variant.material !== "",
  );

  const sizes = [
    ...new Set(
      productDetail?.product?.variants
        ?.map((v) => v.size)
        .filter((size) => size && size.trim() !== ""),
    ),
  ];
  const colors = [
    ...new Set(
      productDetail?.product?.variants
        ?.map((v) => v.color)
        .filter((color) => color && color.trim() !== ""),
    ),
  ];

  const materials = [
    ...new Set(
      productDetail?.product?.variants
        ?.map((v) => v.material)
        .filter((material) => material && material.trim() !== ""),
    ),
  ];
  const selectedVariant =
    selectedSize || selectedColor || selectedMaterial
      ? productDetail?.product?.variants?.find(
          (v) =>
            (!selectedSize || v.size === selectedSize) &&
            (!selectedColor || v.color === selectedColor) &&
            (!selectedMaterial || v.material === selectedMaterial),
        )
      : null;

  // handle thêm sản phẩm vào giỏ hàng
  const { fetchCart } = useCartStore(); //Cập nhật số lượng sản phẩm trong giỏ hàng
  const handleAddToCart = async () => {
    try {
      if (!selectedVariant) {
        toast.warning("Vui lòng chọn loại sản phẩm (size,...)");
        return;
      }

      const payload = {
        variant_id: selectedVariant.variant_id,
        quantity: quantity,
      };

      const res = await cartService.createCart(payload);

      if (res.status === 201 || res.status === 200) {
        await fetchCart();
        toast.success("Đã thêm thành công", {
          duration: 500,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Thêm vào giỏ hàng thất bại", {
        duration: 500,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-primary">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">
          {productDetail?.product?.product_name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden">
            <motion.img
              key={previewImage}
              src={`http://localhost:3000${previewImage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-cover transition-all duration-500 hover:scale-110"
            />
          </div>
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-3">
              {productDetail?.product?.images.map((img) => (
                <div
                  key={productDetail?.product?.product_id}
                  className="min-w-[90px]"
                >
                  <div
                    onClick={() => setPreviewImage(img.image_url)}
                    className={`
            h-24 w-24
            rounded-xl
            overflow-hidden
            cursor-pointer
            border-2
            transition-all
            duration-300
            ${
              previewImage === img.image_url
                ? "border-primary shadow-lg scale-105"
                : "border-transparent hover:border-primary hover:scale-105"
            }
          `}
                  >
                    <img
                      src={`http://localhost:3000${img.image_url}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div>
          <Badge className="mb-3 bg-accent">
            {productDetail?.brand?.brand_name}
          </Badge>
          <h1 className="text-3xl font-bold mb-3">
            {productDetail?.product?.product_name}
          </h1>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`size-5 ${i < Math.floor(productDetail?.product?.total_rate) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <span className="text-lg font-medium">
              {productDetail?.product?.total_rate}
            </span>
            <span className="text-muted-foreground">
              ({productDetail?.product?.reviews} reviews)
            </span>
          </div>

          <div className="mb-4">
            <span className="text-xs text-muted-foreground">
              SKU: {selectedVariant?.sku}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold text-accent">
              {productDetail?.product?.discount_price.toLocaleString()} ₫
            </span>
            <span className="text-xl text-muted-foreground line-through">
              {productDetail?.product?.price.toLocaleString()} ₫
            </span>
            <Badge className="bg-destructive">
              -
              {Math.round(
                ((productDetail?.product?.price -
                  productDetail?.product?.discount_price) /
                  productDetail?.product?.price) *
                  100,
              )}
              % OFF
            </Badge>
          </div>

          <div className="mb-6 space-y-3">
            {productDetail?.product?.total_stock > 0 ? (
              <Badge className="bg-green-100 text-green-700 border-green-300">
                ✓ Còn hàng
              </Badge>
            ) : (
              <Badge className="bg-red-100 text-red-700 border-red-300">
                ✕ Hết hàng
              </Badge>
            )}

            {selectedVariant && (
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Số lượng còn lại
                  </span>
                  <span className="font-semibold">
                    {selectedVariant.stock_quantity}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span className="text-muted-foreground">Giá sản phẩm</span>
                  <span className="text-xl font-bold text-primary">
                    {(
                      (productDetail.product.discount_price ??
                        productDetail.product.price) +
                      (selectedVariant.additional_price ?? 0)
                    ).toLocaleString()}
                    ₫
                  </span>
                </div>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Size Selection */}
          {hasSize && (
            <div className="mb-6">
              <label className="font-medium mb-3 block">Size</label>

              <div className="flex gap-3 flex-wrap">
                {sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {hasColor && (
            <div className="mb-6">
              <label className="font-medium mb-3 block">Màu sắc</label>

              <div className="flex gap-3 flex-wrap">
                {colors.map((color) => (
                  <Button
                    key={color}
                    variant={selectedColor === color ? "default" : "outline"}
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Material Selection */}
          {hasMaterial && (
            <div className="mb-6">
              <label className="font-medium mb-3 block">Chất liệu</label>

              <div className="flex gap-3 flex-wrap">
                {materials.map((material) => (
                  <Button
                    key={material}
                    variant={
                      selectedMaterial === material ? "default" : "outline"
                    }
                    onClick={() => setSelectedMaterial(material)}
                  >
                    {material}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {/* Quantity */}
          <div className="mb-8">
            <label className="font-medium mb-3 block">Số lượng</label>
            <div className="flex items-center gap-3 w-fit">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="size-4" />
              </Button>
              <span className="text-xl font-medium w-12 text-center">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setQuantity(
                    Math.min(productDetail?.product?.total_stock, quantity + 1),
                  )
                }
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <Button
              className="flex-1 bg-accent hover:bg-accent/90 text-lg py-6"
              disabled={productDetail?.product?.total_stock === 0}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 size-5" />
              Thêm vào giỏ hàng
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-auto px-6 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              <Heart className="size-5" />
            </Button>
          </div>

          <Button
            variant="default"
            className="w-full bg-primary hover:bg-primary/90 text-lg py-6 mb-6"
            disabled={productDetail?.product?.total_stock === 0}
          >
            Đặt hàng ngay
          </Button>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary">
              <Truck className="size-6 text-accent" />
              <span className="text-xs font-medium">
                Miễn phí vận chuyển cho đơn từ 500k
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary">
              <Shield className="size-6 text-accent" />
              <span className="text-xs font-medium">Đảm bảo chất lượng</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary">
              <RotateCcw className="size-6 text-accent" />
              <span className="text-xs font-medium">
                Hoàn trả trong vòng 7 ngày
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="description">Mô tả sản phẩm</TabsTrigger>
          <TabsTrigger value="reviews">
            Đánh giá ({productDetail?.product?.reviews})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground leading-relaxed">
                {productDetail?.product?.short_description}
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Thương hiệu: {productDetail?.product?.brand_name}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Danh mục: {productDetail?.product?.category_name}</span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span> {productDetail?.product?.description}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="space-y-4">
            {reviews.map((review, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{review.author}</span>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`size-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {review.date}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{review.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Các sản phẩm liên quan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Link to={`/product/${item.id}`}>
                  <div className="aspect-square rounded-lg bg-secondary flex items-center justify-center text-6xl mb-4 hover:bg-primary-100 transition-colors">
                    {item.image}
                  </div>
                </Link>
                <h3 className="font-medium mb-2">{item.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm">{item.rating}</span>
                </div>
                <span className="text-lg font-bold text-accent">
                  {item.price.toLocaleString()} ₫
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
