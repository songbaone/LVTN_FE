import { useState } from "react";
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface StockLog {
  id: string;
  productId: string;
  productName: string;
  variantSku: string;
  variantColor: string;
  variantMaterial: string;
  actionType: "MANUAL_IMPORT" | "EXCEL_IMPORT" | "ADJUST" | "ROLLBACK";
  oldQuantity: number;
  changeQuantity: number;
  newQuantity: number;
  referenceCode: string;
  performedBy: string;
  createdAt: string;
}

interface RollbackPreviewItem {
  logId: string;
  productName: string;
  variantSku: string;
  currentStock: number;
  willRevertTo: number;
}

interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_STOCK_LOGS: StockLog[] = [
  {
    id: "LOG-001",
    productId: "P1",
    productName: "Organic Cotton Onesie Set",
    variantSku: "BC-OCS-001-W-S",
    variantColor: "White",
    variantMaterial: "Cotton",
    actionType: "MANUAL_IMPORT",
    oldQuantity: 0,
    changeQuantity: 50,
    newQuantity: 50,
    referenceCode: "REF-IMP-20260601-001",
    performedBy: "Admin User",
    createdAt: "2026-06-01 10:30:00",
  },
  {
    id: "LOG-002",
    productId: "P1",
    productName: "Organic Cotton Onesie Set",
    variantSku: "BC-OCS-001-W-M",
    variantColor: "White",
    variantMaterial: "Cotton",
    actionType: "MANUAL_IMPORT",
    oldQuantity: 0,
    changeQuantity: 50,
    newQuantity: 50,
    referenceCode: "REF-IMP-20260601-001",
    performedBy: "Admin User",
    createdAt: "2026-06-01 10:30:00",
  },
  {
    id: "LOG-003",
    productId: "P2",
    productName: "Baby Monitor Premium",
    variantSku: "SM-BMP-002-BK",
    variantColor: "Black",
    variantMaterial: "Plastic",
    actionType: "EXCEL_IMPORT",
    oldQuantity: 0,
    changeQuantity: 30,
    newQuantity: 30,
    referenceCode: "REF-EXL-20260602-001",
    performedBy: "Admin User",
    createdAt: "2026-06-02 14:20:00",
  },
  {
    id: "LOG-004",
    productId: "P2",
    productName: "Baby Monitor Premium",
    variantSku: "SM-BMP-002-WH",
    variantColor: "White",
    variantMaterial: "Plastic",
    actionType: "EXCEL_IMPORT",
    oldQuantity: 0,
    changeQuantity: 20,
    newQuantity: 20,
    referenceCode: "REF-EXL-20260602-001",
    performedBy: "Admin User",
    createdAt: "2026-06-02 14:20:00",
  },
  {
    id: "LOG-005",
    productId: "P3",
    productName: "Silicone Feeding Set",
    variantSku: "SF-SFS-003-PK",
    variantColor: "Pink",
    variantMaterial: "Silicone",
    actionType: "ADJUST",
    oldQuantity: 100,
    changeQuantity: -5,
    newQuantity: 95,
    referenceCode: "REF-ADJ-20260603-001",
    performedBy: "Staff User",
    createdAt: "2026-06-03 09:15:00",
  },
  {
    id: "LOG-006",
    productId: "P4",
    productName: "Baby Stroller Lightweight",
    variantSku: "TR-SLW-004-GY",
    variantColor: "Gray",
    variantMaterial: "Aluminum",
    actionType: "ROLLBACK",
    oldQuantity: 8,
    changeQuantity: 42,
    newQuantity: 50,
    referenceCode: "REF-RBK-20260604-001",
    performedBy: "Admin User",
    createdAt: "2026-06-04 11:00:00",
  },
  {
    id: "LOG-007",
    productId: "P5",
    productName: "Diaper Bag Backpack",
    variantSku: "AC-DBB-005-NV",
    variantColor: "Navy",
    variantMaterial: "Polyester",
    actionType: "MANUAL_IMPORT",
    oldQuantity: 12,
    changeQuantity: 30,
    newQuantity: 42,
    referenceCode: "REF-IMP-20260605-001",
    performedBy: "Admin User",
    createdAt: "2026-06-05 08:45:00",
  },
  {
    id: "LOG-008",
    productId: "P6",
    productName: "Wooden Educational Toy Set",
    variantSku: "TY-WES-006-NT",
    variantColor: "Natural",
    variantMaterial: "Wood",
    actionType: "ADJUST",
    oldQuantity: 40,
    changeQuantity: -6,
    newQuantity: 34,
    referenceCode: "REF-ADJ-20260605-002",
    performedBy: "Staff User",
    createdAt: "2026-06-05 13:20:00",
  },
  {
    id: "LOG-009",
    productId: "P10",
    productName: "Baby Safety Gate",
    variantSku: "SF-BSG-010-WH",
    variantColor: "White",
    variantMaterial: "Metal",
    actionType: "EXCEL_IMPORT",
    oldQuantity: 0,
    changeQuantity: 50,
    newQuantity: 50,
    referenceCode: "REF-EXL-20260606-001",
    performedBy: "Admin User",
    createdAt: "2026-06-06 10:00:00",
  },
  {
    id: "LOG-010",
    productId: "P10",
    productName: "Baby Safety Gate",
    variantSku: "SF-BSG-010-BK",
    variantColor: "Black",
    variantMaterial: "Metal",
    actionType: "EXCEL_IMPORT",
    oldQuantity: 0,
    changeQuantity: 20,
    newQuantity: 20,
    referenceCode: "REF-EXL-20260606-001",
    performedBy: "Admin User",
    createdAt: "2026-06-06 10:00:00",
  },
  {
    id: "LOG-011",
    productId: "P1",
    productName: "Organic Cotton Onesie Set",
    variantSku: "BC-OCS-001-W-L",
    variantColor: "White",
    variantMaterial: "Cotton",
    actionType: "ADJUST",
    oldQuantity: 15,
    changeQuantity: -3,
    newQuantity: 12,
    referenceCode: "REF-ADJ-20260607-001",
    performedBy: "Staff User",
    createdAt: "2026-06-07 15:30:00",
  },
  {
    id: "LOG-012",
    productId: "P7",
    productName: "Organic Cotton Sleepsuit",
    variantSku: "BC-OCS-007-Y-S",
    variantColor: "Yellow",
    variantMaterial: "Cotton",
    actionType: "MANUAL_IMPORT",
    oldQuantity: 10,
    changeQuantity: 20,
    newQuantity: 30,
    referenceCode: "REF-IMP-20260608-001",
    performedBy: "Admin User",
    createdAt: "2026-06-08 09:00:00",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getActionTypeBadge = (type: StockLog["actionType"]) => {
  switch (type) {
    case "MANUAL_IMPORT":
      return <Badge className="bg-success">Manual Import</Badge>;
    case "EXCEL_IMPORT":
      return <Badge className="bg-blue-500">Excel Import</Badge>;
    case "ADJUST":
      return <Badge className="bg-yellow-500 text-white">Adjust</Badge>;
    case "ROLLBACK":
      return <Badge className="bg-destructive">Rollback</Badge>;
  }
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
  // ── Filters ──
  const [searchQuery, setSearchQuery] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState("ALL");
  const [referenceCodeFilter, setReferenceCodeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ── Pagination ──
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 8,
    totalItems: MOCK_STOCK_LOGS.length,
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

  // ── Filtered Data ──
  const filteredLogs = MOCK_STOCK_LOGS.filter((log) => {
    const matchesSearch =
      log.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.variantSku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesActionType =
      actionTypeFilter === "ALL" || log.actionType === actionTypeFilter;

    const matchesReferenceCode =
      !referenceCodeFilter ||
      log.referenceCode.toLowerCase().includes(referenceCodeFilter.toLowerCase());

    const matchesDateFrom =
      !dateFrom || log.createdAt >= dateFrom;

    const matchesDateTo =
      !dateTo || log.createdAt <= dateTo + " 23:59:59";

    return matchesSearch && matchesActionType && matchesReferenceCode && matchesDateFrom && matchesDateTo;
  });

  const totalPages = Math.ceil(filteredLogs.length / pagination.pageSize);
  const paginatedLogs = filteredLogs.slice(
    (pagination.currentPage - 1) * pagination.pageSize,
    pagination.currentPage * pagination.pageSize
  );

  // ── Handlers ──

  const handleViewReferenceDetail = (referenceCode: string) => {
    const logs = MOCK_STOCK_LOGS.filter((l) => l.referenceCode === referenceCode);
    setReferenceDetailLogs(logs);
    setReferenceDetailCode(referenceCode);
    setIsReferenceDetailOpen(true);
  };

  const handleOpenRollbackPreview = (referenceCode: string) => {
    setSelectedReferenceCode(referenceCode);
    setIsPreviewLoading(true);
    setIsRollbackPreviewOpen(true);

    // Simulate preview loading
    setTimeout(() => {
      const relatedLogs = MOCK_STOCK_LOGS.filter(
        (l) => l.referenceCode === referenceCode
      );
      const previewItems: RollbackPreviewItem[] = relatedLogs.map((log) => ({
        logId: log.id,
        productName: log.productName,
        variantSku: log.variantSku,
        currentStock: log.newQuantity,
        willRevertTo: log.oldQuantity,
      }));
      setRollbackPreviewItems(previewItems);
      setIsPreviewLoading(false);
    }, 1000);
  };

  const handleProceedToRollback = () => {
    setIsRollbackPreviewOpen(false);
    setIsConfirmRollbackOpen(true);
  };

  const handleExecuteRollback = () => {
    setIsRollbackExecuting(true);

    // Simulate rollback execution
    setTimeout(() => {
      setIsRollbackExecuting(false);
      setIsConfirmRollbackOpen(false);
      toast.success(`Rollback completed for reference: ${selectedReferenceCode} (mock)`);
      setSelectedReferenceCode("");
      setRollbackPreviewItems([]);
    }, 1500);
  };

  const handleCloseRollbackPreview = () => {
    setIsRollbackPreviewOpen(false);
    setSelectedReferenceCode("");
    setRollbackPreviewItems([]);
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  // ── Get unique reference codes for display ──
  const uniqueReferenceCodes = Array.from(
    new Set(MOCK_STOCK_LOGS.map((l) => l.referenceCode))
  );

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Stock History</h1>
        <p className="text-muted-foreground">
          Track all stock changes, view batch history, and perform rollbacks
        </p>
      </div>

      {/* ── Filters ── */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                className="pl-10"
              />
            </div>

            <Select
              value={actionTypeFilter}
              onValueChange={(v) => {
                setActionTypeFilter(v);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
            >
              <SelectTrigger>
                <Filter className="size-4 mr-2" />
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "ALL" ? "All Actions" : type.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Reference Code..."
              value={referenceCodeFilter}
              onChange={(e) => {
                setReferenceCodeFilter(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
            />

            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              placeholder="From date"
            />

            <Input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              placeholder="To date"
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
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── History Table ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="size-5" />
            Stock Change Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Log ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>Action Type</TableHead>
                  <TableHead className="text-center">Old</TableHead>
                  <TableHead className="text-center">Change</TableHead>
                  <TableHead className="text-center">New</TableHead>
                  <TableHead>Reference Code</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-16">
                      <div className="flex flex-col items-center">
                        <div className="size-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                          <History className="size-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No stock logs found</h3>
                        <p className="text-muted-foreground text-sm">
                          Try adjusting your filters
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-secondary/50">
                      <TableCell className="font-mono text-xs">{log.id}</TableCell>
                      <TableCell>
                        <span className="font-medium">{log.productName}</span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.variantSku}
                        <span className="text-muted-foreground ml-1">
                          ({log.variantColor} / {log.variantMaterial})
                        </span>
                      </TableCell>
                      <TableCell>{getActionTypeBadge(log.actionType)}</TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {log.oldQuantity}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`font-bold ${
                            log.changeQuantity > 0
                              ? "text-success"
                              : log.changeQuantity < 0
                              ? "text-destructive"
                              : ""
                          }`}
                        >
                          {log.changeQuantity > 0 ? "+" : ""}
                          {log.changeQuantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {log.newQuantity}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleViewReferenceDetail(log.referenceCode)}
                          className="font-mono text-xs text-accent hover:underline cursor-pointer text-left"
                        >
                          {log.referenceCode}
                        </button>
                      </TableCell>
                      <TableCell className="text-sm">{log.performedBy}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.createdAt}
                      </TableCell>
                      <TableCell className="text-right">
                        {log.actionType !== "ROLLBACK" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenRollbackPreview(log.referenceCode)}
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
          {filteredLogs.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {(pagination.currentPage - 1) * pagination.pageSize + 1}–
                {Math.min(
                  pagination.currentPage * pagination.pageSize,
                  filteredLogs.length
                )}{" "}
                of {filteredLogs.length} logs
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage <= 1}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                  disabled={pagination.currentPage >= totalPages}
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
            <DialogTitle>Batch History</DialogTitle>
            <DialogDescription>
              Reference Code: <span className="font-mono font-bold">{referenceDetailCode}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Log ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Variant SKU</TableHead>
                  <TableHead>Action Type</TableHead>
                  <TableHead className="text-center">Old</TableHead>
                  <TableHead className="text-center">Change</TableHead>
                  <TableHead className="text-center">New</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referenceDetailLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">{log.id}</TableCell>
                    <TableCell>{log.productName}</TableCell>
                    <TableCell className="text-sm">{log.variantSku}</TableCell>
                    <TableCell>{getActionTypeBadge(log.actionType)}</TableCell>
                    <TableCell className="text-center">{log.oldQuantity}</TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`font-bold ${
                          log.changeQuantity > 0 ? "text-success" : "text-destructive"
                        }`}
                      >
                        {log.changeQuantity > 0 ? "+" : ""}
                        {log.changeQuantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{log.newQuantity}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.createdAt}
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
              Close
            </Button>
            {referenceDetailLogs.every((l) => l.actionType !== "ROLLBACK") && (
              <Button
                onClick={() => {
                  setIsReferenceDetailOpen(false);
                  handleOpenRollbackPreview(referenceDetailCode);
                }}
                className="bg-destructive hover:bg-destructive/90"
              >
                <RotateCcw className="size-4 mr-2" />
                Rollback Batch
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rollback Preview</DialogTitle>
            <DialogDescription>
              Reference Code: <span className="font-mono font-bold">{selectedReferenceCode}</span>
            </DialogDescription>
          </DialogHeader>

          {isPreviewLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="size-8 animate-spin text-accent mx-auto mb-4" />
              <p className="text-muted-foreground">Loading rollback preview...</p>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20 mb-4">
                <AlertTriangle className="size-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-warning">Warning: Rollback Action</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This will revert the stock changes made in this batch. This action cannot be undone.
                    Please review the changes below before proceeding.
                  </p>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Variant</TableHead>
                      <TableHead className="text-center">Current Stock</TableHead>
                      <TableHead className="text-center">Will Revert To</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rollbackPreviewItems.map((item) => (
                      <TableRow key={item.logId}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell className="font-mono text-sm">{item.variantSku}</TableCell>
                        <TableCell className="text-center">{item.currentStock}</TableCell>
                        <TableCell className="text-center font-bold text-warning">
                          {item.willRevertTo}
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
              Cancel
            </Button>
            <Button
              onClick={handleProceedToRollback}
              disabled={isPreviewLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              <RotateCcw className="size-4 mr-2" />
              Proceed to Rollback
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
            <DialogTitle>Confirm Rollback</DialogTitle>
            <DialogDescription>
              Are you sure you want to rollback the batch with reference code{" "}
              <span className="font-mono font-bold">{selectedReferenceCode}</span>?
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="size-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Irreversible Action</p>
              <p className="text-xs text-muted-foreground mt-1">
                This will revert stock quantities for {rollbackPreviewItems.length} variant(s) to their
                previous values. This operation cannot be undone.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmRollbackOpen(false)}
              disabled={isRollbackExecuting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExecuteRollback}
              disabled={isRollbackExecuting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isRollbackExecuting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <RotateCcw className="size-4 mr-2" />
                  Confirm Rollback
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}