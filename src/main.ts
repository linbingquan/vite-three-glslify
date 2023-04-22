import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import fragment from "./fragment.glsl";
import vertex from "./vertex.glsl";
import "./style.css";

const { innerWidth, innerHeight } = window;
const container = document.querySelector<HTMLDivElement>("#app");

const scene = new THREE.Scene();
const aspect = innerWidth / innerHeight;
const camera = new THREE.PerspectiveCamera(50, aspect);
camera.position.set(-1.5, 1.5, 3.0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
if (container) container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener("change", render);

const material = new THREE.ShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    textureA: { value: new THREE.TextureLoader().load("./baboon.png", render) },
    time: { value: 0.0 },
  },
});
const geometry = new THREE.BoxGeometry();
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

function render() {
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  const { innerWidth, innerHeight } = window;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  render();
});
