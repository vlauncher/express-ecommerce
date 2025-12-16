import request from 'supertest';
import app from '../../src/app';
import { User, Otp } from '../../src/models';
import transporter from '../../src/utils/email';

// Mock email transporter
jest.mock('../../src/utils/email', () => ({
  sendMail: jest.fn().mockResolvedValue('OK'),
}));

describe('Auth Integration', () => {
  beforeEach(async () => {
    await User.destroy({ where: {}, truncate: true });
    await Otp.destroy({ where: {}, truncate: true });
    jest.clearAllMocks();
  });

  const userData = {
    first_name: 'Test',
    last_name: 'User',
    email: 'integration@test.com',
    password: 'Password123!',
  };

  it('should register, verify, login, refresh, and resend otp', async () => {
    // 1. Register
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send(userData);
    
    expect(registerRes.status).toBe(201);
    expect(transporter.sendMail).toHaveBeenCalled();

    // Get OTP from DB (since we can't easily parse it from the mock call in integration without more complex setup)
    const otpRecord = await Otp.findOne({ where: { email: userData.email } });
    expect(otpRecord).not.toBeNull();
    const otpCode = otpRecord!.otp;

    // 2. Verify OTP
    const verifyRes = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({ email: userData.email, otp: otpCode });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body).toHaveProperty('access');
    expect(verifyRes.body).toHaveProperty('refresh');

    // 3. Login
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: userData.email, password: userData.password });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('access');

    // 4. Refresh Token
    const refreshToken = loginRes.body.refresh;
    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh-token')
      .send({ refresh_token: refreshToken });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body).toHaveProperty('access');

    // 5. Resend OTP (should fail if already verified, so let's reset verification to test it, or test failure)
    // Testing failure case for verified user
    const resendRes = await request(app)
        .post('/api/v1/auth/resend-otp')
        .send({ email: userData.email });
    expect(resendRes.status).toBe(400); // User already verified

    // Create unverified user for Resend OTP success
    const user2 = { ...userData, email: 'resend@test.com' };
    await request(app).post('/api/v1/auth/register').send(user2);
    
    const resendSuccess = await request(app)
        .post('/api/v1/auth/resend-otp')
        .send({ email: user2.email });
    
    expect(resendSuccess.status).toBe(200);
  });

  it('should fail login for unverified user', async () => {
    await request(app).post('/api/v1/auth/register').send(userData);
    
    const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: userData.email, password: userData.password });
    
    expect(res.status).toBe(401); // 401 because error thrown in service is caught and mapped to 401 in controller for login
    // Actually controller maps login error to 401. Service throws "Account not verified".
  });
});
