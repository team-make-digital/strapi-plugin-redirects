import { Core } from '@strapi/strapi';

export interface Settings {
  enabledContentTypes: {
    [key: string]: { enabled: boolean; slugField: string | null };
  };
}

export interface RedirectData {
  contentType: string;
  oldSlug: string;
  newSlug: string;
  redirectType: string;
  comment?: string;
}

export interface RedirectEntry {
  id: number;
  contentType: string;
  oldSlug: string;
  newSlug: string;
  redirectType: string;
  comment?: string;
}

export interface RedirectEntryCompact {
  oldSlug: string;
  newSlug: string;
  redirectType: string;
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async getSettings(): Promise<Settings> {
    const pluginStore = strapi.store({
      type: 'plugin',
      name: 'redirect-manager',
    });
    const settings = await pluginStore.get({ key: 'settings' });
    if (settings && typeof settings === 'object' && 'enabledContentTypes' in settings) {
      return settings as Settings;
    }
    return {
      enabledContentTypes: {},
    };
  },

  async saveSettings(settings: Settings): Promise<void> {
    const pluginStore = strapi.store({
      type: 'plugin',
      name: 'redirect-manager',
    });

    await pluginStore.set({
      key: 'settings',
      value: settings,
    });
  },

  async createRedirect(data: RedirectData): Promise<void> {
    await strapi.db.query('plugin::redirect-manager.redirect').create({ data });
  },

  async resolveRedirect(contentType: string, inputSlug: string): Promise<RedirectEntry | null> {
    let currentSlug = inputSlug;
    let redirect: RedirectEntry | null = null;
    const visitedSlugs = new Set<string>();

    while (true) {

      const [
        foundRedirect1,
        foundRedirect2,
        foundRedirect3,
        foundRedirect4,
      ] = await Promise.all([
        strapi.db.query('plugin::redirect-manager.redirect').findOne({
          where: { contentType, oldSlug: currentSlug },
        }),
        strapi.db.query('plugin::redirect-manager.redirect').findOne({
          where: { contentType, oldSlug: "/"+currentSlug },
        }),
        strapi.db.query('plugin::redirect-manager.redirect').findOne({
          where: { contentType, oldSlug: currentSlug+"/" },
        }),
        strapi.db.query('plugin::redirect-manager.redirect').findOne({
          where: { contentType, oldSlug: "/"+currentSlug+"/" },
        })
      ]);

      const foundRedirect = foundRedirect1 || foundRedirect2 || foundRedirect3 || foundRedirect4;

      if (!foundRedirect || visitedSlugs.has(foundRedirect.newSlug)) {
        break;
      }

      redirect = foundRedirect;
      currentSlug = foundRedirect.newSlug;
      visitedSlugs.add(currentSlug);
    }

    return redirect;
  },

  async getAllRedirects(): Promise<RedirectEntryCompact[]> {
    const entries = await strapi.db.query("plugin::redirect-manager.redirect").findMany({
      select: ["oldSlug", "newSlug", "redirectType"],
      limit: 500, // important: fetch ALL, not just 100
    });

    return entries
      .filter(entry => {
        return entry.oldSlug.split("/").filter(Boolean).length > 1;
      })
      .map(entry => ({
        oldSlug: entry.oldSlug,
        newSlug: entry.newSlug,
        redirectType: entry.redirectType,
      }));
  },

  // New method to fetch all content types and their fields
  async getContentTypes(): Promise<
    Array<{ uid: string; attributes: { [key: string]: { type: string } } }>
  > {
    const contentTypes = strapi.contentTypes;
    return Object.entries(contentTypes)
      .filter(([uid]) => uid.startsWith('api::'))
      .map(([uid, model]:any) => ({
        uid,
        attributes: model.attributes,
      }));
  },
});
