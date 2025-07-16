/// <reference types="koa" />
declare const _default: {
    register: ({ strapi }: {
        strapi: import("@strapi/types/dist/core").Strapi; /**
         * Plugin server methods
         */
    }) => void;
    bootstrap: ({ strapi }: {
        strapi: import("@strapi/types/dist/core").Strapi;
    }) => Promise<void>;
    destroy: ({ strapi }: {
        strapi: import("@strapi/types/dist/core").Strapi;
    }) => void;
    config: {
        default: {};
        validator(): void;
    };
    controllers: {
        controller: ({ strapi }: {
            strapi: import("@strapi/types/dist/core").Strapi;
        }) => {
            index(ctx: any): void;
        };
        redirect: {
            getSettings(ctx: import("koa").Context): Promise<void>;
            saveSettings(ctx: import("koa").Context): Promise<void>;
            getContentTypes(ctx: import("koa").Context): Promise<void>;
            findContentBySlug(ctx: import("koa").Context): Promise<import("koa").Context>;
            getRedirect(ctx: import("koa").Context): Promise<import("koa").Context>;
        };
    };
    routes: {
        'content-api': {
            type: string;
            routes: {
                method: string;
                path: string;
                handler: string;
                /**
                 * Plugin server methods
                 */
                config: {
                    policies: any[];
                };
            }[];
        };
    };
    services: {
        service: ({ strapi }: {
            strapi: import("@strapi/types/dist/core").Strapi;
        }) => {
            getWelcomeMessage(): string;
        };
        redirect: ({ strapi }: {
            strapi: import("@strapi/types/dist/core").Strapi;
        }) => {
            getSettings(): Promise<import("./services/redirect").Settings>;
            saveSettings(settings: import("./services/redirect").Settings): Promise<void>;
            createRedirect(data: import("./services/redirect").RedirectData): Promise<void>;
            resolveRedirect(contentType: string, inputSlug: string): Promise<import("./services/redirect").RedirectEntry>;
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
    contentTypes: {
        redirect: {
            schema: {
                kind: string;
                collectionName: string;
                info: {
                    singularName: string;
                    pluralName: string;
                    displayName: string;
                };
                options: {
                    draftAndPublish: boolean;
                    timestamps: boolean;
                };
                attributes: {
                    contentType: {
                        type: string;
                        required: boolean;
                    };
                    oldSlug: {
                        type: string;
                        required: boolean;
                    };
                    newSlug: {
                        type: string;
                        required: boolean;
                    };
                    redirectType: {
                        type: string;
                        required: boolean;
                        default: string;
                    };
                    comment: {
                        type: string;
                    };
                };
            };
        };
    };
    policies: {};
    middlewares: {};
};
export default _default;
