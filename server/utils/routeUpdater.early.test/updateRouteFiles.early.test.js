
// Unit tests for: updateRouteFiles




const { updateRouteFiles } = require('../routeUpdater');
const fs = require('fs').promises;
const path = require('path');
jest.mock("fs", () => ({
  promises: {
    writeFile: jest.fn(),
    chmod: jest.fn(),
  },
}));

describe('updateRouteFiles() updateRouteFiles method', () => {
  const serverDir = path.join(__dirname, '..');
  const routesDir = path.join(serverDir, 'routes');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy paths', () => {
    it('should successfully write the subpillars.js file', async () => {
      // Test that the subpillars.js file is written correctly
      await updateRouteFiles();
      expect(fs.writeFile).toHaveBeenCalledWith(expect.stringContaining('subpillars.js'), expect.any(String));
    });

    it('should successfully write the updateRoutes.js script', async () => {
      // Test that the updateRoutes.js script is written correctly
      await updateRouteFiles();
      expect(fs.writeFile).toHaveBeenCalledWith(expect.stringContaining('updateRoutes.js'), expect.any(String));
    });

    it('should set the correct permissions for the updateRoutes.js script', async () => {
      // Test that the updateRoutes.js script has the correct permissions set
      await updateRouteFiles();
      expect(fs.chmod).toHaveBeenCalledWith(expect.stringContaining('updateRoutes.js'), 0o755);
    });

    it('should log success message when route files are updated successfully', async () => {
      // Test that a success message is logged when the route files are updated
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      await updateRouteFiles();
      expect(consoleLogSpy).toHaveBeenCalledWith('Successfully created route updater utility');
      consoleLogSpy.mockRestore();
    });
  });

  describe('Edge cases', () => {
    it('should throw an error if writing subpillars.js fails', async () => {
      // Test that an error is thrown if writing subpillars.js fails
      fs.writeFile.mockRejectedValueOnce(new Error('Failed to write subpillars.js'));
      await expect(updateRouteFiles()).rejects.toThrow('Failed to write subpillars.js');
    });

    it('should throw an error if writing updateRoutes.js fails', async () => {
      // Test that an error is thrown if writing updateRoutes.js fails
      fs.writeFile.mockImplementationOnce((filePath) => {
        if (filePath.includes('updateRoutes.js')) {
          return Promise.reject(new Error('Failed to write updateRoutes.js'));
        }
        return Promise.resolve();
      });
      await expect(updateRouteFiles()).rejects.toThrow('Failed to write updateRoutes.js');
    });

    it('should throw an error if setting permissions for updateRoutes.js fails', async () => {
      // Test that an error is thrown if setting permissions for updateRoutes.js fails
      fs.chmod.mockRejectedValueOnce(new Error('Failed to set permissions'));
      await expect(updateRouteFiles()).rejects.toThrow('Failed to set permissions');
    });

    it('should log error message when route files update fails', async () => {
      // Test that an error message is logged when the route files update fails
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      fs.writeFile.mockRejectedValueOnce(new Error('Write error'));
      await expect(updateRouteFiles()).rejects.toThrow('Write error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to update route files:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });
});

// End of unit tests for: updateRouteFiles
