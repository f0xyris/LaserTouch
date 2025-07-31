import 'dotenv/config';
import { createServer } from "../server/index";
import { registerRoutes } from "../server/routes";

const app = createServer();

// Register all server routes
registerRoutes(app).catch(console.error);

export default app; 