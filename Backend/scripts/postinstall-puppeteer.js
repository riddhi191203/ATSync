const { execFileSync } = require("child_process")
const path = require("path")

const cacheDirectory = process.env.PUPPETEER_CACHE_DIR
    || path.join(__dirname, "..", ".cache", "puppeteer")
const puppeteerCli = require.resolve("puppeteer/lib/cjs/puppeteer/node/cli.js")

try {

    console.log("[postinstall] Installing Chrome for Puppeteer...")
    console.log(`[postinstall] Puppeteer cache: ${cacheDirectory}`)

    execFileSync(
        process.execPath,
        [puppeteerCli, "browsers", "install", "chrome"],
        {
            stdio: "inherit",
            env: {
                ...process.env,
                PUPPETEER_CACHE_DIR: cacheDirectory
            }
        }
    )

    console.log("[postinstall] Chrome installed successfully!")

    process.exit(0)

} catch (error) {

    console.error("[postinstall] Failed to install Chrome")
    console.error(error)

    process.exit(1)
}
