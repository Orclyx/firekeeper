const fetch = require("node-fetch")
const { failureStates } = require("./constants")
const { Worker } = require("../src/Worker")

const filename = "Worker.test.js"
const accessToken = "abc"

it("must be initialised before use", async () => {
  await expect(new Worker().run()).rejects.toThrowError()
})

it("must be initialised with config, filename and accessToken", async () => {
  const config = {}

  await expect(new Worker().init()).rejects.toThrowError()
  await expect(new Worker().init(config)).rejects.toThrowError()
  await expect(new Worker().init(config, filename)).rejects.toThrowError()
  await expect(new Worker().init(config, filename, accessToken)).resolves.toBeUndefined()
})

it("pushes config to DigitalOcean API", async () => {
  const config = {
    name: "foo",
    inbound_rules: [
      {
        protocol: "tcp",
        ports: 22,
        sources: {
          addresses: ["0.0.0.0/0", "::/0"],
          tags: ["gateway"],
        },
      },
    ],
  }

  const worker = new Worker()
  await worker.init(config, filename, accessToken)
  await worker.run()

  const { body, headers } = fetch.mock.calls?.[fetch.mock.calls.length - 1]?.[1] || {}
  expect(headers?.Authorization).toBe(`Bearer ${accessToken}`)

  const firewall = JSON.parse(body)
  expect(firewall).toBeInstanceOf(Object)
  expect(firewall).toHaveProperty("name")
  expect(firewall).toHaveProperty("inbound_rules")
  expect(firewall.name).toMatch(/^foo/)
  expect(firewall.inbound_rules[0]?.protocol).toBe("tcp")
  expect(firewall.inbound_rules[0]?.ports).toBe(22)
  expect(firewall.inbound_rules[0]?.sources?.addresses).toHaveLength(2)
  expect(firewall.inbound_rules[0]?.sources?.addresses).toContain("0.0.0.0/0")
  expect(firewall.inbound_rules[0]?.sources?.addresses).toContain("::/0")
  expect(firewall.inbound_rules[0]?.sources?.tags?.[0]).toBe("gateway")
})

it("handles failure states", async () => {
  const config = {
    name: "foo",
    inbound_rules: [
      {
        protocol: "tcp",
        ports: 22,
        sources: {
          addresses: ["0.0.0.0/0", "::/0"],
          tags: ["gateway"],
        },
      },
    ],
  }

  let worker

  worker = new Worker()
  await expect(worker.init(config, filename, failureStates.GET_FIREWALLS_ERR)).rejects.toThrowError()
  await expect(worker.init(config, filename, failureStates.GET_FIREWALLS_NOT_OK)).rejects.toThrowError()

  worker = new Worker()
  worker.init(config, filename, failureStates.POST_FIREWALLS_ERR)
  await expect(worker.run()).rejects.toThrowError()

  worker = new Worker()
  worker.init(config, filename, failureStates.POST_FIREWALLS_NOT_OK)
  await expect(worker.run()).rejects.toThrowError()

  worker = new Worker()
  worker.init(config, filename, failureStates.POST_TAGS_ERR)
  await expect(worker.run()).rejects.toThrowError()

  worker = new Worker()
  worker.init(config, filename, failureStates.POST_TAGS_NOT_OK)
  await expect(worker.run()).rejects.toThrowError()
})
