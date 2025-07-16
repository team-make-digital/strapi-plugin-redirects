import { Core } from '@strapi/strapi';

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  const redirectService = strapi.plugin('redirect-manager').service('redirect');

  strapi.db.lifecycles.subscribe({
    async beforeUpdate(event) {
      const { model, params } = event as any;
      const uid = model.uid;

      if (!uid.startsWith('api::')) return;

      try {
        const settings = await redirectService.getSettings();
        const config = settings.enabledContentTypes?.[uid];
        if (!config?.enabled || !config.slugField) return;

        const prevEntry = await strapi.db.query(uid).findOne({
          where: { id: params.where.id },
          select: [config.slugField],
        });

        event.state = { oldSlug: prevEntry?.[config.slugField] };
      } catch (error) {
        console.error(`Redirect Manager Error in beforeUpdate for ${uid}:`, error);
      }
    },

    async afterUpdate(event) {
      const { model, result, state } = event as any;
      const uid = model.uid;

      if (!uid.startsWith('api::')) return;

      const isDraftAndPublish = model.options?.draftAndPublish;
      const isPublished = !!result.publishedAt;
      if (isDraftAndPublish && !isPublished) return;

      try {
        const settings = await redirectService.getSettings();
        const config = settings.enabledContentTypes?.[uid];
        if (!config?.enabled || !config.slugField) return;

        const oldSlug = state?.oldSlug;
        const newSlug = result[config.slugField];

        if (oldSlug && newSlug && oldSlug !== newSlug) {
          // Remove reverse redirects to avoid loops
          await strapi.db.query('plugin::redirect-manager.redirect').deleteMany({
            where: {
              contentType: uid,
              oldSlug: newSlug,
            },
          });

          // Create new redirect entry
          await redirectService.createRedirect({
            contentType: uid,
            oldSlug,
            newSlug,
            redirectType: '301',
            comment: `Auto-created from ${oldSlug} to ${newSlug}`,
          });
        }
      } catch (error) {
        console.error(`[Redirect Manager] Error in afterUpdate for ${uid}:`, error);
      }
    },
  });
};