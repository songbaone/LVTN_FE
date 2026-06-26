import { Outlet, Link, Navigate, useLocation } from "react-router";
import { Heart, ShoppingCart, User, Search, Menu, Baby } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Skeleton } from "../ui/skeleton";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { categoryService } from "../../../services/category.service";
import axios from "axios";
import { cartService } from "../../../services/cart.service";
import { useCartStore } from "../../../helpers/cartStore";

interface CategoryNode {
  category_id: number;
  category_name: string;
  slug: string;
  description: string;
  image_url: string;
  status: boolean;
  parent_id: number | null;
  total_product_count: number;
  children: CategoryNode[];
}

interface cartTotal {
  total_unique_items: number;
}

export default function CustomerLayout() {
  const location = useLocation();
  const [cartCount] = useState(3);
  const [wishlistCount] = useState(5);
  const navigate = useNavigate();
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [quantityCart, setQuantityCart] = useState(0);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryService.getTree();
        const tree: CategoryNode[] =
          response.data?.tree ?? response.data?.data?.tree ?? [];
        if (mounted) {
          setCategoryTree(tree);
        }
      } catch (err) {
        console.error("Failed to fetch category tree:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    fetchCategories();
    return () => {
      mounted = false;
    };
  }, []);
  const { cart, fetchCart } = useCartStore();

  useEffect(() => {
    const fetchQuantityCart = async () => {
      try {
        const res = await cartService.getCart();

        if (res.status === 200) {
          setQuantityCart(res.data.data.total_unique_items);
          console.log("total_unique_items:", res.data.data.total_unique_items);
        }
      } catch (err) {
        console.error("Failed to fetch category tree:", err);
      }
    };
    fetchQuantityCart();
    fetchCart();
    return () => {};
  });

  const activeParentCategories = categoryTree.filter(
    (cat) => cat.status === true && cat.parent_id === null,
  );

  const handleCategoryClick = (categoryId: number, categoryName: string) => {
    navigate(
      `/products?category_id=${categoryId}&category_name=${encodeURIComponent(categoryName)}`,
    );
  };

  const loginExisting = async () => {
    const token = localStorage.getItem("AccessToken");

    if (!token) {
      const result = await Swal.fire({
        icon: "warning",
        title: "Bạn chưa đăng nhập",
        text: "Bạn có muốn đăng nhập để tiếp tục không?",
        showCancelButton: true,
        confirmButtonText: "Đăng nhập",
        cancelButtonText: "Ở lại trang này",
      });

      if (result.isConfirmed) {
        navigate("/login");
      }
      navigate("/");
    }
    navigate("/cart");

    return false;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Banner */}
      <div className="px-4 py-2 text-sm text-center bg-accent text-accent-foreground">
        🎉 Khuyến mãi: Giảm giá lên đến 50% cho các sản phẩm quần áo trẻ em |
        Miễn phí vận chuyển cho đơn từ 500.000 VNĐ
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b shadow-sm bg-card border-border">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 text-2xl font-bold text-primary"
            >
              <Baby className="size-8" />
              <span>BabyStore</span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="flex-1 hidden max-w-2xl md:flex">
              <div className="relative w-full">
                <Search className="absolute -translate-y-1/2 left-3 top-1/2 size-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for baby products..."
                  className="py-6 pl-10 pr-4 bg-secondary border-primary-200"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Wishlist */}
              <Button variant="ghost" size="icon" asChild className="relative">
                <Link to="/wishlist">
                  <Heart className="size-5" />
                  {wishlistCount > 0 && (
                    <Badge className="absolute flex items-center justify-center p-0 -top-1 -right-1 size-5 bg-accent">
                      {wishlistCount}
                    </Badge>
                  )}
                </Link>
              </Button>

              {/* Cart */}
              <Button
                onClick={loginExisting}
                variant="ghost"
                size="icon"
                asChild
                className="relative"
              >
                <div>
                  <ShoppingCart className="size-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute flex items-center justify-center p-0 -top-1 -right-1 size-5 bg-accent">
                      {cart?.total_unique_items ?? 0}
                    </Badge>
                  )}
                </div>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist">Wishlist</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/auth">Sign In</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <nav className="flex flex-col gap-4">
                    <h2 className="text-lg font-semibold text-primary">
                      Danh mục
                    </h2>
                    {loading ? (
                      <>
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-8 w-5/6" />
                        <Skeleton className="h-8 w-2/3" />
                        <Skeleton className="h-8 w-4/5" />
                      </>
                    ) : activeParentCategories.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Chưa có danh mục sản phẩm
                      </p>
                    ) : (
                      activeParentCategories.map((cat) => (
                        <button
                          key={cat.category_id}
                          onClick={() =>
                            handleCategoryClick(
                              cat.category_id,
                              cat.category_name,
                            )
                          }
                          className="text-left transition-colors text-foreground hover:text-primary"
                        >
                          {cat.category_name}
                        </button>
                      ))
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <div className="mt-3 md:hidden">
            <div className="relative">
              <Search className="absolute -translate-y-1/2 left-3 top-1/2 size-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10 pr-4 bg-secondary border-primary-200"
              />
            </div>
          </div>
        </div>

        {/* Categories Navigation - Desktop */}
        <div className="hidden border-t md:block bg-primary-50 border-primary-100">
          <div className="container px-4 mx-auto overflow-x-auto">
            <nav className="flex items-center gap-6 py-3">
              {loading ? (
                <>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </>
              ) : activeParentCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có danh mục sản phẩm
                </p>
              ) : (
                activeParentCategories.map((cat) => (
                  <button
                    key={cat.category_id}
                    onClick={() =>
                      handleCategoryClick(cat.category_id, cat.category_name)
                    }
                    className="text-sm transition-colors whitespace-nowrap text-foreground hover:text-accent"
                  >
                    {cat.category_name}
                  </button>
                ))
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t bg-card border-border">
        <div className="container px-4 py-12 mx-auto">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-primary">
                Về chung tôi
              </h3>
              <p className="text-sm text-muted-foreground">
                Đối tác đáng tin cậy của bạn cho các sản phẩm dành cho trẻ em
                cao cấp. Chất lượng, an toàn và chăm sóc cho con bạn.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">Dịch vụ khách hàng</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/help"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Trung tâm hỗ trợ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shipping"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Thông tin vận chuyển
                  </Link>
                </li>
                <li>
                  <Link
                    to="/returns"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Hoàn trả
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Liên hệ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">Đường dẫn nhanh</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/products"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Sản phẩm
                  </Link>
                </li>
                <li>
                  <Link
                    to="/brands"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Thương hiệu
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/auth"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Đăng nhập
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">Bản tin</h3>
              <p className="mb-3 text-sm text-muted-foreground">
                Nhận thông tin cập nhật về sản phẩm mới và ưu đãi đặc biệt
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Nhập email của bạn "
                  className="bg-secondary"
                />
                <Button className="bg-accent hover:bg-accent/90">
                  Đăng kí
                </Button>
              </div>
            </div>
          </div>
          <div className="pt-8 mt-8 text-sm text-center border-t border-border text-muted-foreground">
            © 2026 BabyStore. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
