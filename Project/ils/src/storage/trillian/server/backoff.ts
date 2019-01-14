export type BackoffOptions = {
  min: number;
  max: number;
  factor: number;
  jitter: boolean;
  timeout: number;
};

export const Backoff = <T>(
  options: BackoffOptions,
  operation: () => Promise<T>
): Promise<void> => {
  const settings = { delta: 0, start: Date.now(), ...options };
  return new Promise<void>((resolve, reject) =>
    runBackoff(settings, operation, resolve, reject)
  );
};

const runBackoff = <T>(
  settings: BackoffOptions & { delta: number; start: number },
  operation: () => Promise<T>,
  resolve: () => void,
  reject: (err: Error) => void
) => {
  operation()
    .then(_ => resolve())
    .catch(e => {
      if (Date.now() > settings.start + settings.timeout) {
        reject(e);
        return;
      }

      const base = settings.min + settings.delta;
      let pause = base;

      if (settings.jitter) {
        pause += Math.random() * pause;
      }

      let nextPause = base * settings.factor;

      if (nextPause > settings.max || nextPause < settings.min) {
        nextPause = settings.max;
      }

      settings.delta = nextPause - settings.min;

      setTimeout(() => runBackoff(settings, operation, resolve, reject), pause);
    });
};
