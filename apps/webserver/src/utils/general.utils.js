const featureFlags = JSON.parse(sessionStorage.getItem('featureFlags') || '{}');

export default featureFlags;
