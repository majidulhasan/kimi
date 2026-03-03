import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthContextType } from '@/types';
import { getOneByIndex, createItem, getItem, updateItem } from '@/db/database';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('alfalah_current_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem('alfalah_current_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const foundUser = await getOneByIndex('users', 'by-email', email);
      
      if (foundUser && foundUser.password === password) {
        setUser(foundUser);
        localStorage.setItem('alfalah_current_user', JSON.stringify(foundUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'role'>
  ): Promise<boolean> => {
    try {
      // Check if email already exists
      const existingUser = await getOneByIndex('users', 'by-email', userData.email);
      if (existingUser) {
        return false;
      }

      // Create new user with customer role
      const newUserId = await createItem('users', {
        ...userData,
        role: 'customer',
      } as Omit<User, 'id' | 'createdAt' | 'updatedAt'>);

      // Get the created user
      const newUser = await getItem('users', newUserId);
      if (newUser) {
        setUser(newUser);
        localStorage.setItem('alfalah_current_user', JSON.stringify(newUser));
      }

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('alfalah_current_user');
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      if (!user?.id) return false;

      await updateItem('users', user.id, data);
      
      const updatedUser = await getItem('users', user.id);
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('alfalah_current_user', JSON.stringify(updatedUser));
      }

      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f3d2e] to-[#1a5f4a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
