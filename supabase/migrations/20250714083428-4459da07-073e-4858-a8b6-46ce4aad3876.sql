-- Create avatars bucket for user profile images
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for creative-materials bucket
CREATE POLICY "Users can view their own creative materials" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'creative-materials' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own creative materials" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'creative-materials' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Reviewers can view all creative materials" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'creative-materials' AND auth.uid() IN (
  SELECT user_id FROM profiles WHERE role IN ('reviewer', 'admin')
));

-- Storage policies for supporting-documents bucket
CREATE POLICY "Users can view their own supporting documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'supporting-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own supporting documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'supporting-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Reviewers can view all supporting documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'supporting-documents' AND auth.uid() IN (
  SELECT user_id FROM profiles WHERE role IN ('reviewer', 'admin')
));

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);