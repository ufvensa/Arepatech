# VENSA Website - Installation & Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git

### Installation Steps

1. **Install Dependencies**
```bash
cd "c:\Users\johnp\Desktop\Arepatech\VENSA"
npm install
```

2. **Install Additional Required Packages**
```bash
npm install tailwindcss-animate
```

3. **Start Development Server**
```bash
npm run dev
```

4. **Open Your Browser**
```
http://localhost:3000
```

## ✅ What's Been Built

### Core Infrastructure ✓
- ✅ Next.js 14 with App Router
- ✅ TypeScript configuration
- ✅ Tailwind CSS styling
- ✅ Responsive layout (Header & Footer)
- ✅ Authentication system (mock)
- ✅ Mock database with realistic data

### Pages Completed ✓
1. **Home Page** - Hero section, mission statement, featured opportunities, upcoming events, CTA
2. **Layout** - Responsive header with navigation, footer with links

### Mock Data Created ✓
- **Users** (5 sample members including eboard and alumni)
- **Events** (6 events: social, professional, cultural, intramural)
- **Opportunities** (8 job/internship listings)
- **Resources** (8 community threads)
- **Gallery** (5 photos with captions)
- **Blog Posts** (3 published articles)
- **Announcements** (3 active announcements)

### Features Implemented ✓
- Authentication context (login/register/logout)
- Responsive navigation with mobile menu
- User profile dropdown
- Type-safe TypeScript interfaces
- Utility functions for formatting
- CSS custom properties and components

## 🔨 Next Steps to Complete

### Remaining Pages to Build

1. **About Page** (`/about`)
   - Mission section
   - Eboard members grid
   - Site creators section

2. **Events Page** (`/events`)
   - Event calendar view
   - Event cards with filters
   - Individual event details
   - RSVP functionality
   - Intramurals section
   - Announcements board

3. **Opportunities Page** (`/opportunities`)
   - Job board with search
   - Filter by type/company
   - Post new opportunity
   - Individual opportunity details

4. **Gallery Page** (`/gallery`)
   - Photo grid with lightbox
   - Event-based filtering
   - Blog posts section

5. **Resources Page** (`/resources`)
   - Reddit-style interface
   - Category filters
   - Upvote/downvote system
   - Thread comments

6. **Contact Page** (`/contact`)
   - Contact form with validation
   - Social media links
   - Email integration

7. **Profile Pages** (`/profile`)
   - Profile dashboard
   - Account settings
   - Member directory
   - Mentorship requests
   - Security settings

8. **Auth Pages** (`/login`, `/register`)
   - Login form
   - Registration form
   - Password reset

### API Routes to Build

Create these in `src/app/api/`:
- `/api/auth/` - Authentication endpoints
- `/api/events/` - Event CRUD operations
- `/api/opportunities/` - Opportunity management
- `/api/resources/` - Community resources
- `/api/gallery/` - Photo/video uploads
- `/api/profile/` - User profile updates

## 📁 Project Structure

```
VENSA/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── layout.tsx         ✅ Root layout
│   │   ├── page.tsx           ✅ Home page
│   │   ├── globals.css        ✅ Global styles
│   │   ├── about/             ⏳ About page
│   │   ├── events/            ⏳ Events pages
│   │   ├── opportunities/     ⏳ Opportunities pages
│   │   ├── gallery/           ⏳ Gallery pages
│   │   ├── resources/         ⏳ Resources pages
│   │   ├── contact/           ⏳ Contact page
│   │   ├── profile/           ⏳ Profile pages
│   │   ├── login/             ⏳ Login page
│   │   ├── register/          ⏳ Register page
│   │   └── api/               ⏳ API routes
│   ├── components/
│   │   └── layout/
│   │       ├── Header.tsx     ✅ Navigation header
│   │       └── Footer.tsx     ✅ Site footer
│   ├── contexts/
│   │   └── AuthContext.tsx    ✅ Auth state management
│   ├── lib/
│   │   ├── mock-data/         ✅ Sample data
│   │   │   ├── users.ts
│   │   │   ├── events.ts
│   │   │   ├── opportunities.ts
│   │   │   ├── resources.ts
│   │   │   └── gallery.ts
│   │   └── utils.ts           ✅ Utility functions
│   └── types/
│       └── index.ts           ✅ TypeScript types
├── public/                     # Static assets
├── package.json               ✅ Dependencies
├── tsconfig.json              ✅ TypeScript config
├── tailwind.config.js         ✅ Tailwind config
├── next.config.js             ✅ Next.js config
└── README.md                  # This file
```

## 🎨 Design System

### Colors
- **Primary**: Blue (Venezuelan flag)
- **Secondary**: Yellow (Venezuelan flag)
- **Accent**: Red (Venezuelan flag)
- **Neutral**: Gray scale

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold, large
- **Body**: Regular, readable

### Components
- **Buttons**: Rounded, hover effects
- **Cards**: Shadow on hover
- **Forms**: Clean, validated inputs

## 🔐 Authentication Flow

### Mock Authentication
Currently using `localStorage` and mock data:
- Register creates new user
- Login checks against mock users
- Logout clears session
- Protected routes check auth state

### Default Test Account
```
Email: maria.rodriguez@ufl.edu
Password: password123
```

## 📱 Responsive Design

- **Mobile**: < 768px (hamburger menu)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🐛 Known Issues (TypeScript Errors)

The TypeScript errors you're seeing are normal because:
1. Dependencies haven't been installed yet (`npm install`)
2. Node modules are missing
3. Next.js types need to be generated

**These will be resolved after running `npm install`**

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import repository to Vercel
3. Deploy automatically

### Manual Build
```bash
npm run build
npm run start
```

## 📖 Development Workflow

1. **Start dev server**: `npm run dev`
2. **Make changes** to files
3. **Browser auto-refreshes** with changes
4. **Build for production**: `npm run build`

## 💡 Tips for Next Steps

### To Continue Building:
1. Start with the About page (simple, static)
2. Then Events page (uses calendar component)
3. Then Opportunities (core feature)
4. Then remaining pages

### Testing Authentication:
- Click "Join Us" or "Login"
- Use test credentials above
- Check profile dropdown appears

### Adding New Pages:
1. Create folder in `src/app/`
2. Add `page.tsx` file
3. Import and use components
4. Navigation auto-updates

## 🎯 Project Goals

✅ **Modularity**: Reusable components  
✅ **Type Safety**: Full TypeScript  
✅ **Responsive**: Mobile-first design  
✅ **User-Friendly**: Clear navigation  
✅ **Professional**: Clean, modern UI  

## 📞 Need Help?

If you encounter issues:
1. Check console for errors
2. Verify all dependencies installed
3. Clear browser cache
4. Restart dev server

---

**¡Viva Venezuela! 🇻🇪**
