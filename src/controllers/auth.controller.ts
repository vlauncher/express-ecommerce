import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export class AuthController {
  
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      const result = await authService.verifyOtp(email, otp);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refresh_token } = req.body;
      if (!refresh_token) {
        res.status(400).json({ error: 'Refresh token required' });
        return;
      }
      const result = await authService.refreshToken(refresh_token);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
  
  async resendOtp(req: Request, res: Response) {
      try {
          const { email } = req.body;
          const result = await authService.resendOtp(email);
          res.json(result);
      } catch (error: any) {
          res.status(400).json({ error: error.message });
      }
  }
}

export const authController = new AuthController();
