import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';

const canvas = document.getElementById('lienzo');

// Renderizador
const renderizador = new THREE.WebGLRenderer({ canvas, antialias: true });

// Escena (ANTES de los loaders)
const escena = new THREE.Scene();
escena.background = new THREE.Color(0x460673);

// Cámara
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 500);
camera.position.set(0, 2, 10);

const orbit = new OrbitControls(camera, renderizador.domElement);
orbit.update();

// Ajuste de tamaño
function ajusteCanvas() {
  const { width, height } = canvas.getBoundingClientRect();
  renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderizador.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
ajusteCanvas();
window.addEventListener('resize', ajusteCanvas);

// Luces
escena.add(new THREE.AmbientLight(0xffffff, 1));

RectAreaLightUniformsLib.init();
const rectLight = new THREE.RectAreaLight(0xffffff, 3, 4, 4);
rectLight.position.set(6, 9, 0);
rectLight.lookAt(5, 10, 0);
escena.add(rectLight);
escena.add(new RectAreaLightHelper(rectLight));

// Helpers
escena.add(new THREE.GridHelper(20, 20));

// Modelos (en la carpeta public/)
const loader = new GLTFLoader();

let escaparate;
loader.load('src/escaparate.glb',
  (gltf) => {escena.add(gltf.scene)
    escaparate = gltf.scene;
    escaparate.position.set(0, 0, -5);
    escena.add(escaparate);
  },
  undefined,
  (error) => console.error('Error al cargar escaparate', error)
);

let neko;
loader.load('src/neko.glb',
  (gltf) => {
    neko = gltf.scene;
    neko.position.set(2, 0, -2);
    escena.add(neko);
  },
  undefined,
  (error) => console.error('Error al cargar neko', error)
);

// Loop
renderizador.setAnimationLoop(() => {
  if (neko) neko.rotation.y += 0.03;
  renderizador.render(escena, camera);
});