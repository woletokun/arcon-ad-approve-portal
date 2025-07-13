import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CalendarIcon, Upload, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

export const SubmitAd = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'creative' | 'supporting') => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const uploadFiles = async (files: File[], bucketName: string, folder: string) => {
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      const fileName = `${folder}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);
      
      if (!error) {
        uploadedUrls.push(fileName);
      }
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Upload files
      const creativeFiles = Array.from((document.getElementById('creative-materials') as HTMLInputElement)?.files || []);
      const supportingFiles = Array.from((document.getElementById('supporting-documents') as HTMLInputElement)?.files || []);
      
      const creativeUrls = await uploadFiles(creativeFiles, 'creative-materials', profile?.id);
      const supportingUrls = await uploadFiles(supportingFiles, 'supporting-documents', profile?.id);

      // Submit application
      const { error } = await supabase
        .from('submissions')
        .insert({
          advertiser_id: profile?.id,
          brand_name: formData.get('brandName') as string,
          campaign_title: formData.get('campaignTitle') as string,
          advert_category: formData.get('advertCategory') as Database['public']['Enums']['advert_category'],
          campaign_start_date: startDate?.toISOString().split('T')[0] || '',
          campaign_end_date: endDate?.toISOString().split('T')[0] || '',
          geographic_scope: formData.get('geographicScope') as Database['public']['Enums']['geographic_scope'],
          geographic_details: formData.get('geographicDetails') as string,
          creative_materials_urls: creativeUrls,
          supporting_documents_urls: supportingUrls,
          notes: formData.get('notes') as string,
          payment_confirmed: true // Demo simulation
        });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "Your advertisement submission has been sent for review.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Submit Advertisement</h1>
          <p className="text-muted-foreground mt-2">
            Submit your advertisement materials for ARCON approval
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Advertisement Submission Form</CardTitle>
            <CardDescription>
              Please provide all required information and materials for review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Advertiser Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="advertiserName">Advertiser Name</Label>
                  <Input
                    id="advertiserName"
                    value={profile?.full_name || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={profile?.company_name || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              {/* Campaign Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="brandName">Brand Name *</Label>
                  <Input
                    id="brandName"
                    name="brandName"
                    placeholder="Enter brand name"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaignTitle">Campaign Title *</Label>
                  <Input
                    id="campaignTitle"
                    name="campaignTitle"
                    placeholder="Enter campaign title"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="advertCategory">Advertisement Category *</Label>
                  <Select name="advertCategory" disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tv">Television</SelectItem>
                      <SelectItem value="radio">Radio</SelectItem>
                      <SelectItem value="billboard">Billboard</SelectItem>
                      <SelectItem value="digital">Digital</SelectItem>
                      <SelectItem value="print">Print</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="geographicScope">Geographic Scope *</Label>
                  <Select name="geographicScope" disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national">National</SelectItem>
                      <SelectItem value="state">State</SelectItem>
                      <SelectItem value="lga">Local Government Area</SelectItem>
                      <SelectItem value="regional">Regional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="geographicDetails">Geographic Details</Label>
                <Input
                  id="geographicDetails"
                  name="geographicDetails"
                  placeholder="Specify states, LGAs, or regions"
                  disabled={isLoading}
                />
              </div>

              {/* Campaign Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Campaign Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Campaign End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* File Uploads */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="creative-materials">Creative Materials</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="mt-4">
                        <Label htmlFor="creative-materials" className="cursor-pointer">
                          <span className="text-primary hover:text-primary/80">Upload files</span>
                          <span className="text-muted-foreground"> or drag and drop</span>
                        </Label>
                        <Input
                          id="creative-materials"
                          type="file"
                          multiple
                          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'creative')}
                          disabled={isLoading}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Images, videos, audio files, scripts (max 10MB each)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supporting-documents">Supporting Documents</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="mt-4">
                        <Label htmlFor="supporting-documents" className="cursor-pointer">
                          <span className="text-primary hover:text-primary/80">Upload files</span>
                          <span className="text-muted-foreground"> or drag and drop</span>
                        </Label>
                        <Input
                          id="supporting-documents"
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.txt"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'supporting')}
                          disabled={isLoading}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Briefs, disclaimers, compliance documents (PDF, DOC)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Any additional information or special requirements..."
                  rows={4}
                  disabled={isLoading}
                />
              </div>

              {/* Payment Simulation */}
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Payment Confirmation (Demo)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  In the live system, payment would be processed here. For demo purposes, this is automatically confirmed.
                </p>
                <Button type="button" variant="outline" disabled>
                  Payment Confirmed ✓
                </Button>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit for Review
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};