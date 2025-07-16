import contentAPIRoutes from './content-api';
import redirect from './redirect';

const routes = {
  'content-api': {
    type: 'content-api',
    routes: [...contentAPIRoutes, ...redirect],
  },
};

export default routes;
