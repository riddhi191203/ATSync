const { execSync } = require("child_process")

try {

    console.log("[postinstall] Installing Chrome for Puppeteer...")

    execSync(
        "npx puppeteer browsers install chrome",
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