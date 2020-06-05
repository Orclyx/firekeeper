const fs = require("fs")
const path = require("path")
const YAML = require("yaml")
const { Worker } = require("./Worker")

// Load environment variables from .env for ease of use
require("dotenv").config()

const accessToken = process.env.DIGITALOCEAN_ACCESS_TOKEN

if (typeof accessToken === "undefined") {
  console.log("Missing DIGITALOCEAN_ACCESS_TOKEN environment variable or .env file entry")
  process.exit(1)
}

const configDir = path.join(__dirname, "..", "firewalls")
const configurations = fs
  .readdirSync(configDir)
  .filter((filename) => filename !== "firewall.example.yml" && filename.match(/\.ya?ml$/))

if (!configurations.length) {
  console.log("No firewall configurations found.")
  process.exit(1)
}

// Deploy all configurations
configurations.forEach(async (filename) => {
  try {
    const config = YAML.parse(fs.readFileSync(configDir + path.sep + filename, "utf8"))
    const worker = new Worker()
    await worker.init(config, filename, accessToken)
    await worker.run()
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
})
