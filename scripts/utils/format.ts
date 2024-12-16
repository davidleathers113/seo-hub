import { ValidationError } from '../types';

export function formatValidationOutput(errors: ValidationError[], warnings: ValidationError[]): void {
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ No validation issues found');
    return;
  }

  if (errors.length > 0) {
    console.log('\n❌ Validation errors:');
    errors.forEach(error => {
      console.log(`[${error.code}] ${error.file}:${error.line} - ${error.message}`);
    });
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  Validation warnings:');
    warnings.forEach(warning => {
      console.log(`[${warning.code}] ${warning.file}:${warning.line} - ${warning.message}`);
    });
  }
}