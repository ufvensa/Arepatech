# VENSA Supabase Implementation Guide

This guide explains how to connect your existing React components to Supabase.

## Table of Contents
1. [Setup](#setup)
2. [Wrap App with AuthProvider](#wrap-app-with-authprovider)
3. [Connect SignUp Form](#connect-signup-form)
4. [Connect Login Form](#connect-login-form)
5. [Connect Directory Page](#connect-directory-page)
6. [Connect Resources Page](#connect-resources-page)
7. [Protected Routes](#protected-routes)

---

## Setup

1. **Run the SQL schema** in your Supabase SQL Editor:
   - Go to Supabase Dashboard > SQL Editor
   - Copy and paste the contents of `supabase/schema.sql`
   - Click "Run"

2. **Create Storage Buckets** in Supabase Dashboard > Storage:
   - `avatars` - Public bucket for profile pictures
   - `event-images` - Public bucket for event images
   - `resource-images` - Public bucket for resource thumbnails

3. **Configure your environment variables** in `client/.env.local`

---

## Wrap App with AuthProvider

Update your `main.jsx` to wrap the app with the AuthProvider:

```jsx
// client/src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import './App.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
```

---

## Connect SignUp Form

Replace your SignUp component's form handler:

```jsx
// client/src/pages/SignUp.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: signUpError } = await signUp({
        email,
        password,
        firstName,
        lastName,
        username,
        major,
        year,
        dateOfBirth: dateOfBirth || null,
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // Check if email confirmation is required
      if (data?.user && !data.session) {
        alert("Please check your email to confirm your account!");
        navigate("/profile"); // Redirect to login
      } else {
        navigate("/"); // Redirect to home
      }
    } catch (err) {
      setError(err.message || "An error occurred during sign up");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ... rest of your JSX
    // Add error display:
    // {error && <p className="signup-error">{error}</p>}
    // Update button:
    // <button type="submit" disabled={isLoading}>
    //   {isLoading ? "Signing up..." : "Sign Up"}
    // </button>
  );
}
```

---

## Connect Login Form

Update your Profile/Login component:

```jsx
// client/src/pages/Profile.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, user, profile } = useAuth();
  const navigate = useNavigate();

  // If already logged in, show profile instead of login form
  if (user && profile) {
    return <UserProfile profile={profile} />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error: signInError } = await signIn({ email, password });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      navigate("/");
    } catch (err) {
      setError(err.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of your login form JSX
}

// Optional: User profile component when logged in
function UserProfile({ profile }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="user-profile">
      <h1>Welcome, {profile.first_name}!</h1>
      <p>Major: {profile.major}</p>
      <p>Year: {profile.year}</p>
      <p>Status: {profile.status}</p>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
}
```

---

## Connect Directory Page

Update your Directory component to fetch from Supabase:

```jsx
// client/src/pages/Directory.jsx
import { useState, useEffect } from "react";
import { getProfiles } from "../lib/supabase";

export default function Directory() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedMember, setSelectedMember] = useState(null);

  // Fetch members from Supabase
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const data = await getProfiles({
          status: selectedStatus,
          search: searchQuery,
        });

        // Transform data to match existing component structure
        const transformedData = data.map(profile => ({
          id: profile.id,
          name: `${profile.first_name} ${profile.last_name}`,
          status: profile.status,
          major: profile.major || 'Undeclared',
          year: profile.year || 'Unknown',
          attendanceRate: profile.attendance_rate || 0,
          workplace: profile.workplace,
          email: null, // Don't expose email publicly
          avatar: profile.avatar_url,
          linkedin: profile.linkedin_url,
        }));

        setMembers(transformedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [selectedStatus, searchQuery]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      // Search is triggered in the main useEffect
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (loading) return <div className="loading">Loading members...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  // Calculate counts from fetched data
  const memberCounts = {
    all: members.length,
    eboard: members.filter(m => m.status === "eboard").length,
    member: members.filter(m => m.status === "member").length,
    alumni: members.filter(m => m.status === "alumni").length,
  };

  // ... rest of your JSX (replace MOCK_MEMBERS with members)
}
```

---

## Connect Resources Page

Update your Resources component:

```jsx
// client/src/pages/Resources.jsx
import { useState, useEffect } from "react";
import { getResources, createResource, uploadResourceImage } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isAuthenticated } = useAuth();

  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    major: "All Majors",
    imageFile: null,
  });

  // Fetch resources from Supabase
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const data = await getResources({
          majorTag: selectedMajor,
          search: searchQuery,
        });

        // Transform data to match existing structure
        const transformedData = data.map(resource => ({
          id: resource.id,
          title: resource.title,
          description: resource.description,
          major: resource.major_tag,
          image: resource.image_url,
          author: resource.author
            ? `${resource.author.first_name} ${resource.author.last_name}`
            : 'VENSA Member',
          date: new Date(resource.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          }),
        }));

        setResources(transformedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [selectedMajor, searchQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      alert("Please log in to add a resource");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;

      // Upload image if provided
      if (newResource.imageFile) {
        imageUrl = await uploadResourceImage(newResource.imageFile);
      }

      // Create resource in database
      const created = await createResource({
        title: newResource.title,
        description: newResource.description,
        major_tag: newResource.major,
        image_url: imageUrl,
      });

      // Add to local state
      setResources(prev => [{
        id: created.id,
        title: created.title,
        description: created.description,
        major: created.major_tag,
        image: created.image_url,
        author: created.author
          ? `${created.author.first_name} ${created.author.last_name}`
          : 'VENSA Member',
        date: new Date(created.created_at).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        }),
      }, ...prev]);

      // Reset form
      setNewResource({ title: "", description: "", major: "All Majors", imageFile: null });
      setShowModal(false);
    } catch (err) {
      alert("Error creating resource: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update file input handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewResource(prev => ({ ...prev, imageFile: file }));
    }
  };

  // ... rest of your JSX
  // Update "Add Resource" button to check auth:
  // {isAuthenticated() && (
  //   <button onClick={() => setShowModal(true)}>+ Add Resource</button>
  // )}
}
```

---

## Protected Routes

Create a ProtectedRoute component for pages that require authentication:

```jsx
// client/src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, requireEBoard = false }) {
  const { user, profile, loading, isEBoard } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/profile" replace />;
  }

  if (requireEBoard && !isEBoard()) {
    return <Navigate to="/" replace />;
  }

  return children;
}
```

Use it in your App.jsx:

```jsx
// client/src/App.jsx
import { ProtectedRoute } from './components/ProtectedRoute';

// In your routes:
<Route
  path="/admin/events"
  element={
    <ProtectedRoute requireEBoard>
      <EventAdmin />
    </ProtectedRoute>
  }
/>
```

---

## Update Navbar for Auth State

Update your Navbar to show login state:

```jsx
// client/src/components/Navbar.jsx
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <nav>
      {/* ... other nav items */}

      {user ? (
        <div className="nav-user">
          <span>Hi, {profile?.first_name || 'User'}</span>
          <button onClick={handleLogout}>Log Out</button>
        </div>
      ) : (
        <Link to="/profile">Login</Link>
      )}
    </nav>
  );
}
```

---

## Storage Bucket Policies

In Supabase Dashboard > Storage > Policies, create the following policies:

### avatars bucket:
```sql
-- Allow public read
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### resource-images bucket:
```sql
-- Allow public read
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'resource-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resource-images' AND auth.uid() IS NOT NULL);
```

### event-images bucket:
```sql
-- Allow public read
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'event-images');

-- Only E-Board can upload
CREATE POLICY "E-Board can upload" ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND status = 'eboard'
  )
);
```
