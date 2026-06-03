-- ==========================================
-- SUPABASE DATABASE SETUP SCRIPT
-- Copy and paste everything below this line into the Supabase SQL Editor
-- ==========================================

-- 1. Create Tables

-- Projects Table
CREATE TABLE public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  title text NOT NULL,
  category text,
  tools text,
  description text,
  link text,
  image_url text,
  display_order integer DEFAULT 0
);

-- Education Table
CREATE TABLE public.education (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  degree text NOT NULL,
  institution text NOT NULL,
  period text NOT NULL,
  description text,
  display_order integer DEFAULT 0
);

-- Library Table (Books & Notes)
CREATE TABLE public.library (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  title text NOT NULL,
  item_type text NOT NULL, -- e.g., 'Book' or 'Notes'
  description text,
  file_url text NOT NULL,
  image_url text
);

-- Settings Table (for Resume)
CREATE TABLE public.settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  value text NOT NULL
);

-- Insert a default row for resume and all site content text
INSERT INTO public.settings (key, value) VALUES 
  ('resume_url', '#'),
  ('hero_greeting', 'Hello! I''m'),
  ('hero_firstname', 'SOUMYADIP'),
  ('hero_lastname', 'MAJI'),
  ('hero_role_title', 'A ML ENGINEERE'),
  ('hero_role_1', 'Developer'),
  ('hero_role_2', 'Engineer'),
  ('about_title', 'About Me'),
  ('about_desc', 'Full Stack Developer with 4+ years of experience building scalable web applications using React.js, Angular, Next.js, Node.js, and NestJS. Skilled in microservices architecture, CMS development, and low-code platforms. Passionate about creating high-performance, production-ready solutions from concept to deployment.'),
  ('contact_email', 'soumyadipmaji643@gmail.com'),
  ('contact_edu', 'B.Tech in Computer Science And Engineering'),
  ('footer_name', 'Soumyadip Maji'),
  ('social_github', 'https://github.com/raxx21'),
  ('social_linkedin', 'https://www.linkedin.com/in/rajesh-chityal-2a70141b3'),
  ('social_twitter', 'https://x.com/raxx21_official'),
  ('social_instagram', 'https://www.instagram.com/therajeshchityal')
ON CONFLICT (key) DO NOTHING;

-- ==========================================
-- 2. Setup Security (Row Level Security)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow ANYONE (public) to READ the data (so your portfolio website works for visitors)
CREATE POLICY "Allow public read access on projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow public read access on education" ON public.education FOR SELECT USING (true);
CREATE POLICY "Allow public read access on library" ON public.library FOR SELECT USING (true);
CREATE POLICY "Allow public read access on settings" ON public.settings FOR SELECT USING (true);

-- Allow ONLY AUTHENTICATED ADMINS to INSERT/UPDATE/DELETE data
CREATE POLICY "Allow authenticated full access on projects" ON public.projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access on education" ON public.education FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access on library" ON public.library FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access on settings" ON public.settings FOR ALL USING (auth.role() = 'authenticated');

-- ==========================================
-- 3. Setup Storage Buckets
-- ==========================================

-- Note: Depending on your Supabase version, creating buckets via SQL might require superuser access.
-- If the below fails, simply go to "Storage" in Supabase UI and manually create a public bucket named "portfolio-assets".

INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-assets', 'portfolio-assets', true)
ON CONFLICT DO NOTHING;

-- Allow public to view files
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio-assets');

-- Allow authenticated users to upload/edit files
CREATE POLICY "Admin Upload Access" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio-assets');
CREATE POLICY "Admin Update Access" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'portfolio-assets');
CREATE POLICY "Admin Delete Access" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'portfolio-assets');
