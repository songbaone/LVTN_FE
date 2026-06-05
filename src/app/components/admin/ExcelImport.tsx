import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Upload,
  FileSpreadsheet,
  Check,
  X,
  AlertTriangle,
  Download,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Separator } from "../ui/separator";

interface ExcelImportProps {
  type?: "products" | "inventory";
}

export default function ExcelImport({ type = "products" }: ExcelImportProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, name: "Upload File", icon: Upload },
    { id: 2, name: "Preview Data", icon: FileSpreadsheet },
    { id: 3, name: "Column Mapping", icon: Check },
    { id: 4, name: "Validation", icon: AlertTriangle },
    { id: 5, name: "Duplicate Check", icon: X },
    { id: 6, name: "Summary", icon: CheckCircle2 },
    { id: 7, name: "Import", icon: Check },
  ];

  const sampleData = [
    { name: "Organic Cotton Onesie", sku: "BC-OCS-001", price: "450000", stock: "50", category: "Clothing" },
    { name: "Baby Monitor Premium", sku: "SM-BMP-002", price: "1250000", stock: "20", category: "Electronics" },
    { name: "Feeding Set", sku: "SF-SFS-003", price: "320000", stock: "35", category: "Feeding" },
  ];

  const validationErrors = [
    { row: 5, column: "Price", error: "Invalid price format", severity: "error" },
    { row: 8, column: "SKU", error: "SKU already exists", severity: "warning" },
    { row: 12, column: "Category", error: "Category not found", severity: "error" },
  ];

  const duplicates = [
    { sku: "BC-OCS-001", existingName: "Organic Cotton Onesie", newName: "Organic Cotton Onesie Set" },
    { sku: "SM-BMP-002", existingName: "Baby Monitor Premium", newName: "Baby Monitor Premium Plus" },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center py-12">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
              <FileSpreadsheet className="size-16 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Upload Excel File</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Upload your {type} data in Excel format. Make sure your file follows the template format.
            </p>
            <div className="max-w-xl mx-auto border-2 border-dashed border-primary rounded-lg p-12 hover:bg-secondary/50 transition-colors cursor-pointer mb-6">
              <Upload className="size-12 mx-auto mb-4 text-primary" />
              <p className="font-medium mb-2">Click to upload or drag and drop</p>
              <p className="text-sm text-muted-foreground">XLSX, XLS (max. 10MB)</p>
            </div>
            <Button variant="outline" className="mr-3">
              <Download className="size-4 mr-2" />
              Download Template
            </Button>
            <Button className="bg-accent hover:bg-accent/90" onClick={() => setCurrentStep(2)}>
              Upload & Continue
            </Button>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-3">Preview Data</h2>
            <p className="text-muted-foreground mb-6">
              Review the data from your Excel file before proceeding. Found <Badge className="bg-accent">{sampleData.length} rows</Badge>
            </p>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleData.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.price} ₫</TableCell>
                        <TableCell>{item.stock}</TableCell>
                        <TableCell>{item.category}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-3">Column Mapping</h2>
            <p className="text-muted-foreground mb-6">
              Map the columns from your Excel file to the database fields
            </p>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { excel: "Name", field: "Product Name" },
                    { excel: "SKU", field: "SKU Code" },
                    { excel: "Price", field: "Selling Price" },
                    { excel: "Stock", field: "Stock Quantity" },
                    { excel: "Category", field: "Product Category" },
                  ].map((mapping) => (
                    <div key={mapping.excel} className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-1 block">Excel Column</label>
                        <Input value={mapping.excel} disabled className="bg-secondary" />
                      </div>
                      <div className="pt-6">→</div>
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-1 block">Database Field</label>
                        <Select defaultValue={mapping.field}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Product Name">Product Name</SelectItem>
                            <SelectItem value="SKU Code">SKU Code</SelectItem>
                            <SelectItem value="Selling Price">Selling Price</SelectItem>
                            <SelectItem value="Stock Quantity">Stock Quantity</SelectItem>
                            <SelectItem value="Product Category">Product Category</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-3">Validation Results</h2>
            <p className="text-muted-foreground mb-6">
              Found {validationErrors.length} validation issues that need attention
            </p>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {validationErrors.map((error, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 p-4 rounded-lg border ${
                        error.severity === "error"
                          ? "border-destructive bg-destructive/5"
                          : "border-warning bg-warning/5"
                      }`}
                    >
                      {error.severity === "error" ? (
                        <XCircle className="size-5 text-destructive flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="size-5 text-warning flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium mb-1">
                          Row {error.row} - {error.column}
                        </p>
                        <p className="text-sm text-muted-foreground">{error.error}</p>
                      </div>
                      <Badge variant="secondary">
                        {error.severity === "error" ? "Error" : "Warning"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-3">Duplicate SKU Detection</h2>
            <p className="text-muted-foreground mb-6">
              Found {duplicates.length} products with existing SKUs. Choose how to handle them.
            </p>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {duplicates.map((dup, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary">SKU: {dup.sku}</Badge>
                        <Select defaultValue="skip">
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="skip">Skip</SelectItem>
                            <SelectItem value="update">Update Existing</SelectItem>
                            <SelectItem value="create">Create New</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Existing Product</p>
                          <p className="font-medium">{dup.existingName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">New Product</p>
                          <p className="font-medium">{dup.newName}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 6:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-3">Import Summary</h2>
            <p className="text-muted-foreground mb-6">Review the summary before importing</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="size-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="size-6 text-success" />
                  </div>
                  <p className="text-3xl font-bold mb-1">145</p>
                  <p className="text-sm text-muted-foreground">Valid Records</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="size-12 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="size-6 text-warning" />
                  </div>
                  <p className="text-3xl font-bold mb-1">3</p>
                  <p className="text-sm text-muted-foreground">Warnings</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
                    <XCircle className="size-6 text-destructive" />
                  </div>
                  <p className="text-3xl font-bold mb-1">2</p>
                  <p className="text-sm text-muted-foreground">Errors</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Rows</span>
                    <span className="font-medium">150</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Will Import</span>
                    <span className="font-medium text-success">145</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Will Skip</span>
                    <span className="font-medium text-destructive">5</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Action</span>
                    <span className="font-semibold">Import Products</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 7:
        return (
          <div className="text-center py-12">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="size-16 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Import Successful!</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Successfully imported 145 products. You can view them in the product management page.
            </p>
            <div className="max-w-md mx-auto mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-5 text-success" />
                      <span>145 products imported</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="size-5 text-warning" />
                      <span>3 products with warnings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="size-5 text-destructive" />
                      <span>2 products skipped</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Button className="bg-accent hover:bg-accent/90">View Products</Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Import {type === "products" ? "Products" : "Inventory"}</h1>
      <p className="text-muted-foreground mb-8">Follow the steps to import your data from Excel</p>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div
                className={`size-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                  currentStep === step.id
                    ? "bg-accent text-accent-foreground"
                    : currentStep > step.id
                    ? "bg-success text-success-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {currentStep > step.id ? <Check className="size-5" /> : <step.icon className="size-5" />}
              </div>
              <span className="text-xs text-center font-medium hidden md:block">{step.name}</span>
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 w-full h-0.5 bg-secondary -z-10" style={{ top: "20px" }} />
              )}
            </div>
          ))}
        </div>
        <Progress value={(currentStep / steps.length) * 100} className="h-2" />
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-8">{renderStep()}</CardContent>
      </Card>

      {/* Navigation */}
      {currentStep !== 1 && currentStep !== 7 && (
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
            Previous
          </Button>
          <Button
            className="bg-accent hover:bg-accent/90"
            onClick={() => setCurrentStep(Math.min(7, currentStep + 1))}
          >
            {currentStep === 6 ? "Start Import" : "Continue"}
          </Button>
        </div>
      )}
    </div>
  );
}
