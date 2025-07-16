export default {
  kind: "collectionType",
  collectionName: "redirects",
  info: {
    singularName: "redirect",
    pluralName: "redirects",
    displayName: "Redirect",
  },
  options: {
    draftAndPublish: false,
    timestamps: true,
  },
  attributes: {
    contentType: { type: "string", required: true },
    oldSlug: { type: "string", required: true },
    newSlug: { type: "string", required: true },
    redirectType: { type: "string", required: true, default: "301" },
    comment: { type: "text" },
  },
};