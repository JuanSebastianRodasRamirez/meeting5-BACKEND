import { Request } from 'express';

/**
 * User interface representing a user in the system
 */
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User data without password (for responses)
 */
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User creation data
 */
export interface CreateUserDTO {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  password: string;
}

/**
 * User update data
 */
export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  age?: number;
  email?: string;
  password?: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Meeting interface
 */
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  participants: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Meeting creation data
 */
export interface CreateMeetingDTO {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  participants: string[];
}

/**
 * Meeting update data
 */
export interface UpdateMeetingDTO {
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  participants?: string[];
}

/**
 * Password reset token
 */
export interface PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

/**
 * JWT payload
 */
export interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * Authenticated request with user data
 */
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

/**
 * Social auth request body
 */
export interface SocialAuthRequest {
  idToken: string;
}

/**
 * Social auth link request body
 */
export interface SocialAuthLinkRequest {
  idToken: string;
  userId: string;
}

/**
 * Email options
 */
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}
