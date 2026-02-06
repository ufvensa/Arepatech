/**
 * Auth Context Provider
 * VENSA - Venezuelan Student Association at UF
 *
 * Provides global authentication state and user profile management
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getProfile, signUp as supabaseSignUp, signIn as supabaseSignIn, signOut as supabaseSignOut, isAllowedEmail } from '../lib/supabase';

// Re-export email validation for use in components
export { isAllowedEmail } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile when user changes
  const fetchProfile = async (userId, userEmail = null) => {
    try {
      const profileData = await getProfile(userId);

      // If profile doesn't exist, try to create it (fallback for missing trigger)
      if (!profileData) {
        console.log('Profile not found, attempting to create...');
        
        // Try upsert instead of insert to handle edge cases
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email: userEmail || '',
            first_name: '',
            last_name: '',
          }, { onConflict: 'id' })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
          // Try one more fetch in case the profile was created by a trigger in the meantime
          const retryData = await getProfile(userId);
          setProfile(retryData || null);
        } else {
          setProfile(newProfile);
        }
      } else {
        setProfile(profileData);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Last resort: try a simple fetch in case the error was during insert
      try {
        const fallbackData = await getProfile(userId);
        setProfile(fallbackData || null);
      } catch {
        setProfile(null);
      }
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
          await fetchProfile(session.user.id, session.user.email);
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
            setTimeout(() => fetchProfile(session.user.id, session.user.email), 500);
          } else {
            await fetchProfile(session.user.id, session.user.email);
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
   * @param {string} params.major - User's major
   * @param {string} params.year - Academic year
   * @param {string} params.dateOfBirth - Date of birth
   */
  const signUp = async ({ email, password, firstName, lastName, major, year, dateOfBirth }) => {
    setLoading(true);
    setError(null);

    try {
      // Sign up with Supabase Auth — pass ALL fields in metadata
      // so the DB trigger can save them immediately on user creation
      const data = await supabaseSignUp({
        email,
        password,
        metadata: {
          first_name: firstName,
          last_name: lastName,
          major: major || null,
          year: year || null,
          date_of_birth: dateOfBirth || null,
        },
      });

      // Create or update the profile with ALL fields
      if (data.user) {
        // Wait a moment for any trigger to complete first
        await new Promise(resolve => setTimeout(resolve, 500));

        // Upsert profile with all signup data
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: email,
            first_name: firstName,
            last_name: lastName,
            major: major || null,
            year: year || null,
            date_of_birth: dateOfBirth || null,
          }, {
            onConflict: 'id'
          });

        if (upsertError) {
          console.error('Error creating/updating profile:', upsertError);
        }

        await fetchProfile(data.user.id, email);
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
