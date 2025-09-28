const { transport, EMAIL_USER } = require("../../config/emailConfig");
const { FRONTEND_URL } = require("../../config/frontendConfig");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class EmailService {
  static async sendVerificationEmail(email, token) {
    if (!email) {
      throw new AppError("email is required", statusCodes.BAD_REQUEST);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError("Invalid email format", statusCodes.BAD_REQUEST);
    }
    if (!token) {
      throw new AppError("token is required", statusCodes.BAD_REQUEST);
    }

    const verificationURL = `${FRONTEND_URL}/verify-email?token=${token}`;

    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #129990; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome!</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Please verify your email address</h2>
            <p style="color: #666; line-height: 1.6;">
              Thank you for signing up! To complete your registration and start using our platform, 
              please click the button below to verify your email address.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationURL}" 
                style="background-color: #129990; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p style="color: #999; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verificationURL}">${verificationURL}</a>
            </p>
            <p style="color: #999; font-size: 12px;">
              This verification link will expire in 24 hours.
            </p>
          </div>
        </div>
      `
    };

    try {
      await transport.sendMail(mailOptions);
    } catch (error) {
      throw new AppError(`Error sending verification email: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  static async sendPasswordResetEmail(email, token) {
    if (!email) {
      throw new AppError("email is required", statusCodes.BAD_REQUEST);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError("Invalid email format", statusCodes.BAD_REQUEST);
    }
    if (!token) {
      throw new AppError("token is required", statusCodes.BAD_REQUEST);
    }

    const resetURL = `${FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: 'Reset Your Password - HealthCare',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #129990 0%, #0d7377 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">HealthCare</h1>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 30px; background-color: white; margin: 0 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello!</h2>

            <p style="color: #666; line-height: 1.6; font-size: 16px; margin-bottom: 25px;">
              We received a request to reset your password for your HealthCare account. 
              Click the button below to create a new password.
            </p>
            
            <!-- Reset Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${resetURL}" 
                style="background: linear-gradient(135deg, #129990 0%, #0d7377 100%); 
                        color: white; 
                        padding: 15px 35px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        display: inline-block;
                        font-weight: bold;
                        font-size: 16px;
                        box-shadow: 0 4px 15px rgba(18, 153, 144, 0.3);">
                Reset My Password
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; line-height: 1.5; margin-top: 30px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetURL}" style="color: #129990; word-break: break-all;">${resetURL}</a>
            </p>
            
            <!-- Security Notice -->
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #129990; margin-top: 30px;">
              <h3 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">Security Notice:</h3>
              <ul style="color: #666; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>This link will expire in <strong>1 hour</strong></li>
                <li>If you didn't request this reset, you can safely ignore this email</li>
                <li>Your password won't change until you click the link above</li>
              </ul>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px;">
            <p style="margin: 0;">
              This email was sent by HealthCare. If you have any questions, please contact our support team.
            </p>
            <p style="margin: 10px 0 0 0;">
              © ${new Date().getFullYear()} HealthCare. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    try {
      await transport.sendMail(mailOptions);
    } catch (error) {
      throw new AppError(`Error sending reset password email: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  static async sendRandomPasswordEmail(email, password) {
    if (!email) {
      throw new AppError("email is required", statusCodes.BAD_REQUEST);
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError("Invalid email format", statusCodes.BAD_REQUEST);
    }
    if (!password) {
      throw new AppError("password is required", statusCodes.BAD_REQUEST);
    }

    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: "Your Random Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Hello!</h2>
          <p style="color: #666;">Your random password is: <strong>${password}</strong></p>
          <p style="color: #666;">Please use this password to log in to your account.</p>
        </div>
      `
    };

    try {
      await transport.sendMail(mailOptions);
    } catch (error) {
      throw new AppError(`Error sending random password email: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  static async sendNotificationEmail(email, {
    title,
    message,
    type }) {
    if (!email) {
      throw new AppError("email is required", statusCodes.BAD_REQUEST);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError("Invalid email format", statusCodes.BAD_REQUEST);
    }
    if (!title) {
      throw new AppError("title is required", statusCodes.BAD_REQUEST);
    }
    if (!message) {
      throw new AppError("message is required", statusCodes.BAD_REQUEST);
    }
    if (!type) {
      throw new AppError("type is required", statusCodes.BAD_REQUEST);
    }

    const typeColors = {
      appointment: '#1890ff', // Blue
      medical: '#52c41a',     // Green
      system: '#722ed1',      // Purple
      alert: '#f5222d',       // Red
      reminder: '#fa8c16',    // Orange
    };
  
    // Default to blue if type not recognized
    const notificationColor = typeColors[type?.toLowerCase()] || '#1890ff';

    // Format the notification date
    const formattedDate = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: `HealthCare Notification: ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #129990 0%, #0d7377 100%); padding: 25px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">HealthCare</h1>
            <p style="color: white; opacity: 0.9; margin: 5px 0 0 0;">Notification Center</p>
          </div>
          
          <!-- Notification Card -->
          <div style="padding: 30px; background-color: white; margin: 0 15px; border-radius: 0 0 8px 8px; box-shadow: 0 3px 10px rgba(0,0,0,0.08);">
            <!-- Notification Type Badge -->
            <div style="margin-bottom: 20px;">
              <span style="background-color: ${notificationColor}; color: white; padding: 5px 12px; border-radius: 16px; font-size: 12px; font-weight: bold; text-transform: uppercase;">${type || 'System'}</span>
            </div>
            
            <!-- Notification Title -->
            <h2 style="color: #333; margin: 0 0 15px 0; font-size: 20px;">${title}</h2>
            
            <!-- Notification Message -->
            <div style="color: #444; line-height: 1.6; font-size: 16px; background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid ${notificationColor};">
              ${message}
            </div>
            
            <!-- Timestamp -->
            <p style="color: #999; font-size: 13px; margin-top: 25px;">
              <strong>Date:</strong> ${formattedDate}
            </p>
            
            <!-- View All Button -->
            <div style="text-align: center; margin-top: 35px;">
              <a href="${FRONTEND_URL}/notifications" 
                style="background-color: ${notificationColor}; 
                        color: white; 
                        padding: 12px 25px; 
                        text-decoration: none; 
                        border-radius: 6px; 
                        display: inline-block;
                        font-weight: bold;
                        font-size: 14px;">
                View All Notifications
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
            <p style="margin: 0;">
              You're receiving this email because you've enabled email notifications for your HealthCare account.
            </p>
            <p style="margin: 10px 0 0 0;">
              <a href="${FRONTEND_URL}/settings/notifications" style="color: #129990; text-decoration: none;">
                Manage notification preferences
              </a>
              |
              <a href="${FRONTEND_URL}" style="color: #129990; text-decoration: none;">
                Go to HealthCare
              </a>
            </p>
            <p style="margin: 15px 0 0 0; font-size: 11px;">
              © ${new Date().getFullYear()} HealthCare. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    try {
      await transport.sendMail(mailOptions);
    } catch (error) {
      throw new AppError(`Error sending notification email: ${error instanceof Error ? error.message : 'Unknown error'}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = { EmailService };