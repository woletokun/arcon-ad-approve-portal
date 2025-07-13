-- Create enum types
CREATE TYPE public.user_role AS ENUM ('advertiser', 'reviewer', 'admin');
CREATE TYPE public.advert_category AS ENUM ('tv', 'radio', 'billboard', 'digital', 'print', 'online');
CREATE TYPE public.submission_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'requires_changes');
CREATE TYPE public.geographic_scope AS ENUM ('national', 'state', 'lga', 'regional');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company_name TEXT,
    role user_role NOT NULL DEFAULT 'advertiser',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create submissions table
CREATE TABLE public.submissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    advertiser_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL,
    campaign_title TEXT NOT NULL,
    advert_category advert_category NOT NULL,
    campaign_start_date DATE NOT NULL,
    campaign_end_date DATE NOT NULL,
    geographic_scope geographic_scope NOT NULL,
    geographic_details TEXT, -- specific states/LGAs
    creative_materials_urls TEXT[], -- file URLs
    supporting_documents_urls TEXT[], -- file URLs
    notes TEXT,
    status submission_status NOT NULL DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.profiles(id),
    payment_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comments table for reviewer feedback
CREATE TABLE public.submission_comments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE, -- internal notes vs feedback to advertiser
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create certificates table
CREATE TABLE public.certificates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID NOT NULL UNIQUE REFERENCES public.submissions(id) ON DELETE CASCADE,
    certificate_number TEXT NOT NULL UNIQUE,
    qr_code_data TEXT NOT NULL,
    pdf_url TEXT,
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Reviewers can view all profiles" 
ON public.profiles FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role IN ('reviewer', 'admin')
    )
);

-- Create policies for submissions
CREATE POLICY "Advertisers can view their own submissions" 
ON public.submissions FOR SELECT 
USING (
    advertiser_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Advertisers can create submissions" 
ON public.submissions FOR INSERT 
WITH CHECK (
    advertiser_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'advertiser'
    )
);

CREATE POLICY "Advertisers can update their pending submissions" 
ON public.submissions FOR UPDATE 
USING (
    advertiser_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    ) AND status = 'pending'
);

CREATE POLICY "Reviewers can view all submissions" 
ON public.submissions FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role IN ('reviewer', 'admin')
    )
);

CREATE POLICY "Reviewers can update submission status" 
ON public.submissions FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role IN ('reviewer', 'admin')
    )
);

-- Create policies for comments
CREATE POLICY "Advertisers can view comments on their submissions" 
ON public.submission_comments FOR SELECT 
USING (
    submission_id IN (
        SELECT id FROM public.submissions 
        WHERE advertiser_id IN (
            SELECT id FROM public.profiles WHERE user_id = auth.uid()
        )
    ) AND is_internal = FALSE
);

CREATE POLICY "Reviewers can view all comments" 
ON public.submission_comments FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role IN ('reviewer', 'admin')
    )
);

CREATE POLICY "Reviewers can create comments" 
ON public.submission_comments FOR INSERT 
WITH CHECK (
    reviewer_id IN (
        SELECT id FROM public.profiles 
        WHERE user_id = auth.uid() AND role IN ('reviewer', 'admin')
    )
);

-- Create policies for certificates (public readable for verification)
CREATE POLICY "Anyone can read certificates for verification" 
ON public.certificates FOR SELECT 
USING (is_active = TRUE);

CREATE POLICY "Advertisers can view their certificates" 
ON public.certificates FOR SELECT 
USING (
    submission_id IN (
        SELECT id FROM public.submissions 
        WHERE advertiser_id IN (
            SELECT id FROM public.profiles WHERE user_id = auth.uid()
        )
    )
);

CREATE POLICY "Reviewers can create certificates" 
ON public.certificates FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role IN ('reviewer', 'admin')
    )
);

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
('creative-materials', 'creative-materials', false),
('supporting-documents', 'supporting-documents', false),
('certificates', 'certificates', true);

-- Create storage policies
CREATE POLICY "Authenticated users can upload creative materials" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'creative-materials' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own creative materials" 
ON storage.objects FOR SELECT 
USING (
    bucket_id = 'creative-materials' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Reviewers can view all creative materials" 
ON storage.objects FOR SELECT 
USING (
    bucket_id = 'creative-materials' AND 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role IN ('reviewer', 'admin')
    )
);

CREATE POLICY "Authenticated users can upload supporting documents" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'supporting-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own supporting documents" 
ON storage.objects FOR SELECT 
USING (
    bucket_id = 'supporting-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Reviewers can view all supporting documents" 
ON storage.objects FOR SELECT 
USING (
    bucket_id = 'supporting-documents' AND 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role IN ('reviewer', 'admin')
    )
);

CREATE POLICY "Certificates are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'certificates');

CREATE POLICY "Reviewers can upload certificates" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'certificates' AND 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role IN ('reviewer', 'admin')
    )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
    BEFORE UPDATE ON public.submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
        NEW.email,
        COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'advertiser')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Generate certificate number function
CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'ARCON-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;