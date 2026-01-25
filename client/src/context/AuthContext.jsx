/**
 * Auth Context Provider
 * VENSA - Venezuelan Student Association at UF
 *
 * Provides global authentication state and user profile management
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getProfile, signUp as supabaseSignUp, signIn as supabaseSignIn, signOut as supabaseSignOut } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile when user changes
  const fetchProfile = async (userId) => {
    try {
      const profileData = await getProfile(userId);
      setProfile(profileData);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfile(null);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          // Small delay to allow profile trigger to complete on signup
          if (event === 'SIGNED_IN') {
            setTimeout(() => fetchProfile(session.user.id), 500);
          } else {
            await fetchProfile(session.user.id);
          }
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign up a new user
   * @param {Object} params - Signup data
   * @param {string} params.email - User email
   * @param {string} params.password - User password
   * @param {string} params.firstName - First name
   * @param {string} params.lastName - Last name
   * @param {string} params.username - Unique username
   * @param {string} params.major - User's major
   * @param {string} params.year - Academic year
   * @param {string} params.dateOfBirth - Date of birth
   */
  const signUp = async ({ email, password, firstName, lastName, username, major, year, dateOfBirth }) => {
    setLoading(true);
    setError(null);

    try {
      // Sign up with Supabase Auth
      const data = await supabaseSignUp({
        email,
        password,
        metadata: {
          first_name: firstName,
          last_name: lastName,
          username,
        },
      });

      // The trigger will create the basic profile, now update with additional fields
      if (data.user) {
        // Wait a moment for the trigger to complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update profile with additional fields
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            major,
            year,
            date_of_birth: dateOfBirth || null,
          })
          .eq('id', data.user.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
        }

        await fetchProfile(data.user.id);
      }

      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in with email and password
   */
  const signIn = async ({ email, password }) => {
    setLoading(true);
    setError(null);

    try {
      const data = await supabaseSignIn({ email, password });
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    setLoading(true);
    setError(null);

    try {
      await supabaseSignOut();
      setUser(null);
      setProfile(null);
      return { error: null };
    } catch (err) {
      setError(err.message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh the user's profile
   */
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (role) => {
    return profile?.status === role;
  };

  /**
   * Check if user is E-Board member
   */
  const isEBoard = () => hasRole('eboard');

  /**
   * Check if user is logged in
   */
  const isAuthenticated = () => !!user;

  const value = {
    user,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    hasRole,
    isEBoard,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
