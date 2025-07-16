import { Core } from '@strapi/strapi';
export interface Settings {
    enabledContentTypes: {
        [key: string]: {
            enabled: boolean;
            slugField: string | null;
        };
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
declare const _default: ({ strapi }: {
    strapi: Core.Strapi;
}) => {
    getSettings(): Promise<Settings>;
    saveSettings(settings: Settings): Promise<void>;
    createRedirect(data: RedirectData): Promise<void>;
    resolveRedirect(contentType: string, inputSlug: string): Promise<RedirectEntry | null>;
    getContentTypes(): Promise<Array<{
        uid: string;
        attributes: {
            [key: string]: {
                type: string;
            };
        };
    }>>;
};
export default _default;
