import { User } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'maria.rodriguez@ufl.edu',
    password: 'password123',
    full_name: 'Maria Rodriguez',
    profile_picture_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    role: 'eboard',
    club_position: 'President',
    graduation_year: 2025,
    major: 'Business Administration',
    bio: 'Passionate about building community and professional growth.',
    social_links: [
      { platform: 'linkedin', url: 'https://linkedin.com/in/mariarodriguez' },
      { platform: 'instagram', url: 'https://instagram.com/maria_vensa' }
    ],
    created_at: '2023-08-15T00:00:00Z'
  },
  {
    id: '2',
    email: 'carlos.martinez@ufl.edu',
    password: 'password123',
    full_name: 'Carlos Martinez',
    profile_picture_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'eboard',
    club_position: 'Vice President',
    graduation_year: 2025,
    major: 'Computer Science',
    bio: 'Building tech solutions for our Venezuelan community.',
    social_links: [
      { platform: 'linkedin', url: 'https://linkedin.com/in/carlosmartinez' },
      { platform: 'github', url: 'https://github.com/carlosm' }
    ],
    created_at: '2023-08-15T00:00:00Z'
  },
  {
    id: '3',
    email: 'sofia.hernandez@ufl.edu',
    password: 'password123',
    full_name: 'Sofia Hernandez',
    profile_picture_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    role: 'member',
    club_position: 'Member',
    graduation_year: 2026,
    major: 'Engineering',
    bio: 'Love connecting with fellow Venezuelans and learning new things!',
    created_at: '2024-01-10T00:00:00Z'
  },
  {
    id: '4',
    email: 'andres.garcia@ufl.edu',
    password: 'password123',
    full_name: 'Andres Garcia',
    profile_picture_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    role: 'alumni',
    club_position: 'Alumni Member',
    graduation_year: 2023,
    major: 'Finance',
    bio: 'Working at Goldman Sachs. Always happy to help current students!',
    social_links: [
      { platform: 'linkedin', url: 'https://linkedin.com/in/andresgarcia' }
    ],
    created_at: '2021-08-20T00:00:00Z'
  },
  {
    id: '5',
    email: 'isabella.torres@ufl.edu',
    password: 'password123',
    full_name: 'Isabella Torres',
    profile_picture_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    role: 'eboard',
    club_position: 'Treasurer',
    graduation_year: 2025,
    major: 'Accounting',
    bio: 'Managing our finances and planning amazing events!',
    created_at: '2023-08-15T00:00:00Z'
  }
];
