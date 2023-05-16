
/**
* @function useRateLimiter
* @summary Checks if the rate Limiter should be used.
* @return {Boolean} True if you can, false otherwise.
*/
const useRateLimiter = () => {
  if ((process.env.NODE_ENV !== 'development') && (process.env.NODE_ENV !== 'qa') && (process.env.NODE_ENV !== 'test')) {
    return true;
  } else {
    return false;
  }
}

module.exports = {
  useRateLimiter
}
