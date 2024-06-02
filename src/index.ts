#!/usr/bin/env bun
import { parseArgs, rl } from "./common";
import { type, homedir } from "os";
import { resolve } from "path";
import { appendFile } from "fs/promises";

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

        const bshRc = "export PATH=$PATH:$HOME/.bsh";

        try {
          const contents = await Bun.file(bashrc).text();

          if (!contents.includes(bshRc)) {
            await appendFile(bashrc, "\n\n# Bun Shell\n" + bshRc + "\n");
          }
        } catch (_) {
          console.log(
            "Could not add bsh to PATH. Please add it manually:",
            bshRc
          );
          break;
        }

        const source = await Bun.$`bash -c ". ${{
          raw: bashrc,
        }}"`
          .nothrow()
          .quiet();

        if (source.exitCode != 0)
          console.error("Could not source bsh:", source.stderr.toString());
        else
          console.log(
            "\nbsh was installed successfully. Run 'bsh --version' to test it."
          );

        break;
      }

      default:
        console.log(
          "\nSorry, we do not autoinstall bsh on your OS right now. Please do it yourself:\n\n\t",
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
