import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";

export default [
  {
    input: "src/index.ts",
    output: [
      { file: "dist/index.cjs", format: "cjs" }, // CommonJS
      { file: "dist/index.mjs", format: "esm" }, // ES Modules
    ],
    plugins: [typescript(), resolve()],
  },
];
