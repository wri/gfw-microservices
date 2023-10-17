import { getJestProjects } from '@nrwl/jest';

export default {
  projects: getJestProjects(),
  resolver: `${__dirname}/tests/common/resolver.js`,
};
