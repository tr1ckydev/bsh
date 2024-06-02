import { createInterface } from "readline/promises";
import { version } from "../package.json";

export function rl() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "\x1b[32m$\x1b[0m ",
  });

  process.on("exit", () => rl.close());

  console.log("Welcome to Bun Shell!\n");

  rl.prompt();

  rl.on("line", async (command) => {
    const comm = command.trim();

    if (comm.startsWith("exit")) {
      const [_, code] = comm.split(" ");

      const codeNumber = parseInt(code);

      process.exit(isNaN(codeNumber) ? 0 : codeNumber);
    }

    await Bun.$`${{ raw: comm }}`.nothrow();

    rl.prompt();
  });

  return rl;
}

export async function parseArgs() {
  switch (Bun.argv[2]) {
    case "--version":
      console.log("bsh:", version);
      console.log("bun:", `${Bun.version}+${Bun.revision.slice(0, 9)}`);
      process.exit(0);
    case "-c":
      const command = Bun.argv[3];
      if (!command) {
        console.error("no command string provided");
        process.exit(1);
      }
      const { exitCode } = await Bun.$`${{ raw: command }}`.nothrow();
      process.exit(exitCode);
    default:
      return Bun.argv[2] as string | undefined;
  }
}
