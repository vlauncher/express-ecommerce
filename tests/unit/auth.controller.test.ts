import { AuthController } from '../../src/controllers/auth.controller';
import { authService } from '../../src/services/auth.service';
import { Request, Response } from 'express';

jest.mock('../../src/services/auth.service');

describe('AuthController', () => {
  let authController: AuthController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;

  beforeEach(() => {
    authController = new AuthController();
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    res = { status, json };
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register successfully', async () => {
      req = { body: { email: 'test' } };
      (authService.register as jest.Mock).mockResolvedValue({ message: 'Success' });

      await authController.register(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith({ message: 'Success' });
    });

    it('should handle error', async () => {
      req = { body: {} };
      (authService.register as jest.Mock).mockRejectedValue(new Error('Fail'));

      await authController.register(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({ error: 'Fail' });
    });
  });

  describe('verifyOtp', () => {
    it('should verify otp', async () => {
      req = { body: { email: 't', otp: '1' } };
      (authService.verifyOtp as jest.Mock).mockResolvedValue({});

      await authController.verifyOtp(req as Request, res as Response);

      expect(json).toHaveBeenCalled();
    });

    it('should handle error', async () => {
      (authService.verifyOtp as jest.Mock).mockRejectedValue(new Error('Fail'));
      await authController.verifyOtp({ body: {} } as Request, res as Response);
      expect(status).toHaveBeenCalledWith(400);
    });
  });

  describe('login', () => {
      it('should login', async () => {
          (authService.login as jest.Mock).mockResolvedValue({});
          await authController.login({ body: {} } as Request, res as Response);
          expect(json).toHaveBeenCalled();
      });

      it('should handle error', async () => {
          (authService.login as jest.Mock).mockRejectedValue(new Error('Fail'));
          await authController.login({ body: {} } as Request, res as Response);
          expect(status).toHaveBeenCalledWith(401);
      });
  });

  describe('refreshToken', () => {
      it('should refresh', async () => {
          req = { body: { refresh_token: 't' } };
          (authService.refreshToken as jest.Mock).mockResolvedValue({});
          await authController.refreshToken(req as Request, res as Response);
          expect(json).toHaveBeenCalled();
      });

      it('should fail if no token', async () => {
          req = { body: {} };
          await authController.refreshToken(req as Request, res as Response);
          expect(status).toHaveBeenCalledWith(400);
      });

      it('should handle service error', async () => {
          req = { body: { refresh_token: 't' } };
          (authService.refreshToken as jest.Mock).mockRejectedValue(new Error('Fail'));
          await authController.refreshToken(req as Request, res as Response);
          expect(status).toHaveBeenCalledWith(401);
      });
  });

  describe('resendOtp', () => {
      it('should resend', async () => {
          (authService.resendOtp as jest.Mock).mockResolvedValue({});
          await authController.resendOtp({ body: { email: 't' } } as Request, res as Response);
          expect(json).toHaveBeenCalled();
      });

      it('should handle error', async () => {
          (authService.resendOtp as jest.Mock).mockRejectedValue(new Error('Fail'));
          await authController.resendOtp({ body: {} } as Request, res as Response);
          expect(status).toHaveBeenCalledWith(400);
      });
  });
});
