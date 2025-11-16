import { db } from '../config/firebase.js';

/**
 * User Data Access Object
 * Handles all database operations for users
 * @module UserDAO
 */

/**
 * Reference to the users collection
 * @constant
 */
const usersCollection = db.collection('users');

/**
 * UserDAO class for database operations
 */
class UserDAO {
  /**
   * Creates a new user in the database
   * @param {Object} userData - User data to create
   * @param {string} userData.firstName - User's first name
   * @param {string} userData.lastName - User's last name
   * @param {number} userData.age - User's age
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's hashed password
   * @param {string} userData.provider - Authentication provider (manual, google, facebook)
   * @returns {Promise<Object>} Created user data with ID
   */
  static async create(userData) {
    try {
      const docRef = await usersCollection.add({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return {
        id: docRef.id,
        ...userData
      };
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Finds a user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User data or null if not found
   */
  static async findById(userId) {
    try {
      const doc = await usersCollection.doc(userId).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      throw new Error(`Failed to find user by ID: ${error.message}`);
    }
  }

  /**
   * Finds a user by email
   * @param {string} email - User's email
   * @returns {Promise<Object|null>} User data or null if not found
   */
  static async findByEmail(email) {
    try {
      const snapshot = await usersCollection.where('email', '==', email).limit(1).get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  /**
   * Updates user information
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user data
   */
  static async update(userId, updateData) {
    try {
      await usersCollection.doc(userId).update({
        ...updateData,
        updatedAt: new Date()
      });
      
      return await this.findById(userId);
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  /**
   * Deletes a user
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  static async delete(userId) {
    try {
      await usersCollection.doc(userId).delete();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  /**
   * Checks if an email already exists
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} True if email exists
   */
  static async emailExists(email) {
    try {
      const user = await this.findByEmail(email);
      return user !== null;
    } catch (error) {
      throw new Error(`Failed to check email existence: ${error.message}`);
    }
  }
}

export default UserDAO;
