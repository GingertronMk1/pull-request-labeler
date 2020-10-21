const distPath = './dist/index.js'
const errorMessage = ``

try {
  require(distPath)
} catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') {
    // Re-throw not "Module not found" errors
    throw error
  }
  if (error.message.indexOf(distPath) === -1) {
    // Re-throw not found errors for other modules
    throw error
  }

  console.error(errorMessage)
  throw error
}
