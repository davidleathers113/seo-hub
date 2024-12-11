import 'jest';

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveBeenCalled(): R;
      toHaveBeenCalledWith(...args: any[]): R;
      toEqual(expected: any): R;
      toBe(expected: any): R;
      toBeInstanceOf(constructor: Function): R;
      toMatchObject(expected: any): R;
      toContainEqual(expected: any): R;
      toBeGreaterThan(expected: number): R;
      toBeLessThan(expected: number): R;
      toHaveBeenCalledTimes(count: number): R;
    }

    interface Expect {
      any(constructor: any): any;
      stringMatching(expected: string | RegExp): any;
      objectContaining(expected: object): any;
      arrayContaining<T>(arr: Array<T>): any;
    }
  }
}