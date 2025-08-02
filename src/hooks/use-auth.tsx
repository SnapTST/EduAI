
'use client';

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useRouter } from 'next/navigation';

// User data structure
interface User {
  username: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, pass: string) => boolean;
  register: (email: string, username: string, pass: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A mock user for demonstration purposes if no one has registered
const MOCK_USER: User = {
    username: 'alex',
    displayName: 'Alex',
    email: 'student@example.com',
    photoURL: 'https://placehold.co/100x100.png'
}
const MOCK_PASSWORD = 'password';
const AUTH_KEY = 'eduai-scholar-auth';
const REGISTERED_USER_KEY = 'eduai-scholar-registered-user';


export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if the user is "logged in" from a previous session
    const storedAuth = localStorage.getItem(AUTH_KEY);
    if (storedAuth) {
        try {
            const authData = JSON.parse(storedAuth);
            if (authData.isAuthenticated) {
                const storedUser = localStorage.getItem(REGISTERED_USER_KEY);
                if (storedUser) {
                  setUser(JSON.parse(storedUser));
                } else {
                  // Fallback to mock user if something is wrong
                  setUser(MOCK_USER);
                }
            }
        } catch (e) {
            console.error("Failed to parse auth data", e);
            localStorage.removeItem(AUTH_KEY);
        }
    }
    setLoading(false);
  }, []);

  const login = (username: string, pass: string): boolean => {
    const storedUserRaw = localStorage.getItem(REGISTERED_USER_KEY);
    
    // Check against registered user first
    if(storedUserRaw) {
      const storedUser = JSON.parse(storedUserRaw);
      if (username === storedUser.username && pass === storedUser.password) {
        setUser(storedUser.user);
        localStorage.setItem(AUTH_KEY, JSON.stringify({ isAuthenticated: true }));
        return true;
      }
    }

    // Fallback to default mock user
    if (username.toLowerCase() === MOCK_USER.username && pass === MOCK_PASSWORD) {
        setUser(MOCK_USER);
        localStorage.setItem(AUTH_KEY, JSON.stringify({ isAuthenticated: true }));
        // Also save the mock user as the "registered" user for consistency
        localStorage.setItem(REGISTERED_USER_KEY, JSON.stringify({ user: MOCK_USER, password: MOCK_PASSWORD }));
        return true;
    }

    return false;
  };

  const register = (email: string, username: string, pass: string): boolean => {
    // In a real app, you'd check if the username or email is already taken.
    // Here we just overwrite any existing registered user for simplicity.
    const newUser: User = {
      email,
      username,
      displayName: username,
      photoURL: `https://placehold.co/100x100.png?text=${username.charAt(0).toUpperCase()}`
    };

    localStorage.setItem(REGISTERED_USER_KEY, JSON.stringify({ user: newUser, password: pass }));
    
    // Automatically log in the user after registration
    setUser(newUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify({ isAuthenticated: true }));

    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{user, loading, login, register, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
