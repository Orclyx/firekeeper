const { failureStates } = require("../tests/constants")

const urls = {
  firewalls: "https://api.digitalocean.com/v2/firewalls",
  tags: "https://api.digitalocean.com/v2/tags",
}

const fetch = (url, options) =>
  new Promise((resolve, reject) => {
    const ok = (json) => resolve({ ok: true, json })
    const notOk = (json) => resolve({ ok: false, json })

    const { method, headers } = {
      method: "GET",
      ...options,
    }

    if (typeof headers?.Authorization === "undefined" || headers.Authorization === "Bearer undefined") {
      reject()
      return
    }

    const accessToken = headers.Authorization.match(/^Bearer (.*)/)[1]

    switch (true) {
      case url === urls.firewalls && method === "GET":
        switch (parseInt(accessToken, 10)) {
          case failureStates.GET_FIREWALLS_ERR:
            reject()
            return

          case failureStates.GET_FIREWALLS_NOT_OK:
            notOk()
            return
        }

        ok(() => ({
          firewalls: [],
        }))
        return

      case url === urls.firewalls && method === "POST":
        switch (parseInt(accessToken, 10)) {
          case failureStates.POST_FIREWALLS_ERR:
            reject()
            return

          case failureStates.POST_FIREWALLS_NOT_OK:
            notOk()
            return
        }

        ok()
        return

      case url === urls.tags && method === "POST":
        switch (parseInt(accessToken, 10)) {
          case failureStates.POST_TAGS_ERR:
            reject()
            return

          case failureStates.POST_TAGS_NOT_OK:
            notOk()
            return
        }

        ok()
        return
    }

    reject()
  })

module.exports = jest.fn(fetch)
