# Build steps

## To build dist/debugAdapter.js

npx webpack

## To release the vscode extension

- Increase version in package.json
- Update CHANGELOG.md
- Run `npm run package` to get the vsix
- To test it use 'Install from VSIX' in VS Code command palette (distribute this)

- To publish `npm run publish` (but DON'T publish it to the store, it is an internal extension)

(works with npm v20.17.0)