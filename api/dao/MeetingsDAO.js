import { db } from '../config/firebase.js';

/**
 * Meetings Data Access Object
 * Handles all database operations for video conference meetings
 * @module MeetingsDAO
 */

/**
 * Reference to the meetings collection
 * @constant
 */
const meetingsCollection = db.collection('meetings');

/**
 * MeetingsDAO class for database operations
 */
class MeetingsDAO {
  /**
   * Creates a new meeting
   * @param {Object} meetingData - Meeting data to create
   * @param {string} meetingData.title - Meeting title
   * @param {string} meetingData.description - Meeting description
   * @param {Date} meetingData.scheduledAt - Scheduled date and time
   * @param {string} meetingData.hostId - Host user ID
   * @param {Array<string>} meetingData.participants - Array of participant IDs
   * @param {string} meetingData.meetingUrl - URL to join the meeting
   * @returns {Promise<Object>} Created meeting data with ID
   */
  static async create(meetingData) {
    try {
      const docRef = await meetingsCollection.add({
        ...meetingData,
        status: 'scheduled', // scheduled, ongoing, completed, cancelled
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return {
        id: docRef.id,
        ...meetingData,
        status: 'scheduled'
      };
    } catch (error) {
      throw new Error(`Failed to create meeting: ${error.message}`);
    }
  }

  /**
   * Finds a meeting by ID
   * @param {string} meetingId - Meeting ID
   * @returns {Promise<Object|null>} Meeting data or null if not found
   */
  static async findById(meetingId) {
    try {
      const doc = await meetingsCollection.doc(meetingId).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      throw new Error(`Failed to find meeting by ID: ${error.message}`);
    }
  }

  /**
   * Gets all meetings for a user (as host or participant)
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of meeting data
   */
  static async getByUserId(userId) {
    try {
      // Get meetings where user is host
      const hostSnapshot = await meetingsCollection
        .where('hostId', '==', userId)
        .get();
      
      // Get meetings where user is participant
      const participantSnapshot = await meetingsCollection
        .where('participants', 'array-contains', userId)
        .get();
      
      const hostMeetings = hostSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        role: 'host'
      }));
      
      const participantMeetings = participantSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        role: 'participant'
      }));
      
      // Combine and remove duplicates
      const allMeetings = [...hostMeetings, ...participantMeetings];
      const uniqueMeetings = Array.from(
        new Map(allMeetings.map(meeting => [meeting.id, meeting])).values()
      );
      
      // Sort by date in memory (avoids need for composite indexes)
      uniqueMeetings.sort((a, b) => {
        const dateA = a.scheduledAt?.toDate?.() || new Date(a.scheduledAt);
        const dateB = b.scheduledAt?.toDate?.() || new Date(b.scheduledAt);
        return dateB - dateA; // Descending (most recent first)
      });
      
      return uniqueMeetings;
    } catch (error) {
      throw new Error(`Failed to get user meetings: ${error.message}`);
    }
  }

  /**
   * Updates a meeting
   * @param {string} meetingId - Meeting ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated meeting data
   */
  static async update(meetingId, updateData) {
    try {
      await meetingsCollection.doc(meetingId).update({
        ...updateData,
        updatedAt: new Date()
      });
      
      return await this.findById(meetingId);
    } catch (error) {
      throw new Error(`Failed to update meeting: ${error.message}`);
    }
  }

  /**
   * Deletes a meeting
   * @param {string} meetingId - Meeting ID
   * @returns {Promise<boolean>} Success status
   */
  static async delete(meetingId) {
    try {
      await meetingsCollection.doc(meetingId).delete();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete meeting: ${error.message}`);
    }
  }
}

export default MeetingsDAO;
