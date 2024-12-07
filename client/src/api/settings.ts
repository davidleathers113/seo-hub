import api from './api';

// Update User Profile
// PUT /settings/profile
// Request: { name: string, email: string }
// Response: { success: boolean, message: string }
export const updateProfile = (data: { name: string; email: string }) => {
  // Mock response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          success: true,
          message: "Profile updated successfully"
        }
      });
    }, 1000);
  });
};

// Change Password
// PUT /settings/password
// Request: { currentPassword: string, newPassword: string }
// Response: { success: boolean, message: string }
export const changePassword = (data: { currentPassword: string; newPassword: string }) => {
  // Mock response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          success: true,
          message: "Password changed successfully"
        }
      });
    }, 1000);
  });
};

// Update Settings
// PUT /settings
// Request: { [key: string]: any }
// Response: { success: boolean, message: string }
export const updateSettings = (data: { [key: string]: any }) => {
  // Mock response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          success: true,
          message: "Settings updated successfully"
        }
      });
    }, 1000);
  });
};

// Export User Data
// GET /settings/export
// Response: { data: any }
export const exportUserData = () => {
  // Mock response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          niches: [],
          pillars: [],
          articles: []
        }
      });
    }, 1000);
  });
};

// Delete Account
// DELETE /settings/account
// Response: { success: boolean, message: string }
export const deleteAccount = () => {
  // Mock response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          success: true,
          message: "Account deleted successfully"
        }
      });
    }, 1000);
  });
};