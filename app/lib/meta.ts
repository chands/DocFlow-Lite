import type { Route } from '~/routes/+types/documents';

/**
 * Meta function for the documents route
 */
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Documents - DocFlow Lite" },
    { name: "description", content: "Upload, organize, and manage your documents with DocFlow Lite." },
  ];
} 