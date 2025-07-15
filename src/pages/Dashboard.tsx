import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileSettings } from "@/components/ProfileSettings";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Users,
  Shield,
  AlertTriangle
} from "lucide-react";

/**
 * Dashboard Component
 * 
 * Main dashboard for ARCON e-Ad Approval Portal
 * Features role-based content display:
 * - Advertiser: Submission overview, recent submissions, quick actions
 * - Reviewer: Review queue, pending approvals, recent activity
 * - Admin: System overview, user statistics, platform health
 */

// Mock data for demo purposes
const mockData = {
  advertiser: {
    submissions: {
      total: 12,
      pending: 3,
      approved: 8,
      rejected: 1
    },
    recentSubmissions: [
      { id: "ADV-001", title: "Nike Air Max Campaign", status: "approved", date: "2024-01-15" },
      { id: "ADV-002", title: "Coca-Cola Summer Ad", status: "pending", date: "2024-01-14" },
      { id: "ADV-003", title: "Samsung Galaxy Launch", status: "under_review", date: "2024-01-13" }
    ]
  },
  reviewer: {
    queue: {
      pending: 15,
      urgent: 3,
      reviewed_today: 8,
      avg_review_time: "2.5 hours"
    },
    recentActivity: [
      { id: "REV-001", title: "Pepsi Billboard Campaign", action: "approved", date: "2024-01-15" },
      { id: "REV-002", title: "MTN Data Plan Ad", action: "requested_changes", date: "2024-01-15" },
      { id: "REV-003", title: "Dangote Cement TV Ad", action: "approved", date: "2024-01-14" }
    ]
  },
  admin: {
    stats: {
      total_users: 234,
      active_advertisers: 89,
      active_reviewers: 12,
      submissions_this_month: 156
    },
    systemHealth: {
      uptime: "99.9%",
      avg_response_time: "245ms",
      storage_used: "68%",
      active_sessions: 45
    }
  }
};

interface DashboardProps {
  userRole?: 'advertiser' | 'reviewer' | 'admin';
}

export const Dashboard = ({ userRole }: DashboardProps) => {
  const { profile, signOut } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  const user = profile ? {
    name: profile.full_name,
    email: profile.email,
    role: profile.role,
    avatar_url: profile.avatar_url
  } : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'destructive';
      case 'under_review': return 'secondary';
      default: return 'secondary';
    }
  };

  const renderAdvertiserDashboard = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.advertiser.submissions.total}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.advertiser.submissions.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting ARCON review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{mockData.advertiser.submissions.approved}</div>
            <p className="text-xs text-muted-foreground">
              Ready for publication
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{mockData.advertiser.submissions.rejected}</div>
            <p className="text-xs text-muted-foreground">
              Requires revision
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Your latest advertisement submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockData.advertiser.recentSubmissions.map((submission) => (
              <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{submission.title}</h4>
                  <p className="text-sm text-muted-foreground">ID: {submission.id}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusColor(submission.status) as any}>
                    {submission.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{submission.date}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button className="w-full">View All Submissions</Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button 
              className="h-auto p-4 flex flex-col space-y-2"
              onClick={() => window.location.href = '/submit'}
            >
              <FileText className="h-6 w-6" />
              <span>Submit New Ad</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col space-y-2"
              onClick={() => window.location.href = '/verify'}
            >
              <CheckCircle className="h-6 w-6" />
              <span>Verify Certificates</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (!profile) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Loading...</h2>
        <p className="text-muted-foreground">Please wait while we load your profile.</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={signOut} />
      
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar 
          userRole={profile.role} 
          pendingCount={mockData.reviewer.queue.pending}
          onViewChange={setActiveView}
        />
        
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            {activeView === 'profile' ? (
              <ProfileSettings />
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-3xl font-bold">Dashboard</h1>
                  <p className="text-muted-foreground">
                    Welcome back, {profile.full_name}. Here's your portal overview.
                  </p>
                </div>
                
                {renderAdvertiserDashboard()}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};