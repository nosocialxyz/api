import express, { NextFunction, Request, Response } from "express";
import { logger } from "./utils/logger";
import { PORT } from "./config";
import timeout from "connect-timeout";
import * as services from "./services";
import * as bodyParser from "body-parser";
import cors from "cors";

const app = express();
const maxErrorHandlingCount = 10;
let errorHandlingCount = 0;

const errorHandler = (err: any, _req: Request | null, res: Response | null, _next: any) => {
  const errMsg: string = "" + err ? err.message : "Unknown error";
  logger.error(`☄️ : Error catched: ${errMsg}.`);
  if (res) {
    res.status(400).send({
      status: "error",
      statusCode: 400,
      message: errMsg,
    });
  }

  logger.warn("📡 : Connection reinitialized.");
};

const loggingResponse = (req: Request, res: Response, next: NextFunction) => {
  const send = res.send;
  logger.info(`Request: method:${req.method}, path:${req.path}`);
  res.send = function (...args: any) {
    if (args.length > 0) {
      //logger.info(`  ↪ [${res.statusCode}]: ${args[0]}`);
      logger.info(`  ↪ [${res.statusCode}]`);
    }
    send.call(res, ...args);
  } as any;
  next();
};

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json());
app.use(loggingResponse);

// API timeout handler
app.use(timeout("600s"));

// Cross domain
app.use(cors());

// Base routes
app.get("/api/v0/ping", services.base.ping);
app.get("/api/v0/account/whitelist", services.base.whitelist);
app.get("/api/v0/account/profiles", services.base.profiles);
app.get("/api/v0/profile/base", services.base.profileBase);
app.get("/api/v0/apps/base", services.base.appBase);
app.get("/api/v0/benefits/base", services.base.BenefitBase);

// Lens tags
app.post("/api/v0/lenstag/trigger", services.lenstag.trigger);
app.get("/api/v0/lenstag/tags", services.lenstag.tags);

// Post routes
app.post("/api/v0/achievement/collect", services.base.achievementCollect);

app.post("/api/v0/achievement/achieve", services.base.achieveAchievement);

app.get("/api/v0/publication/post", services.ai.fetchAllPosts);

app.get("/api/v0/ai/fetchResults", services.ai.fetchAIResults);
app.post("/api/v0/ai/updateResults", services.ai.updateAIResults);

app.post("/api/v0/ai/pushProfile", services.ai.pushProfile);
app.get("/api/v0/ai/fetchProfile", services.ai.fetchProfile);
app.post("/api/v0/ai/updateProfile", services.ai.updateProfile);

app.post("/api/v0/ai/pushAITag", services.ai.pushAITag);
app.get("/api/v0/ai/fetchNextAITag", services.ai.fetchNextAITag);

app.post("/api/v0/nft/pushNft", services.nft.pushNft);
app.get("/api/v0/nft/fetchNft2Mint", services.nft.fetchNft2Mint);
app.get("/api/v0/nft/fetchNft2Update", services.nft.fetchNft2Update);
app.post("/api/v0/nft/updateNft", services.nft.updateNft);

// Error handler
app.use(errorHandler);
process.on("uncaughtException", (err: Error) => {
  logger.error(`☄️  Uncaught exception ${err.message}`);
  if (++errorHandlingCount <= maxErrorHandlingCount) {
    errorHandler(err, null, null, null);
  } else {
    logger.error("Reach max error handling count, just exit and waitinng for restart");
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
});

app.listen(PORT, () => {
  logger.info(`⚡️ : Nosocial API is running at https://localhost:${PORT}`);
});
