import { Link } from "react-router";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Star,
  Heart,
  ShoppingCart,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Gift,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

export default function HomePage() {
  const heroSlides = [
    {
      title: "Summer Sale 2026",
      subtitle: "Up to 50% OFF on Baby Clothing",
      cta: "Shop Now",
      bg: "bg-gradient-to-r from-primary-200 to-primary-300",
    },
    {
      title: "New Arrivals",
      subtitle: "Explore Our Latest Collection",
      cta: "Discover",
      bg: "bg-gradient-to-r from-accent/20 to-accent/30",
    },
    {
      title: "Free Shipping",
      subtitle: "On Orders Over 500,000 VND",
      cta: "Start Shopping",
      bg: "bg-gradient-to-r from-primary-100 to-secondary",
    },
  ];

  const categories = [
    { name: "Clothing & Apparel", icon: "👕", count: 245 },
    { name: "Feeding & Nursing", icon: "🍼", count: 189 },
    { name: "Diapers & Bath", icon: "🛁", count: 156 },
    { name: "Toys & Entertainment", icon: "🧸", count: 312 },
    { name: "Nursery & Gear", icon: "🛏️", count: 98 },
    { name: "Health & Safety", icon: "💊", count: 127 },
  ];

  const featuredProducts = [
    {
      id: 1,
      name: "Organic Cotton Onesie Set",
      brand: "BabyComfort",
      price: 450000,
      originalPrice: 650000,
      rating: 4.8,
      reviews: 124,
      image: "🧸",
      discount: 30,
      badge: "Best Seller",
    },
    {
      id: 2,
      name: "Silicone Baby Feeding Set",
      brand: "SafeFeed",
      price: 320000,
      originalPrice: null,
      rating: 4.9,
      reviews: 89,
      image: "🍽️",
      badge: "New",
    },
    {
      id: 3,
      name: "Premium Baby Monitor",
      brand: "SmartBaby",
      price: 1250000,
      originalPrice: 1500000,
      rating: 4.7,
      reviews: 56,
      image: "📹",
      discount: 17,
    },
    {
      id: 4,
      name: "Soft Plush Toy Collection",
      brand: "CuddleTime",
      price: 280000,
      originalPrice: null,
      rating: 5.0,
      reviews: 203,
      image: "🧸",
      badge: "Top Rated",
    },
  ];

  const brands = [
    "Fisher-Price",
    "Pampers",
    "Johnson's Baby",
    "Chicco",
    "Graco",
    "Huggies",
  ];

  const reviews = [
    {
      author: "Nguyễn Thu Hương",
      rating: 5,
      text: "Excellent quality products! Fast shipping and great customer service.",
      product: "Organic Cotton Onesie Set",
      date: "2 days ago",
    },
    {
      author: "Trần Minh Anh",
      rating: 5,
      text: "Very happy with my purchase. The products are exactly as described.",
      product: "Baby Monitor",
      date: "1 week ago",
    },
    {
      author: "Lê Thanh Mai",
      rating: 4,
      text: "Good selection of products. Prices are reasonable.",
      product: "Feeding Set",
      date: "2 weeks ago",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Carousel */}
      <section className="container mx-auto px-4 py-8">
        <Carousel className="w-full" opts={{ loop: true }}>
          <CarouselContent>
            {heroSlides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className={`${slide.bg} rounded-2xl p-12 md:p-16 lg:p-20`}>
                  <div className="max-w-2xl">
                    <Badge className="mb-4 bg-accent">{slide.title}</Badge>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                      {slide.subtitle}
                    </h1>
                    <Button
                      size="lg"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      {slide.cta} <ArrowRight className="ml-2 size-5" />
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Danh mục sản phẩm</h2>
          <Link to="/products">
            <Button variant="ghost">
              Xem tất cả <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/products?category=${category.name}`}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary-200">
                <CardContent className="pt-6 text-center">
                  <div className="text-5xl mb-3">{category.icon}</div>
                  <h3 className="font-medium text-sm mb-1">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {category.count} sản phẩm
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Sale */}
      <section className="bg-gradient-to-r from-accent/10 to-accent/5 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="size-8 text-accent" />
            <h2 className="text-3xl font-bold">Flash Sale</h2>
            <Badge className="bg-destructive">
              Kết thúc trong vòng 2:45:30
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product) => (
              <Card
                key={product.id}
                className="group hover:shadow-xl transition-shadow"
              >
                <CardHeader className="relative">
                  {product.badge && (
                    <Badge className="absolute top-4 left-4 z-10 bg-accent">
                      {product.badge}
                    </Badge>
                  )}
                  {product.discount && (
                    <Badge className="absolute top-4 right-4 z-10 bg-destructive">
                      -{product.discount}%
                    </Badge>
                  )}
                  <div className="aspect-square rounded-lg bg-secondary flex items-center justify-center text-7xl mb-4">
                    {product.image}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                  >
                    <Heart className="size-5" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-1">
                    {product.brand}
                  </p>
                  <h3 className="font-semibold mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium">
                      {product.rating}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({product.reviews})
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-accent">
                      {product.price.toLocaleString()} ₫
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {product.originalPrice.toLocaleString()} ₫
                      </span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button
                    className="flex-1 bg-accent hover:bg-accent/90"
                    asChild
                  >
                    <Link to={`/product/${product.id}`}>
                      <ShoppingCart className="size-4 mr-2" /> Add to Cart
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="size-8 text-primary" />
          <h2 className="text-3xl font-bold">Best Sellers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Card
              key={product.id}
              className="group hover:shadow-xl transition-shadow"
            >
              <CardHeader className="relative">
                {product.badge && (
                  <Badge className="absolute top-4 left-4 z-10 bg-accent">
                    {product.badge}
                  </Badge>
                )}
                <div className="aspect-square rounded-lg bg-secondary flex items-center justify-center text-7xl mb-4">
                  {product.image}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                >
                  <Heart className="size-5" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-1">
                  {product.brand}
                </p>
                <h3 className="font-semibold mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({product.reviews})
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-accent">
                    {product.price.toLocaleString()} ₫
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {product.originalPrice.toLocaleString()} ₫
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="outline" size="icon">
                  <Heart className="size-4" />
                </Button>
                <Button className="flex-1 bg-accent hover:bg-accent/90" asChild>
                  <Link to={`/product/${product.id}`}>Add to Cart</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Brands */}
      <section className="bg-secondary/30 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Featured Brands
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {brands.map((brand) => (
              <Card
                key={brand}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardContent className="p-6 text-center">
                  <div className="font-semibold text-primary">{brand}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-6 text-center">
          What Our Customers Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <p className="text-sm mb-4">{review.text}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">
                      {review.author}
                    </p>
                    <p>{review.product}</p>
                  </div>
                  <span>{review.date}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-primary/10 py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <Gift className="size-12 mx-auto mb-4 text-accent" />
          <h2 className="text-3xl font-bold mb-4">Join Our Newsletter</h2>
          <p className="text-muted-foreground mb-6">
            Get exclusive offers, parenting tips, and updates on new products
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-border bg-card"
            />
            <Button className="bg-accent hover:bg-accent/90" size="lg">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
