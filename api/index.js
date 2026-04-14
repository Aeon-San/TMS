import { app, initializeAppResources } from "../backend/src/app.js";

export default async function handler(req, res) {
  try {
    await initializeAppResources();
    return app(req, res);
  } catch (error) {
    console.error("Server initialization failed", { message: error.message });

    return res.status(500).json({
      message: "Backend initialization failed. Check server env vars and database connectivity.",
    });
  }
}
