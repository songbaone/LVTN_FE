import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Package,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  Download,
  Upload,
  Edit2,
  Eye,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  Boxes,
  Warehouse,
} from "lucide-react";
import { toast } from "sonner";
import { stockService } from "../../../services/stock.service";
import { categoryService } from "../../../services/category.service";
import { brandService } from "../../../services/brand.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  total_products: number;
  total_variants: number;
  total_stock: number;
  low_stock_count: number;
  out_of_stock_count: number;
}

interface StockVariant {
  variant_id: string;
  sku: string;
  color: string;
  material: string;
  additionalPrice: number;
  stock: number;
}

interface StockItem {
  variant_id: string;
  productId: string;
  product_name: string;
  sku: string;
  category: string;
  brand: string;
  color: string;
  material: string;
  stock_quantity: number;
  additionalPrice: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  image: string;
  variants: StockVariant[];
}

// Backend response shape for GET /stocks (flat row)
interface StockRow {
  product_id: number;
  product_name: string;
  brand_name: string;
  category_name: string;
  main_image_url: string | null;
  price: number;
  discount_price: number | null;
  variant_id: number;
  sku: string;
  size: string | null;
  color: string | null;
  material: string | null;
  additional_price: number;
  stock_quantity: number;
  status: boolean;
  updated_at: string;
}

interface CategoryOption {
  category_id: number;
  category_name: string;
}

interface BrandOption {
  brand_id: number;
  brand_name: string;
}

interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PreviewRow {
  row: number;
  sku: string;
  product_name: string;
  import_quantity: number;
  status: "valid" | "error";
  error?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStatusBadge = (status: StockItem["status"]) => {
  switch (status) {
    case "in_stock":
      return <Badge className="bg-success">Còn hàng</Badge>;
    case "low_stock":
      return <Badge className="bg-warning text-white">Sắp hết hàng</Badge>;
    case "out_of_stock":
      return <Badge className="bg-destructive">Hết hàng</Badge>;
  }
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function InventoryManagement() {
  // ── Tabs ──
  const [activeTab, setActiveTab] = useState("dashboard");

  // ── Loading States ──
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [isInventoryLoading, setIsInventoryLoading] = useState(false);
  const [isLowStockLoading, setIsLowStockLoading] = useState(false);
  const [isOutOfStockLoading, setIsOutOfStockLoading] = useState(false);
  const [isImportSubmitting, setIsImportSubmitting] = useState(false);
  const [isAdjustSubmitting, setIsAdjustSubmitting] = useState(false);

  // ── Dashboard ──
  const [dashboard, setDashboard] = useState<DashboardStats>({
    total_products: 0,
    total_variants: 0,
    total_stock: 0,
    low_stock_count: 0,
    out_of_stock_count: 0,
  });

  // ── Inventory List State ──
  const [inventoryItems, setInventoryItems] = useState<StockRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [selectedBrandId, setSelectedBrandId] = useState("all");
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [brandOptions, setBrandOptions] = useState<BrandOption[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // ── Detail Dialog ──
  const [selectedStockRow, setSelectedStockRow] = useState<StockRow | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // ── Import Dialog ──
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importProductId, setImportProductId] = useState("");
  const [importProductName, setImportProductName] = useState("");
  const [importVariantId, setImportVariantId] = useState("all");
  const [importQuantity, setImportQuantity] = useState("");
  const [importNote, setImportNote] = useState("");

  // ── Adjustment Dialog ──
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustProductId, setAdjustProductId] = useState("");
  const [adjustProductName, setAdjustProductName] = useState("");
  const [adjustVariantId, setAdjustVariantId] = useState("");
  const [adjustCurrentStock, setAdjustCurrentStock] = useState(0);
  const [adjustNewStock, setAdjustNewStock] = useState("");
  const [adjustNote, setAdjustNote] = useState("");

  // ── Excel Import Dialog (4-step wizard) ──
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);
  const [excelStep, setExcelStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [isExcelImporting, setIsExcelImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Low Stock / Out Of Stock ──
  const [lowStockItems, setLowStockItems] = useState<StockItem[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<StockItem[]>([]);

  // ── Load Dashboard ──
  const loadDashboard = useCallback(async () => {
    setIsDashboardLoading(true);
    try {
      const res = await stockService.getDashboard();
      console.log("Dashboard data:", res.data);
      if (res.data) {
        setDashboard(res.data.data);
      } else {
        toast.error("Dữ liệu tổng quan không hợp lệ");
      }
    } catch (error) {
      toast.error("Tải dữ liệu tổng quan thất bại");
    } finally {
      setIsDashboardLoading(false);
    }
  }, []);

  // ── Load Categories ──
  const loadCategories = useCallback(async () => {
    try {
      const res = await categoryService.getAll({ limit: 100 });
      console.log("Category data: ", res.data)
      const items = res.data.data.categories ?? res.data ?? [];
      setCategoryOptions(items);
    } catch {
      // silent fail — categories are optional for filtering
    }
  }, []);

  // ── Load Brands ──
  const loadBrands = useCallback(async () => {
    try {
      const res = await brandService.getAll({ limit: 20 });
      const items = res.data.data?.brands ?? res.data.data ?? res.data ?? [];
      setBrandOptions(items);
    } catch {
      // silent fail — brands are optional for filtering
    }
  }, []);

  // ── Load Inventory List ──
  const loadInventory = useCallback(async () => {
    setIsInventoryLoading(true);
    try {
      const params: Record<string, unknown> = {
        page: pagination.currentPage,
        limit: pagination.pageSize,
      };
      if (searchQuery) params.search = searchQuery;
      if (selectedCategoryId !== "all") params.category_id = parseInt(selectedCategoryId);
      if (selectedBrandId !== "all") params.brand_id = parseInt(selectedBrandId);

      const res = await stockService.getStocks(params);
      console.log("Inventory list response:", res.data);
      const data = res.data.data;
      const pg = data.pagination;

      setInventoryItems(data.stocks);
      setPagination({
        currentPage: pg.page,
        pageSize: pg.limit,
        totalItems: pg.total,
        totalPages: pg.totalPages,
        hasNextPage: pg.hasNextPage,
        hasPrevPage: pg.hasPrevPage,
      });
    } catch (error) {
      toast.error("Tải danh sách tồn kho thất bại");
    } finally {
      setIsInventoryLoading(false);
    }
  }, [searchQuery, selectedCategoryId, selectedBrandId, pagination.currentPage, pagination.pageSize]);

  // ── Load Low Stock ──
  const loadLowStock = useCallback(async () => {
    setIsLowStockLoading(true);
    try {
      const res = await stockService.getLowStock();
      console.log("Low stock response:", res.data);
      setLowStockItems(res.data.data.variants ?? res.data.data ?? res.data ?? []);
    } catch (error) {
      toast.error("Tải danh sách sắp hết hàng thất bại");
    } finally {
      setIsLowStockLoading(false);
    }
  }, []);

  // ── Load Out Of Stock ──
  const loadOutOfStock = useCallback(async () => {
    setIsOutOfStockLoading(true);
    try {
      const res = await stockService.getOutOfStock();
      console.log("Out of stock response:", res.data);
      setOutOfStockItems(res.data.data.variants ?? res.data.data ?? res.data ?? []);
    } catch (error) {
      toast.error("Tải danh sách hết hàng thất bại");
    } finally {
      setIsOutOfStockLoading(false);
    }
  }, []);

  // ── Initial load ──
  useEffect(() => {
    loadDashboard();
    loadCategories();
    loadBrands();
  }, [loadDashboard, loadCategories, loadBrands]);

  useEffect(() => {
    if (activeTab === "inventory") {
      loadInventory();
    }
  }, [activeTab, loadInventory]);

  useEffect(() => {
    if (activeTab === "low-stock") {
      loadLowStock();
    }
  }, [activeTab, loadLowStock]);

  useEffect(() => {
    if (activeTab === "out-of-stock") {
      loadOutOfStock();
    }
  }, [activeTab, loadOutOfStock]);

  // ── Handlers ──

  const handleViewDetail = (item: StockRow) => {
    setSelectedStockRow(item);
    setIsDetailOpen(true);
  };

  const handleOpenImport = (item: StockRow | StockItem) => {
    const isStockRow = "product_id" in item;
    const productId = isStockRow ? String(item.product_id) : item.productId;
    const productName = item.product_name;
    const variantId = isStockRow ? String(item.variant_id) : "all";
    setImportProductId(productId);
    setImportProductName(productName);
    setImportVariantId(variantId);
    setImportQuantity("");
    setImportNote("");
    setIsImportOpen(true);
  };

  const handleOpenAdjust = (item: StockRow | StockItem) => {
    const isStockRow = "product_id" in item;
    const productId = isStockRow ? String(item.product_id) : item.productId;
    const productName = item.product_name;
    const stockQty = item.stock_quantity;
    const variantId = isStockRow ? String(item.variant_id) : "";
    setAdjustProductId(productId);
    setAdjustProductName(productName);
    setAdjustVariantId(variantId);
    setAdjustCurrentStock(stockQty);
    setAdjustNewStock("");
    setAdjustNote("");
    setIsAdjustOpen(true);
  };

  const handleSaveImport = async () => {
    if (!importQuantity || parseInt(importQuantity) <= 0) {
      toast.error("Vui lòng nhập số lượng hợp lệ");
      return;
    }

    const pid = parseInt(importProductId);
    const vid = importVariantId !== "all" ? parseInt(importVariantId) : null;
    console.log("IMPORT VARIANT:", vid);
    console.log("IMPORT PRODUCT:", pid);

    if (!pid || isNaN(pid)) {
      toast.error("Mã sản phẩm không hợp lệ");
      return;
    }

    setIsImportSubmitting(true);
    try {
      await stockService.importStock({
        product_id: pid,
        variants: vid
          ? [{ variant_id: vid, quantity: parseInt(importQuantity) }]
          : [{ variant_id: 0, quantity: parseInt(importQuantity) }],
      });
      toast.success("Nhập kho thành công");
      setIsImportOpen(false);
      // Refresh data
      loadDashboard();
      if (activeTab === "inventory") loadInventory();
    } catch (error) {
      toast.error("Nhập kho thất bại");
    } finally {
      setIsImportSubmitting(false);
    }
  };

  const handleSaveAdjust = async () => {
    if (!adjustNewStock || parseInt(adjustNewStock) < 0) {
      toast.error("Vui lòng nhập số lượng tồn kho hợp lệ");
      return;
    }

    const vid = adjustVariantId ? parseInt(adjustVariantId) : null;
    console.log("ADJUST VARIANT:", vid);

    if (!vid || isNaN(vid)) {
      toast.error("Mã biến thể không hợp lệ");
      return;
    }

    setIsAdjustSubmitting(true);
    try {
      await stockService.adjustStock({
        variant_id: vid,
        stock_quantity: parseInt(adjustNewStock),
        note: adjustNote || undefined,
      });
      toast.success("Điều chỉnh tồn kho thành công");
      setIsAdjustOpen(false);
      // Refresh data
      loadDashboard();
      if (activeTab === "inventory") loadInventory();
    } catch (error) {
      toast.error("Điều chỉnh tồn kho thất bại");
    } finally {
      setIsAdjustSubmitting(false);
    }
  };

  // ── Excel Import Wizard ──
  const handleDownloadTemplate = async () => {
    try {
      const res = await stockService.downloadTemplate();
      downloadBlob(res.data, "stock-import-template.xlsx");
      toast.success("Tải file mẫu thành công");
    } catch (error) {
      toast.error("Tải file mẫu thất bại");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await stockService.previewImport(formData);
      console.log("Preview import response:", res.data);
      const rows = res.data.data.valid_rows || [];
      setPreviewData(rows);
      setExcelStep(3);
    } catch (error) {
      toast.error("Xem trước dữ liệu nhập thất bại");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) return;

    setIsExcelImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      await stockService.importExcel(formData);
      toast.success("Nhập kho Excel thành công");
      setExcelStep(4);
      // Refresh data
      loadDashboard();
      if (activeTab === "inventory") loadInventory();
    } catch (error) {
      toast.error("Nhập kho Excel thất bại");
    } finally {
      setIsExcelImporting(false);
    }
  };

  const handleResetExcelImport = () => {
    setExcelStep(1);
    setSelectedFile(null);
    setPreviewData([]);
    setIsExcelImportOpen(false);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExportReport = async () => {
    try {
      const res = await stockService.exportReport();
      downloadBlob(res.data, "stock-report.xlsx");
      toast.success("Tải báo cáo thành công");
    } catch (error) {
      toast.error("Tải báo cáo thất bại");
    }
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  // ── Filter search debounce helper (manual trigger on Enter or blur) ──
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }
  };

  const handleSearchBlur = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // ── Render helpers for dialog variant options ──
  const importVariants: StockVariant[] = [];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản lý tồn kho</h1>
          <p className="text-muted-foreground">Theo dõi và quản lý số lượng tồn kho sản phẩm</p>
        </div>
        <Button onClick={handleExportReport} variant="outline">
          <Download className="size-4 mr-2" />
          Xuất báo cáo
        </Button>
      </div>

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="dashboard">
            <Package className="size-4 mr-2" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Warehouse className="size-4 mr-2" />
            Tất cả tồn kho
          </TabsTrigger>
          <TabsTrigger value="low-stock">
            <AlertTriangle className="size-4 mr-2" />
            Sắp hết hàng
          </TabsTrigger>
          <TabsTrigger value="out-of-stock">
            <XCircle className="size-4 mr-2" />
            Hết hàng
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════════════════════
           TAB 1: DASHBOARD
           ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="dashboard">
          {isDashboardLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-8 animate-spin text-accent" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tổng sản phẩm
                  </CardTitle>
                  <Package className="size-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboard.total_products}</div>
                  <p className="text-xs text-muted-foreground mt-1">Sản phẩm đang hoạt động</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tổng biến thể
                  </CardTitle>
                  <Boxes className="size-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboard.total_variants}</div>
                  <p className="text-xs text-muted-foreground mt-1">Biến thể SKU</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tổng tồn kho
                  </CardTitle>
                  <Warehouse className="size-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboard.total_stock?.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">Đơn vị trong kho</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Sắp hết hàng
                  </CardTitle>
                  <AlertTriangle className="size-5 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-warning">{dashboard.low_stock_count}</div>
                  <p className="text-xs text-muted-foreground mt-1">Dưới ngưỡng tối thiểu</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Hết hàng
                  </CardTitle>
                  <XCircle className="size-5 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-destructive">{dashboard.out_of_stock_count}</div>
                  <p className="text-xs text-muted-foreground mt-1">Cần nhập thêm</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════
           TAB 2: ALL INVENTORY
           ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="inventory" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo tên sản phẩm hoặc SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    onBlur={handleSearchBlur}
                    className="pl-10"
                  />
                </div>

                <Select
                  value={selectedCategoryId}
                  onValueChange={(v) => {
                    setSelectedCategoryId(v);
                    setPagination((prev) => ({ ...prev, currentPage: 1 }));
                  }}
                >
                  <SelectTrigger>
                    <Filter className="size-4 mr-2" />
                    <SelectValue placeholder="Tất cả danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat.category_id} value={String(cat.category_id)}>
                        {cat.category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedBrandId}
                  onValueChange={(v) => {
                    setSelectedBrandId(v);
                    setPagination((prev) => ({ ...prev, currentPage: 1 }));
                  }}
                >
                  <SelectTrigger>
                    <Filter className="size-4 mr-2" />
                    <SelectValue placeholder="Tất cả thương hiệu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả thương hiệu</SelectItem>
                    {brandOptions.map((brand) => (
                      <SelectItem key={brand.brand_id} value={String(brand.brand_id)}>
                        {brand.brand_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setExcelStep(1);
                      setSelectedFile(null);
                      setPreviewData([]);
                      setIsExcelImportOpen(true);
                    }}
                  >
                    <FileSpreadsheet className="size-4 mr-2" />
                    Nhập kho Excel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Table */}
          <Card>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Màu sắc</TableHead>
                    <TableHead>Chất liệu</TableHead>
                    <TableHead className="text-right">Giá bán</TableHead>
                    <TableHead className="text-center">Tồn kho</TableHead>
                    <TableHead className="text-right">Giá cộng thêm</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isInventoryLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-16">
                        <Loader2 className="size-8 animate-spin text-accent mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : inventoryItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-16">
                        <div className="flex flex-col items-center">
                          <div className="size-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                            <Package className="size-8 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">Không tìm thấy dữ liệu</h3>
                          <p className="text-muted-foreground text-sm">
                            Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    inventoryItems?.map((item) => {
                      const displayPrice = item.discount_price ?? item.price;
                      const stockQty = item.stock_quantity;
                      const stockStatus: "in_stock" | "low_stock" | "out_of_stock" =
                        stockQty === 0 ? "out_of_stock" : stockQty < 15 ? "low_stock" : "in_stock";

                      return (
                        <TableRow key={item.variant_id} className="hover:bg-secondary/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-lg bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                                {item.main_image_url ? (
                                  <img
                                    src={item.main_image_url}
                                    alt={item.product_name}
                                    className="size-full object-cover"
                                  />
                                ) : (
                                  <span className="text-lg">📦</span>
                                )}
                              </div>
                              <div>
                                <span className="font-medium block">{item.product_name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {item.category_name} • {item.brand_name}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                          <TableCell>{item.color ?? "-"}</TableCell>
                          <TableCell>{item.material ?? "-"}</TableCell>
                          <TableCell className="text-right font-medium">
                            {displayPrice.toLocaleString()} ₫
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`font-bold ${stockQty === 0
                                ? "text-destructive"
                                : stockQty < 15
                                  ? "text-warning"
                                  : "text-foreground"
                                }`}
                            >
                              {stockQty}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {item.additional_price > 0
                              ? `${item.additional_price.toLocaleString()} ₫`
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                stockStatus === "out_of_stock"
                                  ? "bg-destructive"
                                  : stockStatus === "low_stock"
                                    ? "bg-warning text-white"
                                    : "bg-success"
                              }
                            >
                              {stockStatus === "out_of_stock"
                                ? "Hết hàng"
                                : stockStatus === "low_stock"
                                  ? "Sắp hết hàng"
                                  : "Còn hàng"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetail(item)}
                                title="Xem chi tiết"
                              >
                                <Eye className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenImport(item)}
                                title="Nhập kho"
                              >
                                <Upload className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenAdjust(item)}
                                title="Điều chỉnh tồn kho"
                              >
                                <Edit2 className="size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {!isInventoryLoading && pagination.totalItems > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Hiển thị {(pagination.currentPage - 1) * pagination.pageSize + 1}–
                  {Math.min(
                    pagination.currentPage * pagination.pageSize,
                    pagination.totalItems
                  )}{" "}
                  trên tổng số {pagination.totalItems} sản phẩm
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPrevPage}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={pagination.currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNextPage}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════
           TAB 3: LOW STOCK
           ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="low-stock" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-warning" />
                Sản phẩm sắp hết hàng
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Sản phẩm có tồn kho dưới ngưỡng tối thiểu
              </p>
            </CardHeader>
            <CardContent>
              {isLowStockLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-8 animate-spin text-accent" />
                </div>
              ) : lowStockItems.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="size-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Không có sản phẩm sắp hết hàng</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Tồn kho hiện tại</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lowStockItems.map((item) => (
                        <TableRow key={item.variant_id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-lg bg-secondary flex items-center justify-center text-2xl">
                                {item.image || "📦"}
                              </div>
                              <span className="font-medium">{item.product_name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                          <TableCell>
                            <span className="font-bold text-warning">{item.stock_quantity}</span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenImport(item)}
                            >
                              <Upload className="size-4 mr-2" />
                              Nhập kho
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════
           TAB 4: OUT OF STOCK
           ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="out-of-stock" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="size-5 text-destructive" />
                Sản phẩm hết hàng
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Sản phẩm cần nhập thêm ngay
              </p>
            </CardHeader>
            <CardContent>
              {isOutOfStockLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-8 animate-spin text-accent" />
                </div>
              ) : outOfStockItems.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="size-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Không có sản phẩm hết hàng</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Tồn kho hiện tại</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {outOfStockItems.map((item) => (
                        <TableRow key={item.variant_id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-lg bg-secondary flex items-center justify-center text-2xl">
                                {item.image || "📦"}
                              </div>
                              <span className="font-medium">{item.product_name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                          <TableCell>
                            <span className="font-bold text-destructive">{item.stock_quantity}</span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenImport(item)}
                            >
                              <Upload className="size-4 mr-2" />
                              Nhập kho
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ═══════════════════════════════════════════════════════════════════════
         DIALOG: PRODUCT INFORMATION
         ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chi tiết sản phẩm</DialogTitle>
            <DialogDescription>
              Xem thông tin chi tiết sản phẩm và tồn kho hiện tại
            </DialogDescription>
          </DialogHeader>

          {selectedStockRow ? (
            <div className="space-y-6">
              {/* Product Image & Info */}
              <div className="flex gap-6">
                <div className="size-32 rounded-lg bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                  {selectedStockRow.main_image_url ? (
                    <img
                      src={selectedStockRow.main_image_url}
                      alt={selectedStockRow.product_name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <Package className="size-12 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <div>
                    <Label className="text-xs text-muted-foreground">Tên sản phẩm</Label>
                    <p className="font-semibold text-lg">{selectedStockRow.product_name}</p>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <Label className="text-xs text-muted-foreground">Danh mục</Label>
                      <p className="font-medium">{selectedStockRow.category_name}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Thương hiệu</Label>
                      <p className="font-medium">{selectedStockRow.brand_name}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Variant Information */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-secondary/30">
                <div>
                  <Label className="text-xs text-muted-foreground">SKU</Label>
                  <p className="font-semibold mt-1 font-mono">{selectedStockRow.sku}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Màu sắc</Label>
                  <p className="font-semibold mt-1">{selectedStockRow.color ?? "-"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Chất liệu</Label>
                  <p className="font-semibold mt-1">{selectedStockRow.material ?? "-"}</p>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-secondary/30">
                {selectedStockRow.discount_price ? (
                  <>
                    <div>
                      <Label className="text-xs text-muted-foreground">Giá khuyến mãi</Label>
                      <p className="font-semibold mt-1 text-success">
                        {selectedStockRow.discount_price.toLocaleString()} ₫
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Giá gốc</Label>
                      <p className="font-semibold mt-1 line-through text-muted-foreground">
                        {selectedStockRow.price.toLocaleString()} ₫
                      </p>
                    </div>
                  </>
                ) : (
                  <div>
                    <Label className="text-xs text-muted-foreground">Giá bán</Label>
                    <p className="font-semibold mt-1">
                      {selectedStockRow.price.toLocaleString()} ₫
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-muted-foreground">Giá cộng thêm</Label>
                  <p className="font-semibold mt-1">
                    {selectedStockRow.additional_price > 0
                      ? `${selectedStockRow.additional_price.toLocaleString()} ₫`
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Stock Information */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-secondary/30">
                <div>
                  <Label className="text-xs text-muted-foreground">Tồn kho hiện tại</Label>
                  <p
                    className={`font-bold mt-1 text-2xl ${selectedStockRow.stock_quantity === 0
                      ? "text-destructive"
                      : selectedStockRow.stock_quantity < 15
                        ? "text-warning"
                        : "text-foreground"
                      }`}
                  >
                    {selectedStockRow.stock_quantity}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Cập nhật lần cuối</Label>
                  <p className="font-semibold mt-1">
                    {new Date(selectedStockRow.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Không có dữ liệu</div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════════
         DIALOG: STOCK IMPORT
         ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhập kho</DialogTitle>
            <DialogDescription>
              Ghi nhận phiếu nhập kho cho sản phẩm này
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Sản phẩm</Label>
              <Input value={importProductName} disabled className="mt-1" />
            </div>

            <div>
              <Label htmlFor="importQuantity">Số lượng nhập</Label>
              <Input
                id="importQuantity"
                type="number"
                min="1"
                value={importQuantity}
                onChange={(e) => setImportQuantity(e.target.value)}
                placeholder="Nhập số lượng"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="importNote">Ghi chú</Label>
              <Input
                id="importNote"
                value={importNote}
                onChange={(e) => setImportNote(e.target.value)}
                placeholder="Ví dụ: Mã đơn nhập hàng"
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsImportOpen(false)}
              disabled={isImportSubmitting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveImport}
              disabled={isImportSubmitting}
              className="bg-accent hover:bg-accent/90"
            >
              {isImportSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Đang nhập...
                </>
              ) : (
                "Lưu"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════════
         DIALOG: STOCK ADJUSTMENT
         ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Điều chỉnh tồn kho</DialogTitle>
            <DialogDescription>
              Điều chỉnh số lượng tồn kho cho sản phẩm này
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Sản phẩm</Label>
              <Input value={adjustProductName} disabled className="mt-1" />
            </div>
            <div>
              <Label htmlFor="adjustVariant">Biến thể</Label>
              <Select value={adjustVariantId} onValueChange={setAdjustVariantId}>
                <SelectTrigger className="mt-1" id="adjustVariant">
                  <SelectValue placeholder="Chọn biến thể" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả biến thể (cấp sản phẩm)</SelectItem>
                  {importVariants.map((v) => (
                    <SelectItem key={v.variant_id} value={v.variant_id}>
                      {v.sku} — {v.color} / {v.material}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tồn kho hiện tại</Label>
              <Input value={adjustCurrentStock} disabled className="mt-1" />
            </div>
            <div>
              <Label htmlFor="adjustNewStock">Tồn kho mới</Label>
              <Input
                id="adjustNewStock"
                type="number"
                min="0"
                value={adjustNewStock}
                onChange={(e) => setAdjustNewStock(e.target.value)}
                placeholder="Nhập số lượng tồn kho mới"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="adjustNote">Ghi chú</Label>
              <Input
                id="adjustNote"
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
                placeholder="Lý do điều chỉnh"
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAdjustOpen(false)}
              disabled={isAdjustSubmitting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveAdjust}
              disabled={isAdjustSubmitting}
              className="bg-accent hover:bg-accent/90"
            >
              {isAdjustSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════════
         DIALOG: EXCEL IMPORT (4-Step Wizard)
         ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={isExcelImportOpen} onOpenChange={(open) => {
        if (!open) handleResetExcelImport();
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nhập kho Excel</DialogTitle>
            <DialogDescription>
              Bước {excelStep} / 4:{" "}
              {excelStep === 1 && "Tải file mẫu"}
              {excelStep === 2 && "Tải file lên"}
              {excelStep === 3 && "Xem trước dữ liệu nhập"}
              {excelStep === 4 && "Nhập kho thành công"}
            </DialogDescription>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`size-8 rounded-full flex items-center justify-center text-sm font-medium ${excelStep > step
                    ? "bg-accent text-white"
                    : excelStep === step
                      ? "bg-accent text-white"
                      : "bg-secondary text-muted-foreground"
                    }`}
                >
                  {excelStep > step ? <CheckCircle2 className="size-5" /> : step}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded ${excelStep > step ? "bg-accent" : "bg-secondary"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>

          {excelStep === 1 && (
            <div className="py-8 text-center space-y-4">
              <FileSpreadsheet className="size-16 text-accent mx-auto" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Tải file mẫu</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Tải file mẫu để điền dữ liệu tồn kho của bạn
                </p>
                <Button onClick={handleDownloadTemplate} size="lg">
                  <Download className="size-4 mr-2" />
                  Tải file mẫu
                </Button>
              </div>
            </div>
          )}

          {excelStep === 2 && (
            <div className="py-8 text-center space-y-4">
              <Upload className="size-16 text-accent mx-auto" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Tải file lên</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Chọn file Excel đã điền dữ liệu để nhập kho
                </p>
                <Label
                  htmlFor="excel-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-dashed border-accent cursor-pointer hover:bg-accent/5 transition-colors"
                >
                  <Upload className="size-5" />
                  <span>Chọn file</span>
                </Label>
                <Input
                  ref={fileInputRef}
                  id="excel-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Đã chọn: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          )}

          {excelStep === 3 && (
            <div className="space-y-4">
              {isUploading || isExcelImporting ? (
                <div className="py-8 text-center">
                  <Loader2 className="size-8 animate-spin text-accent mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isUploading ? "Đang tải và xử lý file..." : "Đang nhập dữ liệu..."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Dòng</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Tên sản phẩm</TableHead>
                          <TableHead className="text-center">Số lượng</TableHead>
                          <TableHead>Trạng thái</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              Không có dữ liệu để xem trước
                            </TableCell>
                          </TableRow>
                        ) : (
                          previewData.map((row, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{row.row}</TableCell>
                              <TableCell className="font-mono text-sm">{row.sku}</TableCell>
                              <TableCell>{row.product_name}</TableCell>
                              <TableCell className="text-center">{row.import_quantity}</TableCell>
                              <TableCell>
                                {row.status === "valid" ? (
                                  <Badge className="bg-success">Hợp lệ</Badge>
                                ) : (
                                  <Badge className="bg-destructive" title={row.error}>
                                    Lỗi: {row.error}
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {previewData.filter((r) => r.status === "valid").length} hợp lệ,{" "}
                      {previewData.filter((r) => r.status === "error").length} lỗi
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {excelStep === 4 && (
            <div className="py-8 text-center space-y-4">
              <CheckCircle2 className="size-16 text-success mx-auto" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Nhập kho thành công</h3>
                <p className="text-sm text-muted-foreground">
                  Đã nhập thành công {previewData.filter((r) => r.status === "valid").length} sản phẩm.
                  {previewData.filter((r) => r.status === "error").length > 0 && (
                    <> {previewData.filter((r) => r.status === "error").length} dòng bị lỗi và đã được bỏ qua.</>
                  )}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            {excelStep < 4 && (
              <Button variant="outline" onClick={handleResetExcelImport} disabled={isUploading || isExcelImporting}>
                Hủy
              </Button>
            )}
            {excelStep === 1 && (
              <Button onClick={() => setExcelStep(2)}>
                Tiếp theo: Tải file lên
              </Button>
            )}
            {excelStep === 2 && (
              <Button disabled>
                Tiếp theo: Xem trước
              </Button>
            )}
            {excelStep === 3 && !isUploading && previewData.length > 0 && !isExcelImporting && (
              <Button
                onClick={handleConfirmImport}
                disabled={isExcelImporting}
                className="bg-accent hover:bg-accent/90"
              >
                {isExcelImporting ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Đang nhập...
                  </>
                ) : (
                  "Xác nhận nhập"
                )}
              </Button>
            )}
            {excelStep === 4 && (
              <Button onClick={handleResetExcelImport}>Đóng</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}