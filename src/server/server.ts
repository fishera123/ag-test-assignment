import swaggerDocs from "config/swagger-config";
import express, { Express } from "express";
import helmet from "helmet";
import compression from "compression";
import { handleErrorMiddleware } from "middlewares/error-handler.middleware";
import { loggerMiddleware } from "middlewares/logger.middleware";
import routes from "routes";
import cors from "cors";

export function setupServer(): Express {
  const app = express();

  app.use(loggerMiddleware);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(helmet());
  app.use(compression());
  app.use(cors());
  app.options("*", cors());

  app.use("/api", routes);

  app.use(handleErrorMiddleware);

  swaggerDocs(app);
  return app;
}
