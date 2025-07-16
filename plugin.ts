import pluginId from './admin/src/pluginId';
// import { Settings } from '@strapi/design-system';
// import { Settings } from '@strapi/design-system';

type TradOptions = Record<string, string>;

const prefixPluginTranslations = (
  trad: TradOptions,
  pluginId: string
): TradOptions => {
  if (!pluginId) {
    throw new TypeError("pluginId can't be empty");
  }
  return Object.keys(trad).reduce((acc, current) => {
    acc[`${pluginId}.${current}`] = trad[current];
    return acc;
  }, {} as TradOptions);
};

export default {
  register(app: any) {
    app.createSettingSection(
      {
        id: pluginId,
        intlLabel: {
          id: `${pluginId}.settings.section`,
          defaultMessage: 'Redirect Manager Settings',
        },
      },
      [
        {
          intlLabel: {
            id: `${pluginId}.settings.link`,
            defaultMessage: 'Configure Redirects',
          },
          id: 'redirect-manager-settings',
          to: `/settings/${pluginId}`,
          async Component() {
            const component = await import('./admin/src/pages/Settings');
            return component.default;
          },
          permissions: [],
        },
      ]
    );
  },

  bootstrap(app: any) {},

  async registerTrads({ locales }: { locales: string[] }) {
    const importedTrads = await Promise.all(
      locales.map((locale) =>
        import(`./admin/src/translations/${locale}.json`)
          .then(({ default: data }) => ({
            data: prefixPluginTranslations(data, pluginId),
            locale,
          }))
          .catch(() => ({
            data: {},
            locale,
          }))
      )
    );
    return Promise.resolve(importedTrads);
  },
};