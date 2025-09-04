declare const _default: {
    service: ({ strapi }: {
        strapi: import("@strapi/types/dist/core").Strapi;
    }) => {
        getWelcomeMessage(): string;
    };
    redirect: ({ strapi }: {
        strapi: import("@strapi/types/dist/core").Strapi;
    }) => {
        getSettings(): Promise<import("./redirect").Settings>;
        saveSettings(settings: import("./redirect").Settings): Promise<void>;
        createRedirect(data: import("./redirect").RedirectData): Promise<void>;
        resolveRedirect(contentType: string, inputSlug: string): Promise<import("./redirect").RedirectEntry>;
        getAllRedirects(): Promise<import("./redirect").RedirectEntryCompact[]>;
        getContentTypes(): Promise<{
            uid: string;
            attributes: {
                [key: string]: {
                    type: string;
                };
            };
        }[]>;
    };
};
export default _default;
