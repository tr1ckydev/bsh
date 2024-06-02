#!/usr/bin/env bun
import { parseArgs, rl } from "./common";
import { type, homedir } from "os";
import { resolve } from "path";

const flag = await parseArgs();

async function build(outfile = "./bsh") {
  const buildCommand = [
    "bun build --entrypoints",
    JSON.stringify(Bun.fileURLToPath(import.meta.resolve("./build.ts"))),
    "--outfile",
    JSON.stringify(outfile),
    "--minify",
    "--compile",
  ].join(" ");

  console.info(buildCommand);

  const { exitCode } = await Bun.$`${{
    raw: buildCommand,
  }}`.nothrow();

  return exitCode;
}

switch (flag) {
  case "--build":
    process.exit(await build());
  case "--install":
    const _homedir = homedir();
    const _type = type();

    const buildCode = await build(resolve(_homedir, ".bsh/bsh"));

    if (buildCode != 0) process.exit(buildCode);

    switch (_type) {
      case "Linux": {
        const bashrc = resolve(_homedir, ".bashrc");

        const bshRc = "\n\n# Bun Shell\nexport PATH=$PATH:$HOME/.bsh\n";

        const { exitCode } = await Bun.$`echo "${{
          raw: bshRc,
        }}" >> ${bashrc}`.nothrow();

        if (exitCode != 0) {
          console.log(
            "Could not add bsh to PATH. Please add it manually:",
            bshRc
          );
          break;
        }

        await Bun.$`source ${bashrc}`;

        break;
      }

      default:
        console.log(
          "\nSorry, we do not autoinstall bsh on your os right now. Please do it yourself:\n\n\t",
          resolve(_homedir, ".bsh"),
          "\n"
        );
        break; // todo: add others
    }

    process.exit(0);
  case undefined:
    break;
  default:
    console.error("unknown flag: " + flag);
    process.exit(1);
}

rl();
