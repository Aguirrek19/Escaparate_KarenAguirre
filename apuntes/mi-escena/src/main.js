import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import * as dat from 'dat.gui';

const canvas = document.getElementById('lienzo');

// Renderizador
const renderizador = new THREE.WebGLRenderer({ canvas, antialias: true });

// Escena (ANTES de los loaders)
const escena = new THREE.Scene();
escena.background = new THREE.Color(0x460673);

// Cámara
const camera = new THREE.PerspectiveCamera(40, 2, 0.1, 600);
camera.position.set(0, 16, 20);

const orbit = new OrbitControls(camera, renderizador.domElement);
orbit.update();


const gui = new dat.GUI();

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
const rectLight = new THREE.RectAreaLight(0xffffff, 0.8, 0.7, 0.8);
rectLight.position.set(-5.6, 6.6, -1.7);
rectLight.lookAt(-1, -50, 0);
rectLight.intensity = 10;
escena.add(rectLight);

const rectHelper = new RectAreaLightHelper(rectLight);
rectLight.add(rectHelper);

const lightFolder = gui.addFolder('RectAreaLight');
const rectFolder = lightFolder.addFolder('RectAreaLight');
rectFolder.open();

const params = {
  color: '#ffffff',
  targetX: 5,
  targetY: 10,
  targetZ: 0,
};

function apuntar() {
  rectLight.lookAt(params.targetX, params.targetY, params.targetZ);
}

// Tamaño
rectFolder.add(rectLight, 'width', 0.1, 20, 0.1).name('Ancho');
rectFolder.add(rectLight, 'height', 0.1, 20, 0.1).name('Alto');

// Posición
const posFolder = rectFolder.addFolder('Posición');
posFolder.add(rectLight.position, 'x', -30, 30, 0.1).onChange(apuntar);
posFolder.add(rectLight.position, 'y', -30, 30, 0.1).onChange(apuntar);
posFolder.add(rectLight.position, 'z', -30, 30, 0.1).onChange(apuntar);
posFolder.open();

// Hacia dónde apunta
const targetFolder = rectFolder.addFolder('Apunta a');
targetFolder.add(params, 'targetX', -50, 30, 0.1).onChange(apuntar);
targetFolder.add(params, 'targetY', -50, 30, 0.1).onChange(apuntar);
targetFolder.add(params, 'targetZ', -50, 30, 0.1).onChange(apuntar);


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
    neko.position.set(2, 4, -5);
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