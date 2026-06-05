import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Alert, AlertDescription } from "../ui/alert";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Home,
  Briefcase,
  MapPinned,
  Star,
  AlertCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface Address {
  id: string;
  label: string;
  receiverName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  isDefault: boolean;
  type: "home" | "work" | "other";
}

export default function AddressManagement() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      label: "Home",
      receiverName: "Nguyễn Thu Hương",
      phone: "+84 912 345 678",
      province: "Ho Chi Minh",
      district: "District 1",
      ward: "Ben Nghe Ward",
      street: "123 Nguyễn Huệ",
      isDefault: true,
      type: "home"
    },
    {
      id: "2",
      label: "Office",
      receiverName: "Nguyễn Thu Hương",
      phone: "+84 912 345 678",
      province: "Ho Chi Minh",
      district: "District 3",
      ward: "Ward 1",
      street: "456 Điện Biên Phủ",
      isDefault: false,
      type: "work"
    },
    {
      id: "3",
      label: "Parents House",
      receiverName: "Nguyễn Văn An",
      phone: "+84 987 654 321",
      province: "Ha Noi",
      district: "Ba Dinh",
      ward: "Ngoc Ha Ward",
      street: "789 Kim Mã",
      isDefault: false,
      type: "other"
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    label: "",
    receiverName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    street: "",
    isDefault: false,
    type: "home" as "home" | "work" | "other"
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock data for cascading dropdowns
  const provinces = [
    "Ho Chi Minh",
    "Ha Noi",
    "Da Nang",
    "Can Tho",
    "Hai Phong"
  ];

  const districtsByProvince: Record<string, string[]> = {
    "Ho Chi Minh": ["District 1", "District 2", "District 3", "Thu Duc", "Binh Thanh"],
    "Ha Noi": ["Ba Dinh", "Hoan Kiem", "Dong Da", "Hai Ba Trung", "Cau Giay"],
    "Da Nang": ["Hai Chau", "Cam Le", "Son Tra", "Ngu Hanh Son", "Lien Chieu"],
    "Can Tho": ["Ninh Kieu", "Binh Thuy", "Cai Rang", "O Mon", "Thot Not"],
    "Hai Phong": ["Hong Bang", "Ngo Quyen", "Le Chan", "Hai An", "Kien An"]
  };

  const wardsByDistrict: Record<string, string[]> = {
    "District 1": ["Ben Nghe Ward", "Ben Thanh Ward", "Nguyen Thai Binh Ward", "Pham Ngu Lao Ward"],
    "District 3": ["Ward 1", "Ward 2", "Ward 3", "Ward 4"],
    "Ba Dinh": ["Ngoc Ha Ward", "Dien Bien Ward", "Doi Can Ward", "Quan Thanh Ward"],
    // Add more as needed
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Reset dependent fields when province changes
      if (field === "province") {
        updated.district = "";
        updated.ward = "";
      }

      // Reset ward when district changes
      if (field === "district") {
        updated.ward = "";
      }

      return updated;
    });

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.label.trim()) {
      newErrors.label = "Address label is required";
    }

    if (!formData.receiverName.trim()) {
      newErrors.receiverName = "Receiver name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[+]?[\d\s()-]+$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    if (!formData.province) {
      newErrors.province = "Province is required";
    }

    if (!formData.district) {
      newErrors.district = "District is required";
    }

    if (!formData.ward) {
      newErrors.ward = "Ward is required";
    }

    if (!formData.street.trim()) {
      newErrors.street = "Street address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setFormData({
      label: "",
      receiverName: "",
      phone: "",
      province: "",
      district: "",
      ward: "",
      street: "",
      isDefault: false,
      type: "home"
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      receiverName: address.receiverName,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      street: address.street,
      isDefault: address.isDefault,
      type: address.type
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving");
      return;
    }

    setIsSaving(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (editingAddress) {
      // Update existing address
      setAddresses(prev => prev.map(addr =>
        addr.id === editingAddress.id
          ? { ...addr, ...formData }
          : formData.isDefault ? { ...addr, isDefault: false } : addr
      ));
      toast.success("Address updated successfully!");
    } else {
      // Add new address
      const newAddress: Address = {
        id: Date.now().toString(),
        ...formData
      };

      setAddresses(prev =>
        formData.isDefault
          ? [...prev.map(a => ({ ...a, isDefault: false })), newAddress]
          : [...prev, newAddress]
      );
      toast.success("Address added successfully!");
    }

    setIsSaving(false);
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setDeletingAddressId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingAddressId) return;

    setIsSaving(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    setAddresses(prev => prev.filter(addr => addr.id !== deletingAddressId));
    toast.success("Address deleted successfully!");

    setIsSaving(false);
    setIsDeleteDialogOpen(false);
    setDeletingAddressId(null);
  };

  const handleSetDefault = async (id: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
    toast.success("Default address updated!");
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "home": return Home;
      case "work": return Briefcase;
      default: return MapPinned;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "home": return "bg-success";
      case "work": return "bg-info";
      default: return "bg-warning";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Address Management</h1>
          <Button onClick={handleAddNew} className="bg-accent hover:bg-accent/90">
            <Plus className="size-4 mr-2" />
            Add New Address
          </Button>
        </div>
        <p className="text-muted-foreground">Manage your delivery addresses</p>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="size-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <MapPin className="size-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No addresses yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Add your first delivery address to make checkout faster
            </p>
            <Button onClick={handleAddNew} className="bg-accent hover:bg-accent/90">
              <Plus className="size-4 mr-2" />
              Add Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => {
            const TypeIcon = getTypeIcon(address.type);
            return (
              <Card
                key={address.id}
                className={`relative ${address.isDefault ? "border-2 border-accent" : ""}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`size-10 rounded-full ${getTypeColor(address.type)} flex items-center justify-center`}>
                        <TypeIcon className="size-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{address.label}</CardTitle>
                        {address.isDefault && (
                          <Badge className="bg-accent mt-1 text-xs">
                            <Star className="size-3 mr-1" />
                            Default Address
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {address.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold text-base mb-1">{address.receiverName}</p>
                    <p className="text-sm text-muted-foreground">{address.phone}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm">{address.street}</p>
                    <p className="text-sm text-muted-foreground">
                      {address.ward}, {address.district}
                    </p>
                    <p className="text-sm text-muted-foreground">{address.province}</p>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-border">
                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                        className="flex-1"
                      >
                        <Star className="size-3 mr-1" />
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(address)}
                      className={address.isDefault ? "flex-1" : ""}
                    >
                      <Edit2 className="size-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(address.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Edit Address" : "Add New Address"}
            </DialogTitle>
            <DialogDescription>
              {editingAddress ? "Update your delivery address details" : "Add a new delivery address to your account"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Address Label & Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="label">
                  Address Label <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => handleChange("label", e.target.value)}
                  placeholder="e.g., Home, Office"
                  className={errors.label ? "border-destructive" : ""}
                />
                {errors.label && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {errors.label}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="type">Address Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => handleChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Receiver Name & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="receiverName">
                  Receiver Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="receiverName"
                  value={formData.receiverName}
                  onChange={(e) => handleChange("receiverName", e.target.value)}
                  placeholder="Full name"
                  className={errors.receiverName ? "border-destructive" : ""}
                />
                {errors.receiverName && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {errors.receiverName}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+84 912 345 678"
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Province → District → Ward (Cascading) */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="province">
                  Province/City <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.province}
                  onValueChange={(value) => handleChange("province", value)}
                >
                  <SelectTrigger className={errors.province ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.province && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {errors.province}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="district">
                  District <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.district}
                  onValueChange={(value) => handleChange("district", value)}
                  disabled={!formData.province}
                >
                  <SelectTrigger className={errors.district ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {(districtsByProvince[formData.province] || []).map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.district && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {errors.district}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="ward">
                  Ward <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.ward}
                  onValueChange={(value) => handleChange("ward", value)}
                  disabled={!formData.district}
                >
                  <SelectTrigger className={errors.ward ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {(wardsByDistrict[formData.district] || []).map((ward) => (
                      <SelectItem key={ward} value={ward}>
                        {ward}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.ward && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {errors.ward}
                  </p>
                )}
              </div>
            </div>

            {/* Street Address */}
            <div>
              <Label htmlFor="street">
                Street Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => handleChange("street", e.target.value)}
                placeholder="House number, street name"
                className={errors.street ? "border-destructive" : ""}
              />
              {errors.street && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.street}
                </p>
              )}
            </div>

            {/* Set as Default */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => handleChange("isDefault", e.target.checked)}
                className="size-4 rounded border-border"
              />
              <Label htmlFor="isDefault" className="cursor-pointer font-normal">
                Set as default address
              </Label>
            </div>

            {formData.isDefault && (
              <Alert>
                <AlertCircle className="size-4" />
                <AlertDescription className="text-sm">
                  This address will be used as your default delivery address for all orders.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-accent hover:bg-accent/90"
            >
              {isSaving && <Loader2 className="size-4 mr-2 animate-spin" />}
              {isSaving ? "Saving..." : editingAddress ? "Update Address" : "Add Address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Address</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="size-4 mr-2 animate-spin" />}
              {isSaving ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
