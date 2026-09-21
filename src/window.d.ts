export {};

declare global {
  interface Window {
    executor: {
      run: (source: string) => Promise<{
        ok: boolean;
        output: string;
        error?: string;
      }>;
      toggleFloating: () => Promise<boolean>;
      checkForUpdates: () => Promise<string>;
      onUpdateStatus: (callback: (status: string) => void) => void;
      onFloatingOutput: (callback: (result: unknown) => void) => void;
    };
  }
}
