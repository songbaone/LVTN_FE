import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Star,
  Upload,
  X,
  CheckCircle,
  Clock,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  ThumbsUp,
  MessageSquare,
  Edit2,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

interface Review {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  rating: number;
  title: string;
  content: string;
  photos: string[];
  status: "pending" | "published";
  createdAt: string;
  helpful: number;
  replies: number;
}

interface PendingReview {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  orderDate: string;
}

export default function ReviewManagement() {
  const [activeTab, setActiveTab] = useState("pending");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PendingReview | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    rating: 0,
    hoverRating: 0,
    title: "",
    content: "",
    photos: [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [pendingReviews] = useState<PendingReview[]>([
    {
      id: "1",
      orderId: "ORD-1234",
      productId: "P1",
      productName: "Organic Cotton Onesie Set",
      productImage: "🧸",
      orderDate: "2026-06-02"
    },
    {
      id: "2",
      orderId: "ORD-1235",
      productId: "P2",
      productName: "Baby Monitor Premium",
      productImage: "📹",
      orderDate: "2026-06-01"
    }
  ]);

  const [submittedReviews, setSubmittedReviews] = useState<Review[]>([
    {
      id: "R1",
      productId: "P3",
      productName: "Silicone Feeding Set",
      productImage: "🍽️",
      rating: 5,
      title: "Perfect for my baby!",
      content: "The quality is excellent and my baby loves it. The silicone material is safe and easy to clean. Highly recommend to all parents!",
      photos: [],
      status: "published",
      createdAt: "2026-05-28",
      helpful: 12,
      replies: 1
    },
    {
      id: "R2",
      productId: "P4",
      productName: "Baby Stroller Lightweight",
      productImage: "🚼",
      rating: 4,
      title: "Great stroller but could be better",
      content: "Very lightweight and easy to fold. The canopy provides good sun protection. Only minor issue is the basket could be larger.",
      photos: [],
      status: "published",
      createdAt: "2026-05-20",
      helpful: 8,
      replies: 0
    },
    {
      id: "R3",
      productId: "P5",
      productName: "Wooden Educational Toy Set",
      productImage: "🧩",
      rating: 5,
      title: "Educational and fun!",
      content: "My 2-year-old absolutely loves these toys. They're well-made, safe, and help with motor skill development. Worth every penny!",
      photos: [],
      status: "pending",
      createdAt: "2026-06-04",
      helpful: 0,
      replies: 0
    }
  ]);

  const handleOpenReviewDialog = (product: PendingReview) => {
    setSelectedProduct(product);
    setFormData({
      rating: 0,
      hoverRating: 0,
      title: "",
      content: "",
      photos: []
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: "" }));
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handlePhotoUpload = () => {
    // Simulate photo upload
    const newPhoto = `photo-${Date.now()}`;
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, newPhoto]
    }));
    toast.success("Photo uploaded");
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.rating === 0) {
      newErrors.rating = "Please select a rating";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Review title is required";
    } else if (formData.title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Review content is required";
    } else if (formData.content.trim().length < 20) {
      newErrors.content = "Content must be at least 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitReview = async () => {
    if (!validateForm() || !selectedProduct) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSaving(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newReview: Review = {
      id: `R${Date.now()}`,
      productId: selectedProduct.productId,
      productName: selectedProduct.productName,
      productImage: selectedProduct.productImage,
      rating: formData.rating,
      title: formData.title,
      content: formData.content,
      photos: formData.photos,
      status: "pending",
      createdAt: new Date().toISOString().split('T')[0],
      helpful: 0,
      replies: 0
    };

    setSubmittedReviews(prev => [newReview, ...prev]);
    toast.success("Review submitted successfully! It will be published after moderation.");

    setIsSaving(false);
    setIsDialogOpen(false);
  };

  const handleDeleteReview = (id: string) => {
    setSubmittedReviews(prev => prev.filter(review => review.id !== id));
    toast.success("Review deleted");
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && handleRatingClick(star)}
            onMouseEnter={() => interactive && setFormData(prev => ({ ...prev, hoverRating: star }))}
            onMouseLeave={() => interactive && setFormData(prev => ({ ...prev, hoverRating: 0 }))}
            className={interactive ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"}
            disabled={!interactive}
          >
            <Star
              className={`size-6 ${
                star <= (interactive ? (formData.hoverRating || formData.rating) : rating)
                  ? "fill-warning text-warning"
                  : "fill-none text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const pendingCount = pendingReviews.length;
  const submittedCount = submittedReviews.length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Reviews</h1>
        <p className="text-muted-foreground">Share your product experiences with other customers</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="pending" className="relative">
            Pending Reviews
            {pendingCount > 0 && (
              <Badge className="ml-2 bg-accent">{pendingCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="submitted">
            Submitted Reviews
            {submittedCount > 0 && (
              <Badge variant="outline" className="ml-2">{submittedCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Pending Reviews Tab */}
        <TabsContent value="pending" className="space-y-4">
          {pendingReviews.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="size-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <CheckCircle className="size-10 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground text-center">
                  You've reviewed all your purchased products
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingReviews.map((product) => (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="size-20 rounded-lg bg-secondary flex items-center justify-center text-4xl flex-shrink-0">
                      {product.productImage}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{product.productName}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Ordered on {new Date(product.orderDate).toLocaleDateString()}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        Order: {product.orderId}
                      </Badge>
                    </div>
                    <Button
                      onClick={() => handleOpenReviewDialog(product)}
                      className="bg-accent hover:bg-accent/90"
                    >
                      <Star className="size-4 mr-2" />
                      Write Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Submitted Reviews Tab */}
        <TabsContent value="submitted" className="space-y-4">
          {submittedReviews.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="size-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Star className="size-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No reviews yet</h3>
                <p className="text-muted-foreground text-center">
                  Start sharing your experience with products you've purchased
                </p>
              </CardContent>
            </Card>
          ) : (
            submittedReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4 mb-4">
                    <div className="size-16 rounded-lg bg-secondary flex items-center justify-center text-3xl flex-shrink-0">
                      {review.productImage}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold mb-1">{review.productName}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            {renderStars(review.rating)}
                            <Badge className={review.status === "published" ? "bg-success" : "bg-warning"}>
                              {review.status === "published" ? (
                                <>
                                  <CheckCircle className="size-3 mr-1" />
                                  Published
                                </>
                              ) : (
                                <>
                                  <Clock className="size-3 mr-1" />
                                  Pending Approval
                                </>
                              )}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit2 className="size-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold mb-1">{review.title}</h4>
                      <p className="text-sm text-muted-foreground">{review.content}</p>
                    </div>

                    {review.photos.length > 0 && (
                      <div className="flex gap-2">
                        {review.photos.map((photo, index) => (
                          <div key={index} className="size-20 rounded-lg bg-secondary flex items-center justify-center">
                            <ImageIcon className="size-8 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-6 pt-3 border-t border-border text-sm text-muted-foreground">
                      <span>Reviewed on {new Date(review.createdAt).toLocaleDateString()}</span>
                      {review.status === "published" && (
                        <>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="size-3" />
                            {review.helpful} helpful
                          </span>
                          {review.replies > 0 && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="size-3" />
                              {review.replies} {review.replies === 1 ? "reply" : "replies"}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Write Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience with this product
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-6 py-4">
              {/* Product Info */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary">
                <div className="size-16 rounded-lg bg-background flex items-center justify-center text-3xl">
                  {selectedProduct.productImage}
                </div>
                <div>
                  <h4 className="font-semibold">{selectedProduct.productName}</h4>
                  <p className="text-sm text-muted-foreground">Order: {selectedProduct.orderId}</p>
                </div>
              </div>

              {/* Rating */}
              <div>
                <Label className="mb-3 block">
                  Rating <span className="text-destructive">*</span>
                </Label>
                {renderStars(formData.rating, true)}
                {formData.rating > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {formData.rating === 1 && "Poor"}
                    {formData.rating === 2 && "Fair"}
                    {formData.rating === 3 && "Good"}
                    {formData.rating === 4 && "Very Good"}
                    {formData.rating === 5 && "Excellent"}
                  </p>
                )}
                {errors.rating && (
                  <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {errors.rating}
                  </p>
                )}
              </div>

              {/* Review Title */}
              <div>
                <Label htmlFor="title">
                  Review Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Summarize your experience"
                  className={errors.title ? "border-destructive" : ""}
                  maxLength={100}
                />
                <div className="flex justify-between mt-1">
                  {errors.title ? (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3" />
                      {errors.title}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formData.title.length}/100
                  </span>
                </div>
              </div>

              {/* Review Content */}
              <div>
                <Label htmlFor="content">
                  Review Content <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleChange("content", e.target.value)}
                  placeholder="Share details about your experience with this product"
                  className={`min-h-32 ${errors.content ? "border-destructive" : ""}`}
                  maxLength={500}
                />
                <div className="flex justify-between mt-1">
                  {errors.content ? (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3" />
                      {errors.content}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formData.content.length}/500
                  </span>
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <Label className="mb-3 block">Photos (Optional)</Label>
                <div className="flex flex-wrap gap-3">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative size-24 rounded-lg bg-secondary flex items-center justify-center group">
                      <ImageIcon className="size-8 text-muted-foreground" />
                      <button
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute -top-2 -right-2 size-6 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                  {formData.photos.length < 5 && (
                    <button
                      onClick={handlePhotoUpload}
                      className="size-24 rounded-lg border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 flex flex-col items-center justify-center gap-1 transition-colors"
                    >
                      <Upload className="size-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Upload</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Add up to 5 photos. JPG or PNG, max 5MB each
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={isSaving}
              className="bg-accent hover:bg-accent/90"
            >
              {isSaving && <Loader2 className="size-4 mr-2 animate-spin" />}
              {isSaving ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
