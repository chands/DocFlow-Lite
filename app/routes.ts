import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout("components/Layout.tsx", [
    index("routes/index.tsx"),
    route("home", "routes/home.tsx"),
    route("documents", "routes/documents.tsx")
  ])
] satisfies RouteConfig;
