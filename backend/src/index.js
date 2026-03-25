import { app, initializeAppResources } from "./app.js";

const PORT = process.env.PORT || 9000;

initializeAppResources()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is online at: http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
