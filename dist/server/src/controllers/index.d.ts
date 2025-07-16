/// <reference types="koa" />
declare const _default: {
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
export default _default;
