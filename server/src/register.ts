import { Core } from '@strapi/strapi';
import redirectRoutes from './routes/redirect';

export default ({ strapi }: { strapi: Core.Strapi }) => {
  console.log('📦 Registering Redirect Manager content-api routes');

  const plugin = strapi.plugin('redirect-manager');

  // Make sure content-api section exists
  if (!plugin.routes['content-api']) {
    plugin.routes['content-api'] = {
      type: 'content-api',
      routes: [],
    };
  }

  plugin.routes['content-api'].routes.push(...redirectRoutes);
};
