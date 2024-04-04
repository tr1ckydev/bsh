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
        let currentDir = process.cwd();
        while (true) {
            const command = prompt("\x1b[32m$\x1b[0m");
            if (!command) continue;
            try {
                const { stdout } = await Bun.$`${{
                    raw: command.trimEnd(),
                }}; echo "BSH_PWD $PWD"`
                    .nothrow()
                    .quiet()
                    .cwd(currentDir);
                const pwdIndex = stdout.lastIndexOf("BSH_PWD");
                await Bun.write(Bun.stdout, stdout.subarray(0, pwdIndex));
                currentDir = stdout
                    .subarray(pwdIndex + "BSH_PWD ".length, -1)
                    .toString();
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
