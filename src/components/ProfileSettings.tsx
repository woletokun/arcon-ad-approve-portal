import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const ProfileSettings = () => {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    company_name: profile?.company_name || "",
    phone: profile?.phone || "",
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.user_id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      
      const { error: updateError } = await updateProfile({
        avatar_url: data.publicUrl
      });

      if (updateError) throw updateError;

      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await updateProfile(formData);
    
    if (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    }
  };

  if (!profile) return null;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Manage your profile information and avatar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
            <AvatarFallback className="text-lg">
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <Label htmlFor="avatar-upload" className="cursor-pointer">
              <Button 
                variant="outline" 
                disabled={isUploading}
                className="cursor-pointer"
                asChild
              >
                <div>
                  {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {isUploading ? "Uploading..." : "Change Avatar"}
                </div>
              </Button>
            </Label>
            <Input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <p className="text-sm text-muted-foreground mt-1">
              JPG, PNG or GIF. Max 5MB.
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
              placeholder="Enter your company name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={profile.email}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Input
              value={profile.role}
              disabled
              className="bg-muted capitalize"
            />
          </div>

          <Button type="submit" className="w-full">
            Update Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};