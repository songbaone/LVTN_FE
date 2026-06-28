import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
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
  Star,
  MessageSquare,
  ThumbsUp,
  Eye,
  Check,
  X,
  Reply,
  Search,
  Filter,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Image as ImageIcon,
  Loader2,
  CheckSquare,
  Square,
} from "lucide-react";
import { toast } from "sonner";

interface Review {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  title: string;
  content: string;
  images: string[];
  status: "pending" | "approved" | "rejected";
  helpful: number;
  createdAt: string;
  reply?: {
    content: string;
    repliedBy: string;
    repliedAt: string;
  };
}

export default function ReviewManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([
    {
      id: "R1",
      productId: "P1",
      productName: "Organic Cotton Onesie Set",
      productImage: "🧸",
      customerId: "C1",
      customerName: "Nguyễn Thu Hương",
      customerAvatar: "NH",
      rating: 5,
      title: "Perfect for my baby!",
      content:
        "The quality is excellent and my baby loves it. Very soft and comfortable. Highly recommend to all parents!",
      images: [],
      status: "approved",
      helpful: 12,
      createdAt: "2026-06-04 10:30",
      reply: {
        content:
          "Thank you for your wonderful feedback! We're thrilled to hear your baby loves it.",
        repliedBy: "Admin",
        repliedAt: "2026-06-04 14:20",
      },
    },
    {
      id: "R2",
      productId: "P2",
      productName: "Baby Monitor Premium",
      productImage: "📹",
      customerId: "C2",
      customerName: "Trần Minh Anh",
      customerAvatar: "TMA",
      rating: 4,
      title: "Great product but pricey",
      content:
        "Works perfectly and the night vision is amazing. Only downside is the price, but worth it for peace of mind.",
      images: [],
      status: "approved",
      helpful: 8,
      createdAt: "2026-06-03 15:20",
    },
    {
      id: "R3",
      productId: "P3",
      productName: "Silicone Feeding Set",
      productImage: "🍽️",
      customerId: "C3",
      customerName: "Lê Thị Mai",
      customerAvatar: "LTM",
      rating: 5,
      title: "Best feeding set ever!",
      content:
        "BPA-free, easy to clean, and my baby can't get enough of it. Colors are vibrant and attractive.",
      images: [],
      status: "pending",
      helpful: 0,
      createdAt: "2026-06-05 09:45",
    },
    {
      id: "R4",
      productId: "P1",
      productName: "Organic Cotton Onesie Set",
      productImage: "🧸",
      customerId: "C4",
      customerName: "Phạm Văn Đức",
      customerAvatar: "PVD",
      rating: 3,
      title: "Decent but not amazing",
      content:
        "Quality is okay but I expected more for the price. Fits well though.",
      images: [],
      status: "pending",
      helpful: 0,
      createdAt: "2026-06-05 11:15",
    },
    {
      id: "R5",
      productId: "P4",
      productName: "Baby Stroller Lightweight",
      productImage: "🚼",
      customerId: "C5",
      customerName: "Hoàng Thị Lan",
      customerAvatar: "HTL",
      rating: 2,
      title: "Disappointed with quality",
      content:
        "The stroller feels flimsy and the wheels are not smooth. Not worth the money.",
      images: [],
      status: "pending",
      helpful: 0,
      createdAt: "2026-06-05 13:30",
    },
    {
      id: "R6",
      productId: "P5",
      productName: "Wooden Educational Toy Set",
      productImage: "🧩",
      customerId: "C6",
      customerName: "Vũ Minh Quân",
      customerAvatar: "VMQ",
      rating: 5,
      title: "Educational and fun!",
      content:
        "My toddler loves these toys. They're well-made, safe, and help with motor skills. Highly recommend!",
      images: [],
      status: "approved",
      helpful: 15,
      createdAt: "2026-06-02 16:40",
    },
    {
      id: "R7",
      productId: "P2",
      productName: "Baby Monitor Premium",
      productImage: "📹",
      customerId: "C7",
      customerName: "Đặng Thị Hoa",
      customerAvatar: "DTH",
      rating: 1,
      title: "Terrible product, do not buy!",
      content:
        "This is spam content with inappropriate language and fake review. Should be rejected.",
      images: [],
      status: "rejected",
      helpful: 0,
      createdAt: "2026-06-04 08:20",
    },
  ]);

  // Statistics
  const stats = {
    total: reviews.length,
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
    avgRating: (
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    ).toFixed(1),
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: (
      (reviews.filter((r) => r.rating === rating).length / reviews.length) *
      100
    ).toFixed(0),
  }));

  const statusColors: Record<string, string> = {
    pending: "bg-warning",
    approved: "bg-success",
    rejected: "bg-destructive",
  };

  // Filtering and Sorting
  const filteredReviews = reviews
    .filter((review) => {
      const matchesSearch =
        review.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || review.status === statusFilter;
      const matchesRating =
        ratingFilter === "all" || review.rating.toString() === ratingFilter;
      return matchesSearch && matchesStatus && matchesRating;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "rating-desc":
          return b.rating - a.rating;
        case "rating-asc":
          return a.rating - b.rating;
        case "helpful-desc":
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    });

  const handleSelectReview = (id: string) => {
    setSelectedReviews((prev) =>
      prev.includes(id)
        ? prev.filter((reviewId) => reviewId !== id)
        : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedReviews.length === filteredReviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(filteredReviews.map((r) => r.id));
    }
  };

  const handleOpenDetail = (review: Review) => {
    setSelectedReview(review);
    setIsDetailDialogOpen(true);
  };

  const handleOpenReply = (review: Review) => {
    setSelectedReview(review);
    setReplyContent("");
    setIsReplyDialogOpen(true);
  };

  const handleApprove = async (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, status: "approved" as const } : r,
      ),
    );
    toast.success("Review approved");
  };

  const handleReject = async (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, status: "rejected" as const } : r,
      ),
    );
    toast.success("Review rejected");
  };

  const handleBulkApprove = async () => {
    if (selectedReviews.length === 0) {
      toast.error("Please select reviews to approve");
      return;
    }
    toast.success(`${selectedReviews.length} reviews approved`);
    setSelectedReviews([]);
  };

  const handleBulkReject = async () => {
    if (selectedReviews.length === 0) {
      toast.error("Please select reviews to reject");
      return;
    }
    toast.success(`${selectedReviews.length} reviews rejected`);
    setSelectedReviews([]);
  };

  const handleSaveReply = async () => {
    if (!replyContent.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Reply posted successfully");
    setIsSaving(false);
    setIsReplyDialogOpen(false);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`size-4 ${
              star <= rating
                ? "fill-warning text-warning"
                : "fill-none text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Review Management</h1>
        <p className="text-muted-foreground">
          Moderate customer reviews and feedback
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reviews
            </CardTitle>
            <MessageSquare className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Review
            </CardTitle>
            <AlertTriangle className="size-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">
              {stats.pending}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting moderation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
            <CheckCircle className="size-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {stats.approved}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Published reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rejected
            </CardTitle>
            <XCircle className="size-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {stats.rejected}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Not published</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Rating
            </CardTitle>
            <Star className="size-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">
              {stats.avgRating}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Out of 5.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-5" />
            Rating Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-20">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="size-4 fill-warning text-warning" />
                </div>
                <div className="flex-1 h-6 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-warning transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-24 text-right">
                  <span className="text-sm font-medium">{count} reviews</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="size-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="rating-desc">Highest Rating</SelectItem>
                  <SelectItem value="rating-asc">Lowest Rating</SelectItem>
                  <SelectItem value="helpful-desc">Most Helpful</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedReviews.length > 0 && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-sm font-medium">
                  {selectedReviews.length}{" "}
                  {selectedReviews.length === 1 ? "review" : "reviews"} selected
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleBulkApprove}
                    className="bg-success hover:bg-success/90"
                  >
                    <Check className="size-4 mr-1" />
                    Approve Selected
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleBulkReject}
                    variant="destructive"
                  >
                    <X className="size-4 mr-1" />
                    Reject Selected
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <button onClick={handleSelectAll}>
                    {selectedReviews.length === filteredReviews.length &&
                    filteredReviews.length > 0 ? (
                      <CheckSquare className="size-4 text-accent" />
                    ) : (
                      <Square className="size-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center">
                      <div className="size-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                        <MessageSquare className="size-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        No reviews found
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review) => (
                  <TableRow key={review.id} className="hover:bg-secondary/50">
                    <TableCell>
                      <button onClick={() => handleSelectReview(review.id)}>
                        {selectedReviews.includes(review.id) ? (
                          <CheckSquare className="size-4 text-accent" />
                        ) : (
                          <Square className="size-4" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="size-10 rounded-lg bg-secondary flex items-center justify-center text-2xl">
                          {review.productImage}
                        </div>
                        <span className="font-medium text-sm">
                          {review.productName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-8">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {review.customerAvatar}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {review.customerName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                        <span className="ml-1 text-sm font-medium">
                          {review.rating}.0
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div>
                        <p className="font-semibold text-sm mb-1 line-clamp-1">
                          {review.title}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {review.content}
                        </p>
                        {review.helpful > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <ThumbsUp className="size-3" />
                            <span>{review.helpful} helpful</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[review.status]}>
                        {review.status.charAt(0).toUpperCase() +
                          review.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDetail(review)}
                        >
                          <Eye className="size-3" />
                        </Button>
                        {review.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(review.id)}
                              className="text-success hover:bg-success/10"
                            >
                              <Check className="size-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(review.id)}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <X className="size-3" />
                            </Button>
                          </>
                        )}
                        {review.status === "approved" && !review.reply && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReply(review)}
                          >
                            <Reply className="size-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {selectedReview.customerAvatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold">
                        {selectedReview.customerName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedReview.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge className={statusColors[selectedReview.status]}>
                      {selectedReview.status.charAt(0).toUpperCase() +
                        selectedReview.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    {renderStars(selectedReview.rating)}
                    <span className="font-semibold">
                      {selectedReview.rating}.0
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {selectedReview.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {selectedReview.content}
                  </p>

                  {selectedReview.images.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {selectedReview.images.map((img, index) => (
                        <div
                          key={index}
                          className="size-20 rounded-lg bg-secondary flex items-center justify-center"
                        >
                          <ImageIcon className="size-8 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedReview.helpful > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ThumbsUp className="size-4" />
                      <span>
                        {selectedReview.helpful} people found this helpful
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-secondary">
                <div className="flex items-center gap-2 mb-2">
                  <div className="size-10 rounded-lg bg-background flex items-center justify-center text-2xl">
                    {selectedReview.productImage}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Product</p>
                    <p className="font-semibold">
                      {selectedReview.productName}
                    </p>
                  </div>
                </div>
              </div>

              {selectedReview.reply && (
                <div className="p-4 rounded-lg border border-accent/20 bg-accent/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Reply className="size-4 text-accent" />
                    <span className="font-semibold text-accent">
                      Store Reply
                    </span>
                  </div>
                  <p className="text-sm mb-2">{selectedReview.reply.content}</p>
                  <p className="text-xs text-muted-foreground">
                    By {selectedReview.reply.repliedBy} •{" "}
                    {new Date(selectedReview.reply.repliedAt).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                {selectedReview.status === "pending" && (
                  <>
                    <Button
                      onClick={() => {
                        handleApprove(selectedReview.id);
                        setIsDetailDialogOpen(false);
                      }}
                      className="bg-success hover:bg-success/90"
                    >
                      <Check className="size-4 mr-2" />
                      Approve Review
                    </Button>
                    <Button
                      onClick={() => {
                        handleReject(selectedReview.id);
                        setIsDetailDialogOpen(false);
                      }}
                      variant="destructive"
                    >
                      <X className="size-4 mr-2" />
                      Reject Review
                    </Button>
                  </>
                )}
                {selectedReview.status === "approved" &&
                  !selectedReview.reply && (
                    <Button
                      onClick={() => {
                        setIsDetailDialogOpen(false);
                        handleOpenReply(selectedReview);
                      }}
                      className="bg-accent hover:bg-accent/90"
                    >
                      <Reply className="size-4 mr-2" />
                      Reply to Review
                    </Button>
                  )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to Review</DialogTitle>
            <DialogDescription>
              Send a public reply to this customer review
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-secondary">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {selectedReview.customerAvatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {selectedReview.customerName}
                    </p>
                    <div className="flex items-center gap-1">
                      {renderStars(selectedReview.rating)}
                    </div>
                  </div>
                </div>
                <p className="text-sm font-semibold mb-1">
                  {selectedReview.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedReview.content}
                </p>
              </div>

              <div>
                <Label htmlFor="reply">Your Reply</Label>
                <Textarea
                  id="reply"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Thank you for your feedback..."
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReplyDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveReply}
              disabled={isSaving}
              className="bg-accent hover:bg-accent/90"
            >
              {isSaving && <Loader2 className="size-4 mr-2 animate-spin" />}
              {isSaving ? "Posting..." : "Post Reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
