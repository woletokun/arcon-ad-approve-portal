import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ShieldCheck, Search, CheckCircle, XCircle, AlertTriangle, Calendar, Building, Tag } from 'lucide-react';
import { format } from 'date-fns';

type Certificate = {
  id: string;
  certificate_number: string;
  issued_at: string;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  submissions: {
    brand_name: string;
    campaign_title: string;
    advert_category: 'tv' | 'radio' | 'billboard' | 'digital' | 'print' | 'online';
    geographic_scope: 'national' | 'state' | 'lga' | 'regional';
    profiles: {
      full_name: string;
      company_name: string;
    };
  };
};

export const Verify = () => {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [searchId, setSearchId] = useState(certificateId || '');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (certificateId) {
      verifyCertificate(certificateId);
    }
  }, [certificateId]);

  const verifyCertificate = async (certId: string) => {
    setLoading(true);
    setSearched(true);
    
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          submissions (
            brand_name,
            campaign_title,
            advert_category,
            geographic_scope,
            profiles (
              full_name,
              company_name
            )
          )
        `)
        .eq('certificate_number', certId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        setCertificate(null);
      } else {
        setCertificate(data as unknown as Certificate);
      }
    } catch (error) {
      setCertificate(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      verifyCertificate(searchId.trim());
    }
  };

  const isExpired = certificate && new Date(certificate.valid_until) < new Date();
  const isValid = certificate && !isExpired && certificate.is_active;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="bg-primary rounded-full p-4">
                <ShieldCheck className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2">Certificate Verification</h1>
            <p className="text-muted-foreground text-lg">
              Verify the authenticity of ARCON advertisement certificates
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Verify Certificate
              </CardTitle>
              <CardDescription>
                Enter the certificate number to verify its authenticity and view details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="certificate-id" className="sr-only">
                    Certificate Number
                  </Label>
                  <Input
                    id="certificate-id"
                    placeholder="Enter certificate number (e.g., ARCON-2024-123456)"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button type="submit" disabled={loading || !searchId.trim()}>
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          {searched && (
            <Card>
              <CardContent className="p-8">
                {loading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Verifying certificate...</p>
                  </div>
                ) : certificate ? (
                  <div className="space-y-6">
                    {/* Status Header */}
                    <div className="text-center">
                      {isValid ? (
                        <div className="flex flex-col items-center space-y-2">
                          <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-4">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                          </div>
                          <h2 className="text-2xl font-bold text-green-600">Certificate Valid</h2>
                          <p className="text-muted-foreground">This certificate is authentic and currently valid</p>
                        </div>
                      ) : isExpired ? (
                        <div className="flex flex-col items-center space-y-2">
                          <div className="bg-orange-100 dark:bg-orange-900/20 rounded-full p-4">
                            <AlertTriangle className="h-12 w-12 text-orange-600" />
                          </div>
                          <h2 className="text-2xl font-bold text-orange-600">Certificate Expired</h2>
                          <p className="text-muted-foreground">This certificate was valid but has expired</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-2">
                          <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-4">
                            <XCircle className="h-12 w-12 text-red-600" />
                          </div>
                          <h2 className="text-2xl font-bold text-red-600">Certificate Invalid</h2>
                          <p className="text-muted-foreground">This certificate is not active</p>
                        </div>
                      )}
                    </div>

                    {/* Certificate Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      <div className="space-y-4">
                        <div>
                          <Label className="font-semibold text-base">Certificate Number</Label>
                          <p className="text-lg font-mono">{certificate.certificate_number}</p>
                        </div>
                        
                        <div>
                          <Label className="font-semibold text-base">Campaign Title</Label>
                          <p className="text-lg">{certificate.submissions.campaign_title}</p>
                        </div>
                        
                        <div>
                          <Label className="font-semibold text-base">Brand Name</Label>
                          <p className="text-lg">{certificate.submissions.brand_name}</p>
                        </div>
                        
                        <div>
                          <Label className="font-semibold text-base">Advertiser</Label>
                          <p className="text-lg">{certificate.submissions.profiles.full_name}</p>
                          {certificate.submissions.profiles.company_name && (
                            <p className="text-muted-foreground">{certificate.submissions.profiles.company_name}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="font-semibold text-base flex items-center">
                            <Tag className="h-4 w-4 mr-1" />
                            Category
                          </Label>
                          <Badge variant="outline" className="text-sm">
                            {certificate.submissions.advert_category}
                          </Badge>
                        </div>
                        
                        <div>
                          <Label className="font-semibold text-base flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            Geographic Scope
                          </Label>
                          <Badge variant="outline" className="text-sm">
                            {certificate.submissions.geographic_scope}
                          </Badge>
                        </div>
                        
                        <div>
                          <Label className="font-semibold text-base flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Issued Date
                          </Label>
                          <p>{format(new Date(certificate.issued_at), 'PPP')}</p>
                        </div>
                        
                        <div>
                          <Label className="font-semibold text-base">Validity Period</Label>
                          <p>
                            {format(new Date(certificate.valid_from), 'PPP')} - {format(new Date(certificate.valid_until), 'PPP')}
                          </p>
                          {isExpired && (
                            <Badge variant="destructive" className="mt-1">
                              Expired
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Verification Note */}
                    <div className="mt-8 p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Verification Note:</strong> This certificate has been verified against ARCON's database. 
                        The information displayed above confirms the authenticity and current status of the advertisement approval.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-4 w-fit mx-auto mb-4">
                      <XCircle className="h-12 w-12 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Certificate Not Found</h2>
                    <p className="text-muted-foreground mb-4">
                      The certificate number you entered was not found in our database or may be invalid.
                    </p>
                    <div className="text-sm text-muted-foreground">
                      <p>Please check that you have entered the correct certificate number and try again.</p>
                      <p>If you believe this is an error, please contact ARCON support.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          {!searched && (
            <Card>
              <CardHeader>
                <CardTitle>How to Verify</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 rounded-full p-2 mt-1">
                      <span className="text-primary font-semibold text-sm">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Scan QR Code</h3>
                      <p className="text-muted-foreground">Use your phone's camera to scan the QR code on the certificate</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 rounded-full p-2 mt-1">
                      <span className="text-primary font-semibold text-sm">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Manual Entry</h3>
                      <p className="text-muted-foreground">Enter the certificate number manually in the format: ARCON-YYYY-XXXXXX</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 rounded-full p-2 mt-1">
                      <span className="text-primary font-semibold text-sm">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">View Results</h3>
                      <p className="text-muted-foreground">Get instant verification of the certificate's authenticity and validity</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};