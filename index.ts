#!/usr/bin/env bun

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
        while (true) {
            const command = prompt("\x1b[32m$\x1b[0m");
            if (!command) continue;
            try {
                await Bun.$`${{ raw: command.trimEnd() }}`.nothrow();
            } catch (err) {
                console.error("error:", (err as Error).message);
                continue;
            } finally {
                console.write("\n");
            }
        }
    default:
        throw "unknown flag: " + Bun.argv[2];
}