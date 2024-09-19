# Build steps

## To build the server

- Run `nvm use 20.17.0`
- Run `npm run build-server`
- The server is in `dist/debugAdapter.js`
- Execute it with `node debugAdapter.js` in the machine where the prolog extension is running.

## To release the vscode extension

- Increase version in package.json
- Update CHANGELOG.md
- Run `npm run package` to get the vsix
- To test it use 'Install from VSIX' in VS Code command palette (distribute this)

- To publish `npm run publish` (but DON'T publish it to the store, it is an internal extension)
