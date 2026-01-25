-- ============================================================================
-- VENSA Supabase Database Schema
-- Venezuelan Student Association at UF
-- ============================================================================

-- Enable UUID extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

-- Year status for students
CREATE TYPE year_status AS ENUM (
  'Freshman',
  'Sophomore',
  'Junior',
  'Senior',
  'Graduate',
  'Alumni'
);

-- Member status/role
CREATE TYPE member_status AS ENUM (
  'member',
  'eboard',
  'alumni'
);

-- Event types
CREATE TYPE event_type AS ENUM (
  'GBM',
  'Social',
  'Professional',
  'Intramural',
  'Networking',
  'Workshop',
  'Other'
);

-- ============================================================================
-- PROFILES TABLE (extends auth.users)
-- ============================================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  date_of_birth DATE,
  major TEXT,
  year year_status DEFAULT 'Freshman',
  status member_status DEFAULT 'member',
  workplace TEXT,
  attendance_rate INTEGER DEFAULT 0 CHECK (attendance_rate >= 0 AND attendance_rate <= 100),
  avatar_url TEXT,
  bio TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_profiles_major ON public.profiles(major);

-- ============================================================================
-- EVENTS TABLE
-- ============================================================================

CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  image_url TEXT,
  type event_type DEFAULT 'Other',
  rsvp_link TEXT,
  is_published BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster event queries
CREATE INDEX idx_events_date ON public.events(date);
CREATE INDEX idx_events_type ON public.events(type);
CREATE INDEX idx_events_published ON public.events(is_published);

-- ============================================================================
-- RESOURCES TABLE
-- ============================================================================

CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  major_tag TEXT DEFAULT 'All Majors',
  image_url TEXT,
  file_url TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster resource queries
CREATE INDEX idx_resources_major ON public.resources(major_tag);
CREATE INDEX idx_resources_author ON public.resources(author_id);
CREATE INDEX idx_resources_published ON public.resources(is_published);

-- ============================================================================
-- EVENT RSVPS TABLE (optional - for tracking attendance)
-- ============================================================================

CREATE TABLE public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  attended BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_rsvps_event ON public.event_rsvps(event_id);
CREATE INDEX idx_rsvps_user ON public.event_rsvps(user_id);

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Anyone can view profiles (public directory)
-- Note: We select specific columns to avoid exposing sensitive data like email
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- ============================================================================
-- EVENTS POLICIES
-- ============================================================================

-- Anyone can view published events
CREATE POLICY "Published events are viewable by everyone"
  ON public.events
  FOR SELECT
  USING (is_published = true);

-- E-Board members can view all events (including unpublished)
CREATE POLICY "E-Board can view all events"
  ON public.events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.status = 'eboard'
    )
  );

-- Only E-Board can create events
CREATE POLICY "E-Board can create events"
  ON public.events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.status = 'eboard'
    )
  );

-- Only E-Board can update events
CREATE POLICY "E-Board can update events"
  ON public.events
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.status = 'eboard'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.status = 'eboard'
    )
  );

-- Only E-Board can delete events
CREATE POLICY "E-Board can delete events"
  ON public.events
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.status = 'eboard'
    )
  );

-- ============================================================================
-- RESOURCES POLICIES
-- ============================================================================

-- Anyone can view published resources
CREATE POLICY "Published resources are viewable by everyone"
  ON public.resources
  FOR SELECT
  USING (is_published = true);

-- Authenticated users can create resources
CREATE POLICY "Authenticated users can create resources"
  ON public.resources
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own resources
CREATE POLICY "Users can update their own resources"
  ON public.resources
  FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Users can delete their own resources, E-Board can delete any
CREATE POLICY "Users can delete their own resources"
  ON public.resources
  FOR DELETE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.status = 'eboard'
    )
  );

-- ============================================================================
-- EVENT RSVPS POLICIES
-- ============================================================================

-- Users can view their own RSVPs
CREATE POLICY "Users can view their own RSVPs"
  ON public.event_rsvps
  FOR SELECT
  USING (user_id = auth.uid());

-- E-Board can view all RSVPs for events
CREATE POLICY "E-Board can view all RSVPs"
  ON public.event_rsvps
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.status = 'eboard'
    )
  );

-- Authenticated users can RSVP to events
CREATE POLICY "Authenticated users can RSVP"
  ON public.event_rsvps
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own RSVP
CREATE POLICY "Users can update their own RSVP"
  ON public.event_rsvps
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own RSVP
CREATE POLICY "Users can delete their own RSVP"
  ON public.event_rsvps
  FOR DELETE
  USING (user_id = auth.uid());

-- E-Board can update attendance status
CREATE POLICY "E-Board can update attendance"
  ON public.event_rsvps
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.status = 'eboard'
    )
  );

-- ============================================================================
-- HELPER FUNCTION: Auto-create profile on signup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STORAGE BUCKETS (run these in Supabase Dashboard > Storage)
-- ============================================================================
--
-- Create the following buckets:
-- 1. avatars - for user profile pictures
-- 2. event-images - for event cover images
-- 3. resource-images - for resource thumbnails
-- 4. resource-files - for resource file attachments (PDFs, docs, etc.)
--
-- Storage policies should be configured in Supabase Dashboard:
-- - avatars: authenticated users can upload/update their own
-- - event-images: only e-board can upload
-- - resource-images: authenticated users can upload
-- - resource-files: authenticated users can upload
-- ============================================================================
