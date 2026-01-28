# VENSA - Venezuelan Student Association at UF

**Creating a home away from home while fostering professional development and cultural connection.**

## Mission

VENSA (Venezuelan Student Association at the University of Florida) is dedicated to creating a supportive community where Venezuelan students can connect, grow, and thrive together. We understand the challenges of being away from home, and we're here to provide a space where members feel supported, culturally connected, and professionally empowered.

Our core pillars:
- **Community**: Building lasting connections among Venezuelan students
- **Professional Development**: Creating pathways to career success through mentorship, networking, and opportunities
- **Cultural Preservation**: Celebrating Venezuelan heritage and traditions
- **Support Network**: Providing resources for academic, immigration, and personal needs

---

## Product Vision

VENSA's website serves as the **digital hub** for our community, with a strong emphasis on **professional development and career growth**. This platform goes beyond event management—it's designed to connect members with opportunities, mentors, alumni, and resources that will shape their professional journeys.

### Key Focus Areas

#### 1. **Professional Development First**
- **Opportunity Backboard**: Centralized platform for internships, co-ops, and job postings
- **Mentorship Network**: Connect students with experienced members and alumni for career guidance
- **Referral System**: Members can refer each other for opportunities with direct email integration
- **Alumni Engagement**: Tap into the professional network of VENSA alumni for advice and connections
- **Resource Library**: Curated advice on courses, career paths, and professional growth

#### 2. **Community Building**
- **Events & Activities**: Organize cultural events, social gatherings, and professional workshops
- **Intramural Sports**: Foster team spirit and friendly competition
- **Member Directory**: Find and connect with fellow Venezuelans on campus
- **Cultural Content**: Blog posts celebrating Venezuelan culture and student achievements

#### 3. **Support & Resources**
- **Immigration Resources**: Essential information for international students
- **Academic Guidance**: Course recommendations and academic support
- **Student Resources**: General university and life resources

---

## Project Architecture

### Technology Stack

#### **Frontend**
- **Framework**: Next.js 14+ (React with App Router)
  - Server-side rendering for optimal SEO and performance
  - Built-in API routes for seamless backend integration
  - Image optimization for fast loading times
- **Styling**: Tailwind CSS + shadcn/ui
  - Modern, responsive design system
  - Consistent UI components across the platform
- **State Management**: React Context API + Zustand
- **Form Handling**: React Hook Form + Zod validation
- **Calendar**: FullCalendar for event management
- **Image Gallery**: React-photo-gallery with PhotoSwipe

#### **Backend**
- **Runtime**: Next.js API Routes + Supabase
  - Serverless API endpoints within Next.js
  - Supabase for authentication, database, and real-time features
  - Built-in storage for photos, videos, and documents
- **Authentication**: Supabase Auth
  - Email/password authentication
  - Social login options (Google, Instagram)
  - Role-based access control (Admin, Eboard, Member, Alumni)

#### **Database**
- **PostgreSQL** (via Supabase)
  - Relational database for complex relationships
  - Real-time subscriptions for live updates
- **Storage**: Supabase Storage
  - Secure file storage for profile pictures, event photos, and documents

#### **Integrations**
- **Payment**: Stripe for event ticketing
- **Email**: Resend or SendGrid for notifications and contact forms
- **Calendar**: Google Calendar API for birthday integration
- **Social Media**: Instagram API for gallery integration

---

## Database Schema

### Core Tables

#### **Users & Authentication**
```sql
users
├── id (UUID, primary key)
├── email (unique, required)
├── password_hash
├── full_name
├── profile_picture_url
├── role (admin, eboard, member, alumni)
├── club_position
├── birthday
├── language_preference (en, es)
├── email_notifications (boolean)
├── graduation_year
├── major
├── created_at
└── updated_at

user_social_links
├── id (UUID, primary key)
├── user_id (foreign key → users)
├── platform (instagram, linkedin, github, etc.)
└── url
```

#### **Professional Development**
```sql
opportunities
├── id (UUID, primary key)
├── title
├── company
├── description
├── opportunity_type (internship, job, co-op)
├── application_deadline
├── contact_email
├── application_url
├── salary_range
├── location (remote, hybrid, on-site)
├── posted_by (foreign key → users)
├── status (active, expired, filled)
└── created_at

mentorship_requests
├── id (UUID, primary key)
├── mentee_id (foreign key → users)
├── mentor_id (foreign key → users)
├── topic
├── message
├── status (pending, accepted, declined, completed)
└── created_at

referrals
├── id (UUID, primary key)
├── referrer_id (foreign key → users)
├── referee_id (foreign key → users)
├── opportunity_id (foreign key → opportunities)
├── status (submitted, interview, hired, rejected)
└── created_at

alumni_activities
├── id (UUID, primary key)
├── user_id (foreign key → users)
├── activity_type (mentorship, donation, event-attendance, job-referral)
├── description
└── created_at
```

#### **Events & Community**
```sql
events
├── id (UUID, primary key)
├── title
├── description
├── event_type (social, professional, cultural, intramural)
├── date_time
├── end_time
├── location
├── max_attendees
├── ticket_price
├── requires_rsvp
├── created_by (foreign key → users)
├── status (upcoming, ongoing, completed, cancelled)
└── created_at

event_attendance
├── id (UUID, primary key)
├── event_id (foreign key → events)
├── user_id (foreign key → users)
├── rsvp_status (confirmed, pending, declined)
├── attended (boolean)
├── ticket_purchased (boolean)
└── payment_id

announcements
├── id (UUID, primary key)
├── title
├── content
├── priority (urgent, high, normal, low)
├── target_audience (all, members, eboard)
├── created_by (foreign key → users)
└── expires_at

intramural_teams
├── id (UUID, primary key)
├── sport
├── team_name
├── season
├── max_players
└── registration_deadline

intramural_team_members
├── team_id (foreign key → intramural_teams)
├── user_id (foreign key → users)
└── position
```

#### **Content & Media**
```sql
gallery_items
├── id (UUID, primary key)
├── event_id (foreign key → events)
├── media_type (photo, video)
├── media_url
├── thumbnail_url
├── caption
├── uploaded_by (foreign key → users)
└── created_at

blog_posts
├── id (UUID, primary key)
├── title
├── slug (unique)
├── content
├── excerpt
├── featured_image_url
├── category (cultural, professional, student-highlight)
├── author_id (foreign key → users)
├── published (boolean)
└── published_at

resources
├── id (UUID, primary key)
├── title
├── description
├── resource_type (course-advice, immigration, career, student-resource)
├── url
├── file_url
└── created_by (foreign key → users)
```

---

## Project Structure

```
vensa-website/
├── src/
│   ├── app/                                    # Next.js App Router
│   │   ├── (auth)/                             # Authentication routes
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   │
│   │   ├── (main)/                             # Main application routes
│   │   │   ├── page.tsx                        # Homepage
│   │   │   │
│   │   │   ├── about/                          # About Us section
│   │   │   │   ├── page.tsx                    # Main about page
│   │   │   │   ├── mission/page.tsx            # Mission & values
│   │   │   │   ├── eboard/page.tsx             # Leadership board
│   │   │   │   ├── chapter/page.tsx            # Current chapter info
│   │   │   │   └── creators/page.tsx           # Site creators
│   │   │   │
│   │   │   ├── events/                         # Events hub
│   │   │   │   ├── page.tsx                    # Events calendar
│   │   │   │   ├── [id]/page.tsx               # Individual event page
│   │   │   │   ├── past/page.tsx               # Past events archive
│   │   │   │   ├── intramurals/                # Intramural sports
│   │   │   │   │   ├── page.tsx                # Intramurals dashboard
│   │   │   │   │   └── [teamId]/page.tsx       # Team details
│   │   │   │   └── announcements/page.tsx      # Announcements
│   │   │   │
│   │   │   ├── opportunities/                  # Professional development hub
│   │   │   │   ├── page.tsx                    # Opportunity backboard
│   │   │   │   ├── [id]/page.tsx               # Opportunity details
│   │   │   │   └── post/page.tsx               # Post new opportunity
│   │   │   │
│   │   │   ├── gallery/                        # Media gallery
│   │   │   │   ├── page.tsx                    # Photo grid
│   │   │   │   ├── [eventId]/page.tsx          # Event-specific gallery
│   │   │   │   └── blog/                       # Blog/News
│   │   │   │       ├── page.tsx                # Blog list
│   │   │   │       └── [slug]/page.tsx         # Individual post
│   │   │   │
│   │   │   ├── contact/                        # Contact section
│   │   │   │   └── page.tsx                    # Contact form
│   │   │   │
│   │   │   ├── profile/                        # User profile hub
│   │   │   │   ├── page.tsx                    # Profile overview
│   │   │   │   ├── account/page.tsx            # Account settings
│   │   │   │   ├── security/page.tsx           # Security settings
│   │   │   │   ├── directory/page.tsx          # Member directory
│   │   │   │   ├── mentorship/page.tsx         # Mentorship requests
│   │   │   │   ├── alumni/page.tsx             # Alumni network
│   │   │   │   └── referrals/page.tsx          # Job referrals
│   │   │   │
│   │   │   └── resources/                      # Resources center
│   │   │       ├── page.tsx                    # All resources
│   │   │       ├── courses/page.tsx            # Course advice
│   │   │       ├── immigration/page.tsx        # Immigration resources
│   │   │       └── career/page.tsx             # Career resources
│   │   │
│   │   ├── api/                                # API Routes
│   │   │   ├── auth/                           # Authentication endpoints
│   │   │   ├── events/                         # Event management
│   │   │   ├── users/                          # User operations
│   │   │   ├── opportunities/                  # Opportunity CRUD
│   │   │   ├── mentorship/                     # Mentorship system
│   │   │   ├── gallery/                        # Media uploads
│   │   │   ├── contact/                        # Contact form handler
│   │   │   ├── payments/                       # Stripe integration
│   │   │   └── webhooks/                       # External webhooks
│   │   │
│   │   ├── layout.tsx                          # Root layout
│   │   └── globals.css                         # Global styles
│   │
│   ├── components/                             # Reusable components
│   │   ├── ui/                                 # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── form.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/                             # Layout components
│   │   │   ├── Header.tsx                      # Navigation header
│   │   │   ├── Footer.tsx                      # Site footer
│   │   │   └── Sidebar.tsx                     # Dashboard sidebar
│   │   │
│   │   ├── home/                               # Homepage components
│   │   │   ├── HeroSection.tsx
│   │   │   ├── MissionStatement.tsx
│   │   │   ├── QuickLinks.tsx
│   │   │   └── FeaturedEvents.tsx
│   │   │
│   │   ├── events/                             # Event components
│   │   │   ├── EventCard.tsx
│   │   │   ├── EventCalendar.tsx
│   │   │   ├── RSVPForm.tsx
│   │   │   ├── TicketPurchase.tsx
│   │   │   └── AttendanceTracker.tsx
│   │   │
│   │   ├── opportunities/                      # Professional dev components
│   │   │   ├── OpportunityCard.tsx
│   │   │   ├── OpportunityFilters.tsx
│   │   │   ├── PostOpportunityForm.tsx
│   │   │   └── ReferralButton.tsx
│   │   │
│   │   ├── profile/                            # Profile components
│   │   │   ├── ProfileCard.tsx
│   │   │   ├── SocialLinks.tsx
│   │   │   ├── DirectoryList.tsx
│   │   │   ├── MentorshipCard.tsx
│   │   │   └── AlumniConnect.tsx
│   │   │
│   │   ├── gallery/                            # Media components
│   │   │   ├── PhotoGrid.tsx
│   │   │   ├── VideoEmbed.tsx
│   │   │   ├── InstagramFeed.tsx
│   │   │   └── MediaUploader.tsx
│   │   │
│   │   └── shared/                             # Shared components
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── SearchBar.tsx
│   │       └── Pagination.tsx
│   │
│   ├── lib/                                    # Utilities & configurations
│   │   ├── supabase/
│   │   │   ├── client.ts                       # Client-side Supabase
│   │   │   ├── server.ts                       # Server-side Supabase
│   │   │   └── middleware.ts                   # Auth middleware
│   │   ├── stripe.ts                           # Stripe configuration
│   │   ├── email.ts                            # Email service
│   │   ├── utils.ts                            # Utility functions
│   │   └── constants.ts                        # App constants
│   │
│   ├── hooks/                                  # Custom React hooks
│   │   ├── useAuth.ts                          # Authentication hook
│   │   ├── useEvents.ts                        # Events data hook
│   │   ├── useProfile.ts                       # Profile management
│   │   ├── useOpportunities.ts                 # Opportunities hook
│   │   └── useMentorship.ts                    # Mentorship hook
│   │
│   ├── types/                                  # TypeScript type definitions
│   │   ├── database.ts                         # Database types
│   │   ├── events.ts                           # Event types
│   │   ├── user.ts                             # User types
│   │   ├── opportunities.ts                    # Opportunity types
│   │   └── index.ts                            # Exported types
│   │
│   └── middleware.ts                           # Next.js middleware (auth guards)
│
├── public/                                     # Static assets
│   ├── images/
│   │   ├── logo.png
│   │   ├── hero/
│   │   └── placeholders/
│   ├── icons/
│   └── favicon.ico
│
├── supabase/                                   # Supabase configurations
│   ├── migrations/                             # Database migrations
│   └── seed.sql                                # Seed data
│
├── .env.local                                  # Environment variables (gitignored)
├── .env.example                                # Example environment variables
├── next.config.js                              # Next.js configuration
├── tailwind.config.js                          # Tailwind CSS configuration
├── tsconfig.json                               # TypeScript configuration
├── package.json                                # Dependencies
├── .gitignore
└── README.md                                   # This file
```

---

## MVP (Minimum Viable Product) - Phase 1

**Timeline**: 4-6 weeks  
**Goal**: Launch a functional platform for community connection and basic professional development features

### Core Features

#### **Week 1-2: Foundation & Authentication**
- ✅ Project setup (Next.js + Supabase + Tailwind)
- ✅ User registration & login
- ✅ Basic profile creation
- ✅ Responsive layout (header, footer)

#### **Week 2-3: Community Features**
- ✅ Homepage with mission statement
- ✅ About Us page (mission, eboard, creators)
- ✅ Events page (list view)
- ✅ Contact form with email integration

#### **Week 3-4: Professional Development Core**
- ✅ Opportunity backboard (view listings)
- ✅ Post new opportunities
- ✅ Basic member directory
- ✅ Profile page with social links

#### **Week 4-5: Testing & Polish**
- ✅ Mobile responsiveness
- ✅ SEO optimization
- ✅ Bug fixes
- ✅ Deploy to production

### MVP Success Metrics
- Users can register, login, and create profiles
- Members can view and post opportunities
- Events are visible and RSVPs work (via Google Forms initially)
- Contact form delivers messages
- Site is mobile-responsive
- Page load time < 2 seconds

---

## Post-MVP Phases

### **Phase 2: Enhanced Professional Development** (Weeks 6-10)
- Mentorship request system
- Referral tracking
- Alumni directory with engagement features
- Advanced opportunity filters and search
- Email notifications for new opportunities
- Resource library with course advice and immigration resources

### **Phase 3: Advanced Community Features** (Weeks 11-15)
- Full event calendar with internal RSVP
- Ticket purchasing system (Stripe)
- Attendance tracking
- Gallery with photo uploads
- Instagram integration
- Intramural team management
- Blog/news section

### **Phase 4: Analytics & Engagement** (Weeks 16+)
- Admin dashboard with analytics
- Member engagement tracking
- Automated email campaigns
- Advanced search across all content
- Mobile app (React Native)
- AI-powered opportunity matching

---

## Key Differentiators

### **Professional Development Focus**
Unlike typical student organization websites, VENSA prioritizes **career growth**:
- Centralized opportunity platform reduces job search friction
- Mentorship matching connects students with experienced guidance
- Alumni network creates long-term professional relationships
- Referral system leverages community connections

### **Community-Centric Design**
Every feature is designed to strengthen connections:
- Member directory fosters networking
- Events bring people together in person
- Cultural content celebrates shared heritage
- Support resources address unique challenges of Venezuelan students

### **Data-Driven Engagement**
Track what matters for professional growth:
- Opportunity application success rates
- Mentorship satisfaction scores
- Event attendance trends
- Alumni engagement metrics

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email
RESEND_API_KEY=your_resend_api_key
CONTACT_EMAIL=vensa@example.com

# Stripe (Phase 2)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Google Calendar (Phase 2)
GOOGLE_CALENDAR_API_KEY=your_api_key

# Instagram (Phase 3)
INSTAGRAM_ACCESS_TOKEN=your_access_token
```

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- Supabase account (free tier)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/vensa-website.git
cd vensa-website
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. **Run database migrations**
```bash
# Instructions will be added once migrations are created
```

5. **Start development server**
```bash
npm run dev
```

6. **Open browser**
```
http://localhost:3000
```

---

## Contributing

We welcome contributions from VENSA members! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Write clean, readable code
- Follow existing code style
- Test your changes thoroughly
- Update documentation as needed

---

## Deployment

### Production Deployment (Vercel)
```bash
# Connect GitHub repository to Vercel
# Vercel will automatically deploy on push to main branch
```

### Manual Deployment
```bash
npm run build
npm run start
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Contributors

### Site Creators
*To be added: Photos and bios of team members who built this platform*

### Eboard 2024-2025
*To be added: Current leadership team*

---

## Contact

**Venezuelan Student Association at UF**
- Email: vensa@example.com
- Instagram: [@vensa.uf](https://instagram.com/vensa.uf)
- Website: [vensauf.org](https://vensauf.org)

---

## Acknowledgments

Built with ❤️ by Venezuelan students, for Venezuelan students.

Special thanks to:
- VENSA Eboard for vision and guidance
- All contributors who made this possible
- The Venezuelan community at UF

**¡Viva Venezuela! 🇻🇪**
