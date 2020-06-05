class WorkerError extends Error {
  constructor(message, filename) {
    super(message)
    this.name = `WorkerError for ${filename}`
  }
}

module.exports.WorkerError = WorkerError
