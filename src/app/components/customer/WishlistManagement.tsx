import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Grid3x3,
  List,
  Search,
  Star,
  DollarSign,
  Package,
  Filter,
  CheckSquare,
  Square
} from "lucide-react";
import { toast } from "sonner";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  category: string;
  stock: number;
  image: string;
  addedDate: string;
}

export default function WishlistManagement() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [items, setItems] = useState<WishlistItem[]>([
    {
      id: "1",
      name: "Organic Cotton Onesie Set - 3 Pack",
      price: 450000,
      originalPrice: 550000,
      rating: 4.8,
      reviews: 124,
      category: "Baby Clothing",
      stock: 45,
      image: "🧸",
      addedDate: "2026-06-01"
    },
    {
      id: "2",
      name: "Baby Monitor Premium with Night Vision",
      price: 1250000,
      rating: 4.9,
      reviews: 89,
      category: "Smart Monitoring",
      stock: 12,
      image: "📹",
      addedDate: "2026-05-28"
    },
    {
      id: "3",
      name: "Silicone Feeding Set - BPA Free",
      price: 320000,
      originalPrice: 400000,
      rating: 4.7,
      reviews: 203,
      category: "Feeding",
      stock: 0,
      image: "🍽️",
      addedDate: "2026-05-25"
    },
    {
      id: "4",
      name: "Baby Stroller Lightweight with Canopy",
      price: 2850000,
      rating: 4.6,
      reviews: 67,
      category: "Travel",
      stock: 8,
      image: "🚼",
      addedDate: "2026-05-20"
    },
    {
      id: "5",
      name: "Diaper Bag Backpack Multi-Pocket",
      price: 680000,
      originalPrice: 850000,
      rating: 4.9,
      reviews: 156,
      category: "Accessories",
      stock: 23,
      image: "🎒",
      addedDate: "2026-05-15"
    },
    {
      id: "6",
      name: "Wooden Educational Toy Set",
      price: 540000,
      rating: 4.8,
      reviews: 92,
      category: "Toys",
      stock: 34,
      image: "🧩",
      addedDate: "2026-05-10"
    }
  ]);

  const categories = ["all", ...Array.from(new Set(items.map(item => item.category)))];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "name":
        return a.name.localeCompare(b.name);
      case "recent":
      default:
        return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
    }
  });

  const handleRemove = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    toast.success("Item removed from wishlist");
  };

  const handleMoveToCart = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item && item.stock > 0) {
      toast.success(`${item.name} added to cart`);
    } else {
      toast.error("Item is out of stock");
    }
  };

  const handleBulkMoveToCart = () => {
    const inStockItems = selectedItems.filter(id => {
      const item = items.find(i => i.id === id);
      return item && item.stock > 0;
    });

    if (inStockItems.length === 0) {
      toast.error("No in-stock items selected");
      return;
    }

    toast.success(`${inStockItems.length} items added to cart`);
    setSelectedItems([]);
  };

  const handleBulkRemove = () => {
    setItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
    toast.success(`${selectedItems.length} items removed from wishlist`);
    setSelectedItems([]);
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge className="bg-destructive">Out of Stock</Badge>;
    } else if (stock < 10) {
      return <Badge className="bg-warning">Low Stock</Badge>;
    } else {
      return <Badge className="bg-success">In Stock</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
        <p className="text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"} saved for later
        </p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="size-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Heart className="size-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Save items you love to your wishlist and add them to cart later
            </p>
            <Button className="bg-accent hover:bg-accent/90">
              <ShoppingCart className="size-4 mr-2" />
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Toolbar */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search wishlist..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Category Filter */}
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="size-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.filter(c => c !== "all").map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recently Added</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="name">Name: A-Z</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3x3 className="size-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedItems.length > 0 && (
                <div className="mt-4 p-4 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {selectedItems.length} {selectedItems.length === 1 ? "item" : "items"} selected
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkMoveToCart}
                    >
                      <ShoppingCart className="size-3 mr-1" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkRemove}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Select All */}
          {filteredItems.length > 0 && (
            <div className="mb-4 flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
              >
                {selectedItems.length === filteredItems.length ? (
                  <CheckSquare className="size-4 text-accent" />
                ) : (
                  <Square className="size-4" />
                )}
                <span>Select All ({filteredItems.length})</span>
              </button>
            </div>
          )}

          {/* Items Grid/List */}
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="size-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Search className="size-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground text-center">
                  Try adjusting your search or filter criteria
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className={`group hover:shadow-lg transition-all ${selectedItems.includes(item.id) ? "border-2 border-accent" : ""} ${viewMode === "list" ? "flex flex-row" : ""}`}
                >
                  <CardContent className={`${viewMode === "grid" ? "p-4" : "p-4 flex items-center gap-4 flex-1"}`}>
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleSelectItem(item.id)}
                      className="mb-3 md:mb-0"
                    >
                      {selectedItems.includes(item.id) ? (
                        <CheckSquare className="size-5 text-accent" />
                      ) : (
                        <Square className="size-5 text-muted-foreground hover:text-accent transition-colors" />
                      )}
                    </button>

                    {/* Product Image */}
                    <div className={`${viewMode === "grid" ? "mb-4" : ""} ${viewMode === "list" ? "size-24" : "size-full aspect-square"} rounded-lg bg-secondary flex items-center justify-center text-6xl flex-shrink-0`}>
                      {item.image}
                    </div>

                    {/* Product Info */}
                    <div className={viewMode === "list" ? "flex-1" : ""}>
                      <div className="mb-2">
                        <Badge variant="outline" className="text-xs mb-2">
                          {item.category}
                        </Badge>
                        <h3 className="font-semibold mb-1 line-clamp-2">{item.name}</h3>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="size-4 fill-warning text-warning" />
                          <span className="font-medium">{item.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({item.reviews} reviews)
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-xl font-bold text-accent">
                          {item.price.toLocaleString()} ₫
                        </span>
                        {item.originalPrice && (
                          <>
                            <span className="text-sm text-muted-foreground line-through">
                              {item.originalPrice.toLocaleString()} ₫
                            </span>
                            <Badge className="bg-destructive text-xs">
                              -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                            </Badge>
                          </>
                        )}
                      </div>

                      <div className="mb-4">
                        {getStockBadge(item.stock)}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-accent hover:bg-accent/90"
                          size="sm"
                          onClick={() => handleMoveToCart(item.id)}
                          disabled={item.stock === 0}
                        >
                          <ShoppingCart className="size-3 mr-1" />
                          {item.stock === 0 ? "Out of Stock" : "Add to Cart"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemove(item.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
