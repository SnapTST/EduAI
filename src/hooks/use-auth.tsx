
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

// Mock user data structure
interface User {
  displayName: string;
  email: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A mock user for demonstration purposes
const MOCK_USER: User = {
    displayName: 'Alex',
    email: 'student@example.com',
    photoURL: 'https://placehold.co/100x100.png'
}
const MOCK_PASSWORD = 'password';
const AUTH_KEY = 'eduai-scholar-auth';


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
                setUser(MOCK_USER);
            }
        } catch (e) {
            console.error("Failed to parse auth data", e);
            localStorage.removeItem(AUTH_KEY);
        }
    }
    setLoading(false);
  }, []);

  const login = (email: string, pass: string): boolean => {
    if (email.toLowerCase() === MOCK_USER.email && pass === MOCK_PASSWORD) {
        setUser(MOCK_USER);
        localStorage.setItem(AUTH_KEY, JSON.stringify({ isAuthenticated: true }));
        return true;
    }
    return false;
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
    <AuthContext.Provider value={{user, loading, login, logout}}>
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
