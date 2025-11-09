export interface User {
  id: string;
  email: string;
  password?: string;
  full_name: string;
  profile_picture_url: string;
  role: 'admin' | 'eboard' | 'member' | 'alumni';
  club_position?: string;
  graduation_year?: number;
  major?: string;
  bio?: string;
  social_links?: SocialLink[];
  created_at: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  event_type: 'social' | 'professional' | 'cultural' | 'intramural';
  date_time: string;
  end_time?: string;
  location: string;
  max_attendees?: number;
  ticket_price: number;
  requires_rsvp: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_by: string;
  attendees: string[];
  image_url?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  description: string;
  opportunity_type: 'internship' | 'job' | 'co-op';
  application_deadline?: string;
  contact_email?: string;
  application_url?: string;
  salary_range?: string;
  location: string;
  posted_by: string;
  status: 'active' | 'expired' | 'filled';
  created_at: string;
}

export interface Resource {
  id: string;
  title: string;
  content: string;
  resource_type: 'course-advice' | 'immigration' | 'career' | 'student-resource';
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_by: string;
  created_at: string;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  resource_id: string;
  content: string;
  created_by: string;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  media_type: 'photo' | 'video';
  media_url: string;
  thumbnail_url: string;
  caption?: string;
  event_id?: string;
  uploaded_by: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image_url?: string;
  category: 'cultural' | 'professional' | 'student-highlight';
  author_id: string;
  published: boolean;
  published_at?: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  created_by: string;
  created_at: string;
  expires_at?: string;
}

export interface MentorshipRequest {
  id: string;
  mentee_id: string;
  mentor_id: string;
  topic: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  created_at: string;
}

export interface EboardMember {
  id: string;
  user_id: string;
  position: string;
  bio: string;
  display_order: number;
  active: boolean;
}
