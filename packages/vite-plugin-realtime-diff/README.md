<h2  align="center">vite-plugin-realtime-diff</h2>

<h4  align="center">The open-source tool for pixel-perfect website migrations<h4>

<p align="center">
<img src="https://github.com/BuilderIO/builder/assets/73601258/a5821094-2ab1-4eb4-9190-233cc29159bc" alt="vite-plugin-realtime-diff" width="50%" />
</p>

### Approach

Two URLs are layered on top of each other with CSS overlay techniques to analyze and understand their differences.

### Use Cases:

<ul>
    <li> Compare two URLs to achieve a pixel-perfect match </li>
    <li> Ideal for website migrations to a new stack </li>
    <li> Attest your frontend skills using this </li>
    <li> Spot differences in similar-looking web pages </li>
    <li> Open-source and customizable </li>
    <li> Perform diffing in realtime without any hassle</li>
</ul>

### Installation

Do visual testing yourself on your browser by just adding `?_diff=true` command by using our vite plugin. This will show you the output directly and compare it with two base URLs that you provide.

```
npm install -D vite-plugin-realtime-diff
```

```js
// vite.config.ts
import { realtimeDiff } from "vite-plugin-realtime-diff";

export default defineConfig(() => {
  return {
    plugins: [realtimeDiff("https://builder.io/")], // the base url you want to target the diff to
  };
});
```
