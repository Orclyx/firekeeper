const { execSync } = require("child_process")
const fetch = require("node-fetch")
const { WorkerError } = require("./WorkerError")

/**
 * @todo Rework so that this worker's operations can be rolled back in the event that a subsequent
 *       worker's operation fails. Would want deploy(), rollback() and commit() methods:
 *
 *       deploy() would always create a new firewall
 *       rollback() would remove the new firewall
 *       commit() would wait until the new firewall was active, then delete the old firewall (if any)
 */
class Worker {
  init = async (config, filename, accessToken) => {
    this.config = config
    this.filename = filename
    this.accessToken = accessToken

    this.name = `${this.config.name}.${this.version()}`
    this.knownTag = `firekeeper:${this.config.name}`
    this.id = await this.findFirewallByTag(this.knownTag)
  }

  errorFactory = (message) => new WorkerError(message, this.filename)

  version = () => execSync("git rev-parse --short HEAD").toString().trim()

  findFirewallByTag = (tag) =>
    fetch("https://api.digitalocean.com/v2/firewalls", {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw await response.text()
        }

        return response.json()
      })
      .then((data) => {
        if (!data.firewalls) {
          return null
        }

        for (const item of data.firewalls) {
          if (item.tags.indexOf(tag) !== -1) {
            // Found a firewall matching our tag
            return item.id
          }
        }

        return null
      })
      .catch((err) => {
        throw this.errorFactory(err)
      })

  getTags = () => [...(this.config.tags ?? []), this.knownTag].sort()

  createTags = async (tags) => {
    for (const tag of tags) {
      await fetch("https://api.digitalocean.com/v2/tags", {
        method: "POST",
        body: JSON.stringify({ name: tag }),
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      })
        .then(async (response) => {
          if (!response.ok) {
            throw await response.text()
          }
        })
        .catch((err) => {
          throw this.errorFactory(err)
        })
    }
  }

  createOrUpdateFirewall = async () => {
    const firewall = {
      ...this.config,
      name: this.name,
      tags: this.getTags(),
    }

    let url, verb

    if (this.id === null) {
      url = "https://api.digitalocean.com/v2/firewalls"
      verb = "POST"
    } else {
      url = `https://api.digitalocean.com/v2/firewalls/${this.id}`
      verb = "PUT"
    }

    await fetch(url, {
      method: verb,
      body: JSON.stringify(firewall),
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw this.errorFactory(await response.text())
        }
      })
      .catch((err) => {
        throw this.errorFactory(err)
      })
  }

  run = async () => {
    await this.createTags(this.getTags())
    await this.createOrUpdateFirewall(this.id)
  }
}

module.exports.Worker = Worker
