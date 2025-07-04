// Type for the form-data module
export interface FormDataType {
  append(key: string, value: any, options?: any): void;
  getHeaders(): { [key: string]: string };
  getBuffer(): Buffer;
  getBoundary(): string;
  getLength(callback: (err: Error | null, length: number) => void): void;
  submit(url: string, callback: (err: Error | null, res: any) => void): void;
  pipe(to: any): void;
}

// ... rest of the types ... 