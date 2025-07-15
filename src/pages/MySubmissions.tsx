import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CertificateDownload } from '@/components/CertificateDownload';
import { Eye, FileText, CheckCircle, Clock, XCircle, AlertTriangle, Download } from 'lucide-react';
import { format } from 'date-fns';

type Submission = {
  id: string;
  brand_name: string;
  campaign_title: string;
  advert_category: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'requires_changes';
  submitted_at: string;
  certificates?: {
    id: string;
    certificate_number: string;
    qr_code_data: string;
    issued_at: string;
    valid_until: string;
    submissions: {
      brand_name: string;
      campaign_title: string;
      advert_category: string;
      profiles: {
        full_name: string;
        company_name: string;
      };
    };
  }[];
};

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, variant: 'secondary' as const, color: 'text-yellow-600' },
  under_review: { label: 'Under Review', icon: Eye, variant: 'default' as const, color: 'text-blue-600' },
  approved: { label: 'Approved', icon: CheckCircle, variant: 'default' as const, color: 'text-green-600' },
  rejected: { label: 'Rejected', icon: XCircle, variant: 'destructive' as const, color: 'text-red-600' },
  requires_changes: { label: 'Requires Changes', icon: AlertTriangle, variant: 'outline' as const, color: 'text-orange-600' },
};

export const MySubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          id,
          brand_name,
          campaign_title,
          advert_category,
          status,
          submitted_at,
          certificates (
            id,
            certificate_number,
            qr_code_data,
            issued_at,
            valid_until,
            submissions (
              brand_name,
              campaign_title,
              advert_category,
              profiles (
                full_name,
                company_name
              )
            )
          )
        `)
        .eq('advertiser_id', profile?.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions((data || []) as unknown as Submission[]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch submissions",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your submissions...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view your submissions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Submissions</h1>
        <p className="text-muted-foreground mt-2">
          Track your advertisement submissions and download certificates
        </p>
      </div>

      <div className="space-y-4">
        {submissions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't submitted any advertisements for review.
              </p>
              <Button onClick={() => window.location.href = '/submit'}>
                Submit Your First Ad
              </Button>
            </CardContent>
          </Card>
        ) : (
          submissions.map((submission) => {
            const statusInfo = statusConfig[submission.status as keyof typeof statusConfig];
            const StatusIcon = statusInfo?.icon || Clock;
            const hasCertificate = submission.certificates && submission.certificates.length > 0;

            return (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{submission.campaign_title}</CardTitle>
                      <CardDescription>
                        {submission.brand_name} • {submission.advert_category}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={statusInfo?.variant || 'secondary'}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo?.label || submission.status}
                      </Badge>
                      {hasCertificate && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-1" />
                              Certificate
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Download Certificate</DialogTitle>
                              <DialogDescription>
                                Your advertisement has been approved. Download your certificate and QR code.
                              </DialogDescription>
                            </DialogHeader>
                            <CertificateDownload certificateData={submission.certificates[0]} />
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>Submitted: {format(new Date(submission.submitted_at), 'PPP')}</p>
                    {hasCertificate && (
                      <p className="text-green-600 font-medium mt-1">
                        Certificate: {submission.certificates[0].certificate_number}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};