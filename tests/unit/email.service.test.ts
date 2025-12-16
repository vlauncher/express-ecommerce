import { EmailService } from '../../src/services/email.service';
import transporter from '../../src/utils/email';

// Mock the transporter
jest.mock('../../src/utils/email', () => ({
  sendMail: jest.fn(),
}));

describe('EmailService', () => {
  let emailService: EmailService;

  beforeEach(() => {
    emailService = new EmailService();
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send an email successfully', async () => {
      (transporter.sendMail as jest.Mock).mockResolvedValueOnce('OK');

      await emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test Body',
      });

      expect(transporter.sendMail).toHaveBeenCalledWith({
        from: process.env.EMAIL_HOST_USER,
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test Body',
        html: undefined,
      });
    });

    it('should throw an error if sending fails', async () => {
      (transporter.sendMail as jest.Mock).mockRejectedValueOnce(new Error('SMTP Error'));

      await expect(
        emailService.sendEmail({
          to: 'test@example.com',
          subject: 'Test',
          text: 'Test',
        })
      ).rejects.toThrow('Failed to send email');
    });
  });

  describe('sendOtp', () => {
    it('should send an OTP email', async () => {
      const sendEmailSpy = jest.spyOn(emailService, 'sendEmail').mockResolvedValue();

      await emailService.sendOtp('test@example.com', '123456');

      expect(sendEmailSpy).toHaveBeenCalledWith(expect.objectContaining({
        to: 'test@example.com',
        subject: 'Your Verification Code',
        text: expect.stringContaining('123456'),
        html: expect.stringContaining('123456'),
      }));
    });
  });
});
