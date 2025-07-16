import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileSettings } from "@/components/ProfileSettings";
import { Navigate } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

/**
 * Dashboard Component
 * 
 * Main dashboard for ARCON e-Ad Approval Portal
 * Handles loading, missing profile, and redirects gracefully.
 */

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
      pending: 15
    }
  }
};

export const Dashboard = () => {
  const { user, profile, loading, signOut } = useAuth();
  const [activeView, setActiveView] = useState("dashboard");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load your profile.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-destructive mb-2">Profile not found</h2>
          <p className="text-muted-foreground">Please ensure your account has a profile record in Supabase.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "destructive";
      case "under_review":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const renderAdvertiserDashboard = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {["total", "pending", "approved", "rejected"].map((key) => {
          const titleMap: any = {
            total: "Total Submissions",
            pending: "Pending Review",
            approved: "Approved",
            rejected: "Rejected"
          };

          const iconMap: any = {
            total: FileText,
            pending: Clock,
            approved: CheckCircle,
            rejected: XCircle
          };

          const Icon = iconMap[key];
          const count = mockData.advertiser.submissions[key as keyof typeof mockData.advertiser.submissions];

          return (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{titleMap[key]}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${key === "approved" ? "text-success" : key === "rejected" ? "text-destructive" : ""}`}>
                  {count}
                </div>
                <p className="text-xs text-muted-foreground">
                  {key === "pending" ? "Awaiting ARCON review" : key === "approved" ? "Ready for publication" : key === "rejected" ? "Requires revision" : "+2 from last month"}
                </p>
              </CardContent>
            </Card>
          );
        })}
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
                    {submission.status.replace("_", " ")}
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
              onClick={() => (window.location.href = "/submit")}
            >
              <FileText className="h-6 w-6" />
              <span>Submit New Ad</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col space-y-2"
              onClick={() => (window.location.href = "/verify")}
            >
              <CheckCircle className="h-6 w-6" />
              <span>Verify Certificates</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const userInfo = {
    name: profile.full_name,
    email: profile.email,
    role: profile.role,
    avatar_url: profile.avatar_url
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={userInfo} onLogout={signOut} />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar
          userRole={profile.role}
          pendingCount={mockData.reviewer.queue.pending}
          onViewChange={setActiveView}
        />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            {activeView === "profile" ? (
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
