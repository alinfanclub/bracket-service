import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

const currentDirectory = dirname(fileURLToPath(import.meta.url));

config({
  path: resolve(currentDirectory, "../../../.env")
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  await app.listen(4000);
}

void bootstrap();
