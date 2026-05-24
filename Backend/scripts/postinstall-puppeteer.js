const { execSync } = require("child_process")
const fs = require("fs")

const CACHE_DIR = "/opt/render/.cache/puppeteer"

const pathExists = (path) => {
    try {
        return fs.existsSync(path)
    } catch {
        return false
    }
}

const browserAlreadyInstalled = () => {
    try {
        const puppeteer = require("puppeteer")
        const executablePath = puppeteer.executablePath()

        return executablePath && pathExists(executablePath)
    } catch {
        return false
    }
}

try {

    if (browserAlreadyInstalled()) {
        console.log("[postinstall] Chrome already installed.")
        process.exit(0)
    }

    console.log("[postinstall] Installing Chrome for Puppeteer...")

    process.env.PUPPETEER_CACHE_DIR = CACHE_DIR

    execSync(
        `npx puppeteer browsers install chrome --path=${CACHE_DIR}`,
        {
            stdio: "inherit"
        }
    )

    console.log("[postinstall] Chrome installed successfully!")

    process.exit(0)

} catch (error) {

    console.error("[postinstall] Failed to install Chrome")
    console.error(error)

    process.exit(1)
}