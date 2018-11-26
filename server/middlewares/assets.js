const fs = require('fs')
const { promisify } = require('util')
const path = require('path')
const mime = require('mime')
const { values } = require('ramda')

const readFile = promisify(fs.readFile)

const ASSET_MANIFEST_FILENAME = 'asset-manifest.json'

const assetMiddleware = (name, basePath, serve = true) => async (req, res, next) => {
  const assetManifestPath = path.resolve(path.join(basePath, ASSET_MANIFEST_FILENAME))

  let assetManifest = {}

  try {
    assetManifest = JSON.parse(await readFile(assetManifestPath))
  } catch (e) {
    throw new Error(`The asset manifest file for "${name}" was not found.`)
  }

  const assetList = values(assetManifest)

  req.assets = req.assets || {}

  req.assets[name] = {
    assetManifest,
    assetBasePath: basePath,
  }

  if (
    // We only serve files for GET requests
    // TODO: should also do the same for HEAD
    req.method !== 'GET' ||
    // We will only serve static js if the `serve`
    // flag is turned on (to disable serving SSR js)
    (!serve && /.js$/.test(req.url))
  ) {
    return next()
  }

  if (assetList.indexOf(req.url) !== -1) {
    const filePath = path.resolve(path.join(basePath, req.url))
    const type = mime.getType(filePath)

    fs.stat(filePath, (err, stat) => {
      if (err) {
        next(err, null)
        return
      }

      res.setHeader('Content-Type', type)
      res.setHeader('Content-Length', stat.size)

      fs.createReadStream(filePath).pipe(res)
    })
    return
  }

  return next()
}

module.exports = assetMiddleware
