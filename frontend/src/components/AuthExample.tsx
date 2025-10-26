import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { ROLES, type UserRole } from "../constants/roles";

// Example component showing how to use the new useAuth hook
export function AuthExample() {
  const {
    isAuthenticated,
    loading,
    error,
    success,
    user,
    role,
    personId,
    signIn,
    signUp,
    signOut,
    clearMessages,
    hasRole,
    hasAnyRole,
  } = useAuth();

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    role: ROLES.PATIENT as UserRole,
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await signIn(credentials);
    if (success) {
      console.log("Signed in successfully!");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await signUp(credentials);
    if (success) {
      console.log("Account created successfully!");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return (
      <div>
        <h2>Welcome!</h2>
        <p>You are signed in as: {role}</p>
        <p>Person ID: {personId}</p>
        {user && <p>Name: {user.first_name} {user.last_name}</p>}
        
        <div>
          <p>Role Checks:</p>
          <p>Is Patient: {hasRole(ROLES.PATIENT) ? "Yes" : "No"}</p>
          <p>Is Doctor: {hasRole(ROLES.DOCTOR) ? "Yes" : "No"}</p>
          <p>Is Admin: {hasAnyRole([ROLES.ADMIN, ROLES.SUPER_ADMIN]) ? "Yes" : "No"}</p>
        </div>

        <button onClick={signOut}>Sign Out</button>
        
        {error && <div style={{ color: "red" }}>{error}</div>}
        {success && <div style={{ color: "green" }}>{success}</div>}
        {(error || success) && (
          <button onClick={clearMessages}>Clear Messages</button>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2>Authentication</h2>
      
      <form onSubmit={handleSignIn}>
        <h3>Sign In</h3>
        <input
          type="email"
          placeholder="Email"
          value={credentials.email}
          onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
          required
        />
        <select
          value={credentials.role}
          onChange={(e) => setCredentials(prev => ({ ...prev, role: e.target.value as UserRole }))}
        >
          <option value={ROLES.PATIENT}>Patient</option>
          <option value={ROLES.DOCTOR}>Doctor</option>
          <option value={ROLES.ADMIN}>Admin</option>
        </select>
        <button type="submit">Sign In</button>
      </form>

      <form onSubmit={handleSignUp}>
        <h3>Sign Up</h3>
        <button type="submit">Sign Up</button>
      </form>

      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>{success}</div>}
      {(error || success) && (
        <button onClick={clearMessages}>Clear Messages</button>
      )}
    </div>
  );
}