import { SecurityHeaderMiddleware } from './security-header.middleware';

describe('SecurityHeaderMiddleware', () => {
  it('sets valid browser security headers', () => {
    const middleware = new SecurityHeaderMiddleware();
    const setHeader = jest.fn();
    const next = jest.fn();

    middleware.use({} as never, { setHeader } as never, next);

    expect(setHeader).toHaveBeenCalledWith('X-XSS-Protection', '0');
    expect(setHeader).toHaveBeenCalledWith(
      'Content-Security-Policy',
      "default-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'self'"
    );
    expect(setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
    expect(next).toHaveBeenCalledTimes(1);
  });
});