import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  BarChart3, 
  Settings, 
  Shield, 
  AlertTriangle,
  Loader2,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  UserCog,
  CreditCard,
  Save,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

interface Business {
  id: string;
  name: string;
  website_url: string;
  industry: string | null;
  created_at: string;
  user_id: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

interface Subscription {
  id: string;
  business_id: string;
  plan: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

interface AppSetting {
  key: string;
  value: unknown;
  created_at: string;
  updated_at: string;
}

interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  price_monthly: number | string;
  currency: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export default function AdminDashboard() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [appSettings, setAppSettings] = useState<AppSetting[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [newRoleUserId, setNewRoleUserId] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'moderator' | 'user'>('user');

  const [subscriptionForm, setSubscriptionForm] = useState({
    business_id: '',
    plan: 'free',
    status: 'active',
    current_period_end: '',
  });

  const [settingForm, setSettingForm] = useState({
    key: '',
    valueText: `{
  "enabled": true
}`,
  });

  const [planForm, setPlanForm] = useState({
    id: '',
    code: '',
    name: '',
    price_monthly: '0',
    currency: 'USD',
    is_active: 'true',
    sort_order: '0',
  });

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access the admin dashboard.',
        variant: 'destructive',
      });
      navigate('/dashboard');
    }
  }, [isAdmin, adminLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
    if (!tab && activeTab !== 'overview' && location.pathname === '/admin') {
      setActiveTab('overview');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, location.pathname]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const errors: Array<{ label: string; message: string; code?: string }> = [];

      const addError = (label: string, err: unknown) => {
        const asRecord = (v: unknown): Record<string, unknown> | null =>
          v && typeof v === 'object' ? (v as Record<string, unknown>) : null;

        const record = asRecord(err);
        const message =
          (record?.message as string | undefined) ||
          (record?.error_description as string | undefined) ||
          (record?.details as string | undefined) ||
          (typeof err === 'string' ? err : 'Unknown error');

        const code = record?.code as string | undefined;
        errors.push({ label, message, code });
        console.warn(`AdminDashboard fetch failed (${label})`, err);
      };

      // Fetch businesses
      {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          addError('businesses', error);
          setBusinesses([]);
        } else {
          setBusinesses(data || []);
        }
      }

      // Fetch user roles
      {
        const { data, error } = await supabase
          .from('user_roles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          addError('user_roles', error);
          setUserRoles([]);
        } else {
          setUserRoles(data || []);
        }
      }

      // Fetch subscriptions
      {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          addError('subscriptions', error);
          setSubscriptions([]);
        } else {
          setSubscriptions(data || []);
        }
      }

      // Fetch app settings
      {
        const { data, error } = await supabase
          .from('app_settings')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) {
          addError('app_settings', error);
          setAppSettings([]);
        } else {
          setAppSettings((data as AppSetting[]) || []);
        }
      }

      // Fetch subscription plan catalog (pricing)
      {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('sort_order', { ascending: true });

        if (error) {
          addError('subscription_plans', error);
          setSubscriptionPlans([]);
        } else {
          setSubscriptionPlans((data as SubscriptionPlan[]) || []);
        }
      }

      if (errors.length > 0) {
        const first = errors[0];
        const migrationHint =
          first.code === '42P01' ||
          first.code === 'PGRST205' ||
          /does not exist/i.test(first.message) ||
          /schema cache/i.test(first.message);

        toast({
          title: 'Some admin data failed to load',
          description: migrationHint
            ? `${first.label}: ${first.message} (run the latest Supabase migrations and reload the API schema cache)`
            : `${first.label}: ${first.message}`,
          variant: 'destructive',
        });
      }

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load admin data';
      console.error('Error fetching admin data:', error);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setTab = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(location.search);
    if (tab === 'overview') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    navigate({ pathname: '/admin', search: params.toString() ? `?${params.toString()}` : '' }, { replace: true });
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    try {
      // Check if user already has a role
      const existingRole = userRoles.find(r => r.user_id === userId);

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert([{ user_id: userId, role: newRole }]);

        if (error) throw error;
      }

      toast({
        title: 'Role Updated',
        description: `User role has been changed to ${newRole}`,
      });

      fetchData();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBusiness = async (businessId: string) => {
    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', businessId);

      if (error) throw error;

      toast({
        title: 'Business Deleted',
        description: 'The business has been removed',
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting business:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete business',
        variant: 'destructive',
      });
    }
  };

  const handleAssignRole = async () => {
    const userId = newRoleUserId.trim();
    if (!userId) return;

    await handleRoleChange(userId, newRole);
    setNewRoleUserId('');
    setNewRole('user');
  };

  const upsertSubscription = async () => {
    if (!subscriptionForm.business_id) {
      toast({
        title: 'Missing business',
        description: 'Select a business to set subscription for.',
        variant: 'destructive',
      });
      return;
    }

    const end = subscriptionForm.current_period_end.trim();
    const current_period_end = end ? new Date(end).toISOString() : null;

    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        business_id: subscriptionForm.business_id,
        plan: subscriptionForm.plan,
        status: subscriptionForm.status,
        current_period_end,
      }, { onConflict: 'business_id' });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to save subscription',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Subscription saved',
      description: 'Subscription has been updated.',
    });

    setSubscriptionForm({ business_id: '', plan: 'free', status: 'active', current_period_end: '' });
    fetchData();
  };

  const deleteSubscription = async (businessId: string) => {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('business_id', businessId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete subscription',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Subscription deleted',
      description: 'Subscription has been removed.',
    });

    fetchData();
  };

  const upsertSetting = async () => {
    const key = settingForm.key.trim();
    if (!key) return;

    let value: unknown;
    try {
      value = JSON.parse(settingForm.valueText);
    } catch {
      toast({
        title: 'Invalid JSON',
        description: 'Settings value must be valid JSON.',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase
      .from('app_settings')
      .upsert({ key, value }, { onConflict: 'key' });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to save setting',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Setting saved',
      description: 'App setting has been updated.',
    });

    setSettingForm({ key: '', valueText: '{\n  "enabled": true\n}' });
    fetchData();
  };

  const deleteSetting = async (key: string) => {
    const { error } = await supabase
      .from('app_settings')
      .delete()
      .eq('key', key);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete setting',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Setting deleted',
      description: 'App setting has been removed.',
    });

    fetchData();
  };

  const resetPlanForm = () => {
    setPlanForm({
      id: '',
      code: '',
      name: '',
      price_monthly: '0',
      currency: 'USD',
      is_active: 'true',
      sort_order: '0',
    });
  };

  const upsertPlan = async () => {
    const code = planForm.code.trim().toLowerCase();
    const name = planForm.name.trim();
    const currency = planForm.currency.trim().toUpperCase() || 'USD';

    if (!code || !name) {
      toast({
        title: 'Missing fields',
        description: 'Plan code and name are required.',
        variant: 'destructive',
      });
      return;
    }

    const price = Number(planForm.price_monthly);
    if (!Number.isFinite(price) || price < 0) {
      toast({
        title: 'Invalid price',
        description: 'Price must be a valid number (>= 0).',
        variant: 'destructive',
      });
      return;
    }

    const sortOrder = Number.parseInt(planForm.sort_order, 10);
    if (!Number.isFinite(sortOrder)) {
      toast({
        title: 'Invalid sort order',
        description: 'Sort order must be a whole number.',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase
      .from('subscription_plans')
      .upsert({
        id: planForm.id || undefined,
        code,
        name,
        currency,
        price_monthly: price,
        is_active: planForm.is_active === 'true',
        sort_order: sortOrder,
      }, { onConflict: 'code' });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to save subscription plan.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Plan saved',
      description: 'Pricing has been updated.',
    });

    resetPlanForm();
    fetchData();
  };

  const deletePlan = async (id: string) => {
    const { error } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete subscription plan.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Plan deleted',
      description: 'Subscription plan has been removed.',
    });

    if (planForm.id === id) resetPlanForm();
    fetchData();
  };

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const filteredBusinesses = businesses.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.website_url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalBusinesses: businesses.length,
    totalAdmins: userRoles.filter(r => r.role === 'admin').length,
    totalModerators: userRoles.filter(r => r.role === 'moderator').length,
    totalUsers: userRoles.filter(r => r.role === 'user').length,
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-start gap-3">
              <SidebarTrigger className="md:hidden mt-1" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <Shield className="w-8 h-8 text-primary" />
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground">Manage users, businesses, and platform settings</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Businesses</p>
                    <p className="text-2xl font-bold mt-1">{stats.totalBusinesses}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Admins</p>
                    <p className="text-2xl font-bold mt-1">{stats.totalAdmins}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Moderators</p>
                    <p className="text-2xl font-bold mt-1">{stats.totalModerators}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <UserCog className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Regular Users</p>
                    <p className="text-2xl font-bold mt-1">{stats.totalUsers}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setTab}>
              <TabsList className="bg-card border border-border mb-6 w-full overflow-x-auto justify-start">
                <TabsTrigger value="overview" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="businesses" className="gap-2">
                  <Building2 className="w-4 h-4" />
                  Businesses
                </TabsTrigger>
                <TabsTrigger value="roles" className="gap-2">
                  <Users className="w-4 h-4" />
                  User Roles
                </TabsTrigger>
                <TabsTrigger value="subscriptions" className="gap-2">
                  <CreditCard className="w-4 h-4" />
                  Subscriptions
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Platform Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="p-4 rounded-lg bg-muted/30 border border-border">
                        <h4 className="font-semibold mb-2">Recent Activity</h4>
                        <p className="text-sm text-muted-foreground">
                          {businesses.length} businesses registered. {userRoles.length} users with assigned roles.
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-6 h-6 text-amber-400" />
                          <div>
                            <p className="font-semibold">System Status</p>
                            <p className="text-sm text-muted-foreground">All systems operational</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="businesses">
                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <CardTitle>All Businesses</CardTitle>
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search businesses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <Table className="min-w-[720px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Website</TableHead>
                            <TableHead>Industry</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="w-[70px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredBusinesses.map((business) => (
                            <TableRow key={business.id}>
                              <TableCell className="font-medium">{business.name}</TableCell>
                              <TableCell className="text-muted-foreground">{business.website_url}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{business.industry || 'N/A'}</Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {new Date(business.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={() => handleDeleteBusiness(business.id)}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                          {filteredBusinesses.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                No businesses found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="roles">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>User Roles Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-3 mb-6 p-4 rounded-lg bg-muted/30 border border-border">
                      <Input
                        placeholder="Enter user UUID (auth.users.id)"
                        value={newRoleUserId}
                        onChange={(e) => setNewRoleUserId(e.target.value)}
                        className="md:flex-1"
                      />
                      <Select value={newRole} onValueChange={(v) => setNewRole(v as 'admin' | 'moderator' | 'user')}>
                        <SelectTrigger className="w-full md:w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleAssignRole} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Assign
                      </Button>
                    </div>

                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <Table className="min-w-[720px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>User ID</TableHead>
                            <TableHead>Current Role</TableHead>
                            <TableHead>Assigned</TableHead>
                            <TableHead>Change Role</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userRoles.map((role) => (
                            <TableRow key={role.id}>
                              <TableCell className="font-mono text-sm">{role.user_id.slice(0, 8)}...</TableCell>
                              <TableCell>
                                <Badge className={
                                  role.role === 'admin' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                  role.role === 'moderator' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                  'bg-green-500/20 text-green-400 border-green-500/30'
                                }>
                                  {role.role}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {new Date(role.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Select
                                  defaultValue={role.role}
                                  onValueChange={(value) => handleRoleChange(role.user_id, value as 'admin' | 'moderator' | 'user')}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="moderator">Moderator</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          ))}
                          {userRoles.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                No user roles assigned yet
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subscriptions">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Subscriptions (Admin Managed)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-4 mb-6 p-4 rounded-lg bg-muted/30 border border-border">
                      <Select
                        value={subscriptionForm.business_id}
                        onValueChange={(v) => setSubscriptionForm((p) => ({ ...p, business_id: v }))}
                      >
                        <SelectTrigger className="md:col-span-2">
                          <SelectValue placeholder="Select business" />
                        </SelectTrigger>
                        <SelectContent>
                          {businesses.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={subscriptionForm.plan}
                        onValueChange={(v) => setSubscriptionForm((p) => ({ ...p, plan: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="starter">Starter</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={subscriptionForm.status}
                        onValueChange={(v) => setSubscriptionForm((p) => ({ ...p, status: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="trialing">Trialing</SelectItem>
                          <SelectItem value="past_due">Past Due</SelectItem>
                          <SelectItem value="canceled">Canceled</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        placeholder="Period end (YYYY-MM-DD)"
                        value={subscriptionForm.current_period_end}
                        onChange={(e) => setSubscriptionForm((p) => ({ ...p, current_period_end: e.target.value }))}
                        className="md:col-span-2"
                      />

                      <div className="md:col-span-2 flex gap-2">
                        <Button onClick={upsertSubscription} className="gap-2 flex-1">
                          <Save className="w-4 h-4" />
                          Save Subscription
                        </Button>
                      </div>
                    </div>

                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <Table className="min-w-[720px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Business</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Period End</TableHead>
                            <TableHead className="w-[90px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subscriptions.map((s) => {
                            const b = businesses.find((x) => x.id === s.business_id);
                            return (
                              <TableRow key={s.id}>
                                <TableCell className="font-medium">{b?.name || s.business_id.slice(0, 8) + '...'}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{s.plan}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className={
                                    s.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                    s.status === 'trialing' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                    s.status === 'past_due' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                    'bg-red-500/20 text-red-400 border-red-500/30'
                                  }>
                                    {s.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : '—'}
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() =>
                                          setSubscriptionForm({
                                            business_id: s.business_id,
                                            plan: s.plan,
                                            status: s.status,
                                            current_period_end: s.current_period_end ? new Date(s.current_period_end).toISOString().slice(0, 10) : '',
                                          })
                                        }
                                      >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Load into form
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => deleteSubscription(s.business_id)}
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          {subscriptions.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                No subscriptions yet
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <div className="grid gap-6">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle>Admin Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 md:grid-cols-3 mb-6 p-4 rounded-lg bg-muted/30 border border-border">
                        <Input
                          placeholder="Setting key (e.g., maintenance_mode)"
                          value={settingForm.key}
                          onChange={(e) => setSettingForm((p) => ({ ...p, key: e.target.value }))}
                        />
                        <Input
                          placeholder='JSON value (e.g., {"enabled":true})'
                          value={settingForm.valueText}
                          onChange={(e) => setSettingForm((p) => ({ ...p, valueText: e.target.value }))}
                          className="md:col-span-2 font-mono"
                        />
                        <Button onClick={upsertSetting} className="gap-2 md:col-span-3">
                          <Save className="w-4 h-4" />
                          Save Setting
                        </Button>
                      </div>

                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                      ) : (
                        <Table className="min-w-[720px]">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Key</TableHead>
                              <TableHead>Value</TableHead>
                              <TableHead>Updated</TableHead>
                              <TableHead className="w-[90px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {appSettings.map((s) => (
                              <TableRow key={s.key}>
                                <TableCell className="font-mono text-sm">{s.key}</TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                  {JSON.stringify(s.value)}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {new Date(s.updated_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() =>
                                          setSettingForm({
                                            key: s.key,
                                            valueText: JSON.stringify(s.value, null, 2),
                                          })
                                        }
                                      >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Load into form
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => deleteSetting(s.key)}
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                            {appSettings.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                  No app settings yet
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle>Subscription Plan Prices</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 md:grid-cols-6 mb-6 p-4 rounded-lg bg-muted/30 border border-border">
                        <Input
                          placeholder="code (starter)"
                          value={planForm.code}
                          onChange={(e) => setPlanForm((p) => ({ ...p, code: e.target.value }))}
                        />
                        <Input
                          placeholder="name (Starter)"
                          value={planForm.name}
                          onChange={(e) => setPlanForm((p) => ({ ...p, name: e.target.value }))}
                          className="md:col-span-2"
                        />
                        <Input
                          placeholder="price monthly"
                          value={planForm.price_monthly}
                          onChange={(e) => setPlanForm((p) => ({ ...p, price_monthly: e.target.value }))}
                          inputMode="decimal"
                        />
                        <Input
                          placeholder="currency (USD)"
                          value={planForm.currency}
                          onChange={(e) => setPlanForm((p) => ({ ...p, currency: e.target.value }))}
                        />
                        <Select value={planForm.is_active} onValueChange={(v) => setPlanForm((p) => ({ ...p, is_active: v }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Active" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="sort"
                          value={planForm.sort_order}
                          onChange={(e) => setPlanForm((p) => ({ ...p, sort_order: e.target.value }))}
                          inputMode="numeric"
                          className="md:col-span-1"
                        />
                        <div className="md:col-span-6 flex gap-2">
                          <Button onClick={upsertPlan} className="gap-2">
                            <Save className="w-4 h-4" />
                            Save Plan
                          </Button>
                          <Button variant="outline" onClick={resetPlanForm}>
                            New
                          </Button>
                        </div>
                      </div>

                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                      ) : (
                        <Table className="min-w-[720px]">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Code</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Sort</TableHead>
                              <TableHead className="w-[90px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {subscriptionPlans.map((p) => (
                              <TableRow key={p.id}>
                                <TableCell className="font-mono text-sm">{p.code}</TableCell>
                                <TableCell className="font-medium">{p.name}</TableCell>
                                <TableCell className="text-muted-foreground">
                                  {p.currency} {Number(p.price_monthly).toFixed(2)}/mo
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{p.is_active ? 'active' : 'inactive'}</Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{p.sort_order}</TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() =>
                                          setPlanForm({
                                            id: p.id,
                                            code: p.code,
                                            name: p.name,
                                            price_monthly: String(p.price_monthly ?? 0),
                                            currency: p.currency || 'USD',
                                            is_active: p.is_active ? 'true' : 'false',
                                            sort_order: String(p.sort_order ?? 0),
                                          })
                                        }
                                      >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Load into form
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => deletePlan(p.id)}
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                            {subscriptionPlans.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                  No subscription plans yet
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>
    </SidebarProvider>
  );
}
