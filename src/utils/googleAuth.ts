// Utility for Google / Gmail Authentication and decoding profile data
import { StudentUser } from '../types';

export interface GoogleUserProfile {
  email: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  sub?: string;
  email_verified?: boolean;
}

// Decode standard Google JWT Token if received from GSI
export function parseJwt(token: string): GoogleUserProfile | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding Google JWT token', error);
    return null;
  }
}

// Convert Google User Profile to our StudentUser model
export function createStudentUserFromGoogle(profile: GoogleUserProfile, extraPhone?: string, extraDoc?: string): StudentUser {
  const email = profile.email.toLowerCase();
  let name = profile.name;
  if (!name && profile.given_name) {
    name = `${profile.given_name} ${profile.family_name || ''}`.trim();
  }
  if (!name) {
    const localPart = email.split('@')[0].replace(/[._-]/g, ' ');
    name = localPart.charAt(0).toUpperCase() + localPart.slice(1);
  }

  const avatarUrl = profile.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

  return {
    id: profile.sub ? `g-${profile.sub}` : `usr-g-${Date.now()}`,
    name,
    email,
    phone: extraPhone || '+54 9 11 4982-3344',
    doc: extraDoc || '',
    isMember: false,
    avatarUrl,
    provider: 'google',
    createdAt: new Date().toISOString(),
  };
}
