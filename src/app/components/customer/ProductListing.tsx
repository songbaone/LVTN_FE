import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Star,
  Heart,
  ShoppingCart,
  Grid3x3,
  List,
  Filter,
  ChevronRight,
  ChevronDown,
  Search,
  AlertCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Skeleton } from "../ui/skeleton";
import { categoryService } from "../../../services/category.service";
import { brandService } from "../../../services/brand.service";
import { productService } from "../../../services/product.service";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { ImageWithFallback } from "../figma/ImageWithFallback";

// ─── Types ───────────────────────────────────────────────
interface CategoryNode {
  category_id: number;
  category_name: string;
  description: string;
  status: boolean;
  children: CategoryNode[];
}

interface BrandNode {
  brand_id: number;
  brand_name: string;
  logo_url: string | null;
  country: string;
  status: boolean;
}

interface ProductImage {
  image_url: string;
}

interface ProductNode {
  product_id: number;
  product_name: string;
  slug: string;
  category_id: number;
  category_name: string;
  brand_id: number;
  brand_name: string;
  thumbnail: string | null;
  price: number;
  discount_price: number | null;
  status: boolean;
  total_stock: number;
  images: ProductImage[];
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── Constants ────────────────────────────────────────────
const DEFAULT_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4=";
const DEBOUNCE_MS = 500;
const DEFAULT_PAGE_SIZE = 12;
interface PriceRange {
  label: string;
  min_price?: number;
  max_price?: number;
}

const PRICE_RANGES: PriceRange[] = [
  { label: "Dưới 100.000đ", max_price: 100000 },
  { label: "100.000đ - 300.000đ", min_price: 100000, max_price: 300000 },
  { label: "300.000đ - 500.000đ", min_price: 300000, max_price: 500000 },
  { label: "500.000đ - 1.000.000đ", min_price: 500000, max_price: 1000000 },
  { label: "Trên 1.000.000đ", min_price: 1000000 },
];

// ─── Helpers ──────────────────────────────────────────────
const getProductImage = (product: ProductNode): string => {
  if (product.thumbnail) {
    return product.thumbnail.startsWith("http")
      ? product.thumbnail
      : import.meta.env.VITE_API_URL + product.thumbnail;
  }
  if (product.images?.[0]?.image_url) {
    return product.images[0].image_url.startsWith("http")
      ? product.images[0].image_url
      : import.meta.env.VITE_API_URL + product.images[0].image_url;
  }
  return DEFAULT_PLACEHOLDER;
};

const formatPrice = (price: number): string => {
  return price.toLocaleString("vi-VN") + " ₫";
};

// ─── Component ────────────────────────────────────────────
export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();

  // View mode
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // ── Products state ──
  const [products, setProducts] = useState<ProductNode[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData | null>(null);

  // ── Filter state (synced with URL, derived via string keys to avoid reference instability) ──
  const paramsStr = useMemo(() => searchParams.toString(), [searchParams]);
  const currentPage = useMemo(() => Number(searchParams.get("page")) || 1, [paramsStr]);
  const searchQuery = useMemo(() => searchParams.get("product_name") || "", [paramsStr]);
  const selectedCategoryId = useMemo(() => {
    const val = searchParams.get("category_id");
    return val ? Number(val) : null;
  }, [paramsStr]);
  const selectedBrandIds: number[] = useMemo(() => {
    const raw = searchParams.get("brand_id");
    return raw?.split(",").map(Number).filter(Boolean) ?? [];
  }, [paramsStr]);
  const sortBy = useMemo(() => searchParams.get("sort") || "popular", [paramsStr]);
  const selectedMinPrice = useMemo(() => {
    const val = searchParams.get("min_price");
    return val ? Number(val) : null;
  }, [paramsStr]);
  const selectedMaxPrice = useMemo(() => {
    const val = searchParams.get("max_price");
    return val ? Number(val) : null;
  }, [paramsStr]);

  // ── Local search input (before debounce) ──
  const [searchInputValue, setSearchInputValue] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const initialLoadRef = useRef(true);

  // ── Category tree state ──
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

  // ── Brand state ──
  const [brands, setBrands] = useState<BrandNode[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [brandSearchQuery, setBrandSearchQuery] = useState("");


  // ── Initialize data ──
  useEffect(() => {
    getCategoryTree();
    getBrands();
  }, []);



  // Sync search input when URL changes externally (e.g. browser back/forward)
  useEffect(() => {
    setSearchInputValue(searchQuery);
  }, [searchQuery]);
  // ══════════════════════════════════════════════════════
  //  DATA FETCHING
  // ══════════════════════════════════════════════════════

  const getCategoryTree = async () => {
    try {
      setCategoriesLoading(true);
      const response = await categoryService.getTree();
      const tree = response.data.data.tree as CategoryNode[];
      setCategoryTree(tree);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const getBrands = async () => {
    try {
      setBrandsLoading(true);
      const response = await brandService.getAll({ limit: 100 });
      const brandsData = response.data.data.brands as BrandNode[];
      const activeBrands = brandsData
        .filter((brand) => brand.status === true)
        .sort((a, b) => a.brand_name.localeCompare(b.brand_name));
      setBrands(activeBrands);
    } catch (error) {
      console.error("Failed to load brands:", error);
    } finally {
      setBrandsLoading(false);
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      setProductsError(null);

      // Only show skeleton on very first load; after that, keep current products visible
      if (initialLoadRef.current) {
        setProductsLoading(true);
      }

      const params: Record<string, string | number> = {
        page: currentPage,
        limit: DEFAULT_PAGE_SIZE,
      };

      if (selectedCategoryId) {
        params.category_id = selectedCategoryId;
      }

      if (selectedBrandIds.length > 0) {
        params.brand_id = selectedBrandIds.join(",");
      }

      if (searchQuery) {
        params.product_name = searchQuery;
      }

      if (selectedMinPrice !== null) {
        params.min_price = selectedMinPrice;
      }
      if (selectedMaxPrice !== null) {
        params.max_price = selectedMaxPrice;
      }

      if (sortBy === "price-low") {
        params.sort = "price";
        params.order = "asc";
      } else if (sortBy === "price-high") {
        params.sort = "price";
        params.order = "desc";
      } else if (sortBy === "newest") {
        params.sort = "created_at";
        params.order = "desc";
      }
      const response = await productService.getAll(params);
      const data = response.data.data;

      setProducts(data.products ?? []);
      setPagination(data.pagination ?? null);
      initialLoadRef.current = false;
    } catch (error: any) {
      console.error("Failed to load products:", error);
      setProductsError(
        error?.response?.data?.message || "Không thể tải danh sách sản phẩm"
      );
      // Only clear products on error during initial load — keep stale data otherwise
      if (initialLoadRef.current) {
        setProducts([]);
        setPagination(null);
        initialLoadRef.current = false;
      }
    } finally {
      setProductsLoading(false);
    }
  }, [currentPage, selectedCategoryId, selectedBrandIds, searchQuery, sortBy, selectedMinPrice, selectedMaxPrice]);

  // Fetch products whenever filters change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ══════════════════════════════════════════════════════
  //  SEARCH DEBOUNCE
  // ══════════════════════════════════════════════════════

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchInputValue(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        // Build new search params directly to ensure immediate URL update
        const next = new URLSearchParams(searchParams.toString());
        if (value) {
          next.set("product_name", value);
        } else {
          next.delete("product_name");
        }
        next.delete("page"); // reset to page 1 on new search
        setSearchParams(next);
      }, DEBOUNCE_MS);
    },
    [searchParams, setSearchParams]
  );



  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // ══════════════════════════════════════════════════════
  //  PRICE HANDLERS
  // ══════════════════════════════════════════════════════

  const handlePriceRangeSelect = useCallback(
    (minPrice: number | null, maxPrice: number | null) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        // Toggle: if same price range is already selected, clear it
        const currentMin = prev.get("min_price");
        const currentMax = prev.get("max_price");
        const sameRange =
          String(minPrice ?? "") === (currentMin ?? "") &&
          String(maxPrice ?? "") === (currentMax ?? "");
        if (sameRange) {
          next.delete("min_price");
          next.delete("max_price");
        } else {
          if (minPrice !== null) {
            next.set("min_price", String(minPrice));
          } else {
            next.delete("min_price");
          }
          if (maxPrice !== null) {
            next.set("max_price", String(maxPrice));
          } else {
            next.delete("max_price");
          }
        }
        next.delete("page");
        return next;
      });
    },
    [setSearchParams]
  );

  // ══════════════════════════════════════════════════════
  //  CATEGORY HANDLERS
  // ══════════════════════════════════════════════════════

  const toggleExpand = useCallback((categoryId: number) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const handleCategorySelect = useCallback(
    (category: CategoryNode) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (prev.get("category_id") === String(category.category_id)) {
          next.delete("category_id");
        } else {
          next.set("category_id", String(category.category_id));
        }
        next.delete("page");
        return next;
      });
    },
    [setSearchParams]
  );

  const isCategorySelected = useCallback(
    (categoryId: number): boolean => {
      return selectedCategoryId === categoryId;
    },
    [selectedCategoryId]
  );

  // ══════════════════════════════════════════════════════
  //  BRAND HANDLERS
  // ══════════════════════════════════════════════════════

  const handleBrandSelect = useCallback(
    (brandId: number, checked: boolean) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        const current = prev
          .get("brand_id")
          ?.split(",")
          .map(Number)
          .filter(Boolean) ?? [];
        let updated: number[];
        if (checked) {
          updated = [...current, brandId];
        } else {
          updated = current.filter((id) => id !== brandId);
        }
        if (updated.length > 0) {
          next.set("brand_id", updated.join(","));
        } else {
          next.delete("brand_id");
        }
        next.delete("page");
        return next;
      });
    },
    [setSearchParams]
  );

  const isBrandSelected = useCallback(
    (brandId: number): boolean => {
      return selectedBrandIds.includes(brandId);
    },
    [selectedBrandIds]
  );

  const filteredBrands = useMemo(
    () =>
      brands.filter((brand) =>
        brand.brand_name.toLowerCase().includes(brandSearchQuery.toLowerCase())
      ),
    [brands, brandSearchQuery]
  );

  // ══════════════════════════════════════════════════════
  //  PAGINATION HANDLERS
  // ══════════════════════════════════════════════════════

  const handlePageChange = useCallback(
    (page: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("page", String(page));
        return next;
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setSearchParams]
  );

  const handleSortChange = useCallback(
    (value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === "popular") {
          next.delete("sort");
        } else {
          next.set("sort", value);
        }
        next.delete("page");
        return next;
      });
    },
    [setSearchParams]
  );

  // ══════════════════════════════════════════════════════
  //  ACTIVE CATEGORIES (status=true only)
  // ══════════════════════════════════════════════════════

  const filterActiveCategories = useCallback(
    (categories: CategoryNode[]): CategoryNode[] => {
      return categories
        .filter((cat) => cat.status === true)
        .map((cat) => ({
          ...cat,
          children: filterActiveCategories(cat.children),
        }));
    },
    []
  );

  const activeCategoryTree = useMemo(
    () => filterActiveCategories(categoryTree),
    [categoryTree, filterActiveCategories]
  );

  // ══════════════════════════════════════════════════════
  //  PAGINATION RANGE
  // ══════════════════════════════════════════════════════

  const paginationRange = useMemo(() => {
    if (!pagination) return [];
    const total = pagination.totalPages;
    const current = pagination.page;
    const range: (number | "...")[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) range.push(i);
    } else {
      range.push(1);
      if (current > 3) range.push("...");
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) range.push(i);
      if (current < total - 2) range.push("...");
      range.push(total);
    }
    return range;
  }, [pagination]);

  // ══════════════════════════════════════════════════════
  //  SKELETON COMPONENTS
  // ══════════════════════════════════════════════════════

  const CategorySkeleton = useMemo(
    () => (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    ),
    []
  );

  const BrandSkeleton = useMemo(
    () => (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    ),
    []
  );

  // ══════════════════════════════════════════════════════
  //  RENDERERS
  // ══════════════════════════════════════════════════════

  const renderProductSkeletons = () => (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
          : "flex flex-col gap-4"
      }
    >
      {Array.from({ length: 8 }, (_, i) => (
        <Card key={i} className="relative overflow-hidden">
          <CardHeader>
            <Skeleton className="aspect-square rounded-lg" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-32" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  // Show a subtle loading overlay on top of existing products while re-fetching
  const renderLoadingOverlay = () => (
    <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center z-20 rounded-lg">
      <Loader2 className="size-8 text-accent animate-spin" />
    </div>
  );

  const renderProductCard = (product: ProductNode) => {
    const imageSrc = getProductImage(product);
    const hasDiscount =
      product.discount_price !== null && product.discount_price < product.price;
    const inStock = product.total_stock > 0;
    const discountPercent = hasDiscount
      ? Math.round(
        (1 - (product.discount_price ?? product.price) / product.price) * 100
      )
      : 0;

    const cardContent = (
      <>
        <CardHeader className="relative">
          {!inStock && (
            <Badge className="absolute top-4 left-4 z-10 bg-muted">
              Hết hàng
            </Badge>
          )}
          {hasDiscount && discountPercent > 0 && (
            <Badge className="absolute top-4 right-4 z-10 bg-destructive">
              -{discountPercent}%
            </Badge>
          )}
          <Link to={`/product/${product.product_id}`}>
            <div className="aspect-square rounded-lg bg-secondary flex items-center justify-center mb-4 overflow-hidden">
              <ImageWithFallback
                src={imageSrc}
                alt={product.product_name}
                className="w-full h-full object-cover"
              />
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
          <p className="text-xs text-muted-foreground mb-1">
            {product.brand_name}
          </p>
          <Link to={`/product/${product.product_id}`}>
            <h3 className="font-semibold mb-2 line-clamp-2 hover:text-accent transition-colors">
              {product.product_name}
            </h3>
          </Link>
          <div className="flex items-baseline gap-2">
            {hasDiscount ? (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="text-lg font-bold text-accent">
                  {formatPrice(product.discount_price!)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-accent">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {inStock ? "Còn hàng" : "Hết hàng"}
          </p>
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
            disabled={!inStock}
          >
            <ShoppingCart className="size-4 mr-2" />
            {inStock ? "Thêm vào giỏ" : "Hết hàng"}
          </Button>
        </CardFooter>
      </>
    );

    if (viewMode === "list") {
      return (
        <Card
          key={product.product_id}
          className="group hover:shadow-lg transition-shadow"
        >
          <div className="flex gap-4 p-4">
            <Link
              to={`/product/${product.product_id}`}
              className="relative flex-shrink-0"
            >
              <div className="w-40 h-40 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                <ImageWithFallback
                  src={imageSrc}
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                />
              </div>
              {hasDiscount && discountPercent > 0 && (
                <Badge className="absolute top-2 left-2 bg-destructive">
                  -{discountPercent}%
                </Badge>
              )}
            </Link>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {product.brand_name}
                </p>
                <Link to={`/product/${product.product_id}`}>
                  <h3 className="font-semibold text-lg mb-2 hover:text-accent transition-colors">
                    {product.product_name}
                  </h3>
                </Link>
                <p className="text-xs text-muted-foreground">
                  {inStock ? "Còn hàng" : "Hết hàng"}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  {hasDiscount ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-accent">
                        {formatPrice(product.discount_price!)}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xl font-bold text-accent">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Heart className="size-4" />
                  </Button>
                  <Button
                    className="bg-accent hover:bg-accent/90"
                    disabled={!inStock}
                  >
                    <ShoppingCart className="size-4 mr-2" />
                    {inStock ? "Thêm vào giỏ" : "Hết hàng"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card
        key={product.product_id}
        className="group hover:shadow-xl transition-shadow"
      >
        {cardContent}
      </Card>
    );
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Search className="size-16 text-muted-foreground/40 mb-4" />
      <h3 className="text-lg font-semibold mb-2">
        Không tìm thấy sản phẩm phù hợp
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm được sản phẩm mong muốn.
      </p>
      <Button
        variant="outline"
        onClick={() => setSearchParams(new URLSearchParams())}
      >
        Xóa tất cả bộ lọc
      </Button>
    </div>
  );

  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle className="size-16 text-destructive/60 mb-4" />
      <h3 className="text-lg font-semibold mb-2">
        {productsError}
      </h3>
      <Button
        variant="outline"
        onClick={fetchProducts}
        className="mt-4"
      >
        <RefreshCw className="size-4 mr-2" />
        Thử lại
      </Button>
    </div>
  );

  // ══════════════════════════════════════════════════════
  //  FILTER SIDEBAR
  // ══════════════════════════════════════════════════════

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* ── Category Filter ── */}
      <div>
        <h3 className="font-semibold mb-3">Danh mục</h3>
        {categoriesLoading ? (
          CategorySkeleton
        ) : activeCategoryTree.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Chưa có danh mục sản phẩm
          </p>
        ) : (
          <div className="space-y-1">
            {activeCategoryTree.map((category) => {
              const hasChildren = category.children.length > 0;
              const isExpanded = expandedCategories.includes(
                category.category_id
              );

              return (
                <div key={category.category_id}>
                  {hasChildren ? (
                    <>
                      <button
                        onClick={() => toggleExpand(category.category_id)}
                        className="flex items-center gap-2 w-full text-left py-1.5 hover:bg-secondary/50 rounded px-1 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="size-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronRight className="size-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium">
                          {category.category_name}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="ml-6 space-y-1">
                          {category.children.map((child) => (
                            <div
                              key={child.category_id}
                              className="flex items-center gap-2 py-1"
                            >
                              <Checkbox
                                id={`category-${child.category_id}`}
                                checked={isCategorySelected(child.category_id)}
                                onCheckedChange={() =>
                                  handleCategorySelect(child)
                                }
                              />
                              <Label
                                htmlFor={`category-${child.category_id}`}
                                className="text-sm cursor-pointer"
                              >
                                {child.category_name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2 py-1">
                      <div className="w-4 flex-shrink-0" />
                      <Checkbox
                        id={`category-${category.category_id}`}
                        checked={isCategorySelected(category.category_id)}
                        onCheckedChange={() => handleCategorySelect(category)}
                      />
                      <Label
                        htmlFor={`category-${category.category_id}`}
                        className="text-sm cursor-pointer"
                      >
                        {category.category_name}
                      </Label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Brand Filter ── */}
      <div>
        <h3 className="font-semibold mb-3">
          Thương hiệu ({brands.length})
        </h3>

        {!brandsLoading && brands.length > 0 && (
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Tìm thương hiệu..."
              value={brandSearchQuery}
              onChange={(e) => setBrandSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        )}

        {brandsLoading ? (
          BrandSkeleton
        ) : filteredBrands.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có thương hiệu</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {filteredBrands.map((brand) => (
              <div key={brand.brand_id} className="flex items-center gap-2">
                <Checkbox
                  id={`brand-${brand.brand_id}`}
                  checked={isBrandSelected(brand.brand_id)}
                  onCheckedChange={(checked) =>
                    handleBrandSelect(brand.brand_id, checked === true)
                  }
                />
                <Label
                  htmlFor={`brand-${brand.brand_id}`}
                  className="text-sm cursor-pointer flex items-center gap-2"
                >
                  {brand.logo_url ? (
                    <img
                      src={
                        brand.logo_url.startsWith("http")
                          ? brand.logo_url
                          : import.meta.env.VITE_API_URL + brand.logo_url
                      }
                      alt={brand.brand_name}
                      className="size-5 rounded object-contain"
                    />
                  ) : null}
                  {brand.brand_name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Price Range ── */}
      <div>
        <h3 className="font-semibold mb-3">Khoảng giá</h3>
        <div className="space-y-1">
          {PRICE_RANGES.map((range) => {
            const isActive =
              selectedMinPrice === range.min_price &&
              selectedMaxPrice === range.max_price;
            const id = `price-${range.min_price ?? 0}-${range.max_price ?? 0}`;
            return (
              <div key={id} className="flex items-center gap-2 py-1">
                <button
                  onClick={() => handlePriceRangeSelect(range.min_price ?? null, range.max_price ?? null)}
                  className={`flex items-center gap-2 w-full text-left text-sm px-2 py-1 rounded transition-colors ${
                    isActive
                      ? "bg-accent/10 text-accent font-medium"
                      : "hover:bg-secondary/50"
                  }`}
                >
                  <div
                    className={`size-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isActive
                        ? "border-accent"
                        : "border-muted-foreground/40"
                    }`}
                  >
                    {isActive && (
                      <div className="size-2 rounded-full bg-accent" />
                    )}
                  </div>
                  <span>{range.label}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════
  //  MAIN RENDER
  // ══════════════════════════════════════════════════════

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Trang chủ
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Sản phẩm</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Sidebar ── */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Bộ lọc</h2>
            <FilterSidebar />
          </div>
        </aside>

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
            <div className="w-full sm:w-auto">
              {/* Search input */}
              <div className="relative w-full sm:w-72 mb-2 sm:mb-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchInputValue}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
              <h1 className="text-2xl font-bold mb-1">Tất cả sản phẩm</h1>
              <p className="text-sm text-muted-foreground">
                {pagination
                  ? `${pagination.total} sản phẩm được tìm thấy`
                  : "Đang tải..."}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Mobile Filter */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <Filter className="size-4 mr-2" />
                    Bộ lọc
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Bộ lọc</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Phổ biến</SelectItem>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="price-low">Giá: Thấp đến Cao</SelectItem>
                  <SelectItem value="price-high">Giá: Cao đến Thấp</SelectItem>
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

          {/* ── Products ── */}
          <div className="relative min-h-[600px]">
            {/* On very first load (no products yet) */}
            {productsLoading && products.length === 0 ? (
              renderProductSkeletons()
            ) : productsError && products.length === 0 ? (
              renderErrorState()
            ) : !productsLoading && products.length === 0 ? (
              renderEmptyState()
            ) : (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                      : "flex flex-col gap-4"
                  }
                >
                  {products.map((product) =>
                    viewMode === "grid"
                      ? renderProductCard(product)
                      : renderProductCard(product)
                  )}
                </div>

                {/* ── Pagination ── */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (pagination.hasPrevPage)
                                handlePageChange(pagination.page - 1);
                            }}
                            className={
                              !pagination.hasPrevPage
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>

                        {paginationRange.map((page, idx) =>
                          page === "..." ? (
                            <PaginationItem key={`ellipsis-${idx}`}>
                              <span className="flex size-9 items-center justify-center text-sm text-muted-foreground">
                                ...
                              </span>
                            </PaginationItem>
                          ) : (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                isActive={pagination.page === page}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(page as number);
                                }}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        )}

                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (pagination.hasNextPage)
                                handlePageChange(pagination.page + 1);
                            }}
                            className={
                              !pagination.hasNextPage
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}

                {/* Loading overlay while re-fetching with existing products visible */}
                {productsLoading && !initialLoadRef.current && renderLoadingOverlay()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}