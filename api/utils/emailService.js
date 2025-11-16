import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Email Service Module
 * Handles email sending for password recovery and notifications
 * @module EmailService
 */

/**
 * Creates a nodemailer transporter
 * @returns {Object} Nodemailer transporter
 */
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

/**
 * Sends a password recovery email
 * @param {string} to - Recipient email address
 * @param {string} resetToken - Password reset token
 * @returns {Promise<Object>} Send result
 */
export const sendPasswordRecoveryEmail = async (to, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"Video Conference Platform" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Password Recovery',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Recovery</h2>
          <p>You have requested to reset your password. Click the following link to create a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Reset Password
          </a>
          <p style="margin-top: 20px;">This link will expire in 1 hour.</p>
          <p>If you did not request this change, you can ignore this email.</p>
          <hr style="margin-top: 30px;">
          <p style="font-size: 12px; color: #666;">This is an automated email, please do not reply.</p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    throw new Error(`Failed to send recovery email: ${error.message}`);
  }
};

/**
 * Sends a meeting invitation
 * @param {string} to - Recipient email address
 * @param {Object} meetingData - Meeting information
 * @returns {Promise<Object>} Send result
 */
export const sendMeetingInvitation = async (to, meetingData) => {
  try {
    const transporter = createTransporter();
    
    const { title, description, scheduledAt, meetingUrl } = meetingData;
    
    const mailOptions = {
      from: `"Video Conference Platform" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `Meeting Invitation: ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Meeting Invitation</h2>
          <h3>${title}</h3>
          <p><strong>Description:</strong> ${description || 'No description'}</p>
          <p><strong>Date and Time:</strong> ${new Date(scheduledAt).toLocaleString('en-US')}</p>
          <a href="${meetingUrl}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px;">
            Join Meeting
          </a>
          <hr style="margin-top: 30px;">
          <p style="font-size: 12px; color: #666;">This is an automated email, please do not reply.</p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    throw new Error(`Failed to send invitation: ${error.message}`);
  }
};
