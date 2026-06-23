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
import axios from "axios";
import { useEffect, useState } from "react";

interface dataCategories {
  category_id: number;
  category_name: string;
  slug: string;
  description: string;
  image_url: string;
  status: boolean;
  parent_id: number | null;
}

interface dataBrand {
  brand_id: number;
  brand_name: string;
  logo_url: string;
  country: string;
  description: string;
}
import { Skeleton } from "../ui/skeleton";
export default function HomePage() {
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const heroSlides = [
    {
      title: "Khuyến mãi mùa hè 2026",
      subtitle: "Giảm giá đến 50% cho quần áo trẻ em",
      cta: "Mua ngay",
      bg: "bg-gradient-to-r from-primary-200 to-primary-300",
    },
    {
      title: "Sản phẩm mới",
      subtitle: "Khám phá bộ sưu tập mới nhất",
      cta: "Khám phá",
      bg: "bg-gradient-to-r from-accent/20 to-accent/30",
    },
    {
      title: "Miễn phí vận chuyển",
      subtitle: "Cho đơn hàng trên 500.000₫",
      cta: "Mua sắm ngay",
      bg: "bg-gradient-to-r from-primary-100 to-secondary",
    },
  ];

  const [listCategories, setListCategories] = useState<dataCategories[]>([]);
  const [loading, setLoading] = useState(true);

  const getListCategories = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_BASE_URL}/categories/?page=1&limit=12`,
      );

      if (res.status === 200) {
        setListCategories(res.data.data.categories);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const [listBrand, setListBrand] = useState<dataBrand[]>([]);

  const getListBrands = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_BASE_URL}/brands?limit=6`);

      if (res.status === 200) {
        setListBrand(res.data.data.brands);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getListCategories();
    getListBrands();
  }, []);

  const featuredProducts = [
    {
      id: 1,
      name: "Bộ bodysuit cotton hữu cơ",
      brand: "BabyComfort",
      price: 450000,
      originalPrice: 650000,
      rating: 4.8,
      reviews: 124,
      image: "🧸",
      discount: 30,
      badge: "Bán chạy nhất",
    },
    {
      id: 2,
      name: "Bộ dụng cụ ăn dặm silicone",
      brand: "SafeFeed",
      price: 320000,
      originalPrice: null,
      rating: 4.9,
      reviews: 89,
      image: "🍽️",
      badge: "Mới",
    },
    {
      id: 3,
      name: "Máy theo dõi trẻ em cao cấp",
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
      name: "Bộ thú nhồi bông mềm",
      brand: "CuddleTime",
      price: 280000,
      originalPrice: null,
      rating: 5.0,
      reviews: 203,
      image: "🧸",
      badge: "Đánh giá cao nhất",
    },
  ];

  const reviews = [
    {
      author: "Nguyễn Thu Hương",
      rating: 5,
      text: "Sản phẩm chất lượng tuyệt vời! Giao hàng nhanh và dịch vụ khách hàng tốt.",
      product: "Bộ bodysuit cotton hữu cơ",
      date: "2 ngày trước",
    },
    {
      author: "Trần Minh Anh",
      rating: 5,
      text: "Rất hài lòng với đơn hàng. Sản phẩm đúng như mô tả.",
      product: "Máy theo dõi trẻ em",
      date: "1 tuần trước",
    },
    {
      author: "Lê Thanh Mai",
      rating: 4,
      text: "Nhiều sản phẩm để lựa chọn. Giá cả hợp lý.",
      product: "Bộ dụng cụ ăn dặm",
      date: "2 tuần trước",
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
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="pt-6 text-center">
                    <Skeleton className="h-16 w-16 mx-auto rounded-full mb-3" />
                    <Skeleton className="h-4 w-24 mx-auto mb-2" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                  </CardContent>
                </Card>
              ))
            : listCategories.map((category) => (
                <Link
                  key={category.category_id}
                  to={`/products?category=${category.category_name}`}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6 text-center">
                      <div className="text-5xl mb-3">{category.image_url}</div>

                      <h3 className="font-medium text-sm mb-1">
                        {category.category_name}
                      </h3>

                      <p className="text-xs text-muted-foreground">
                        {category.slug}
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
            <Badge className="bg-destructive">Kết thúc sau 2:45:30</Badge>
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
                      <ShoppingCart className="size-4 mr-2" /> Thêm vào giỏ hàng
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
          <h2 className="text-3xl font-bold">Bán chạy nhất</h2>
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
                  <Link to={`/product/${product.id}`}>Thêm vào giỏ hàng</Link>
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
            Thương hiệu nổi bật
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {listBrand.map((brand) => (
              <Card
                key={brand.brand_id}
                className="hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
              >
                <CardContent className="p-4 flex flex-col items-center">
                  {brand.logo_url ? (
                    <img
                      src={`${API_BASE_URL.replace("/api/v1", "")}${brand.logo_url}`}
                      alt={brand.brand_name}
                      className="h-12 object-contain mb-3"
                    />
                  ) : (
                    <div className="h-12 flex items-center justify-center text-lg font-bold mb-3">
                      {brand.brand_name.charAt(0)}
                    </div>
                  )}

                  <div className="font-semibold text-center">
                    {brand.brand_name}
                  </div>
                </CardContent>
                <CardContent className="p-6 text-center">
                  <div className="font-semibold text-primary">
                    {brand.brand_name}
                  </div>

                  <div className="text-xs text-muted-foreground mt-2">
                    {brand.country}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Khách hàng nói gì về chúng tôi
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
          <h2 className="text-3xl font-bold mb-4">Đăng ký nhận tin</h2>
          <p className="text-muted-foreground mb-6">
            Nhận ưu đãi độc quyền, mẹo nuôi dạy con và cập nhật sản phẩm mới
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 px-4 py-3 rounded-lg border border-border bg-card"
            />
            <Button className="bg-accent hover:bg-accent/90" size="lg">
              Đăng ký
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
