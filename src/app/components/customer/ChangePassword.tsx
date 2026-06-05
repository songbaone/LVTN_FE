import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Progress } from "../ui/progress";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  Check,
  X
} from "lucide-react";
import { toast } from "sonner";

export default function ChangePassword() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const calculatePasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;

    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 10;
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^a-zA-Z0-9]/.test(password)) score += 20;

    let label = "Weak";
    let color = "bg-destructive";

    if (score >= 75) {
      label = "Strong";
      color = "bg-success";
    } else if (score >= 50) {
      label = "Good";
      color = "bg-info";
    } else if (score >= 25) {
      label = "Fair";
      color = "bg-warning";
    }

    return { score, label, color };
  };

  const passwordStrength = calculatePasswordStrength(formData.newPassword);

  const passwordRequirements = [
    { id: "length", label: "At least 8 characters", met: formData.newPassword.length >= 8 },
    { id: "lowercase", label: "One lowercase letter", met: /[a-z]/.test(formData.newPassword) },
    { id: "uppercase", label: "One uppercase letter", met: /[A-Z]/.test(formData.newPassword) },
    { id: "number", label: "One number", met: /[0-9]/.test(formData.newPassword) },
    { id: "special", label: "One special character", met: /[^a-zA-Z0-9]/.test(formData.newPassword) }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!passwordRequirements.every(req => req.met)) {
      newErrors.newPassword = "Password does not meet all requirements";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = "New password must be different from current password";
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
    setShowSuccess(true);
    toast.success("Password changed successfully!");

    // Reset form
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });

    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Change Password</h1>
        <p className="text-muted-foreground">Update your password to keep your account secure</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5 text-accent" />
            Password Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Success Alert */}
          {showSuccess && (
            <Alert className="bg-success/10 border-success">
              <CheckCircle2 className="size-4 text-success" />
              <AlertDescription className="text-success">
                Your password has been changed successfully! Please use your new password for future logins.
              </AlertDescription>
            </Alert>
          )}

          {/* Current Password */}
          <div>
            <Label htmlFor="currentPassword">
              Current Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => handleChange("currentPassword", e.target.value)}
                className={errors.currentPassword ? "border-destructive pr-10" : "pr-10"}
                placeholder="Enter your current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="size-3" />
                {errors.currentPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <Label htmlFor="newPassword">
              New Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => handleChange("newPassword", e.target.value)}
                className={errors.newPassword ? "border-destructive pr-10" : "pr-10"}
                placeholder="Enter your new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="size-3" />
                {errors.newPassword}
              </p>
            )}

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Password Strength:</span>
                  <span className={`font-medium ${
                    passwordStrength.label === "Strong" ? "text-success" :
                    passwordStrength.label === "Good" ? "text-info" :
                    passwordStrength.label === "Fair" ? "text-warning" :
                    "text-destructive"
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <Progress
                  value={passwordStrength.score}
                  className={`h-2 ${passwordStrength.color}`}
                />
              </div>
            )}
          </div>

          {/* Password Requirements Checklist */}
          {formData.newPassword && (
            <div className="p-4 rounded-lg bg-secondary space-y-2">
              <p className="text-sm font-medium mb-3">Password Requirements:</p>
              {passwordRequirements.map((req) => (
                <div key={req.id} className="flex items-center gap-2 text-sm">
                  {req.met ? (
                    <Check className="size-4 text-success" />
                  ) : (
                    <X className="size-4 text-muted-foreground" />
                  )}
                  <span className={req.met ? "text-success" : "text-muted-foreground"}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword">
              Confirm New Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
                placeholder="Re-enter your new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="size-3" />
                {errors.confirmPassword}
              </p>
            )}
            {!errors.confirmPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
              <p className="text-sm text-success mt-1 flex items-center gap-1">
                <CheckCircle2 className="size-3" />
                Passwords match
              </p>
            )}
          </div>

          {/* Security Tips */}
          <Alert>
            <AlertCircle className="size-4" />
            <AlertDescription>
              <p className="font-medium mb-1">Keep your account secure</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Use a unique password you don't use anywhere else</li>
                <li>Avoid common words and personal information</li>
                <li>Consider using a password manager</li>
                <li>Change your password regularly</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              className="bg-accent hover:bg-accent/90"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="size-4 mr-2 animate-spin" />}
              {isSaving ? "Changing Password..." : "Change Password"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                setErrors({});
              }}
              disabled={isSaving}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
