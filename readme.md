# Introduction
This is a collection of somewhat generic algorithms that are written in Typescript, targeting ES6. I add new ones as needed for my pet projects. Most algorithms aren't optimized and there are better alternatives -- I made this project for fun only. Some parts are better-tested than the others. No guarantee for backward compatibility. Use it at your own risk.

# Convention
- Camel case
- No mutation on parameters for exported functions
- No global variable
- Avoid mutation and type-casting
- Avoid classes unless they
    - describe data structures
    - absolutely need to store derived data

# Install
```bash
npm install myalgo-ts
```

# Build
```bash
npm run install
npm run clean
npm run test #optional
npm run build
```
Note: at the time of writing, this library is built using the dev version of Typescript, because it fixed [this bug](https://github.com/Microsoft/TypeScript/issues/25511).