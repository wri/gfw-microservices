const jitter = (delay = 200) => delay * (0.5 + Math.random());

const deduceAdminBackoff = (promise, max, delay, resolve, reject) => {
  promise
    .then((response) => {
      if (response.hasOwnProperty('features') && response.features.length) {
        const [feature] = response.features;
        const { name_0, name_1, name_2, gadmid } = feature.attributes;
        resolve({
          gadmid,
          Country: name_0,
          State: name_1,
          'Sub State': name_2,
        });
      } else {
        resolve({
          gadmid: 'None',
          Country: 'None',
          State: 'None',
          'Sub State': 'None',
        });
      }
    })
    .catch((err) => {
      if (max > 0) {
        console.log('retrying...', err);
        setTimeout(() => {
          deduceAdminBackoff(promise, --max, jitter(delay * 2), resolve, reject);
        }, delay);
      } else {
        resolve({
          gadmid: 'None',
          Country: 'None',
          State: 'None',
          'Sub State': 'None',
        });
      }
    });
};

module.exports = {
  deduceAdminBackoff,
};
