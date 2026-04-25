export const decodeJWTPayload = (token: string): any | null => {
  if (!token) {
    console.error('JWT decode failed: Token is empty');
    return null;
  }
  
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      console.error('JWT decode failed: Invalid token format');
      return null;
    }
    
    const payloadPart = parts[1];
    
    // Convert base64url to base64
    let base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    
    // Pad with '='
    while (base64.length % 4) {
      base64 += '=';
    }
    
    const decoded = atob(base64);
    const payload = JSON.parse(decoded);
    
    console.log('JWT decoded successfully:', { role: payload.role, person_id: payload.person_id });
    return payload;
  } catch (err) {
    console.error('Failed to decode JWT:', err);
    return null;
  }
};