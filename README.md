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

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Calendar
GOOGLE_CALENDAR_API_KEY=your_api_key

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

## Acknowledgments

Built with ❤️ by Venezuelan students, for Venezuelan students.

**¡Viva Venezuela! 🇻🇪**
