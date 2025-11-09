import { GalleryItem, BlogPost, Announcement } from '@/types';

export const mockGalleryItems: GalleryItem[] = [
  {
    id: '1',
    media_type: 'photo',
    media_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
    thumbnail_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300',
    caption: 'Welcome Back Social - Fall 2024',
    event_id: '1',
    uploaded_by: '1',
    created_at: '2024-08-28T00:00:00Z'
  },
  {
    id: '2',
    media_type: 'photo',
    media_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3be?w=800',
    thumbnail_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3be?w=300',
    caption: 'Celebrating Venezuelan independence day!',
    uploaded_by: '2',
    created_at: '2024-07-05T00:00:00Z'
  },
  {
    id: '3',
    media_type: 'photo',
    media_url: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800',
    thumbnail_url: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=300',
    caption: 'Arepa making workshop',
    event_id: '3',
    uploaded_by: '3',
    created_at: '2024-09-01T00:00:00Z'
  },
  {
    id: '4',
    media_type: 'photo',
    media_url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800',
    thumbnail_url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=300',
    caption: 'Career fair networking',
    event_id: '5',
    uploaded_by: '1',
    created_at: '2024-09-10T00:00:00Z'
  },
  {
    id: '5',
    media_type: 'photo',
    media_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
    thumbnail_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300',
    caption: 'Intramural soccer team',
    event_id: '4',
    uploaded_by: '2',
    created_at: '2024-09-12T00:00:00Z'
  }
];

export const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Celebrating Venezuelan Independence Day at UF',
    slug: 'celebrating-venezuelan-independence-day-at-uf',
    content: 'This year\'s Venezuelan Independence Day celebration was one for the books! Over 60 students gathered to celebrate our heritage with traditional music, food, and dance. The event featured live performances of joropo and salsa, while attendees enjoyed arepas, tequeños, and quesillo. It was incredible to see so many Venezuelans and friends of Venezuela come together to celebrate our culture...',
    excerpt: 'Over 60 students celebrated Venezuelan Independence Day with traditional music, food, and dance.',
    featured_image_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3be?w=800',
    category: 'cultural',
    author_id: '1',
    published: true,
    published_at: '2024-07-10T00:00:00Z',
    created_at: '2024-07-09T00:00:00Z'
  },
  {
    id: '2',
    title: 'Student Spotlight: Maria Rodriguez - From VENSA to Silicon Valley',
    slug: 'student-spotlight-maria-rodriguez',
    content: 'Meet Maria Rodriguez, our club president who recently accepted a full-time offer at Google. We sat down with Maria to learn about her journey from Venezuela to UF to one of the world\'s top tech companies. "VENSA gave me more than just a community," Maria shares. "It gave me a network of mentors, friends, and opportunities that shaped my career path."...',
    excerpt: 'An interview with our club president about her journey to landing a job at Google.',
    featured_image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
    category: 'student-highlight',
    author_id: '2',
    published: true,
    published_at: '2024-09-01T00:00:00Z',
    created_at: '2024-08-30T00:00:00Z'
  },
  {
    id: '3',
    title: 'Navigating Career Fairs: Tips from VENSA Alumni',
    slug: 'navigating-career-fairs-tips',
    content: 'Career fair season is here! We asked VENSA alumni who\'ve successfully landed internships at top companies to share their best advice. Here are the top 10 tips: 1) Research companies beforehand, 2) Prepare your elevator pitch, 3) Dress professionally, 4) Bring multiple copies of your resume...',
    excerpt: 'Top 10 tips from VENSA alumni on making the most of career fairs.',
    featured_image_url: 'https://images.unsplash.com/photo-1560439514-4e9645039924?w=800',
    category: 'professional',
    author_id: '4',
    published: true,
    published_at: '2024-09-15T00:00:00Z',
    created_at: '2024-09-14T00:00:00Z'
  }
];

export const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Fall Semester Kickoff Meeting - This Friday!',
    content: 'Join us this Friday, Sept 15th at 6 PM in Reitz Union Room 235 for our fall semester kickoff! We\'ll be discussing upcoming events, introducing the eboard, and enjoying Venezuelan snacks. Don\'t miss it!',
    priority: 'high',
    created_by: '1',
    created_at: '2024-09-10T00:00:00Z',
    expires_at: '2024-09-15T00:00:00Z'
  },
  {
    id: '2',
    title: 'Soccer Team Sign-ups Open!',
    content: 'Our intramural soccer team registration is now open! We compete against other student orgs throughout the semester. All skill levels welcome. Sign up by Sept 20th.',
    priority: 'normal',
    created_by: '2',
    created_at: '2024-09-08T00:00:00Z',
    expires_at: '2024-09-20T00:00:00Z'
  },
  {
    id: '3',
    title: 'Career Fair Next Week - Prepare Your Resume!',
    content: 'The UF Career Showcase is next week! Make sure your resume is updated and ready. VENSA is hosting a resume review session this Thursday at 5 PM. Bring your laptop!',
    priority: 'urgent',
    created_by: '1',
    created_at: '2024-09-12T00:00:00Z',
    expires_at: '2024-09-25T00:00:00Z'
  }
];
