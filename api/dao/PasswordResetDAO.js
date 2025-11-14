import { db } from '../config/firebase.js';

/**
 * Password Reset Tokens Data Access Object
 * Handles password recovery token operations
 * @module PasswordResetDAO
 */

/**
 * Reference to the reset tokens collection
 * @constant
 */
const resetTokensCollection = db.collection('passwordResetTokens');

/**
 * PasswordResetDAO class for database operations
 */
class PasswordResetDAO {
  /**
   * Creates a new password reset token
   * @param {Object} tokenData - Token data
   * @param {string} tokenData.userId - User ID
   * @param {string} tokenData.token - Generated token
   * @param {Date} tokenData.expiresAt - Expiration date
   * @returns {Promise<Object>} Created token data with ID
   */
  static async create(tokenData) {
    try {
      const docRef = await resetTokensCollection.add({
        ...tokenData,
        used: false,
        createdAt: new Date()
      });
      
      return {
        id: docRef.id,
        ...tokenData,
        used: false
      };
    } catch (error) {
      throw new Error(`Failed to create reset token: ${error.message}`);
    }
  }

  /**
   * Finds a valid token
   * @param {string} token - Token to find
   * @returns {Promise<Object|null>} Token data or null if not found/expired
   */
  static async findValidToken(token) {
    try {
      const snapshot = await resetTokensCollection
        .where('token', '==', token)
        .where('used', '==', false)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      const data = doc.data();
      
      // Check if token has expired
      if (data.expiresAt.toDate() < new Date()) {
        return null;
      }
      
      return {
        id: doc.id,
        ...data
      };
    } catch (error) {
      throw new Error(`Failed to find token: ${error.message}`);
    }
  }

  /**
   * Marks a token as used
   * @param {string} tokenId - Token ID
   * @returns {Promise<boolean>} Success status
   */
  static async markAsUsed(tokenId) {
    try {
      await resetTokensCollection.doc(tokenId).update({
        used: true,
        usedAt: new Date()
      });
      
      return true;
    } catch (error) {
      throw new Error(`Failed to mark token as used: ${error.message}`);
    }
  }
}

export default PasswordResetDAO;
