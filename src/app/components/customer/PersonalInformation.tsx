import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Alert, AlertDescription } from "../ui/alert";
import { Upload, CheckCircle2, AlertCircle, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PersonalInformation() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "Nguyễn Thu Hương",
    email: "nguyen.huong@email.com",
    phone: "+84 912 345 678",
    gender: "female",
    dateOfBirth: "1990-05-15",
    avatarUrl: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[+]?[\d\s()-]+$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving");
      return;
    }

    setIsSaving(true);
    setShowSuccess(false);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSaving(false);
    setIsEditing(false);
    setShowSuccess(true);
    toast.success("Profile updated successfully!");

    setTimeout(() => setShowSuccess(false), 5000);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    setFormData({
      fullName: "Nguyễn Thu Hương",
      email: "nguyen.huong@email.com",
      phone: "+84 912 345 678",
      gender: "female",
      dateOfBirth: "1990-05-15",
      avatarUrl: ""
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Personal Information</h1>
        <p className="text-muted-foreground">Update your account details and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Success Alert */}
          {showSuccess && (
            <Alert className="bg-success/10 border-success">
              <CheckCircle2 className="size-4 text-success" />
              <AlertDescription className="text-success">
                Your personal information has been updated successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="size-24 border-4 border-primary">
                <AvatarImage src={formData.avatarUrl} alt="Profile" />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  NH
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <button className="absolute bottom-0 right-0 size-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:bg-accent/90 transition-colors shadow-lg">
                  <Camera className="size-4" />
                </button>
              )}
            </div>
            <div>
              <p className="font-medium mb-1">Profile Picture</p>
              <p className="text-sm text-muted-foreground mb-2">
                JPG, PNG or GIF. Max size 2MB.
              </p>
              {isEditing && (
                <Button variant="outline" size="sm">
                  <Upload className="size-4 mr-2" />
                  Upload Photo
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="md:col-span-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                disabled={!isEditing}
                className={errors.fullName ? "border-destructive" : ""}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={!isEditing}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                disabled={!isEditing}
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <Label>Gender</Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => handleChange("gender", value)}
                disabled={!isEditing}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female" className="cursor-pointer font-normal">
                    Female
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male" className="cursor-pointer font-normal">
                    Male
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="cursor-pointer font-normal">
                    Other
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Date of Birth */}
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                disabled={!isEditing}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Information Note */}
          {isEditing && (
            <Alert>
              <AlertCircle className="size-4" />
              <AlertDescription>
                <p className="font-medium mb-1">Keep your information up-to-date</p>
                <p className="text-sm">
                  This information will be used for order delivery and communication.
                  Fields marked with <span className="text-destructive">*</span> are required.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            {!isEditing ? (
              <Button
                className="bg-accent hover:bg-accent/90"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  className="bg-accent hover:bg-accent/90"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving && <Loader2 className="size-4 mr-2 animate-spin" />}
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
