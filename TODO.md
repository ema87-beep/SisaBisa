# Fix Railway Deployment Crash

## Steps

- [x] 1. Analyze project files and identify root causes
- [x] 2. Add `better-sqlite3` to package.json dependencies
- [x] 3. Move Vite packages to devDependencies in package.json
- [x] 4. Add `postinstall` script to build frontend after install
- [x] 5. Update railway.toml with buildCommand
- [x] 6. Update start script to ensure dist exists
- [ ] 7. Test and verify

