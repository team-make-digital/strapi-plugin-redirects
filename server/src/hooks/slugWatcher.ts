// import { Core } from '@strapi/strapi';

// export default (strapi: Core.Strapi) => {
//   return {
//     async beforeUpdate(event) {
//       const { model, params } = event;
//       const contentTypeUID = model.uid;

//       // Load plugin settings
//       const pluginStore = strapi.plugin('redirect-manager').store({ type: 'plugin' });
//       const settings = await pluginStore.get({ key: 'settings' });

//       const tracked = settings?.enabledContentTypes?.[contentTypeUID];
//       if (!tracked || !tracked.enabled || !tracked.slugField) return;

//       const slugField = tracked.slugField;
//       const entryId = params.where?.id;
//       if (!entryId) return;

//       // Get previous data
//       const previous = await strapi.entityService.findOne(contentTypeUID, entryId, { fields: [slugField] });
//       const newSlug = params.data?.[slugField];

//       if (previous?.[slugField] && newSlug && previous[slugField] !== newSlug) {
//         strapi.log.info(`Slug changed for ${contentTypeUID}:${entryId} from "${previous[slugField]}" to "${newSlug}"`);

//         await strapi.entityService.create('plugin::redirect-manager.redirect', {
//           data: {
//             contentType: contentTypeUID,
//             oldSlug: previous[slugField],
//             newSlug: newSlug,
//             redirectType: '301',
//             comment: `Auto-generated on slug change`,
//           },
//         });
//       }
//     },
//   };
// };
