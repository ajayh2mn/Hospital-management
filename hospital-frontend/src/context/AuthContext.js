/**
 * AuthContext.js — provides authentication state to the entire React app.
 *
 * React Context is a way to share state without passing props through every component.
 * Think of it as a "global store" for auth data.
 *
 * Flow:
 *   1. App wraps everything in <AuthProvider>
 *   2. Any component can call useAuth() to get: user, token, login(), logout()
 *   3. When login() is called, token + user info saved to localStorage AND context state
 *   4. When logout() is called, everything is cleared
 *
 * localStorage persists across page refreshes (unlike component state which resets).
 */

import React, { createContext, useState, useContext, useEffect } from 'react';

// Step 1: Create the context
const AuthContext = createContext(null);

// Step 2: Create the Provider component
export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage (so refresh doesn't log out the user)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('token'));

  /**
   * login() — called after successful API login.
   * Saves everything to state and localStorage.
   */
  const login = (authResponse) => {
    const userData = {
      id: authResponse.userId,
      username: authResponse.username,
      email: authResponse.email,
      fullName: authResponse.fullName,
      roles: authResponse.roles,
    };

    setUser(userData);
    setToken(authResponse.token);
    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  /**
   * logout() — clears everything and redirects to login.
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  /**
   * Helper functions to check roles.
   * Example: hasRole('ROLE_ADMIN') returns true if the user is an admin.
   */
  const hasRole = (role) => user?.roles?.includes(role) ?? false;
  const isAdmin = () => hasRole('ROLE_ADMIN');
  const isDoctor = () => hasRole('ROLE_DOCTOR');
  const isNurse = () => hasRole('ROLE_NURSE');
  const isReceptionist = () => hasRole('ROLE_RECEPTIONIST');

  // Value object shared with all consumers
  const value = {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
    hasRole,
    isAdmin,
    isDoctor,
    isNurse,
    isReceptionist,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Step 3: Custom hook for easy access
// Instead of: const { user } = useContext(AuthContext)
// You write:   const { user } = useAuth()
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
