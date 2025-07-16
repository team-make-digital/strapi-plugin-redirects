import { Context } from 'koa';
import { Core } from '@strapi/strapi';
import { Settings, RedirectData, RedirectEntry } from '../services/redirect';

interface RedirectService {
  getSettings(): Promise<Settings>;
  saveSettings(settings: Settings): Promise<void>;
  createRedirect(data: RedirectData): Promise<void>;
  resolveRedirect(contentType: string, inputSlug: string): Promise<RedirectEntry | null>;
  getContentTypes(): Promise<
    Array<{ uid: string; attributes: { [key: string]: { type: string } } }>
  >;
}

const typedStrapi = strapi as Core.Strapi;

export default {
  async getSettings(ctx: Context) {
    try {
      const redirectService = typedStrapi.plugin('redirect-manager').service('redirect') as RedirectService;
      const settings = await redirectService.getSettings();
      ctx.body = settings;
      ctx.send(settings)
    } catch (error) {
      console.error('Redirect Controller Error in getSettings:', error);
      ctx.internalServerError('An error occurred while fetching settings.');
    }
  },

  async saveSettings(ctx: Context) {
    try {
      const { enabledContentTypes } = ctx.request.body as Settings;
      if (!enabledContentTypes || typeof enabledContentTypes !== 'object') {
        ctx.badRequest('Invalid or missing enabledContentTypes in request body.');
        return;
      }
      const redirectService = typedStrapi.plugin('redirect-manager').service('redirect') as RedirectService;
      await redirectService.saveSettings({ enabledContentTypes });
      ctx.body = { ok: true };
    } catch (error) {
      console.error('Redirect Controller Error in saveSettings:', error);
      ctx.internalServerError('An error occurred while saving settings.');
    }
  },

  async getContentTypes(ctx: Context) {
    try {
      const redirectService = typedStrapi.plugin('redirect-manager').service('redirect') as RedirectService;
      const contentTypes = await redirectService.getContentTypes();
      ctx.body = contentTypes;
    } catch (error) {
      console.error('Redirect Controller Error in getContentTypes:', error);
      ctx.internalServerError('An error occurred while fetching content types.');
    }
  },

  async findContentBySlug(ctx: Context) {
    const { contentType, slug } = ctx.params as { contentType?: string; slug?: string };

    if (!contentType || !slug) {
      return ctx.badRequest('Missing contentType or slug in parameters.');
    }

    try {
      const redirectService = typedStrapi.plugin('redirect-manager').service('redirect') as RedirectService;
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
      const config = settings.enabledContentTypes?.[contentType];
      const slugField = config?.slugField;

      if (!slugField) {
        return ctx.internalServerError(`Slug field not configured for content type: ${contentType}`);
      }

      const content = await typedStrapi.db.query(contentType).findOne({
        where: { [slugField]: finalSlug },
      });

      if (!content) {
        return ctx.notFound('Content not found for the resolved slug.');
      }

      const objectToSend = {
        from : slug,
        to : content.slug
      }
      ctx.send(objectToSend);
    } catch (error) {
      console.error(`Redirect Controller Error fetching content for slug ${slug} in ${contentType}:`, error);
      ctx.internalServerError('An error occurred while fetching content.');
    }
  },

  async getRedirect(ctx: Context) {
    const { contentType, oldSlug } = ctx.query as { contentType?: string; oldSlug?: string };

    if (!contentType || !oldSlug) {
      return ctx.badRequest('Missing contentType or oldSlug in query parameters.');
    }
    try {
      const redirectService = typedStrapi.plugin('redirect-manager').service('redirect') as RedirectService;
      const redirect = await redirectService.resolveRedirect(contentType, oldSlug);
      if (!redirect) {
        ctx.body = { data: null };
      } else {
        ctx.body = { data: redirect };
      }
    } catch (error) {
      console.error('Redirect Controller Error querying redirect:', error);
      ctx.internalServerError('Error querying redirect');
    }
  },
};
