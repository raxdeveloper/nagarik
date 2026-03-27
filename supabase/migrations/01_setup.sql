-- NAGRIKA Supabase Setup SQL

-- 1. Create Enums
CREATE TYPE problem_category AS ENUM ('infrastructure', 'education', 'health', 'corruption', 'environment', 'economy');
CREATE TYPE problem_status AS ENUM ('reported', 'verified', 'in_progress', 'solved', 'rejected');
CREATE TYPE user_role AS ENUM ('citizen', 'volunteer', 'ngo', 'government', 'admin');

-- 2. Create Tables
CREATE TABLE provinces (
    id INT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_np TEXT NOT NULL,
    capital TEXT NOT NULL,
    geojson JSONB
);

CREATE TABLE districts (
    id INT PRIMARY KEY,
    province_id INT REFERENCES provinces(id),
    name_en TEXT NOT NULL,
    name_np TEXT NOT NULL,
    geojson JSONB
);

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    avatar_url TEXT,
    phone TEXT,
    nagrika_score INT DEFAULT 0,
    role user_role DEFAULT 'citizen',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category problem_category NOT NULL,
    province_id INT REFERENCES provinces(id),
    district_id INT REFERENCES districts(id),
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    severity INT NOT NULL CHECK (severity >= 1 AND severity <= 10),
    status problem_status DEFAULT 'reported',
    images TEXT[] DEFAULT '{}',
    upvotes INT DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    solved_at TIMESTAMPTZ,
    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    view_count INT DEFAULT 0
);

CREATE TABLE upvotes (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, problem_id)
);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    logo_url TEXT,
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    problems_solved INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Setup RLS (Row Level Security)
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Policies for public read access
CREATE POLICY "Public read access for provinces" ON provinces FOR SELECT USING (true);
CREATE POLICY "Public read access for districts" ON districts FOR SELECT USING (true);
CREATE POLICY "Public read access for users" ON users FOR SELECT USING (true);
CREATE POLICY "Public read access for problems" ON problems FOR SELECT USING (true);
CREATE POLICY "Public read access for upvotes" ON upvotes FOR SELECT USING (true);
CREATE POLICY "Public read access for comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Public read access for organizations" ON organizations FOR SELECT USING (true);

-- Policies for authenticated write access
CREATE POLICY "Users can create problems" ON problems FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can edit own problems" ON problems FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Admin can update all problems" ON problems FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'government'))
);

CREATE POLICY "Users can insert upvotes" ON upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own upvotes" ON upvotes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- 4. Enable Realtime
alter publication supabase_realtime add table problems;
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table upvotes;

-- 5. Create Storage Bucket
insert into storage.buckets (id, name, public) values ('problem-images', 'problem-images', true);
create policy "Images are publicly accessible." on storage.objects for select using (bucket_id = 'problem-images');
create policy "Authenticated users can upload images." on storage.objects for insert with check (bucket_id = 'problem-images' and auth.role() = 'authenticated');

-- 6. Helper Function for Nagrika Score
CREATE OR REPLACE FUNCTION increment_nagrika_score(user_id UUID, amount INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users SET nagrika_score = nagrika_score + amount WHERE id = user_id;
END;
$$;

-- 7. Insert Provinces Seed Data
INSERT INTO provinces (id, name_en, name_np, capital) VALUES
(1, 'Koshi Province', 'कोशी प्रदेश', 'Biratnagar'),
(2, 'Madhesh Province', 'मधेश प्रदेश', 'Janakpur'),
(3, 'Bagmati Province', 'बागमती प्रदेश', 'Hetauda'),
(4, 'Gandaki Province', 'गण्डकी प्रदेश', 'Pokhara'),
(5, 'Lumbini Province', 'लुम्बिनी प्रदेश', 'Deukhuri'),
(6, 'Karnali Province', 'कर्णाली प्रदेश', 'Birendranagar'),
(7, 'Sudurpashchim Province', 'सुदूरपश्चिम प्रदेश', 'Dhangadhi');

-- 8. Insert Some Mock Users (Optional, will fail if UUIDs aren't in auth.users, better to sign up via UI)
-- 9. Insert Seed Data for Problems (We will use a separate script or manual UI entry to ensure users exist)
-- Mock Problems (Assuming we don't have user IDs yet, created_by is left null for seed data)
INSERT INTO problems (title, description, category, province_id, latitude, longitude, severity, status, upvotes, progress) VALUES
('Kathmandu Air Pollution Spike', 'AQI levels have crossed 300 in major intersections of Kathmandu Valley. Immediate action required for vehicular emissions control.', 'environment', 3, 27.7172, 85.3240, 9, 'in_progress', 145, 20),
('Melamchi Water Pipe Burst', 'Main distribution pipe burst in Chabahil, causing waterlogging and disruption of water supply to 500+ households.', 'infrastructure', 3, 27.7200, 85.3450, 8, 'reported', 89, 0),
('Rural School Lacks Roof', 'Primary school in Achham district still waiting for roof repairs after last years storm. Students studying in open.', 'education', 7, 29.1000, 81.3000, 10, 'verified', 234, 10),
('Medical Shortage in Karnali', 'Provincial hospital running out of essential medicines including paracetamol and antibiotics.', 'health', 6, 28.5833, 81.6333, 10, 'in_progress', 312, 40),
('Highway Landslide', 'Narayanghat-Mugling highway blocked due to massive landslide. Hundreds of vehicles stranded.', 'infrastructure', 3, 27.7833, 84.5333, 9, 'solved', 156, 100);
