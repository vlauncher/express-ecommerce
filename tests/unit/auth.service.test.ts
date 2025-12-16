import { AuthService } from '../../src/services/auth.service';
import { User, Otp } from '../../src/models';
import { emailService } from '../../src/services/email.service';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mocks
jest.mock('../../src/models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  },
  Otp: {
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.mock('../../src/services/email.service');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    const mockUser = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('should register a new user and send OTP', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (User.create as jest.Mock).mockResolvedValue({ ...mockUser, id: 1, email: mockUser.email });
      (Otp.destroy as jest.Mock).mockResolvedValue(1);
      (Otp.create as jest.Mock).mockResolvedValue({});

      await authService.register(mockUser);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: mockUser.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(mockUser.password, 10);
      expect(User.create).toHaveBeenCalled();
      expect(emailService.sendOtp).toHaveBeenCalled();
    });

    it('should throw error if user already exists', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ id: 1 });

      await expect(authService.register(mockUser)).rejects.toThrow('User already exists');
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP and activate user', async () => {
      const mockOtp = { destroy: jest.fn() };
      const mockUser = { id: 1, email: 'test@test.com', is_verified: false, save: jest.fn() };

      (Otp.findOne as jest.Mock).mockResolvedValue(mockOtp);
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('token');

      const result = await authService.verifyOtp('test@test.com', '123456');

      expect(Otp.findOne).toHaveBeenCalled();
      expect(mockUser.is_verified).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockOtp.destroy).toHaveBeenCalled();
      expect(result).toHaveProperty('access');
      expect(result).toHaveProperty('refresh');
    });

    it('should throw error for invalid OTP', async () => {
      (Otp.findOne as jest.Mock).mockResolvedValue(null);

      await expect(authService.verifyOtp('test@test.com', '123456')).rejects.toThrow('Invalid or expired OTP');
    });

    it('should throw error if user not found after OTP verification', async () => {
      // Mock OTP found
      (Otp.findOne as jest.Mock).mockResolvedValue({ destroy: jest.fn() });
      // Mock User NOT found
      (User.findOne as jest.Mock).mockResolvedValue(null);

      await expect(authService.verifyOtp('test@test.com', '123456')).rejects.toThrow('User not found');
    });
  });

  describe('login', () => {
    const credentials = { email: 'test@test.com', password: 'password' };
    
    it('should login successfully', async () => {
      const mockUser = { 
        id: 1, 
        email: 'test@test.com', 
        password: 'hashedPassword',
        is_verified: true 
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token');

      const result = await authService.login(credentials);

      expect(result).toHaveProperty('access');
      expect(result).toHaveProperty('refresh');
    });

    it('should throw error if user not found', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      await expect(authService.login(credentials)).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if user not verified', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ is_verified: false });
      await expect(authService.login(credentials)).rejects.toThrow('Account not verified. Please verify your email.');
    });

    it('should throw error if password invalid', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ is_verified: true, password: 'hash' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(authService.login(credentials)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refreshToken', () => {
      it('should return new tokens for valid refresh token', async () => {
          (jwt.verify as jest.Mock).mockReturnValue({ id: 1 });
          (User.findByPk as jest.Mock).mockResolvedValue({ id: 1, email: 'test@test.com' });
          (jwt.sign as jest.Mock).mockReturnValue('token');

          const result = await authService.refreshToken('valid_token');
          expect(result).toHaveProperty('access');
      });

      it('should throw error if user not found', async () => {
          (jwt.verify as jest.Mock).mockReturnValue({ id: 1 });
          (User.findByPk as jest.Mock).mockResolvedValue(null);

          // The service catches the error and throws 'Invalid refresh token'
          await expect(authService.refreshToken('token')).rejects.toThrow('Invalid refresh token');
      });

      it('should throw error for invalid token', async () => {
          (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('Invalid') });
          await expect(authService.refreshToken('bad_token')).rejects.toThrow('Invalid refresh token');
      });
  });

  describe('resendOtp', () => {
      it('should resend OTP', async () => {
          (User.findOne as jest.Mock).mockResolvedValue({ email: 'test@test.com', is_verified: false });
          (Otp.destroy as jest.Mock).mockResolvedValue(1);
          (Otp.create as jest.Mock).mockResolvedValue({});
          
          await authService.resendOtp('test@test.com');
          expect(emailService.sendOtp).toHaveBeenCalled();
      });

      it('should throw error if user not found', async () => {
          (User.findOne as jest.Mock).mockResolvedValue(null);
          await expect(authService.resendOtp('test@test.com')).rejects.toThrow('User not found');
      });

      it('should throw error if user already verified', async () => {
          (User.findOne as jest.Mock).mockResolvedValue({ is_verified: true });
          await expect(authService.resendOtp('test@test.com')).rejects.toThrow('User already verified');
      });
  });
});