# Strapi Plugin: Redirect Manager

🔁 **Centralized redirect management for Strapi v5 – create 301/302 redirects directly from the admin panel**

[![npm version](https://badge.fury.io/js/strapi-plugin-redirect-manager.svg)](https://www.npmjs.com/package/strapi-plugin-redirect-manager)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

- 🌐 **URL Redirects**: Easily manage 301, 302 (and more) HTTP redirects
- 🧠 **Pattern Matching**: Supports wildcards like `/blog/:slug` and RegExp
- 🎛️ **Intuitive Admin UI**: Seamlessly integrated into the admin panel
- 🔄 **Auto Middleware**: Handles redirects at runtime (optional)
- ✅ **Draft & Publish**: Preview redirect entries before going live
- 🧩 **API Accessible**: Easily fetch redirects for use in frontend frameworks

---

## 🎯 Compatibility

| Environment   | Version             | Status            |
|---------------|---------------------|-------------------|
| **Strapi**    | `v5.0.0+`           | ✅ Fully Supported |
| **Node.js**   | `18.x, 20.x, 22.x`  | ✅ Tested          |
| **Database**  | PostgreSQL, MySQL, SQLite | ✅ Compatible |
| **Frontends** | Next.js, Nuxt, Remix, Astro | ✅ Compatible |

---

## 📦 Installation

```bash
npm install strapi-plugin-redirect-manager
# or
yarn add strapi-plugin-redirect-manager
```
## 🛠️ Setup

1. **Add to plugins configuration** (config/plugins.js):
```bash

javascript
module.exports = {
  'redirect-manager': {
    enabled: true,
  },
};
```


2. **Restart your Strapi application**:

```bash

npm run develop
```
or
```bash
yarn develop
```
##  📡 API Endpoints

The redirect-manager plugin exposes multiple APIs to manage redirects, settings, and content resolution.

All routes are prefixed with:

```
/api/redirect-manager
```

## 🔁 1. Get Single Redirect

Endpoint:
```
GET /api/redirect-manager/redirect
```

Description:
Fetch a single redirect by query parameters.

Query Params:

from – The source path (e.g. /old-blog)

## 📋 2. Get All Redirects

Endpoint:
```
GET /api/redirect-manager/redirect/all
```

Description:
Fetch all registered redirects.

# ⚡ Next.js Integration

You can integrate the Redirect Manager plugin with Next.js to automatically apply server-side redirects.

## 1. Create a Redirect Fetcher

Inside your Next.js project, add a helper to fetch redirects from Strapi:
```
// lib/getRedirectHistory.ts
export async function getRedirectHistory(contentType: string, slug: string) {
  try {
    const path = `redirect-manager/redirect`;
    return fetchAPI(
      path,
      { oldSlug: slug, contentType },
      { prefix: "" }
    );
  } catch (error) {
    console.error("Failed to fetch redirect history:", error);
    return { data: null };
  }
}
```

## 2. Example: Dynamic Redirect from Content

You can also fetch content-based redirects (from slugs) in getServerSideProps:
```

// pages/[slug].tsx
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;
  const contentType = "api::article.article";

  const redirect = await getRedirectHistory(contentType, slug);

  if (redirect?.data) {
    return {
      redirect: {
        destination: redirect.data.newSlug,
        permanent: redirect.data.redirectType === "301",
      },
    };
  }

  // fallback: fetch content if no redirect
  const res = await fetch(`${process.env.STRAPI_URL}/api/articles/${slug}`);
  if (res.status === 404) {
    return { notFound: true };
  }
  const data = await res.json();
  return {
    props: { article: data },
  };
};

export default function ArticlePage({ article }: any) {
  return <div>{article.title}</div>;
}
```