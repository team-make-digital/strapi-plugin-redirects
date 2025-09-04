import type { Core } from '@strapi/strapi';
import controller from './controller';
import redirect from './redirect';

const controllers: Record<string, Core.Controller> = {
  controller,
  redirect,
};

export default controllers;
