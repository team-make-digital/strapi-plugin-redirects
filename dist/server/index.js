"use strict";
const bootstrap = async ({ strapi: strapi2 }) => {
  const redirectService = strapi2.plugin("redirect-manager").service("redirect");
  strapi2.db.lifecycles.subscribe({
    async beforeUpdate(event) {
      const { model, params } = event;
      const uid = model.uid;
      if (!uid.startsWith("api::")) return;
      try {
        const settings = await redirectService.getSettings();
        const config2 = settings.enabledContentTypes?.[uid];
        if (!config2?.enabled || !config2.slugField) return;
        const prevEntry = await strapi2.db.query(uid).findOne({
          where: { id: params.where.id },
          select: [config2.slugField]
        });
        event.state = { oldSlug: prevEntry?.[config2.slugField] };
      } catch (error) {
        console.error(`Redirect Manager Error in beforeUpdate for ${uid}:`, error);
      }
    },
    async afterUpdate(event) {
      const { model, result, state } = event;
      const uid = model.uid;
      if (!uid.startsWith("api::")) return;
      const isDraftAndPublish = model.options?.draftAndPublish;
      const isPublished = !!result.publishedAt;
      if (isDraftAndPublish && !isPublished) return;
      try {
        const settings = await redirectService.getSettings();
        const config2 = settings.enabledContentTypes?.[uid];
        if (!config2?.enabled || !config2.slugField) return;
        const oldSlug = state?.oldSlug;
        const newSlug = result[config2.slugField];
        if (oldSlug && newSlug && oldSlug !== newSlug) {
          await strapi2.db.query("plugin::redirect-manager.redirect").deleteMany({
            where: {
              contentType: uid,
              oldSlug: newSlug
            }
          });
          await redirectService.createRedirect({
            contentType: uid,
            oldSlug,
            newSlug,
            redirectType: "301",
            comment: `Auto-created from ${oldSlug} to ${newSlug}`
          });
        }
      } catch (error) {
        console.error(`[Redirect Manager] Error in afterUpdate for ${uid}:`, error);
      }
    }
  });
};
const destroy = ({ strapi: strapi2 }) => {
};
const redirect$3 = [
  // path: /api/redirect-manager/content/:contentType/:slug
  {
    method: "GET",
    path: "/content/:contentType/:slug",
    handler: "redirect.findContentBySlug",
    config: { auth: false, policies: [] }
  },
  // path: /api/redirect-manager/settings
  {
    method: "GET",
    path: "/settings",
    handler: "redirect.getSettings",
    config: { auth: false, policies: [] }
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
    method: "POST",
    path: "/settings",
    handler: "redirect.saveSettings",
    config: { auth: false, policies: [] }
  },
  // path: /api/redirect-manager/content-types
  {
    method: "GET",
    path: "/content-types",
    handler: "redirect.getContentTypes",
    config: { auth: false, policies: [] }
  },
  // path: /api/redirect-manager/redirect
  {
    method: "GET",
    path: "/redirect",
    handler: "redirect.getRedirect",
    config: { auth: false, policies: [] }
  }
];
const register = ({ strapi: strapi2 }) => {
  console.log("📦 Registering Redirect Manager content-api routes");
  const plugin = strapi2.plugin("redirect-manager");
  if (!plugin.routes["content-api"]) {
    plugin.routes["content-api"] = {
      type: "content-api",
      routes: []
    };
  }
  plugin.routes["content-api"].routes.push(...redirect$3);
};
const config = {
  default: {},
  validator() {
  }
};
const redirect$2 = {
  kind: "collectionType",
  collectionName: "redirects",
  info: {
    singularName: "redirect",
    pluralName: "redirects",
    displayName: "Redirect"
  },
  options: {
    draftAndPublish: false,
    timestamps: true
  },
  attributes: {
    contentType: { type: "string", required: true },
    oldSlug: { type: "string", required: true },
    newSlug: { type: "string", required: true },
    redirectType: { type: "string", required: true, default: "301" },
    comment: { type: "text" }
  }
};
const contentTypes = {
  "redirect": {
    schema: redirect$2
  }
};
const controller = ({ strapi: strapi2 }) => ({
  index(ctx) {
    ctx.body = strapi2.plugin("redirect-manager").service("service").getWelcomeMessage();
  }
});
const typedStrapi = strapi;
const redirect$1 = {
  async getSettings(ctx) {
    try {
      const redirectService = typedStrapi.plugin("redirect-manager").service("redirect");
      const settings = await redirectService.getSettings();
      ctx.body = settings;
      ctx.send(settings);
    } catch (error) {
      console.error("Redirect Controller Error in getSettings:", error);
      ctx.internalServerError("An error occurred while fetching settings.");
    }
  },
  async saveSettings(ctx) {
    try {
      const { enabledContentTypes } = ctx.request.body;
      if (!enabledContentTypes || typeof enabledContentTypes !== "object") {
        ctx.badRequest("Invalid or missing enabledContentTypes in request body.");
        return;
      }
      const redirectService = typedStrapi.plugin("redirect-manager").service("redirect");
      await redirectService.saveSettings({ enabledContentTypes });
      ctx.body = { ok: true };
    } catch (error) {
      console.error("Redirect Controller Error in saveSettings:", error);
      ctx.internalServerError("An error occurred while saving settings.");
    }
  },
  async getContentTypes(ctx) {
    try {
      const redirectService = typedStrapi.plugin("redirect-manager").service("redirect");
      const contentTypes2 = await redirectService.getContentTypes();
      ctx.body = contentTypes2;
    } catch (error) {
      console.error("Redirect Controller Error in getContentTypes:", error);
      ctx.internalServerError("An error occurred while fetching content types.");
    }
  },
  async findContentBySlug(ctx) {
    const { contentType, slug } = ctx.params;
    if (!contentType || !slug) {
      return ctx.badRequest("Missing contentType or slug in parameters.");
    }
    try {
      const redirectService = typedStrapi.plugin("redirect-manager").service("redirect");
      const resolvedRedirect = await redirectService.resolveRedirect(contentType, slug);
      let finalSlug = slug;
      let redirectChainFollowed = false;
      if (resolvedRedirect) {
        finalSlug = resolvedRedirect.newSlug;
        redirectChainFollowed = true;
      } else {
        console.error(`Redirect Controller No redirect found for ${slug} in ${contentType}. Using input slug.`);
      }
      const settings = await redirectService.getSettings();
      const config2 = settings.enabledContentTypes?.[contentType];
      const slugField = config2?.slugField;
      if (!slugField) {
        return ctx.internalServerError(`Slug field not configured for content type: ${contentType}`);
      }
      const content = await typedStrapi.db.query(contentType).findOne({
        where: { [slugField]: finalSlug }
      });
      if (!content) {
        return ctx.notFound("Content not found for the resolved slug.");
      }
      const objectToSend = {
        from: slug,
        to: content.slug
      };
      ctx.send(objectToSend);
    } catch (error) {
      console.error(`Redirect Controller Error fetching content for slug ${slug} in ${contentType}:`, error);
      ctx.internalServerError("An error occurred while fetching content.");
    }
  },
  async getRedirect(ctx) {
    const { contentType, oldSlug } = ctx.query;
    if (!contentType || !oldSlug) {
      return ctx.badRequest("Missing contentType or oldSlug in query parameters.");
    }
    try {
      const redirectService = typedStrapi.plugin("redirect-manager").service("redirect");
      const redirect2 = await redirectService.resolveRedirect(contentType, oldSlug);
      if (!redirect2) {
        ctx.body = { data: null };
      } else {
        ctx.body = { data: redirect2 };
      }
    } catch (error) {
      console.error("Redirect Controller Error querying redirect:", error);
      ctx.internalServerError("Error querying redirect");
    }
  }
};
const controllers = {
  controller,
  redirect: redirect$1
};
const middlewares = {};
const policies = {};
const contentAPIRoutes = [
  {
    method: "GET",
    path: "/",
    // name of the controller file & the method.
    handler: "controller.index",
    config: {
      policies: []
    }
  }
];
const routes = {
  "content-api": {
    type: "content-api",
    routes: [...contentAPIRoutes, ...redirect$3]
  }
};
const service = ({ strapi: strapi2 }) => ({
  getWelcomeMessage() {
    return "Welcome to Strapi 🚀";
  }
});
const redirect = ({ strapi: strapi2 }) => ({
  async getSettings() {
    const pluginStore = strapi2.store({
      type: "plugin",
      name: "redirect-manager"
    });
    const settings = await pluginStore.get({ key: "settings" });
    if (settings && typeof settings === "object" && "enabledContentTypes" in settings) {
      return settings;
    }
    return {
      enabledContentTypes: {}
    };
  },
  async saveSettings(settings) {
    const pluginStore = strapi2.store({
      type: "plugin",
      name: "redirect-manager"
    });
    await pluginStore.set({
      key: "settings",
      value: settings
    });
  },
  async createRedirect(data) {
    await strapi2.db.query("plugin::redirect-manager.redirect").create({ data });
  },
  async resolveRedirect(contentType, inputSlug) {
    let currentSlug = inputSlug;
    let redirect2 = null;
    const visitedSlugs = /* @__PURE__ */ new Set();
    while (true) {
      const foundRedirect = await strapi2.db.query("plugin::redirect-manager.redirect").findOne({
        where: { contentType, oldSlug: currentSlug }
      });
      if (!foundRedirect || visitedSlugs.has(foundRedirect.newSlug)) {
        break;
      }
      redirect2 = foundRedirect;
      currentSlug = foundRedirect.newSlug;
      visitedSlugs.add(currentSlug);
    }
    return redirect2;
  },
  // New method to fetch all content types and their fields
  async getContentTypes() {
    const contentTypes2 = strapi2.contentTypes;
    return Object.entries(contentTypes2).filter(([uid]) => uid.startsWith("api::")).map(([uid, model]) => ({
      uid,
      attributes: model.attributes
    }));
  }
});
const services = {
  service,
  redirect
};
const index = {
  register,
  bootstrap,
  destroy,
  config,
  controllers,
  routes,
  services,
  contentTypes,
  policies,
  middlewares
};
module.exports = index;
