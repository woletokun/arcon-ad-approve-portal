import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, MessageCircle, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';

type Submission = {
  id: string;
  brand_name: string;
  campaign_title: string;
  advert_category: 'tv' | 'radio' | 'billboard' | 'digital' | 'print' | 'online';
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'requires_changes';
  submitted_at: string;
  advertiser_id: string;
  profiles: {
    full_name: string;
    company_name: string;
  };
};

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, variant: 'secondary' as const },
  under_review: { label: 'Under Review', icon: Eye, variant: 'default' as const },
  approved: { label: 'Approved', icon: CheckCircle, variant: 'default' as const },
  rejected: { label: 'Rejected', icon: XCircle, variant: 'destructive' as const },
  requires_changes: { label: 'Requires Changes', icon: MessageCircle, variant: 'outline' as const },
};

export const ReviewPanel = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
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
          *,
          profiles (
            full_name,
            company_name
          )
        `)
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

  const fetchSubmissionDetails = async (submissionId: string) => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          profiles (
            full_name,
            company_name,
            email,
            phone
          ),
          submission_comments (
            id,
            comment,
            is_internal,
            created_at,
            reviewer_id,
            profiles (
              full_name
            )
          )
        `)
        .eq('id', submissionId)
        .single();

      if (error) throw error;
      setSelectedSubmission(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch submission details",
      });
    }
  };

  const updateSubmissionStatus = async (submissionId: string, status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'requires_changes') => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: profile?.id
        })
        .eq('id', submissionId);

      if (error) throw error;

      // Add comment if provided
      if (comment.trim()) {
        await supabase
          .from('submission_comments')
          .insert({
            submission_id: submissionId,
            reviewer_id: profile?.id,
            comment: comment.trim(),
            is_internal: false
          });
      }

      // Generate certificate if approved
      if (status === 'approved') {
        await generateCertificate(submissionId);
      }

      toast({
        title: "Status Updated",
        description: `Submission has been ${status}.`,
      });

      setComment('');
      fetchSubmissions();
      setSelectedSubmission(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update submission status",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const generateCertificate = async (submissionId: string) => {
    try {
      const certificateNumber = `ARCON-${new Date().getFullYear()}-${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`;
      const qrData = `${window.location.origin}/verify/${certificateNumber}`;
      
      const { error } = await supabase
        .from('certificates')
        .insert({
          submission_id: submissionId,
          certificate_number: certificateNumber,
          qr_code_data: qrData,
          valid_from: new Date().toISOString().split('T')[0],
          valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year validity
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to generate certificate:', error);
    }
  };

  const filterSubmissions = (status?: string) => {
    if (!status) return submissions;
    return submissions.filter(sub => sub.status === status);
  };

  const getFileUrl = (bucket: string, path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Review Panel</h1>
        <p className="text-muted-foreground mt-2">
          Review and manage advertisement submissions
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({submissions.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({filterSubmissions('pending').length})</TabsTrigger>
          <TabsTrigger value="under_review">Under Review ({filterSubmissions('under_review').length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({filterSubmissions('approved').length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({filterSubmissions('rejected').length})</TabsTrigger>
        </TabsList>

        {(['all', 'pending', 'under_review', 'approved', 'rejected'] as const).map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="space-y-4">
            {filterSubmissions(tabValue === 'all' ? undefined : tabValue).map((submission) => {
              const StatusIcon = statusConfig[submission.status as keyof typeof statusConfig]?.icon || Clock;
              const statusInfo = statusConfig[submission.status as keyof typeof statusConfig];
              
              return (
                <Card key={submission.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{submission.campaign_title}</CardTitle>
                        <CardDescription>
                          {submission.brand_name} • {submission.profiles.company_name}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={statusInfo?.variant || 'secondary'}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo?.label || submission.status}
                        </Badge>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fetchSubmissionDetails(submission.id)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Submission Review</DialogTitle>
                              <DialogDescription>
                                {submission.campaign_title} by {submission.profiles.full_name}
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedSubmission && (
                              <div className="space-y-6">
                                {/* Submission Details */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="font-semibold">Brand Name</Label>
                                    <p>{selectedSubmission.brand_name}</p>
                                  </div>
                                  <div>
                                    <Label className="font-semibold">Category</Label>
                                    <p className="capitalize">{selectedSubmission.advert_category}</p>
                                  </div>
                                  <div>
                                    <Label className="font-semibold">Geographic Scope</Label>
                                    <p className="capitalize">{selectedSubmission.geographic_scope}</p>
                                  </div>
                                  <div>
                                    <Label className="font-semibold">Campaign Duration</Label>
                                    <p>
                                      {format(new Date(selectedSubmission.campaign_start_date), 'PPP')} - {format(new Date(selectedSubmission.campaign_end_date), 'PPP')}
                                    </p>
                                  </div>
                                </div>

                                {/* Files */}
                                {(selectedSubmission.creative_materials_urls?.length > 0 || selectedSubmission.supporting_documents_urls?.length > 0) && (
                                  <div>
                                    <Label className="font-semibold">Uploaded Files</Label>
                                    <div className="mt-2 space-y-2">
                                      {selectedSubmission.creative_materials_urls?.map((url: string, index: number) => (
                                        <div key={index} className="flex items-center space-x-2">
                                          <FileText className="w-4 h-4" />
                                          <a 
                                            href={getFileUrl('creative-materials', url)} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                          >
                                            Creative Material {index + 1}
                                          </a>
                                        </div>
                                      ))}
                                      {selectedSubmission.supporting_documents_urls?.map((url: string, index: number) => (
                                        <div key={index} className="flex items-center space-x-2">
                                          <FileText className="w-4 h-4" />
                                          <a 
                                            href={getFileUrl('supporting-documents', url)} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                          >
                                            Supporting Document {index + 1}
                                          </a>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Notes */}
                                {selectedSubmission.notes && (
                                  <div>
                                    <Label className="font-semibold">Notes</Label>
                                    <p className="mt-1">{selectedSubmission.notes}</p>
                                  </div>
                                )}

                                {/* Comments */}
                                {selectedSubmission.submission_comments?.length > 0 && (
                                  <div>
                                    <Label className="font-semibold">Review Comments</Label>
                                    <div className="mt-2 space-y-2">
                                      {selectedSubmission.submission_comments.map((comment: any) => (
                                        <div key={comment.id} className="bg-muted p-3 rounded">
                                          <p className="text-sm">{comment.comment}</p>
                                          <p className="text-xs text-muted-foreground mt-1">
                                            By {comment.profiles.full_name} on {format(new Date(comment.created_at), 'PPP')}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Review Actions */}
                                {selectedSubmission.status !== 'approved' && selectedSubmission.status !== 'rejected' && (
                                  <div className="space-y-4 border-t pt-4">
                                    <div>
                                      <Label htmlFor="comment">Review Comment</Label>
                                      <Textarea
                                        id="comment"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Add your review comments..."
                                        className="mt-1"
                                      />
                                    </div>
                                    
                                    <div className="flex space-x-2">
                                      <Button
                                        onClick={() => updateSubmissionStatus(selectedSubmission.id, 'approved')}
                                        disabled={actionLoading}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Approve
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={() => updateSubmissionStatus(selectedSubmission.id, 'rejected')}
                                        disabled={actionLoading}
                                      >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Reject
                                      </Button>
                                      <Button
                                        variant="outline"
                                        onClick={() => updateSubmissionStatus(selectedSubmission.id, 'requires_changes')}
                                        disabled={actionLoading}
                                      >
                                        <MessageCircle className="w-4 h-4 mr-1" />
                                        Request Changes
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      <p>Category: {submission.advert_category}</p>
                      <p>Submitted: {format(new Date(submission.submitted_at), 'PPP')}</p>
                      <p>Advertiser: {submission.profiles.full_name}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {filterSubmissions(tabValue === 'all' ? undefined : tabValue).length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No submissions found.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};