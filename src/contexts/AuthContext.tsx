'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { mockUsers } from '@/lib/mock-data/users';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem('vensa_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword as User);
      setIsAuthenticated(true);
      localStorage.setItem('vensa_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    
    return false;
  };

  const register = async (email: string, password: string, fullName: string): Promise<boolean> => {
    // Mock registration
    const existingUser = mockUsers.find(u => u.email === email);
    
    if (existingUser) {
      return false; // User already exists
    }

    const newUser: User = {
      id: String(mockUsers.length + 1),
      email,
      full_name: fullName,
      profile_picture_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}`,
      role: 'member',
      created_at: new Date().toISOString()
    };

    mockUsers.push({ ...newUser, password });
    
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    setIsAuthenticated(true);
    localStorage.setItem('vensa_user', JSON.stringify(userWithoutPassword));
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('vensa_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
