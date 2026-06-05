import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Star, Heart, ShoppingCart, Grid3x3, List, Filter } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";

export default function ProductListing() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState([0, 2000000]);

  const products = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Baby Product ${i + 1}`,
    brand: ["BabyComfort", "SafeFeed", "SmartBaby", "CuddleTime"][i % 4],
    price: Math.floor(Math.random() * 1000000) + 200000,
    originalPrice: i % 3 === 0 ? Math.floor(Math.random() * 1500000) + 500000 : null,
    rating: (Math.random() * 1.5 + 3.5).toFixed(1),
    reviews: Math.floor(Math.random() * 200) + 10,
    image: ["🧸", "🍼", "👶", "🛏️"][i % 4],
    inStock: i % 5 !== 0
  }));

  const categories = [
    "Clothing & Apparel",
    "Feeding & Nursing",
    "Diapers & Bath",
    "Toys & Entertainment",
    "Nursery & Gear",
    "Health & Safety"
  ];

  const brands = ["BabyComfort", "SafeFeed", "SmartBaby", "CuddleTime", "TinyToes", "LittleJoy"];
  const ages = ["0-3 months", "3-6 months", "6-12 months", "1-2 years", "2+ years"];

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center gap-2">
              <Checkbox id={cat} />
              <Label htmlFor={cat} className="text-sm cursor-pointer">
                {cat}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Brands</h3>
        <div className="space-y-2">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center gap-2">
              <Checkbox id={brand} />
              <Label htmlFor={brand} className="text-sm cursor-pointer">
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={2000000}
          step={50000}
          className="mb-2"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{priceRange[0].toLocaleString()} ₫</span>
          <span>{priceRange[1].toLocaleString()} ₫</span>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Age Range</h3>
        <div className="space-y-2">
          {ages.map((age) => (
            <div key={age} className="flex items-center gap-2">
              <Checkbox id={age} />
              <Label htmlFor={age} className="text-sm cursor-pointer">
                {age}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Rating</h3>
        <div className="space-y-2">
          {[5, 4, 3].map((rating) => (
            <div key={rating} className="flex items-center gap-2">
              <Checkbox id={`rating-${rating}`} />
              <Label htmlFor={`rating-${rating}`} className="flex items-center gap-1 text-sm cursor-pointer">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <span>{rating}+</span>
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Products</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters - Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Filters</h2>
            <FilterSidebar />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">All Products</h1>
              <p className="text-sm text-muted-foreground">{products.length} products found</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <Filter className="size-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select defaultValue="popular">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="hidden sm:flex border border-border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-primary" : ""}
                >
                  <Grid3x3 className="size-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-primary" : ""}
                >
                  <List className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          <div className={viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
            : "flex flex-col gap-4"
          }>
            {products.map((product) => (
              viewMode === "grid" ? (
                <Card key={product.id} className="group hover:shadow-xl transition-shadow">
                  <CardHeader className="relative">
                    {!product.inStock && (
                      <Badge className="absolute top-4 left-4 z-10 bg-muted">
                        Out of Stock
                      </Badge>
                    )}
                    {product.originalPrice && (
                      <Badge className="absolute top-4 right-4 z-10 bg-destructive">
                        -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                      </Badge>
                    )}
                    <Link to={`/product/${product.id}`}>
                      <div className="aspect-square rounded-lg bg-secondary flex items-center justify-center text-7xl mb-4 cursor-pointer hover:bg-primary-50 transition-colors">
                        {product.image}
                      </div>
                    </Link>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                    >
                      <Heart className="size-5" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-semibold mb-2 line-clamp-2 hover:text-accent transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="size-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                      <span className="text-xs text-muted-foreground">({product.reviews})</span>
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
                      variant="outline"
                      size="icon"
                      className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                    >
                      <Heart className="size-4" />
                    </Button>
                    <Button
                      className="flex-1 bg-accent hover:bg-accent/90"
                      disabled={!product.inStock}
                    >
                      <ShoppingCart className="size-4 mr-2" />
                      {product.inStock ? "Add to Cart" : "Out of Stock"}
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                  <div className="flex gap-4 p-4">
                    <Link to={`/product/${product.id}`} className="relative flex-shrink-0">
                      <div className="w-40 h-40 rounded-lg bg-secondary flex items-center justify-center text-5xl hover:bg-primary-50 transition-colors">
                        {product.image}
                      </div>
                      {product.originalPrice && (
                        <Badge className="absolute top-2 left-2 bg-destructive">
                          -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                        </Badge>
                      )}
                    </Link>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                        <Link to={`/product/${product.id}`}>
                          <h3 className="font-semibold text-lg mb-2 hover:text-accent transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1 mb-3">
                          <Star className="size-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium">{product.rating}</span>
                          <span className="text-xs text-muted-foreground">({product.reviews} reviews)</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-accent">
                              {product.price.toLocaleString()} ₫
                            </span>
                            {product.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                {product.originalPrice.toLocaleString()} ₫
                              </span>
                            )}
                          </div>
                          {!product.inStock && (
                            <Badge variant="secondary" className="mt-1">Out of Stock</Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon">
                            <Heart className="size-4" />
                          </Button>
                          <Button
                            className="bg-accent hover:bg-accent/90"
                            disabled={!product.inStock}
                          >
                            <ShoppingCart className="size-4 mr-2" />
                            {product.inStock ? "Add to Cart" : "Out of Stock"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              <Button variant="outline" disabled>Previous</Button>
              <Button variant="default" className="bg-primary">1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">Next</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
