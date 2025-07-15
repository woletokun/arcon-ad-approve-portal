import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Download, QrCode, FileText, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';

interface CertificateDownloadProps {
  certificateData: {
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
  };
}

export const CertificateDownload = ({ certificateData }: CertificateDownloadProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateQRCode = async (data: string): Promise<string> => {
    try {
      return await QRCode.toDataURL(data, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      const qrCodeDataUrl = await generateQRCode(certificateData.qr_code_data);
      
      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('ARCON ADVERTISEMENT CERTIFICATE', 105, 30, { align: 'center' });
      
      // Certificate number
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(`Certificate No: ${certificateData.certificate_number}`, 20, 50);
      
      // Campaign details
      doc.setFontSize(12);
      doc.text(`Campaign: ${certificateData.submissions.campaign_title}`, 20, 70);
      doc.text(`Brand: ${certificateData.submissions.brand_name}`, 20, 85);
      doc.text(`Category: ${certificateData.submissions.advert_category}`, 20, 100);
      doc.text(`Advertiser: ${certificateData.submissions.profiles.full_name}`, 20, 115);
      doc.text(`Company: ${certificateData.submissions.profiles.company_name}`, 20, 130);
      
      // Validity
      doc.text(`Issued: ${new Date(certificateData.issued_at).toLocaleDateString()}`, 20, 150);
      doc.text(`Valid Until: ${new Date(certificateData.valid_until).toLocaleDateString()}`, 20, 165);
      
      // QR Code
      doc.addImage(qrCodeDataUrl, 'PNG', 20, 180, 40, 40);
      doc.text('Scan to verify', 20, 230);
      
      // Footer
      doc.setFontSize(10);
      doc.text('This certificate is issued by the Advertising Regulatory Council of Nigeria (ARCON)', 105, 270, { align: 'center' });
      
      doc.save(`${certificateData.certificate_number}.pdf`);
      
      toast({
        title: "Certificate Downloaded",
        description: "Your certificate has been downloaded as a PDF file.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to generate certificate PDF.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = async () => {
    try {
      const qrCodeDataUrl = await generateQRCode(certificateData.qr_code_data);
      
      // Create download link
      const link = document.createElement('a');
      link.download = `${certificateData.certificate_number}-qr.png`;
      link.href = qrCodeDataUrl;
      link.click();
      
      toast({
        title: "QR Code Downloaded",
        description: "QR code has been downloaded as a PNG file.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to generate QR code.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Certificate Downloads
        </CardTitle>
        <CardDescription>
          Download your certificate and QR code for verification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={generatePDF}
            disabled={isGenerating}
            className="flex items-center space-x-2"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>Download Certificate PDF</span>
          </Button>
          
          <Button 
            variant="outline"
            onClick={downloadQRCode}
            className="flex items-center space-x-2"
          >
            <QrCode className="h-4 w-4" />
            <span>Download QR Code</span>
          </Button>
        </div>
        
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Certificate Details:</h4>
          <p className="text-sm"><strong>Number:</strong> {certificateData.certificate_number}</p>
          <p className="text-sm"><strong>Campaign:</strong> {certificateData.submissions.campaign_title}</p>
          <p className="text-sm"><strong>Brand:</strong> {certificateData.submissions.brand_name}</p>
          <p className="text-sm"><strong>Valid Until:</strong> {new Date(certificateData.valid_until).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  );
};