/**
 * Auth Context Provider
 * VENSA - Venezuelan Student Association at UF
 *
 * Provides global authentication state and user profile management
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getProfile, signUp as supabaseSignUp, signIn as supabaseSignIn, signOut as supabaseSignOut, isAllowedEmail, isEmailBanned, uploadAvatar } from '../lib/supabase';
import { savePendingAvatar, getPendingAvatar, clearPendingAvatar } from '../lib/pendingAvatar';

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
      // Check for a pending avatar saved during signup (before email confirmation)
      try {
        const pending = await getPendingAvatar();
        if (pending && pending.userId === userId) {
          console.log('Found pending avatar in IndexedDB, uploading...');
          await uploadAvatar(userId, pending.file);
          await clearPendingAvatar();
          console.log('Pending avatar uploaded successfully');
        }
      } catch (avatarErr) {
        console.error('Failed to upload pending avatar:', avatarErr);
      }

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
        if (!fallbackData) setError("Could not load profile data");
      } catch (fallbackError) {
        console.error('Fallback fetch failed:', fallbackError);
        setProfile(null);
        setError(`Profile load failed: ${err.message}`);
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
          // Run ban check in the background — don't block profile loading
          isEmailBanned(session.user.email).then(isBanned => {
            if (isBanned) {
              console.warn('User email is banned. Signing out.');
              supabase.auth.signOut();
              setUser(null);
              setProfile(null);
              setError("Your account has been suspended.");
            }
          }).catch(err => {
            console.error('Ban check failed (allowing access):', err);
          });

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
  const signUp = async ({ email, password, firstName, lastName, major, year, dateOfBirth, profilePicture }) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Check if email is restricted/banned BEFORE calling Supabase
      try {
        const isBanned = await isEmailBanned(email);
        if (isBanned) {
          throw new Error("This email is currently suspended and cannot register.");
        }
      } catch (banCheckErr) {
        // If the specific ban error was thrown above, rethrow it
        if (banCheckErr.message.includes("suspended")) throw banCheckErr;
        console.error("Ban check failed during signup:", banCheckErr);
      }

      // 2. Sign up with Supabase Auth — pass ALL fields in metadata
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

        // Upload profile picture if provided
        if (profilePicture) {
          if (data.session) {
            // We have a session — upload immediately
            try {
              await uploadAvatar(data.user.id, profilePicture);
            } catch (uploadError) {
              console.error('Failed to upload profile picture during signup:', uploadError);
              // Store in IndexedDB for retry on next sign-in
              await savePendingAvatar(profilePicture, data.user.id);
            }
          } else {
            // No session yet (email confirmation required)
            // Persist the file in IndexedDB so it survives page reloads
            await savePendingAvatar(profilePicture, data.user.id);
          }
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
      // 1. Authenticate
      // Note: supabaseSignIn returns the data object directly ({ user, session })
      const authData = await supabaseSignIn({ email, password });

      // 2. Check Ban Status Immediately
      if (authData.user) {
        try {
          const isBanned = await isEmailBanned(email);
          if (isBanned) {
            console.warn('User is banned. Aborting login.');
            await supabaseSignOut();
            return {
              data: null,
              error: { message: "Your account has been suspended." }
            };
          }
        } catch (banError) {
          console.error('Ban check error:', banError);
        }
      }

      return { data: authData, error: null };
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
    setError(null);

    try {
      await supabaseSignOut();
      setUser(null);
      setProfile(null);
      return { error: null };
    } catch (err) {
      setError(err.message);
      return { error: err };
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
   * Check if user is an admin (e-board member based on name matching)
   */
  const isAdmin = () => {
    if (!profile) return false;
    // Check DB flag immediately
    if (profile.is_admin === true) return true;

    // Fallback: name check (useful for dev/testing)
    const fullName = `${profile.first_name} ${profile.last_name}`.toLowerCase().trim();
    const eboardNames = [
      'jose peaguda',
      'victoria consalvo',
      'alejandro arvelo',
      'ana calleja',
      'chipi rincon',
      'allison bonnemaison',
      'carmelo urdaneta',
      'john riley',
      'camila almandoz',
      'valeria maggiolo',
      'victoria medina',
      'estefi rodriguez'
    ];

    return eboardNames.includes(fullName);
  };

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
    isAdmin,
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
