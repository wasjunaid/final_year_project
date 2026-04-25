import type { GoogleAuthPayload } from '../../models/auth/payload';

// Google Auth service - pure HTTP helpers for Google OAuth flow
export const googleAuthService = {
  // Initiate Google OAuth - redirects to backend Google OAuth endpoint
  async initiateGoogleAuth(payload: GoogleAuthPayload): Promise<void> {
    // Create state parameter with role information using btoa instead of Buffer
    const state = btoa(JSON.stringify({ role: payload.role }));
    
    // Redirect to backend Google OAuth endpoint
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const authUrl = `${backendUrl}/auth/google?state=${encodeURIComponent(state)}`;
    
    // Redirect user to Google OAuth
    window.location.href = authUrl;
  },
};