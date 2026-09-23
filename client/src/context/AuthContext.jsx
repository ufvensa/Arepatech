/**
 * Auth Context Provider
 * VENSA - Venezuelan Student Association at UF
 *
 * Provides global authentication state and user profile management
 */

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase, getProfile, signUp as supabaseSignUp, signIn as supabaseSignIn, signOut as supabaseSignOut, isEmailBanned, uploadAvatar } from '../lib/supabase';
import { savePendingAvatar, getPendingAvatar, clearPendingAvatar } from '../lib/pendingAvatar';
import { subscribeToSession } from '../lib/authSubscription';

// Re-export email validation for use in components
export { isAllowedEmail } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Flag to prevent onAuthStateChange from overwriting profile during signup
  const signupInProgressRef = useRef(false);
  const activeUserRef = useRef(null);
  const profileRequestRef = useRef(0);
  const loadedProfileRef = useRef(null);

  // Fetch user profile when user changes
  const fetchProfile = async (userId, userEmail = null) => {
    if (activeUserRef.current !== userId) return;
    const request = ++profileRequestRef.current;
    const isCurrent = () => activeUserRef.current === userId && profileRequestRef.current === request;
    const commitProfile = (data) => {
      if (!isCurrent()) return;
      loadedProfileRef.current = data?.id ?? null;
      setProfile(data);
    };
    const commitError = (message) => { if (isCurrent()) setError(message); };
    const timeout = setTimeout(() => {
      if (!isCurrent()) return;
      ++profileRequestRef.current;
      console.warn('[auth] profile load timed out');
      setError('Your session is saved, but your profile could not load. Please try again.');
      setLoading(false);
    }, 15000);
    commitError(null);
    try {
      // Check for a pending avatar saved during signup (before email confirmation)
      try {
        const pending = await getPendingAvatar();
        if (!isCurrent()) return;
        if (pending && pending.userId === userId) {
          try {
            await uploadAvatar(userId, pending.file);
            await clearPendingAvatar();
          } catch (uploadErr) {
            console.error('Failed to upload pending avatar (will retry on next load):', uploadErr);
          }
        }
      } catch (avatarErr) {
        console.error('Error checking pending avatar:', avatarErr);
      }

      // Check auth metadata for linkedin_url that may not have been saved
      // during signup (due to RLS blocking upsert without session)
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!isCurrent()) return;
        if (currentUser?.user_metadata?.linkedin_url) {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('linkedin_url')
            .eq('id', userId)
            .single();

          if (existingProfile && !existingProfile.linkedin_url) {
            await supabase
              .from('profiles')
              .update({ linkedin_url: currentUser.user_metadata.linkedin_url })
              .eq('id', userId);
          }
        }
      } catch (metaErr) {
        console.error('Error syncing linkedin_url from metadata:', metaErr);
      }

      const profileData = await getProfile(userId);
      if (!isCurrent()) return;

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
          commitProfile(retryData || null);
        } else {
          commitProfile(newProfile);
        }
      } else {
        commitProfile(profileData);
      }
    } catch (err) {
      if (!isCurrent()) return;
      console.error('Error fetching profile:', err);
      // Last resort: try a simple fetch in case the error was during insert
      try {
        const fallbackData = await getProfile(userId);
        commitProfile(fallbackData || null);
        if (!fallbackData) commitError("Could not load profile data");
      } catch (fallbackError) {
        console.error('Fallback fetch failed:', fallbackError);
        commitProfile(null);
        commitError('Could not load your profile. Please try again.');
      }
    } finally {
      clearTimeout(timeout);
      if (isCurrent()) setLoading(false);
    }
  };

  // Initialize auth state
  useEffect(() => {
    let disposed = false;
    const startupTimeout = setTimeout(() => {
      if (disposed) return;
      console.warn('[auth] session initialization timed out');
      setError('Session restoration is taking longer than expected. Check your connection and try again.');
      setLoading(false);
    }, 15000);
    // INITIAL_SESSION restores persisted sessions; do not race it with a
    // second getSession/profile load. All database work runs outside the lock.
    const unsubscribe = subscribeToSession(supabase.auth,
      (_event, session) => {
        clearTimeout(startupTimeout);
        const nextId = session?.user?.id ?? null;
        if (activeUserRef.current !== nextId) {
          ++profileRequestRef.current;
          loadedProfileRef.current = null;
          setProfile(null);
          setError(null);
        }
        activeUserRef.current = nextId;
        setUser(session?.user ?? null);
        if (!nextId) setLoading(false);
        else if (!loadedProfileRef.current) setLoading(true);
      },
      async (event, session) => {
        if (disposed || !session?.user || activeUserRef.current !== session.user.id) return;
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          // Run ban check in the background — don't block profile loading
          isEmailBanned(session.user.email).then(isBanned => {
            if (isBanned && !disposed && activeUserRef.current === session.user.id) {
              console.warn('User email is banned. Signing out.');
              void supabase.auth.signOut();
              activeUserRef.current = null;
              ++profileRequestRef.current;
              setUser(null);
              setProfile(null);
              setLoading(false);
              setError("Your account has been suspended.");
            }
          }).catch(err => {
            console.error('Ban check failed (allowing access):', err);
          });

        }
        if (signupInProgressRef.current) return;
        // Refresh tokens/tab focus must not blank an already loaded profile.
        if (loadedProfileRef.current === session.user.id && event !== 'USER_UPDATED') return;
        await fetchProfile(session.user.id, session.user.email);
      },
      () => {
        if (disposed) return;
        console.warn('[auth] session recovery failed');
        setError('Unable to restore your account. Please try again.');
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => {
      disposed = true;
      clearTimeout(startupTimeout);
      activeUserRef.current = null;
      // This is a request counter, not a DOM ref; invalidate the latest request.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ++profileRequestRef.current;
      unsubscribe();
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
   * @param {string} params.linkedinUrl - LinkedIn profile URL
   */
  const signUp = async ({
    email,
    password,
    firstName,
    lastName,
    major,
    year,
    dateOfBirth,
    linkedinUrl,
    profilePicture,
    expectedGraduationTerm,
    expectedGraduationYear,
    automaticYearProgression,
  }) => {
    setLoading(true);
    setError(null);
    signupInProgressRef.current = true;

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
          expected_graduation_term: expectedGraduationTerm || null,
          expected_graduation_year: expectedGraduationYear || null,
          automatic_year_progression: Boolean(automaticYearProgression),
          date_of_birth: dateOfBirth || null,
          linkedin_url: linkedinUrl || null,
        },
      });

      // Create or update the profile with ALL fields
      if (data.user) {
        // Wait a moment for any trigger to complete first
        await new Promise(resolve => setTimeout(resolve, 500));

        if (data.session) {
          // We have a session — upsert directly (RLS allows authenticated users)
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              email: email,
              first_name: firstName,
              last_name: lastName,
              major: major || null,
              year: year || null,
              expected_graduation_term: expectedGraduationTerm || null,
              expected_graduation_year: expectedGraduationYear || null,
              automatic_year_progression: Boolean(automaticYearProgression),
              academic_level_override: !automaticYearProgression,
              date_of_birth: dateOfBirth || null,
              linkedin_url: linkedinUrl || null,
            }, {
              onConflict: 'id'
            });

          if (upsertError) {
            console.error('Error creating/updating profile:', upsertError);
          }
        } else {
          // No session (email confirmation required)
          // The DB trigger already created the profile from auth metadata.
          // linkedin_url is stored in raw_user_meta_data and will be
          // applied when the user confirms their email and signs in
          // (see fetchProfile for the recovery logic).
          console.log('No session during signup — linkedin_url stored in auth metadata for recovery on first sign-in.');
        }

        // Upload profile picture if provided
        if (profilePicture) {
          if (data.session) {
            // We have a session — upload immediately
            try {
              await uploadAvatar(data.user.id, profilePicture);
            } catch (uploadError) {
              console.error('Direct avatar upload failed, saving to IndexedDB:', uploadError);
              await savePendingAvatar(profilePicture, data.user.id);
            }
          } else {
            // No session yet (email confirmation required)
            // Persist the file in IndexedDB so it survives page reloads
            await savePendingAvatar(profilePicture, data.user.id);
          }
        }

        if (data.session) await fetchProfile(data.user.id, email);
      }

      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    } finally {
      signupInProgressRef.current = false;
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
      if (!profile) setLoading(true);
      await fetchProfile(user.id, user.email);
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
   * Check if the profile has an E-Board/admin role assigned by the database.
   */
  const isAdmin = () => {
    if (!profile) return false;
    return profile.is_admin === true ||
      profile.status === 'eboard' ||
      ['eboard', 'president', 'technology'].includes(profile.role);
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
