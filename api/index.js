import { app, initializeAppResources } from "../backend/src/app.js";

export default async function handler(req, res) {
  await initializeAppResources();
  return app(req, res);
}
