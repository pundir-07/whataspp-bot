const fs = require("node:fs")
const path = require("path")
const { execSync ,spawn} = require("node:child_process")

function gatherLoggers() {
    const { loggers } = JSON.parse(fs.readFileSync(path.join(__dirname, "./logger.config.json")))
    return loggers
}
function startLogTerminals() {
    const loggers = gatherLoggers()
    for (logger of loggers) {
        const fifoPath = logger.fifo
        if (fs.existsSync(fifoPath)) {
            fs.unlinkSync(fifoPath);
        }
        execSync(`mkfifo ${fifoPath}`);
        const termSubprocess = spawn("osascript", [
            "-e",
            `tell application "Terminal"
              do script "while true; do cat '${fifoPath}'; sleep 0.2; done"
              end tell`,
        ], {
            detached: true
        });
    }

}
startLogTerminals()