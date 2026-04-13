import { createApp } from "./app/create-app.js";
export { createApp };
export { GitHubOAuthUser, GitHubOAuthClient } from "./routing/routes.js";

const isMain = process.argv[1]?.endsWith("index.js") ?? false;
if (isMain) {
  import("./app/server.js").then(({ main }) => main());
}
