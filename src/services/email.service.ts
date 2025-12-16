import transporter from '../utils/email';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export class EmailService {
  
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_HOST_USER,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      console.log(`Email sent to ${options.to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendOtp(to: string, otp: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
      html: `<p>Your verification code is: <strong>${otp}</strong></p><p>It will expire in 10 minutes.</p>`,
    });
  }
}

export const emailService = new EmailService();

