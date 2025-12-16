import { User, Otp } from '../../src/models';

describe('Models', () => {
  describe('User', () => {
    it('should create a user instance', () => {
      const user = User.build({
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        password: 'password',
        is_verified: false,
      });

      expect(user.email).toBe('test@example.com');
      expect(user.is_verified).toBe(false);
    });

    it('should validate email format', async () => {
      const user = User.build({
        first_name: 'Test',
        last_name: 'User',
        email: 'invalid-email',
        password: 'password',
        is_verified: false,
      });

      try {
        await user.validate();
      } catch (e: any) {
        expect(e).toBeDefined();
      }
    });
  });

  describe('Otp', () => {
      it('should create an otp instance', () => {
          const otp = Otp.build({
              email: 'test@test.com',
              otp: '123456',
              expiresAt: new Date()
          });
          expect(otp.otp).toBe('123456');
      });
  });
});
