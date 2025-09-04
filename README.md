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

```bash
/api/redirect-manager
```

## 🔍 1. Get Content by Slug

Endpoint:
```bash
GET /api/redirect-manager/content/:contentType/:slug
```

Description:
Fetch a single content entry by its content type and slug field.

Params:

contentType – UID of the content type (e.g. api::article.article)

slug – Slug value to search for

Response:
```bash
{
  "id": 1,
  "title": "My Article",
  "slug": "my-article"
}
```
## ⚙️ 2. Get Plugin Settings

Endpoint:
```bash
GET /api/redirect-manager/settings
```

Description:
Retrieve the redirect manager’s settings.

Response:
```bash
{
  "enabledContentTypes": {
    "api::article.article": {
      "enabled": true,
      "slugField": "slug"
    }
  }
}
```
## 📝 3. Save Plugin Settings

Endpoint:
```bash
POST /api/redirect-manager/settings
```

Description:
Update and save plugin settings.

Request Body:
```bash
{
  "enabledContentTypes": {
    "api::article.article": {
      "enabled": true,
      "slugField": "slug"
    }
  }
}
```

Response:
```bash
{
  "status": "success",
  "message": "Settings updated successfully"
}
```
📂 4. Get Available Content Types

Endpoint:
```bash
GET /api/redirect-manager/content-types
```

Description:
Fetch a list of content types that can be enabled for redirects.

Response:
```bash
[
  { "uid": "api::article.article", "name": "Article" },
  { "uid": "api::page.page", "name": "Page" }
]
```
## 🔁 5. Get Single Redirect

Endpoint:
```bash
GET /api/redirect-manager/redirect
```

Description:
Fetch a single redirect by query parameters.

Query Params:

from – The source path (e.g. /old-blog)

Response:
```bash
{
  "from": "/old-blog",
  "to": "/new-blog",
  "type": "301"
}
```
📋 6. Get All Redirects

Endpoint:
```bash
GET /api/redirect-manager/redirect/all
```

Description:
Fetch all registered redirects.

Response:
```bash
[
  {
    "from": "/old-blog",
    "to": "/new-blog",
    "type": "301"
  },
  {
    "from": "/outdated",
    "to": "/updated",
    "type": "302"
  }
]
```
➕ 7. Create a Redirect

Endpoint:
```bash
POST /api/redirect-manager/redirect
```

Description:
Create a new redirect rule.

Request Body:
```bash
{
  "from": "/legacy-page",
  "to": "/new-page",
  "type": "302"
}
```

Response:
```bash
{
  "id": 1,
  "from": "/legacy-page",
  "to": "/new-page",
  "type": "302"
}
```