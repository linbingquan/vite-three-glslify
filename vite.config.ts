import { defineConfig } from "vite";
import { glslify } from "vite-plugin-glslify";

export default defineConfig({
  plugins: [
    glslify(),
  ],
  build: {
    rollupOptions: {
      external: [
        "three",
        "three/addons/controls/OrbitControls.js",
        "three/examples/jsm/controls/OrbitControls.js",
      ],
    },
  },
});
