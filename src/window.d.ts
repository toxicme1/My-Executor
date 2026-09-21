export {};

declare global {
  interface Window {
    executor: {
      run: (source: string) => Promise<{
        ok: boolean;
        output: string;
        error?: string;
      }>;
    };
  }
}
