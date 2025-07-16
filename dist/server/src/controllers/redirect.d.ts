import { Context } from 'koa';
declare const _default: {
    getSettings(ctx: Context): Promise<void>;
    saveSettings(ctx: Context): Promise<void>;
    getContentTypes(ctx: Context): Promise<void>;
    findContentBySlug(ctx: Context): Promise<Context>;
    getRedirect(ctx: Context): Promise<Context>;
};
export default _default;
