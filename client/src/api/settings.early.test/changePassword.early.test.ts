
// Unit tests for: changePassword


import { changePassword } from '../settings';


describe('changePassword() changePassword method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should resolve with success message when valid current and new passwords are provided', async () => {
      // Arrange
      const data = { currentPassword: 'oldPassword123', newPassword: 'newPassword123' };

      // Act
      const response = await changePassword(data);

      // Assert
      expect(response.data.success).toBe(true);
      expect(response.data.message).toBe('Password changed successfully');
    });

    it('should handle different valid password inputs correctly', async () => {
      // Arrange
      const data = { currentPassword: 'password1', newPassword: 'password2' };

      // Act
      const response = await changePassword(data);

      // Assert
      expect(response.data.success).toBe(true);
      expect(response.data.message).toBe('Password changed successfully');
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle empty currentPassword gracefully', async () => {
      // Arrange
      const data = { currentPassword: '', newPassword: 'newPassword123' };

      // Act
      const response = await changePassword(data);

      // Assert
      expect(response.data.success).toBe(true);
      expect(response.data.message).toBe('Password changed successfully');
    });

    it('should handle empty newPassword gracefully', async () => {
      // Arrange
      const data = { currentPassword: 'oldPassword123', newPassword: '' };

      // Act
      const response = await changePassword(data);

      // Assert
      expect(response.data.success).toBe(true);
      expect(response.data.message).toBe('Password changed successfully');
    });

    it('should handle both passwords being empty', async () => {
      // Arrange
      const data = { currentPassword: '', newPassword: '' };

      // Act
      const response = await changePassword(data);

      // Assert
      expect(response.data.success).toBe(true);
      expect(response.data.message).toBe('Password changed successfully');
    });

    it('should handle very long passwords', async () => {
      // Arrange
      const longPassword = 'a'.repeat(1000);
      const data = { currentPassword: longPassword, newPassword: longPassword };

      // Act
      const response = await changePassword(data);

      // Assert
      expect(response.data.success).toBe(true);
      expect(response.data.message).toBe('Password changed successfully');
    });
  });
});

// End of unit tests for: changePassword
