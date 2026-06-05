import { useState } from "react";
import { Link, useParams } from "react-router";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Star, Heart, ShoppingCart, Minus, Plus, Truck, Shield, RotateCcw } from "lucide-react";
import { Separator } from "../ui/separator";

export default function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("Medium");
  const [selectedColor, setSelectedColor] = useState("Pink");

  const product = {
    id: id || "1",
    name: "Organic Cotton Onesie Set - Premium Baby Clothing",
    brand: "BabyComfort",
    sku: "BC-OCS-001",
    price: 450000,
    originalPrice: 650000,
    rating: 4.8,
    reviews: 124,
    stock: 15,
    description: "Premium organic cotton onesie set perfect for your baby's sensitive skin. Made with 100% certified organic cotton, breathable and soft fabric ensures maximum comfort throughout the day.",
    images: ["🧸", "👶", "🎀", "💝"],
    sizes: ["Small", "Medium", "Large"],
    colors: ["Pink", "Blue", "White", "Yellow"],
    specifications: {
      Material: "100% Organic Cotton",
      Age: "0-12 months",
      Care: "Machine washable",
      Origin: "Vietnam",
      Certification: "GOTS Certified"
    }
  };

  const relatedProducts = Array.from({ length: 4 }, (_, i) => ({
    id: i + 10,
    name: `Related Product ${i + 1}`,
    price: 350000,
    rating: 4.5,
    image: ["🍼", "🧸", "👶", "🎀"][i]
  }));

  const reviews = [
    {
      author: "Nguyễn Thu Hương",
      rating: 5,
      date: "2 days ago",
      text: "Excellent quality! My baby loves it. Very soft and comfortable material.",
      verified: true
    },
    {
      author: "Trần Minh Anh",
      rating: 5,
      date: "1 week ago",
      text: "Great product, fast shipping. Highly recommended!",
      verified: true
    },
    {
      author: "Lê Thanh Mai",
      rating: 4,
      date: "2 weeks ago",
      text: "Good quality but runs a bit small. Order one size up.",
      verified: true
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-primary">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div>
          <div className="aspect-square rounded-2xl bg-secondary flex items-center justify-center text-[200px] mb-4">
            {product.images[0]}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, i) => (
              <div key={i} className="aspect-square rounded-lg bg-secondary flex items-center justify-center text-5xl cursor-pointer hover:bg-primary-100 transition-colors border-2 border-transparent hover:border-primary">
                {img}
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <Badge className="mb-3 bg-accent">{product.brand}</Badge>
          <h1 className="text-3xl font-bold mb-3">{product.name}</h1>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`size-5 ${i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <span className="text-lg font-medium">{product.rating}</span>
            <span className="text-muted-foreground">({product.reviews} reviews)</span>
          </div>

          <div className="mb-4">
            <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold text-accent">
              {product.price.toLocaleString()} ₫
            </span>
            <span className="text-xl text-muted-foreground line-through">
              {product.originalPrice.toLocaleString()} ₫
            </span>
            <Badge className="bg-destructive">
              -{Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
            </Badge>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <Badge variant="secondary" className="bg-success/10 text-success border-success">
                In Stock ({product.stock} available)
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive">
                Out of Stock
              </Badge>
            )}
          </div>

          <Separator className="my-6" />

          {/* Size Selection */}
          <div className="mb-6">
            <label className="font-medium mb-3 block">Size</label>
            <div className="flex gap-3">
              {product.sizes.map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  onClick={() => setSelectedSize(size)}
                  className={selectedSize === size ? "bg-primary" : ""}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-6">
            <label className="font-medium mb-3 block">Color</label>
            <div className="flex gap-3">
              {product.colors.map((color) => (
                <Button
                  key={color}
                  variant={selectedColor === color ? "default" : "outline"}
                  onClick={() => setSelectedColor(color)}
                  className={selectedColor === color ? "bg-primary" : ""}
                >
                  {color}
                </Button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-8">
            <label className="font-medium mb-3 block">Quantity</label>
            <div className="flex items-center gap-3 w-fit">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="size-4" />
              </Button>
              <span className="text-xl font-medium w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <Button
              className="flex-1 bg-accent hover:bg-accent/90 text-lg py-6"
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-2 size-5" />
              Add to Cart
            </Button>
            <Button variant="outline" size="icon" className="h-auto px-6 border-accent text-accent hover:bg-accent hover:text-accent-foreground">
              <Heart className="size-5" />
            </Button>
          </div>

          <Button variant="default" className="w-full bg-primary hover:bg-primary/90 text-lg py-6 mb-6" disabled={product.stock === 0}>
            Buy Now
          </Button>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary">
              <Truck className="size-6 text-accent" />
              <span className="text-xs font-medium">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary">
              <Shield className="size-6 text-accent" />
              <span className="text-xs font-medium">Quality Guarantee</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary">
              <RotateCcw className="size-6 text-accent" />
              <span className="text-xs font-medium">30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({product.reviews})</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Certified organic cotton for sensitive baby skin</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Breathable and comfortable for all-day wear</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Easy snap closures for quick diaper changes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Machine washable and durable</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="specifications" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex py-2 border-b border-border last:border-0">
                    <span className="font-medium w-40">{key}</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
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
                          <Badge variant="secondary" className="text-xs">Verified Purchase</Badge>
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
                    <span className="text-sm text-muted-foreground">{review.date}</span>
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
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
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
                <span className="text-lg font-bold text-accent">{item.price.toLocaleString()} ₫</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
