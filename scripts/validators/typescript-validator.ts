import { ValidationResult } from '../types';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Main Validation Function
export async function validate(directory: string): Promise<ValidationResult> {
  try {
    await execAsync(`tsc --noEmit --project ${directory}/tsconfig.json`);
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  } catch (error: any) {
    const errorOutput = error.stdout as string;
    const errors = parseTypeScriptErrors(errorOutput);

    return {
      isValid: false,
      errors,
      warnings: []
    };
  }
}

// Helper Functions
function parseTypeScriptErrors(output: string) {
  return output
    .split('\n')
    .filter(line => line.includes('error TS'))
    .map(line => {
      const [file, lineInfo, ...message] = line.split(':');
      const lineNumber = parseInt(lineInfo, 10) || 0;

      return {
        file: file.trim(),
        line: lineNumber,
        message: message.join(':').trim(),
        severity: 'error' as const,
        code: 'TS001'
      };
    });
}