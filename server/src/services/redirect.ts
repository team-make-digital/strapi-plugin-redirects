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
      const foundRedirect = await strapi.db.query('plugin::redirect-manager.redirect').findOne({
        where: { contentType, oldSlug: currentSlug },
      });

      if (!foundRedirect || visitedSlugs.has(foundRedirect.newSlug)) {
        break;
      }

      redirect = foundRedirect;
      currentSlug = foundRedirect.newSlug;
      visitedSlugs.add(currentSlug);
    }

    return redirect;
  },

  // New method to fetch all content types and their fields
  async getContentTypes(): Promise<
    Array<{ uid: string; attributes: { [key: string]: { type: string } } }>
  > {
    const contentTypes = strapi.contentTypes;
    return Object.entries(contentTypes)
      .filter(([uid]) => uid.startsWith('api::'))
      .map(([uid, model]) => ({
        uid,
        attributes: model.attributes,
      }));
  },
});