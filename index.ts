#!/usr/bin/env bun
import { createInterface } from "readline/promises";
switch (Bun.argv[2]) {
    case "--version":
        console.log("bsh:", (await import("./package.json")).version);
        console.log("bun:", `${Bun.version}+${Bun.revision.slice(0, 9)}`);
        break;
    case "-c":
        const command = Bun.argv[3];
        if (!command) throw "no command string provided";
        await Bun.$`${{ raw: command }}`.nothrow();
        break;
    case undefined:
        const rl = createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: "\x1b[32m$\x1b[0m ",
        });
        rl.prompt();
        rl.on("line", async command => {
            try {
                await Bun.$`${{ raw: command }}`.nothrow();
            } catch (err) {
                console.error("error:", (err as Error).message);
            } finally {
                rl.prompt();
            }
        });
        break;
    default:
        throw "unknown flag: " + Bun.argv[2];
}