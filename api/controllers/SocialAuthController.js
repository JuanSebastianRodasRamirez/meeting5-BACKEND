import { auth } from '../config/firebase.js';
import UserDAO from '../dao/UserDAO.js';
import { generateToken } from '../utils/jwt.js';
import logger from '../utils/logger.js';

/**
 * Social Authentication Controller
 * Handles Google and Facebook authentication via Firebase
 * @module SocialAuthController
 */

/**
 * Authenticates a user with Google or Facebook using Firebase ID token
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const socialLogin = async (req, res) => {
  try {
    const { idToken, provider } = req.body;
    
    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'ID token is required'
      });
    }
    
    if (!['google', 'facebook'].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid provider. Use "google" or "facebook"'
      });
    }
    
    // Verify the Firebase ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;
    
    // Check if user already exists
    let user = await UserDAO.findByEmail(email);
    
    if (!user) {
      // Create new user for first-time social login
      const [firstName, ...lastNameParts] = (name || email.split('@')[0]).split(' ');
      const lastName = lastNameParts.join(' ') || 'User';
      
      user = await UserDAO.create({
        firstName,
        lastName,
        age: 18, // Default age for social login
        email,
        password: null, // No password for social login
        provider,
        firebaseUid: uid,
        profilePicture: picture || null
      });
      
      logger.info(`New user created via ${provider}: ${email}`);
    } else {
      // Update existing user's Firebase UID if not set
      if (!user.firebaseUid) {
        await UserDAO.update(user.id, { firebaseUid: uid });
      }
      
      logger.info(`User logged in via ${provider}: ${email}`);
    }
    
    // Remove password from response
    delete user.password;
    
    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      provider
    });
    
    res.status(200).json({
      success: true,
      message: 'Social login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    logger.error('Social login failed', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        message: 'ID token has expired'
      });
    }
    
    if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({
        success: false,
        message: 'Invalid ID token'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to authenticate with social provider',
      error: error.message
    });
  }
};

/**
 * Links a social provider to an existing account
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const linkSocialAccount = async (req, res) => {
  try {
    const { idToken, provider } = req.body;
    const userId = req.user.userId;
    
    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'ID token is required'
      });
    }
    
    // Verify the Firebase ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid } = decodedToken;
    
    // Update user with Firebase UID
    await UserDAO.update(userId, {
      firebaseUid: uid,
      provider: provider // Update provider if needed
    });
    
    logger.info(`Social account linked: ${provider} for user ${userId}`);
    
    res.status(200).json({
      success: true,
      message: `${provider} account linked successfully`
    });
  } catch (error) {
    logger.error('Failed to link social account', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to link social account',
      error: error.message
    });
  }
};
