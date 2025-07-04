declare module 'form-data' {
  class FormData {
    constructor();
    append(key: string, value: any, options?: any): void;
    getHeaders(): { [key: string]: string };
    getBuffer(): Buffer;
    getBoundary(): string;
    getLength(callback: (err: Error | null, length: number) => void): void;
    submit(url: string, callback: (err: Error | null, res: any) => void): void;
    pipe(to: any): void;
  }
  export = FormData;
} 