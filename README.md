# GoalUI
[Goal](https://github.com/huoyijie/Goal) is a lightweight web framework like Django written in Golang.
[GoalUI](https://github.com/huoyijie/GoalUI)

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```bash
$ node -v
v18.15.0
```

```bash
$ npm install
```

### create file .env.`mode`.local

```
# file: .env.development.local
VITE_DEFAULT_LANG=en
VITE_SERVER=http://127.0.0.1:8100
```

and

```
# file: .env.production.local
VITE_DEFAULT_LANG=en
VITE_SERVER=http://127.0.0.1:8100
```

### Compile and Hot-Reload for Development

```bash
$ npm run dev
```

Open web browser and access `http://127.0.0.1:4000`.

### Compile and Minify for Production

```bash
$ npm run build
```

### Lint with [ESLint](https://eslint.org/)

```bash
$ npm run lint
```