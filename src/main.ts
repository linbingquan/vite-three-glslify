import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import fragment from "./fragment.glsl";
import vertex from "./vertex.glsl";

const app = document.querySelector<HTMLDivElement>("#app")!;

const { innerWidth, innerHeight } = window;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50,
  innerWidth / innerHeight,
);
camera.position.set(-1.5, 1.5, 3.0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
app.appendChild(renderer.domElement);

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
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
});
