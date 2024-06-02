#!/usr/bin/env bun
import { parseArgs, rl } from "./common";

const flag = await parseArgs();

if (flag != undefined) {
  console.error("unknown flag: " + flag);
  process.exit(1);
}

rl();
