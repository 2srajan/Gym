const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const emailTemplates = {
  welcome: {
    subject: 'Welcome to Gym Management System',
    html: (user) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1>Welcome to Gym Management System</h1>
        </div>
        <div style="padding: 30px; background-color: #f9fafb;">
          <h2>Hi ${user.name},</h2>
          <p>Thank you for joining our gym management system! Your account has been successfully created.</p>
          <p>You can now:</p>
          <ul>
            <li>Track your workouts and progress</li>
            <li>Access exercise library and gym tools</li>
            <li>Manage your subscription</li>
            <li>Set reminders and goals</li>
            <li>Book facilities</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login"
               style="background-color: #3b82f6; color: white; padding: 12px 30px;
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Login to Your Account
            </a>
          </div>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,<br>The Gym Team</p>
        </div>
        <div style="background-color: #e5e7eb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>&copy; 2024 Gym Management System. All rights reserved.</p>
        </div>
      </div>
    `
  },

  passwordReset: {
    subject: 'Password Reset Request',
    html: (user, token) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center;">
          <h1>Password Reset Request</h1>
        </div>
        <div style="padding: 30px; background-color: #f9fafb;">
          <h2>Hi ${user.name},</h2>
          <p>We received a request to reset your password for your Gym Management System account.</p>
          <p>Click the link below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}"
               style="background-color: #ef4444; color: white; padding: 12px 30px;
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p><strong>Important:</strong></p>
          <ul>
            <li>This link will expire in 1 hour</li>
            <li>If you didn't request this password reset, please ignore this email</li>
            <li>Never share this link with anyone</li>
          </ul>
          <p>If you have any issues, please contact our support team.</p>
          <p>Best regards,<br>The Gym Team</p>
        </div>
        <div style="background-color: #e5e7eb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>&copy; 2024 Gym Management System. All rights reserved.</p>
        </div>
      </div>
    `
  },

  passwordResetConfirmation: {
    subject: 'Password Reset Successful',
    html: (user) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #10b981; color: white; padding: 20px; text-align: center;">
          <h1>Password Reset Successful</h1>
        </div>
        <div style="padding: 30px; background-color: #f9fafb;">
          <h2>Hi ${user.name},</h2>
          <p>Your password has been successfully reset for your Gym Management System account.</p>
          <p>You can now login with your new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login"
               style="background-color: #10b981; color: white; padding: 12px 30px;
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Login to Your Account
            </a>
          </div>
          <p>If you didn't request this password change, please contact our support team immediately.</p>
          <p>Best regards,<br>The Gym Team</p>
        </div>
        <div style="background-color: #e5e7eb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>&copy; 2024 Gym Management System. All rights reserved.</p>
        </div>
      </div>
    `
  },

  emailVerification: {
    subject: 'Verify Your Email Address',
    html: (user, token) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1>Email Verification</h1>
        </div>
        <div style="padding: 30px; background-color: #f9fafb;">
          <h2>Hi ${user.name},</h2>
          <p>Thank you for registering with Gym Management System! Please verify your email address to complete your registration.</p>
          <p>Click the link below to verify your email:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}"
               style="background-color: #3b82f6; color: white; padding: 12px 30px;
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If you can't click the link, you can copy and paste this URL into your browser:</p>
          <p style="word-break: break-all; background-color: #e5e7eb; padding: 10px; border-radius: 5px;">
            ${process.env.FRONTEND_URL}/verify-email?token=${token}
          </p>
          <p>If you didn't create an account with us, please ignore this email.</p>
          <p>Best regards,<br>The Gym Team</p>
        </div>
        <div style="background-color: #e5e7eb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>&copy; 2024 Gym Management System. All rights reserved.</p>
        </div>
      </div>
    `
  },

  subscriptionConfirmation: {
    subject: 'Subscription Confirmed',
    html: (user, subscription) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #8b5cf6; color: white; padding: 20px; text-align: center;">
          <h1>Subscription Confirmed!</h1>
        </div>
        <div style="padding: 30px; background-color: #f9fafb;">
          <h2>Hi ${user.name},</h2>
          <p>Your ${subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)} subscription has been successfully activated!</p>
          <div style="background-color: #8b5cf6; color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3>Subscription Details:</h3>
            <p><strong>Tier:</strong> ${subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)}</p>
            <p><strong>Amount:</strong> $${(subscription.amount / 100).toFixed(2)}/${subscription.billing_cycle}</p>
            <p><strong>Start Date:</strong> ${subscription.start_date.toLocaleDateString()}</p>
            <p><strong>Next Billing:</strong> ${subscription.next_billing_date.toLocaleDateString()}</p>
            <p><strong>Auto-renew:</strong> ${subscription.auto_renew ? 'Enabled' : 'Disabled'}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard"
               style="background-color: #8b5cf6; color: white; padding: 12px 30px;
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          <p>Thank you for choosing our gym management system!</p>
          <p>Best regards,<br>The Gym Team</p>
        </div>
        <div style="background-color: #e5e7eb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>&copy; 2024 Gym Management System. All rights reserved.</p>
        </div>
      </div>
    `
  },

  workoutReminder: {
    subject: 'Workout Reminder',
    html: (user, reminder) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f59e0b; color: white; padding: 20px; text-align: center;">
          <h1>💪 Time to Workout!</h1>
        </div>
        <div style="padding: 30px; background-color: #f9fafb;">
          <h2>Hi ${user.name},</h2>
          <p>${reminder.message}</p>
          <div style="background-color: #f59e0b; color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>When:</strong> ${reminder.scheduled_time.toLocaleString()}</p>
            <p><strong>Where:</strong> ${reminder.location || 'Your preferred workout location'}</p>
            <p><strong>Duration:</strong> ${reminder.duration || '30'} minutes estimated</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/gym-tools"
               style="background-color: #f59e0b; color: white; padding: 12px 30px;
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Log Workout
            </a>
          </div>
          <p>Keep up the great work! Every workout counts towards your fitness goals.</p>
          <p>Best regards,<br>The Gym Team</p>
        </div>
        <div style="background-color: #e5e7eb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>&copy; 2024 Gym Management System. All rights reserved.</p>
        </div>
      </div>
    `
  }
};

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Gym Management System" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

const emailService = {
  sendWelcomeEmail: async (user) => {
    const template = emailTemplates.welcome;
    await sendEmail(user.email, template.subject, template.html(user));
  },

  sendPasswordResetEmail: async (user, token) => {
    const template = emailTemplates.passwordReset;
    await sendEmail(user.email, template.subject, template.html(user, token));
  },

  sendPasswordResetConfirmationEmail: async (user) => {
    const template = emailTemplates.passwordResetConfirmation;
    await sendEmail(user.email, template.subject, template.html(user));
  },

  sendEmailVerificationEmail: async (user, token) => {
    const template = emailTemplates.emailVerification;
    await sendEmail(user.email, template.subject, template.html(user, token));
  },

  sendSubscriptionConfirmationEmail: async (user, subscription) => {
    const template = emailTemplates.subscriptionConfirmation;
    await sendEmail(user.email, template.subject, template.html(user, subscription));
  },

  sendWorkoutReminderEmail: async (user, reminder) => {
    const template = emailTemplates.workoutReminder;
    await sendEmail(user.email, template.subject, template.html(user, reminder));
  },

  sendCustomEmail: async (to, subject, html) => {
    await sendEmail(to, subject, html);
  }
};

module.exports = emailService;