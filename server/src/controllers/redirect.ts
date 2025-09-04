import type { Core } from '@strapi/strapi';
import { Context } from 'koa';
import { Settings, RedirectData, RedirectEntry, RedirectEntryCompact } from '../services/redirect';

interface RedirectService {
  getSettings(): Promise<Settings>;
  saveSettings(settings: Settings): Promise<void>;
  createRedirect(data: RedirectData): Promise<void>;
  resolveRedirect(contentType: string, inputSlug: string): Promise<RedirectEntry | null>;
  getAllRedirects(): Promise<RedirectEntryCompact[] | null>;
  getContentTypes(): Promise<
    Array<{ uid: string; attributes: { [key: string]: { type: string } } }>
  >;
}

const redirect: Core.Controller = {
  async getSettings(ctx: Context) {
    try {
      const redirectService = strapi.plugin('redirect-manager').service('redirect') as RedirectService;
      const settings = await redirectService.getSettings();
      ctx.send(settings);
    } catch (error) {
      console.error('Redirect Controller Error in getSettings:', error);
      ctx.internalServerError('An error occurred while fetching settings.');
    }
  },

  async saveSettings(ctx: Context) {
    try {
      const { enabledContentTypes } = ctx.request.body;
      if (!enabledContentTypes || typeof enabledContentTypes !== 'object') {
        return ctx.badRequest('Invalid or missing enabledContentTypes in request body.');
      }
      const redirectService = strapi.plugin('redirect-manager').service('redirect') as RedirectService;
      await redirectService.saveSettings({ enabledContentTypes });
      ctx.body = { ok: true };
    } catch (error) {
      console.error('Redirect Controller Error in saveSettings:', error);
      ctx.internalServerError('An error occurred while saving settings.');
    }
  },

  async getContentTypes(ctx: Context) {
    try {
      const redirectService = strapi.plugin('redirect-manager').service('redirect') as RedirectService;
      ctx.body = await redirectService.getContentTypes();
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
      const redirectService = strapi.plugin('redirect-manager').service('redirect') as RedirectService;
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
        return ctx.internalServerError(`Slug field not configured for ${contentType}`);
      }

      const content = await strapi.db.query(contentType).findOne({
        where: { [slugField]: finalSlug },
      });

      if (!content) return ctx.notFound('Content not found');

      ctx.send({ from: slug, to: content.slug });
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
      const redirectService = strapi.plugin('redirect-manager').service('redirect') as RedirectService;
      ctx.body = { data: await redirectService.resolveRedirect(contentType, oldSlug) ?? null };
    } catch (error) {
      console.error('Redirect Controller Error querying redirect:', error);
      ctx.internalServerError('Error querying redirect');
    }
  },

  async getAllRedirect(ctx: Context) {

    try {
      const redirectService = strapi.plugin('redirect-manager').service('redirect') as RedirectService;
      ctx.body = { data: await redirectService.getAllRedirects() ?? null };
    } catch (error) {
      console.error('Redirect Controller Error querying redirect:', error);
      ctx.internalServerError('Error querying redirect');
    }
  },

  async createRedirect(ctx: Context) {
    const { data } = ctx.request.body;
    console.log({
      data
    });
    const redirectService = strapi.plugin('redirect-manager').service('redirect') as RedirectService;
    await redirectService.createRedirect(data)
    ctx.body = { data: "Created" };
  },
};

export default redirect;
