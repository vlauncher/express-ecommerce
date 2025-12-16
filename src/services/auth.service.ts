import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, Otp } from '../models';
import { emailService } from './email.service';
import { Op } from 'sequelize';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const OTP_EXPIRY_MINUTES = 10;

export class AuthService {
  
  async register(userData: any) {
    const { first_name, last_name, email, password } = userData;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      is_verified: false,
      role: 'CUSTOMER', // Default role for new registrations
    });

    await this.generateAndSendOtp(user.email);

    return { message: 'User registered. Please check your email for verification OTP.' };
  }

  async verifyOtp(email: string, otpCode: string) {
    const otpRecord = await Otp.findOne({
      where: {
        email,
        otp: otpCode,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!otpRecord) {
      throw new Error('Invalid or expired OTP');
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    user.is_verified = true;
    await user.save();
    
    // Delete OTP after successful verification
    await otpRecord.destroy();

    // Generate tokens immediately after verification? 
    // Usually we ask them to login, but returning tokens here is nice UX.
    // I'll return tokens.
    return this.generateTokens(user);
  }

  async login(credentials: any) {
    const { email, password } = credentials;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.is_verified) {
        // Optionally resend OTP here if you want
        // await this.generateAndSendOtp(email);
        throw new Error('Account not verified. Please verify your email.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async refreshToken(token: string) {
    try {
      const decoded: any = jwt.verify(token, JWT_REFRESH_SECRET);
      const user = await User.findByPk(decoded.id);

      if (!user) {
        throw new Error('User not found');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async resendOtp(email: string) {
      const user = await User.findOne({ where: { email } });
      if (!user) {
          throw new Error('User not found');
      }
      if (user.is_verified) {
          throw new Error('User already verified');
      }
      await this.generateAndSendOtp(email);
      return { message: 'OTP resent' };
  }

  private async generateAndSendOtp(email: string) {
    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);

    // Remove existing OTPs for this email
    await Otp.destroy({ where: { email } });

    await Otp.create({
      email,
      otp,
      expiresAt,
    });

    await emailService.sendOtp(email, otp);
  }

  private generateTokens(user: User) {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    return { access: accessToken, refresh: refreshToken };
  }
}

export const authService = new AuthService();
