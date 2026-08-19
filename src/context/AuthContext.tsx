import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { 
  loadUserProfile, 
  saveUserProfile, 
  createInitialUserProfile 
} from '../utils/storage';
import { 
  auth, 
  isFirebaseConfigured, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  fbSignOut, 
  fbSendPasswordResetEmail,
  fbSendEmailVerification,
  fbUpdateProfile,
  onAuthStateChanged
} from '../services/firebase';

interface AuthContextType {
  user: UserProfile;
  isAuthenticated: boolean;
  isLoading: boolean;
  isFirebaseActive: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, pass: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
  updateUserProfileState: (updates: Partial<UserProfile>) => void;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => loadUserProfile());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          const current = loadUserProfile();
          const synced: UserProfile = {
            ...current,
            uid: fbUser.uid,
            email: fbUser.email || current.email,
            displayName: fbUser.displayName || current.displayName || 'Typing Master',
            isGuest: false,
          };
          setUser(synced);
          saveUserProfile(synced);
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isFirebaseConfigured && auth) {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        const current = loadUserProfile();
        const updated: UserProfile = {
          ...current,
          uid: cred.user.uid,
          email: cred.user.email || email,
          displayName: cred.user.displayName || email.split('@')[0],
          isGuest: false,
        };
        setUser(updated);
        saveUserProfile(updated);
        return { success: true };
      } else {
        // Local simulation login
        const current = loadUserProfile();
        const updated: UserProfile = {
          ...current,
          email,
          displayName: email.split('@')[0],
          isGuest: false,
        };
        setUser(updated);
        saveUserProfile(updated);
        return { success: true };
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (email: string, pass: string, displayName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isFirebaseConfigured && auth) {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        if (cred.user) {
          await fbUpdateProfile(cred.user, { displayName });
          try {
            await fbSendEmailVerification(cred.user);
          } catch {
            // non-fatal
          }
        }
        const newUser = createInitialUserProfile(cred.user.uid, email, displayName, false);
        setUser(newUser);
        saveUserProfile(newUser);
        return { success: true };
      } else {
        // Local registration
        const newUser = createInitialUserProfile(undefined, email, displayName, false);
        setUser(newUser);
        saveUserProfile(newUser);
        return { success: true };
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (isFirebaseConfigured && auth) {
        await fbSignOut(auth);
      }
      const guest = createInitialUserProfile();
      setUser(guest);
      saveUserProfile(guest);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isFirebaseConfigured && auth) {
        await fbSendPasswordResetEmail(auth, email);
        return { success: true };
      } else {
        return { success: true };
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset link.';
      return { success: false, error: errorMessage };
    }
  };

  const resendVerificationEmail = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isFirebaseConfigured && auth && auth.currentUser) {
        await fbSendEmailVerification(auth.currentUser);
        return { success: true };
      }
      return { success: true };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend verification email.';
      return { success: false, error: errorMessage };
    }
  };

  const updateUserProfileState = (updates: Partial<UserProfile>) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      saveUserProfile(updated);
      return updated;
    });
  };

  const continueAsGuest = () => {
    const guest = createInitialUserProfile();
    setUser(guest);
    saveUserProfile(guest);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !user.isGuest,
        isLoading,
        isFirebaseActive: isFirebaseConfigured,
        login,
        register,
        logout,
        resetPassword,
        resendVerificationEmail,
        updateUserProfileState,
        continueAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
