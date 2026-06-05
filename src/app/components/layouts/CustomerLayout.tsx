import { Outlet, Link, useLocation } from "react-router";
import { Heart, ShoppingCart, User, Search, Menu, Baby } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

export default function CustomerLayout() {
  const location = useLocation();
  const [cartCount] = useState(3);
  const [wishlistCount] = useState(5);

  const categories = [
    "Clothing & Apparel",
    "Feeding & Nursing",
    "Diapers & Bath",
    "Toys & Entertainment",
    "Nursery & Gear",
    "Health & Safety"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Banner */}
      <div className="bg-accent text-accent-foreground py-2 px-4 text-center text-sm">
        🎉 Flash Sale: Up to 50% OFF on Baby Clothing | Free Shipping on Orders Over 500,000 VND
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
              <Baby className="size-8" />
              <span>BabyStore</span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for baby products..."
                  className="pl-10 pr-4 py-6 bg-secondary border-primary-200"
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
                    <Badge className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 bg-accent">
                      {wishlistCount}
                    </Badge>
                  )}
                </Link>
              </Button>

              {/* Cart */}
              <Button variant="ghost" size="icon" asChild className="relative">
                <Link to="/cart">
                  <ShoppingCart className="size-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 bg-accent">
                      {cartCount}
                    </Badge>
                  )}
                </Link>
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
                    <h2 className="text-lg font-semibold text-primary">Categories</h2>
                    {categories.map((cat) => (
                      <Link
                        key={cat}
                        to={`/products?category=${cat}`}
                        className="text-foreground hover:text-primary transition-colors"
                      >
                        {cat}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <div className="md:hidden mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10 pr-4 bg-secondary border-primary-200"
              />
            </div>
          </div>
        </div>

        {/* Categories Navigation - Desktop */}
        <div className="hidden md:block bg-primary-50 border-t border-primary-100">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-6 overflow-x-auto py-3">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  to={`/products?category=${cat}`}
                  className="whitespace-nowrap text-sm text-foreground hover:text-accent transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4 text-primary">About BabyStore</h3>
              <p className="text-sm text-muted-foreground">
                Your trusted partner for premium baby products. Quality, safety, and care for your little ones.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Customer Service</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/help" className="text-muted-foreground hover:text-primary">Help Center</Link></li>
                <li><Link to="/shipping" className="text-muted-foreground hover:text-primary">Shipping Info</Link></li>
                <li><Link to="/returns" className="text-muted-foreground hover:text-primary">Returns</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/products" className="text-muted-foreground hover:text-primary">Shop All</Link></li>
                <li><Link to="/brands" className="text-muted-foreground hover:text-primary">Brands</Link></li>
                <li><Link to="/blog" className="text-muted-foreground hover:text-primary">Blog</Link></li>
                <li><Link to="/auth" className="text-muted-foreground hover:text-primary">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Newsletter</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Get updates on new products and special offers
              </p>
              <div className="flex gap-2">
                <Input type="email" placeholder="Your email" className="bg-secondary" />
                <Button className="bg-accent hover:bg-accent/90">Subscribe</Button>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2026 BabyStore. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
