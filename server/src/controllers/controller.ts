import type { Core } from '@strapi/strapi';

const controller: Core.Controller = {
  async index(ctx) {
    const { strapi } = ctx;
    ctx.body = strapi
      .plugin('redirect-manager')
      .service('service')
      .getWelcomeMessage();
  },
};

export default controller;
