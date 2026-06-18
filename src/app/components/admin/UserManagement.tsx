import { use, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { formatDateTime } from "../../../helpers/format";
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
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { get } from "react-hook-form";

interface User {
  user_id: number;
  full_name: string;
  email: string;
  phone: string | null;

  role: {
    role_id: number;
    role_name: "ADMIN" | "STAFF" | "CUSTOMER";
  };

  status: boolean;
  created_at: string;
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
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("joined-desc");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const token = localStorage.getItem("AccessTokenAdmin");
  const getUsers = async (page: number) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/v1/users?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await res.json();
      if (res.status == 200) {
        setUsers(result.data.users);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    getUsers(1);
  }, []);

  const roleColors: Record<number, string> = {
    1: "bg-red-100 text-red-800",
    2: "bg-blue-100 text-blue-800",
    3: "bg-green-100 text-green-800",
  };
  const statusColors = {
    true: "bg-green-100 text-green-800",
    false: "bg-red-100 text-red-800",
  };

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === true).length,
    newThisMonth: users.filter((u) => {
      const now = new Date();
    }).length,
    byRole: {
      admin: users.filter((u) => u.role.role_id === 1).length,
      staff: users.filter((u) => u.role.role_id === 2).length,
      customer: users.filter((u) => u.role.role_id === 3).length,
    },
  };

  // Mock data for user detail view
  const orderHistory: OrderHistoryItem[] = [
    { id: "ORD-001", date: "2026-06-04", total: 2420000, status: "Delivered" },
    { id: "ORD-002", date: "2026-06-02", total: 1890000, status: "Shipping" },
    { id: "ORD-003", date: "2026-05-28", total: 980000, status: "Delivered" },
  ];

  // Filtering and Sorting
  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        roleFilter === "all" || user.role.role_id === Number(roleFilter);
      const matchesStatus =
        statusFilter === "all" || String(user.status) === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.full_name.localeCompare(b.full_name);

        default:
          return 0;
      }
    });

  const handleSelectUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.user_id));
    }
  };

  const handleViewUser = (user: User) => {
    setViewingUser(user);
    setIsViewDialogOpen(true);
  };

  const handleSuspend = (userId: number) => {
    toast.success("User suspended");
  };

  const handleBan = (userId: number) => {
    toast.success("User banned");
  };

  const handleDelete = (userId: number) => {
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
        <p className="text-muted-foreground">
          Manage users, roles, and permissions
        </p>
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
            <p className="text-xs text-muted-foreground mt-1">
              All registered users
            </p>
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
            <div className="text-3xl font-bold text-success">
              {stats.active}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently active
            </p>
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
            <div className="text-3xl font-bold text-accent">
              {stats.newThisMonth}
            </div>
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
                  <SelectItem value="1">Admin</SelectItem>
                  <SelectItem value="2">Staff</SelectItem>
                  <SelectItem value="3">Customer</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
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
                    {selectedUsers.length === filteredUsers.length &&
                    filteredUsers.length > 0 ? (
                      <CheckSquare className="size-4 text-accent" />
                    ) : (
                      <Square className="size-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>User id</TableHead>
                <TableHead>Full name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created at</TableHead>
                <TableHead>View Detail</TableHead>
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
                      <h3 className="text-lg font-semibold mb-2">
                        No users found
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow
                    key={user.user_id}
                    className="hover:bg-secondary/50"
                  >
                    <TableCell>
                      <button onClick={() => handleSelectUser(user.user_id)}>
                        {selectedUsers.includes(user.user_id) ? (
                          <CheckSquare className="size-4 text-accent" />
                        ) : (
                          <Square className="size-4" />
                        )}
                      </button>
                    </TableCell>

                    {/* User id */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground font-mono">
                            {user.user_id}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Full name */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          {user.phone == null ? (
                            <>
                              <p className="text-xs  text-red-500">
                                Chưa cập nhật
                              </p>
                            </>
                          ) : (
                            user.phone
                          )}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className={roleColors[user.role.role_id]}>
                        {user.role.role_name.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[String(user.status)]}>
                        {user.status ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(user.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-start">
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
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">
                        {viewingUser.full_name}
                      </h2>
                      <p className="text-sm text-muted-foreground mb-2">
                        User ID: {viewingUser.user_id}
                      </p>
                      <div className="flex gap-2">
                        <Badge
                          className={roleColors[viewingUser.role.role_name]}
                        >
                          {viewingUser.role.role_name}
                        </Badge>
                        <Badge
                          className={statusColors[String(viewingUser.status)]}
                        >
                          {viewingUser.status ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit2 className="size-3 mr-1" />
                        Edit
                      </Button>
                      {viewingUser.status === true && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuspend(viewingUser.user_id)}
                          className="text-warning"
                        >
                          <Ban className="size-3 mr-1" />
                          Suspend
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(viewingUser.user_id)}
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
                      <span>Joined </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="size-4 text-muted-foreground" />
                      <span>Last active </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm col-span-2">
                      <MapPin className="size-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Statistics Cards */}
              {viewingUser.role.role_id === 3 && (
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <ShoppingBag className="size-4" />
                        Total Orders
                      </CardTitle>
                    </CardHeader>
                    <CardContent></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Package className="size-4" />
                        Total Spent
                      </CardTitle>
                    </CardHeader>
                    <CardContent></CardContent>
                  </Card>
                </div>
              )}

              {/* Tabs */}
              {viewingUser.role.role_id === 3 && (
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
                          <p className="text-sm text-muted-foreground">
                            {order.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-accent">
                            {order.total.toLocaleString()} ₫
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
