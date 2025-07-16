export default [
  // path: /api/redirect-manager/content/:contentType/:slug
  {
    method: 'GET',
    path: '/content/:contentType/:slug',
    handler: 'redirect.findContentBySlug',
    config: { auth: false, policies: [] },
  },

   // path: /api/redirect-manager/settings
  {
    method: 'GET',
    path: '/settings',
    handler: 'redirect.getSettings',
    config: { auth: false, policies: [] },
  },

  /**  
   * path: /api/redirect-manager/settings
   * 
   *   request body
   * 
   *    {
   *     "enabledContentTypes": {
   *     "api::article.article": { "enabled": true, "slugField": "slug" }
   *    }
   *   }
   * 
   */
  {
    method: 'POST',
    path: '/settings',
    handler: 'redirect.saveSettings',
    config: { auth: false, policies: [] },
  },

  // path: /api/redirect-manager/content-types
  {
    method: 'GET',
    path: '/content-types',
    handler: 'redirect.getContentTypes',
    config: { auth: false, policies: [] },
  },

  // path: /api/redirect-manager/redirect
  {
    method: 'GET',
    path: '/redirect',
    handler: 'redirect.getRedirect',
    config: { auth: false, policies: [] },
  },
];