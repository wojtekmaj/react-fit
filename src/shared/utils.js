/**
 * Checks whether we're running on a production build or not.
 */
export const isProduction = process.env.NODE_ENV === 'production';

const consoleOnDev = (method, ...message) => {
  if (!isProduction) {
    // eslint-disable-next-line no-console
    console[method](...message);
  }
};

export const warnOnDev = (...message) => consoleOnDev('warn', ...message);
