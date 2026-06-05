import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import {
  Users,
  UserCheck,
  UserPlus,
  Shield,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Ban,
  Trash2,
  Package,
  Activity,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CheckSquare,
  Square,
  ShoppingBag
} from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "staff" | "customer";
  status: "active" | "suspended" | "banned";
  avatar: string;
  joinedDate: string;
  lastActive: string;
  totalOrders: number;
  totalSpent: number;
  address: string;
}

interface OrderHistoryItem {
  id: string;
  date: string;
  total: number;
  status: string;
}

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  details: string;
}

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("joined-desc");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [users] = useState<User[]>([
    {
      id: "CUST-123",
      name: "Nguyễn Thu Hương",
      email: "nguyen.huong@email.com",
      phone: "+84 912 345 678",
      role: "customer",
      status: "active",
      avatar: "NH",
      joinedDate: "2025-01-15",
      lastActive: "2026-06-05 16:30",
      totalOrders: 24,
      totalSpent: 15750000,
      address: "123 Nguyễn Huệ, Q1, HCM"
    },
    {
      id: "STAFF-001",
      name: "Trần Minh Anh",
      email: "tran.anh@babystore.com",
      phone: "+84 987 654 321",
      role: "staff",
      status: "active",
      avatar: "TMA",
      joinedDate: "2024-06-01",
      lastActive: "2026-06-05 17:00",
      totalOrders: 0,
      totalSpent: 0,
      address: "456 Lê Lợi, Q3, HCM"
    },
    {
      id: "ADMIN-001",
      name: "Lê Văn Quân",
      email: "le.quan@babystore.com",
      phone: "+84 901 234 567",
      role: "admin",
      status: "active",
      avatar: "LVQ",
      joinedDate: "2023-01-01",
      lastActive: "2026-06-05 18:00",
      totalOrders: 0,
      totalSpent: 0,
      address: "789 Điện Biên Phủ, Q10, HCM"
    },
    {
      id: "CUST-124",
      name: "Phạm Thị Mai",
      email: "pham.mai@email.com",
      phone: "+84 913 456 789",
      role: "customer",
      status: "active",
      avatar: "PTM",
      joinedDate: "2025-03-20",
      lastActive: "2026-06-04 10:15",
      totalOrders: 8,
      totalSpent: 4250000,
      address: "234 Hai Bà Trưng, Q1, HCM"
    },
    {
      id: "CUST-125",
      name: "Hoàng Văn Đức",
      email: "hoang.duc@email.com",
      phone: "+84 914 567 890",
      role: "customer",
      status: "suspended",
      avatar: "HVD",
      joinedDate: "2024-11-10",
      lastActive: "2026-05-20 14:30",
      totalOrders: 3,
      totalSpent: 890000,
      address: "567 Nguyễn Trãi, Q5, HCM"
    },
    {
      id: "STAFF-002",
      name: "Vũ Thị Lan",
      email: "vu.lan@babystore.com",
      phone: "+84 988 765 432",
      role: "staff",
      status: "active",
      avatar: "VTL",
      joinedDate: "2024-09-15",
      lastActive: "2026-06-05 16:45",
      totalOrders: 0,
      totalSpent: 0,
      address: "890 CMT8, Q10, HCM"
    },
    {
      id: "CUST-126",
      name: "Đặng Minh Tuấn",
      email: "dang.tuan@email.com",
      phone: "+84 915 678 901",
      role: "customer",
      status: "banned",
      avatar: "DMT",
      joinedDate: "2024-07-05",
      lastActive: "2026-04-15 09:20",
      totalOrders: 1,
      totalSpent: 250000,
      address: "321 Võ Văn Tần, Q3, HCM"
    }
  ]);

  const roleColors: Record<string, string> = {
    "admin": "bg-destructive text-destructive-foreground",
    "staff": "bg-info text-info-foreground",
    "customer": "bg-primary text-primary-foreground"
  };

  const statusColors: Record<string, string> = {
    "active": "bg-success",
    "suspended": "bg-warning",
    "banned": "bg-destructive"
  };

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === "active").length,
    newThisMonth: users.filter(u => {
      const joinDate = new Date(u.joinedDate);
      const now = new Date();
      return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
    }).length,
    byRole: {
      admin: users.filter(u => u.role === "admin").length,
      staff: users.filter(u => u.role === "staff").length,
      customer: users.filter(u => u.role === "customer").length
    }
  };

  // Mock data for user detail view
  const orderHistory: OrderHistoryItem[] = [
    { id: "ORD-001", date: "2026-06-04", total: 2420000, status: "Delivered" },
    { id: "ORD-002", date: "2026-06-02", total: 1890000, status: "Shipping" },
    { id: "ORD-003", date: "2026-05-28", total: 980000, status: "Delivered" }
  ];

  const activityLog: ActivityLog[] = [
    { id: "1", action: "Logged in", timestamp: "2026-06-05 16:30", details: "Web - Chrome" },
    { id: "2", action: "Placed order", timestamp: "2026-06-04 10:30", details: "ORD-001" },
    { id: "3", action: "Updated profile", timestamp: "2026-06-01 14:15", details: "Changed phone number" },
    { id: "4", action: "Logged in", timestamp: "2026-06-01 14:10", details: "Web - Chrome" }
  ];

  // Filtering and Sorting
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case "joined-desc":
        return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
      case "joined-asc":
        return new Date(a.joinedDate).getTime() - new Date(b.joinedDate).getTime();
      case "name":
        return a.name.localeCompare(b.name);
      case "spent-desc":
        return b.totalSpent - a.totalSpent;
      default:
        return 0;
    }
  });

  const handleSelectUser = (id: string) => {
    setSelectedUsers(prev =>
      prev.includes(id)
        ? prev.filter(userId => userId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleViewUser = (user: User) => {
    setViewingUser(user);
    setIsViewDialogOpen(true);
  };

  const handleSuspend = (userId: string) => {
    toast.success("User suspended");
  };

  const handleBan = (userId: string) => {
    toast.success("User banned");
  };

  const handleDelete = (userId: string) => {
    toast.success("User deleted");
  };

  const handleExport = () => {
    toast.success("Exporting user data...");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">Manage users, roles, and permissions</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <Users className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
            <UserCheck className="size-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New This Month
            </CardTitle>
            <UserPlus className="size-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{stats.newThisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">June 2026</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              By Role
            </CardTitle>
            <Shield className="size-5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Admin:</span>
                <span className="font-medium">{stats.byRole.admin}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Staff:</span>
                <span className="font-medium">{stats.byRole.staff}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium">{stats.byRole.customer}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Name, Email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <Filter className="size-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="joined-desc">Newest First</SelectItem>
                    <SelectItem value="joined-asc">Oldest First</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="spent-desc">Highest Spending</SelectItem>
                  </SelectContent>
                </Select>

                <span className="text-sm text-muted-foreground">
                  {filteredUsers.length} users
                </span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="size-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <button onClick={handleSelectAll}>
                    {selectedUsers.length === filteredUsers.length && filteredUsers.length > 0 ? (
                      <CheckSquare className="size-4 text-accent" />
                    ) : (
                      <Square className="size-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-center">Orders</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-16">
                    <div className="flex flex-col items-center">
                      <div className="size-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                        <Users className="size-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No users found</h3>
                      <p className="text-muted-foreground text-sm">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-secondary/50">
                    <TableCell>
                      <button onClick={() => handleSelectUser(user.id)}>
                        {selectedUsers.includes(user.id) ? (
                          <CheckSquare className="size-4 text-accent" />
                        ) : (
                          <Square className="size-4" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{user.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm">{user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={roleColors[user.role]}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[user.status]}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(user.joinedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.lastActive).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {user.totalOrders}
                    </TableCell>
                    <TableCell className="text-right font-bold text-accent">
                      {user.totalSpent > 0 ? `${user.totalSpent.toLocaleString()} ₫` : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="size-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View and manage user information
            </DialogDescription>
          </DialogHeader>

          {viewingUser && (
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="flex items-start gap-6">
                <Avatar className="size-24 border-4 border-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {viewingUser.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{viewingUser.name}</h2>
                      <p className="text-sm text-muted-foreground mb-2">
                        User ID: {viewingUser.id}
                      </p>
                      <div className="flex gap-2">
                        <Badge className={roleColors[viewingUser.role]}>
                          {viewingUser.role.charAt(0).toUpperCase() + viewingUser.role.slice(1)}
                        </Badge>
                        <Badge className={statusColors[viewingUser.status]}>
                          {viewingUser.status.charAt(0).toUpperCase() + viewingUser.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit2 className="size-3 mr-1" />
                        Edit
                      </Button>
                      {viewingUser.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuspend(viewingUser.id)}
                          className="text-warning"
                        >
                          <Ban className="size-3 mr-1" />
                          Suspend
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(viewingUser.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="size-4 text-muted-foreground" />
                      <span>{viewingUser.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="size-4 text-muted-foreground" />
                      <span>{viewingUser.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="size-4 text-muted-foreground" />
                      <span>Joined {new Date(viewingUser.joinedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="size-4 text-muted-foreground" />
                      <span>Last active {new Date(viewingUser.lastActive).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm col-span-2">
                      <MapPin className="size-4 text-muted-foreground" />
                      <span>{viewingUser.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Statistics Cards */}
              {viewingUser.role === "customer" && (
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <ShoppingBag className="size-4" />
                        Total Orders
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{viewingUser.totalOrders}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Package className="size-4" />
                        Total Spent
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-accent">
                        {viewingUser.totalSpent.toLocaleString()} ₫
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Tabs */}
              {viewingUser.role === "customer" && (
                <Tabs defaultValue="orders">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="orders">Order History</TabsTrigger>
                    <TabsTrigger value="activity">Activity Log</TabsTrigger>
                  </TabsList>

                  <TabsContent value="orders" className="space-y-3 mt-4">
                    {orderHistory.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border"
                      >
                        <div>
                          <p className="font-semibold">{order.id}</p>
                          <p className="text-sm text-muted-foreground">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-accent">{order.total.toLocaleString()} ₫</p>
                          <Badge variant="outline" className="text-xs">{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="activity" className="space-y-3 mt-4">
                    {activityLog.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-4 rounded-lg border border-border"
                      >
                        <div className="size-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <Activity className="size-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">{activity.details}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
