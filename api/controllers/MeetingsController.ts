import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import MeetingsDAO from '../dao/MeetingsDAO.js';
import UserDAO from '../dao/UserDAO.js';
import { sendMeetingInvitation } from '../utils/emailService.js';
import logger from '../utils/logger.js';
import { AuthenticatedRequest } from '../types/index.js';

/**
 * Meetings Controller
 * Handles all meeting-related requests
 * @module MeetingsController
 */

/**
 * Creates a new meeting
 * @param req - Express request
 * @param res - Express response
 */
export const createMeeting = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { title, description, scheduledAt, participants, isPublic } = req.body;

    // Validate date
    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled date is not valid'
      });
    }

    // Generate unique URL
    const meetingId = uuidv4();
    const meetingUrl = `${process.env.FRONTEND_URL}/meeting/${meetingId}`;

    // If the title is the fixed bookmark or is empty, assign the URL as the title.
    const finalTitle =
      !title || title.trim() === "" || title === "AUTO_GENERATE"
        ? meetingUrl
        : title;

    const participantsIDs = []
    // Send invitations
    if (Array.isArray(participants) && participants.length > 0) {
      for (const participantEmail of participants) {
        try {
          const participant = await UserDAO.findByEmail(participantEmail);
          if (participant) {
            await sendMeetingInvitation(participant.email, {
              title: finalTitle,
              description: description || '',
              scheduledAt: scheduledDate,
              meetingUrl
            });
            participantsIDs.push(participant.id);
          }
        } catch (emailError) {
          logger.error(`Failed to send invitation to participant ${participantEmail}`, emailError instanceof Error ? emailError : null);
                    // Continue with other participants
        }
        
      }
    } 
    
    const meetingData = {
      title: finalTitle,
      description: description || "",
      scheduledAt: scheduledDate,
      hostId: req.user!.userId,
      participants: participantsIDs,
      meetingUrl,
      isPublic: isPublic || false,
    };

    const meeting = await MeetingsDAO.create(meetingData);

    logger.info(`Meeting created: ${finalTitle} by user ${req.user!.userId}`);

    return res.status(201).json({
      success: true,
      message: 'Meeting created successfully',
      data: meeting
    });
  } catch (error) {
    logger.error('Failed to create meeting', error instanceof Error ? error : null);
    return res.status(500).json({
      success: false,
      message: 'Failed to create meeting',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};


/**
 * Gets all meetings for the user
 * @param req - Express request
 * @param res - Express response
 */
export const getUserMeetings = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const meetings = await MeetingsDAO.getByUserId(req.user!.userId);

    return res.status(200).json({
      success: true,
      data: meetings
    });
  } catch (error) {
    logger.error('Failed to get meetings', error instanceof Error ? error : null);
    return res.status(500).json({
      success: false,
      message: 'Failed to get meetings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Gets a meeting by ID
 * @param req - Express request
 * @param res - Express response
 */
export const getMeetingById = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const meeting = await MeetingsDAO.findById(id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Verify that user has access to the meeting
    const hasAccess = meeting.isPublic || 
      meeting.hostId === req.user!.userId ||
      meeting.participants.includes(req.user!.userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this meeting'
      });
    }

    return res.status(200).json({
      success: true,
      data: meeting
    });
  } catch (error) {
    logger.error('Failed to get meeting', error instanceof Error ? error : null);
    return res.status(500).json({
      success: false,
      message: 'Failed to get meeting',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Updates a meeting
 * @param req - Express request
 * @param res - Express response
 */
export const updateMeeting = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { title, description, scheduledAt, status, isPublic } = req.body;

    const meeting = await MeetingsDAO.findById(id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Only the host can update the meeting
    if (meeting.hostId !== req.user!.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the host can update the meeting'
      });
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt);
    if (status) updateData.status = status;
    if (typeof isPublic === 'boolean') updateData.isPublic = isPublic;

    const updatedMeeting = await MeetingsDAO.update(id, updateData);

    logger.info(`Meeting updated: ${id}`);

    return res.status(200).json({
      success: true,
      message: 'Meeting updated successfully',
      data: updatedMeeting
    });
  } catch (error) {
    logger.error('Failed to update meeting', error instanceof Error ? error : null);
    return res.status(500).json({
      success: false,
      message: 'Failed to update meeting',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Deletes a meeting
 * @param req - Express request
 * @param res - Express response
 */
export const deleteMeeting = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const meeting = await MeetingsDAO.findById(id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Only the host can delete the meeting
    if (meeting.hostId !== req.user!.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the host can delete the meeting'
      });
    }

    await MeetingsDAO.delete(id);

    logger.info(`Meeting deleted: ${id}`);

    return res.status(200).json({
      success: true,
      message: 'Meeting deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete meeting', error instanceof Error ? error : null);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete meeting',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Gets meeting participants and metadata
 * Used by chat microservice to verify access and get meeting info
 * @param req - Express request
 * @param res - Express response
 */
export const getMeetingParticipants = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const meeting = await MeetingsDAO.findById(id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Verify that user has access to the meeting
    const hasAccess = meeting.isPublic || 
      meeting.hostId === userId ||
      meeting.participants?.includes(userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this meeting'
      });
    }

    // Get participant details
    const participantDetails = [];
   
    for (const participantId of meeting.participants || []) {
      try {
        const user = await UserDAO.findById(participantId);
        if (user) {
          participantDetails.push({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          });
        }
      } catch (error) {
        logger.error(`Failed to get participant ${participantId}`, error instanceof Error ? error : null);
      }
    }
    

    // Get host details
    let hostDetails = null;
    try {
      const host = await UserDAO.findById(meeting.hostId);
      if (host) {
        hostDetails = {
          id: host.id,
          firstName: host.firstName,
          lastName: host.lastName,
          email: host.email
        };
      }
    } catch (error) {
      logger.error(`Failed to get host ${meeting.hostId}`, error instanceof Error ? error : null);
    }

    return res.status(200).json({
      success: true,
      data: {
        meetingId: meeting.id,
        title: meeting.title,
        description: meeting.description,
        hostId: meeting.hostId,
        host: hostDetails,
        participants: meeting.participants || [],
        participantDetails,
        status: meeting.status,
        scheduledAt: meeting.scheduledAt,
        meetingUrl: meeting.meetingUrl,
        isPublic: meeting.isPublic || false
      }
    });
  } catch (error) {
    logger.error('Failed to get meeting participants', error instanceof Error ? error : null);
    return res.status(500).json({
      success: false,
      message: 'Failed to get meeting participants',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
