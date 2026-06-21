import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Search,
  Filter,
  History,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { stockService } from "../../../services/stock.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StockLog {
  log_id: number;
  product_name: string;
  variant_sku: string;
  action_type: "MANUAL_IMPORT" | "EXCEL_IMPORT" | "ADJUST" | "ROLLBACK";
  old_quantity: number;
  change_quantity: number;
  new_quantity: number;
  reference_code: string;
  created_by: number | null;
  created_at: string;
}

interface ApiStockLog {
  log_id: number;
  product_name: string;
  variant_sku: string;
  action_type: "MANUAL_IMPORT" | "EXCEL_IMPORT" | "ADJUST" | "ROLLBACK";
  old_quantity: number;
  change_quantity: number;
  new_quantity: number;
  reference_code: string;
  created_by: number | null;
  created_at: string;
}

interface RollbackPreviewItem {
  variant_id: string;
  product_name: string;
  sku: string;
  current_stock: number;
  target_rollback_stock: number;
}

interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getActionTypeBadge = (type: StockLog["action_type"]) => {
  switch (type) {
    case "MANUAL_IMPORT":
      return <Badge className="bg-success">Nhập kho thủ công</Badge>;
    case "EXCEL_IMPORT":
      return <Badge className="bg-blue-500">Nhập Excel</Badge>;
    case "ADJUST":
      return <Badge className="bg-yellow-500 text-white">Điều chỉnh</Badge>;
    case "ROLLBACK":
      return <Badge className="bg-destructive">Hoàn tác</Badge>;
  }
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);

  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(
    d.getUTCMonth() + 1
  ).padStart(2, "0")}/${d.getUTCFullYear()} ${String(
    d.getUTCHours()
  ).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
};

const ACTION_TYPES = [
  "ALL",
  "MANUAL_IMPORT",
  "EXCEL_IMPORT",
  "ADJUST",
  "ROLLBACK",
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function StockHistoryManagement() {
  // ── Data ──
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ── Filters ──
  const [searchQuery, setSearchQuery] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState("ALL");
  const [referenceCodeFilter, setReferenceCodeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ── Pagination ──
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // ── Rollback Dialog ──
  const [isRollbackPreviewOpen, setIsRollbackPreviewOpen] = useState(false);
  const [selectedReferenceCode, setSelectedReferenceCode] = useState("");
  const [rollbackPreviewItems, setRollbackPreviewItems] = useState<RollbackPreviewItem[]>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // ── Confirm Rollback Dialog ──
  const [isConfirmRollbackOpen, setIsConfirmRollbackOpen] = useState(false);
  const [isRollbackExecuting, setIsRollbackExecuting] = useState(false);

  // ── Reference Code Detail Dialog ──
  const [isReferenceDetailOpen, setIsReferenceDetailOpen] = useState(false);
  const [referenceDetailLogs, setReferenceDetailLogs] = useState<StockLog[]>([]);
  const [referenceDetailCode, setReferenceDetailCode] = useState("");

  // ── Load Data ──
  const loadStockLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("[DIAG] Stock Log Filters:", {
        search: searchQuery,
        actionType: actionTypeFilter,
        referenceCode: referenceCodeFilter,
        dateFrom: dateFrom,
        dateTo: dateTo,
        page: pagination.currentPage,
        limit: pagination.pageSize,
      });
      const params: Record<string, unknown> = {
        page: pagination.currentPage,
        limit: pagination.pageSize,
      };
      if (searchQuery) params.search = searchQuery;
      if (actionTypeFilter !== "ALL") params.action_type = actionTypeFilter;
      if (referenceCodeFilter) params.reference_code = referenceCodeFilter;
      if (dateFrom && dateTo && dateFrom > dateTo) {
        toast.error("Ngày bắt đầu không được lớn hơn ngày kết thúc");
        setIsLoading(false);
        return;
      }
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      console.log("[DIAG] Stock Log Request Params:", params);
      const res = await stockService.getStockLogs(params);
      console.log("[DIAG] Stock Logs API Response:", res);
      console.log("[DIAG] Stock Logs Response Data:", res.data);
      const data = res.data.data;
      const pg = data.pagination;

      setStockLogs(data.logs);
      setPagination({
        currentPage: pg.page,
        pageSize: pg.limit,
        totalItems: pg.total,
        totalPages: pg.totalPages,
        hasNextPage: pg.hasNextPage,
        hasPrevPage: pg.hasPrevPage,
      });
    } catch (error) {
      toast.error("Tải lịch sử tồn kho thất bại");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, actionTypeFilter, referenceCodeFilter, dateFrom, dateTo, pagination.currentPage, pagination.pageSize]);

  useEffect(() => {
    loadStockLogs();
  }, [loadStockLogs]);

  // ── Reference codes extracted from data ──
  const uniqueReferenceCodes = Array.from(
    new Set(stockLogs.map((l) => l.reference_code))
  );

  // ── Handlers ──

  const handleViewReferenceDetail = (referenceCode: string) => {
    const logs = stockLogs.filter((l) => l.reference_code === referenceCode);
    setReferenceDetailLogs(logs);
    setReferenceDetailCode(referenceCode);
    setIsReferenceDetailOpen(true);
  };

  const handleOpenRollbackPreview = async (referenceCode: string) => {
    setSelectedReferenceCode(referenceCode);
    setIsPreviewLoading(true);
    setIsRollbackPreviewOpen(true);

    try {
      const res = await stockService.previewRollback(referenceCode);
      console.log("Rollback preview response:", res.data);
      const items: RollbackPreviewItem[] = (res.data.data.affected_variants ?? []).map(
        (item: { variant_id: number; product_name: string; sku: string; current_stock: number; target_rollback_stock: number }) => ({
          variant_id: String(item.variant_id),
          product_name: item.product_name,
          sku: item.sku,
          current_stock: item.current_stock,
          target_rollback_stock: item.target_rollback_stock,
        })
      );
      setRollbackPreviewItems(items);
    } catch (error) {
      toast.error("Không thể tải dữ liệu hoàn tác");
      setIsRollbackPreviewOpen(false);
      setSelectedReferenceCode("");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleProceedToRollback = () => {
    setIsRollbackPreviewOpen(false);
    setIsConfirmRollbackOpen(true);
  };

  const handleExecuteRollback = async () => {
    setIsRollbackExecuting(true);

    try {
      await stockService.rollback(selectedReferenceCode);
      toast.success("Hoàn tác thành công");
      setIsConfirmRollbackOpen(false);
      setSelectedReferenceCode("");
      setRollbackPreviewItems([]);
      // Refresh stock history data
      loadStockLogs();
    } catch (error) {
      toast.error("Hoàn tác thất bại");
    } finally {
      setIsRollbackExecuting(false);
    }
  };

  const handleCloseRollbackPreview = () => {
    setIsRollbackPreviewOpen(false);
    setSelectedReferenceCode("");
    setRollbackPreviewItems([]);
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleFilterChange = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Lịch sử tồn kho</h1>
        <p className="text-muted-foreground">
          Theo dõi tất cả thay đổi tồn kho, xem lịch sử theo lô và thực hiện hoàn tác
        </p>
      </div>

      {/* ── Filters ── */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm nhật ký..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleFilterChange();
                }}
                className="pl-10"
              />
            </div>

            <Select
              value={actionTypeFilter}
              onValueChange={(v) => {
                setActionTypeFilter(v);
                handleFilterChange();
              }}
            >
              <SelectTrigger>
                <Filter className="size-4 mr-2" />
                <SelectValue placeholder="Loại thao tác" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "ALL" ? "Tất cả thao tác" : type === "MANUAL_IMPORT" ? "Nhập kho thủ công" : type === "EXCEL_IMPORT" ? "Nhập Excel" : type === "ADJUST" ? "Điều chỉnh" : "Hoàn tác"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                handleFilterChange();
              }}
              placeholder="Từ ngày"
            />

            <Input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                handleFilterChange();
              }}
              placeholder="Đến ngày"
            />

            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setActionTypeFilter("ALL");
                setReferenceCodeFilter("");
                setDateFrom("");
                setDateTo("");
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── History Table ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="size-5" />
            Nhật ký thay đổi tồn kho
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã nhật ký</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Biến thể</TableHead>
                  <TableHead>Loại thao tác</TableHead>
                  <TableHead className="text-center">Cũ</TableHead>
                  <TableHead className="text-center">Thay đổi</TableHead>
                  <TableHead className="text-center">Mới</TableHead>
                  <TableHead>Mã tham chiếu</TableHead>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-16">
                      <Loader2 className="size-8 animate-spin text-accent mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : stockLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-16">
                      <div className="flex flex-col items-center">
                        <div className="size-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                          <History className="size-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Không có lịch sử tồn kho</h3>
                        <p className="text-muted-foreground text-sm">
                          Hãy thử điều chỉnh bộ lọc
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  stockLogs.map((log) => (
                    <TableRow key={log.log_id} className="hover:bg-secondary/50">
                      <TableCell className="font-mono text-xs">{log.log_id}</TableCell>
                      <TableCell>
                        <span className="font-medium">{log.product_name}</span>
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="font-mono">{log.variant_sku}</span>
                      </TableCell>
                      <TableCell>{getActionTypeBadge(log.action_type)}</TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {log.old_quantity}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`font-bold ${log.change_quantity > 0
                            ? "text-success"
                            : log.change_quantity < 0
                              ? "text-destructive"
                              : ""
                            }`}
                        >
                          {log.change_quantity > 0 ? "+" : ""}
                          {log.change_quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {log.new_quantity}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleViewReferenceDetail(log.reference_code)}
                          className="font-mono text-xs text-accent hover:underline cursor-pointer text-left"
                        >
                          {log.reference_code}
                        </button>
                      </TableCell>
                      <TableCell className="text-sm">
                        User #{log.created_by ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        {log.action_type !== "ROLLBACK" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenRollbackPreview(log.reference_code)}
                            title="Rollback this batch"
                          >
                            <RotateCcw className="size-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!isLoading && pagination.totalItems > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-muted-foreground">
                Hiển thị {(pagination.currentPage - 1) * pagination.pageSize + 1}–
                {Math.min(
                  pagination.currentPage * pagination.pageSize,
                  pagination.totalItems
                )}{" "}
                trên tổng số {pagination.totalItems} nhật ký
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
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════════
         DIALOG: REFERENCE CODE DETAIL (Batch History)
         ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={isReferenceDetailOpen} onOpenChange={setIsReferenceDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Lịch sử theo lô</DialogTitle>
            <DialogDescription>
              Mã tham chiếu: <span className="font-mono font-bold">{referenceDetailCode}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã nhật ký</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Biến thể</TableHead>
                  <TableHead>Loại thao tác</TableHead>
                  <TableHead className="text-center">Cũ</TableHead>
                  <TableHead className="text-center">Thay đổi</TableHead>
                  <TableHead className="text-center">Mới</TableHead>
                  <TableHead>Thời gian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referenceDetailLogs.map((log) => (
                  <TableRow key={log.log_id}>
                    <TableCell className="font-mono text-xs">{log.log_id}</TableCell>
                    <TableCell>{log.product_name}</TableCell>
                    <TableCell className="text-sm font-mono">{log.variant_sku}</TableCell>
                    <TableCell>{getActionTypeBadge(log.action_type)}</TableCell>
                    <TableCell className="text-center">{log.old_quantity}</TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`font-bold ${log.change_quantity > 0 ? "text-success" : "text-destructive"
                          }`}
                      >
                        {log.change_quantity > 0 ? "+" : ""}
                        {log.change_quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{log.new_quantity}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReferenceDetailOpen(false)}
            >
              Đóng
            </Button>
            {referenceDetailLogs.every((l) => l.action_type !== "ROLLBACK") && (
              <Button
                onClick={() => {
                  setIsReferenceDetailOpen(false);
                  handleOpenRollbackPreview(referenceDetailCode);
                }}
                className="bg-destructive hover:bg-destructive/90"
              >
                <RotateCcw className="size-4 mr-2" />
                Hoàn tác lô
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════════
         DIALOG: ROLLBACK PREVIEW
         ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={isRollbackPreviewOpen} onOpenChange={(open) => {
        if (!open) handleCloseRollbackPreview();
      }}>
        <DialogContent className="max-w-7xl">
          <DialogHeader>
            <DialogTitle>Xem trước hoàn tác</DialogTitle>
            <DialogDescription>
              Mã tham chiếu: <span className="font-mono font-bold">{selectedReferenceCode}</span>
            </DialogDescription>
          </DialogHeader>

          {isPreviewLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="size-8 animate-spin text-accent mx-auto mb-4" />
              <p className="text-muted-foreground">Đang tải dữ liệu hoàn tác...</p>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20 mb-4">
                <AlertTriangle className="size-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-warning">Cảnh báo: Thao tác hoàn tác</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Hành động này sẽ khôi phục các thay đổi tồn kho trong lô này. Thao tác này không thể hoàn tác.
                    Vui lòng xem lại các thay đổi trước khi tiếp tục.
                  </p>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Biến thể</TableHead>
                      <TableHead className="text-center">Tồn kho hiện tại</TableHead>
                      <TableHead className="text-center">Sẽ khôi phục về</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rollbackPreviewItems.map((item) => (
                      <TableRow key={item.variant_id}>
                        <TableCell className="font-medium">
                          {item.product_name}
                        </TableCell>

                        <TableCell className="font-mono text-sm">
                          {item.sku}
                        </TableCell>

                        <TableCell className="text-center">
                          {item.current_stock}
                        </TableCell>

                        <TableCell className="text-center font-bold text-warning">
                          {item.target_rollback_stock}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseRollbackPreview}>
              Hủy
            </Button>
            <Button
              onClick={handleProceedToRollback}
              disabled={isPreviewLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              <RotateCcw className="size-4 mr-2" />
              Tiếp tục hoàn tác
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════════
         DIALOG: ROLLBACK CONFIRMATION
         ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={isConfirmRollbackOpen} onOpenChange={setIsConfirmRollbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận hoàn tác</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn hoàn tác lô có mã tham chiếu{" "}
              <span className="font-mono font-bold">{selectedReferenceCode}</span>?
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="size-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Hành động không thể hoàn tác</p>
              <p className="text-xs text-muted-foreground mt-1">
                Thao tác này sẽ khôi phục số lượng tồn kho cho {rollbackPreviewItems.length} biến thể về giá trị trước đó.
                Hành động này không thể được hoàn tác.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmRollbackOpen(false)}
              disabled={isRollbackExecuting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleExecuteRollback}
              disabled={isRollbackExecuting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isRollbackExecuting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Đang thực hiện...
                </>
              ) : (
                <>
                  <RotateCcw className="size-4 mr-2" />
                  Xác nhận hoàn tác
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}