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

const audioLoader = new THREE.AudioLoader();

const backgroundMusic = new THREE.Audio(new THREE.AudioListener());
audioLoader.load('../src/audio/bkgm.mp3', (buffer) => {
  backgroundMusic.setBuffer(buffer);
  backgroundMusic.setLoop(true);
  backgroundMusic.setVolume(0.5);
  backgroundMusic.play();
});


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

const SEPARACION = 2.9;
const COPIAS = 4;

// Luz principal (la que controla el GUI)
const rectLight = new THREE.RectAreaLight(0xffffff, 10, 0.7, 0.8);
rectLight.position.set(-5.6, 6.6, -1.7);
escena.add(rectLight);
rectLight.add(new RectAreaLightHelper(rectLight));

const luces = [rectLight];

// Copias
for (let i = 1; i <= COPIAS; i++) {
  const copia = new THREE.RectAreaLight(0xffffff, 10, 0.7, 0.8);
  escena.add(copia);
  copia.add(new RectAreaLightHelper(copia));
  luces.push(copia);
}

const params = {
  color: '#ffffff',
  targetX: -1,
  targetY: -50,
  targetZ: 0,
};

// Sincroniza todas las luces con la principal
function actualizarLuces() {
  luces.forEach((luz, i) => {
    const desplazamiento = i * SEPARACION;

    luz.position.set(
      rectLight.position.x + desplazamiento,
      rectLight.position.y,
      rectLight.position.z
    );
    luz.width = rectLight.width;
    luz.height = rectLight.height;
    luz.intensity = rectLight.intensity;
    luz.color.copy(rectLight.color);

    // El objetivo también se desplaza, así todas apuntan en paralelo
    luz.lookAt(params.targetX + desplazamiento, params.targetY, params.targetZ);
  });
}
actualizarLuces();

// GUI
const lightFolder = gui.addFolder('RectAreaLight');
lightFolder.open();

lightFolder.add(rectLight, 'intensity', 0, 50, 0.1).name('Intensidad').onChange(actualizarLuces);
lightFolder.add(rectLight, 'width', 0.1, 20, 0.1).name('Ancho').onChange(actualizarLuces);
lightFolder.add(rectLight, 'height', 0.1, 20, 0.1).name('Alto').onChange(actualizarLuces);
lightFolder.addColor(params, 'color').name('Color').onChange((valor) => {
  rectLight.color.set(valor);
  actualizarLuces();
});

const posFolder = lightFolder.addFolder('Posición (luz principal)');
posFolder.add(rectLight.position, 'x', -30, 30, 0.1).onChange(actualizarLuces);
posFolder.add(rectLight.position, 'y', -30, 30, 0.1).onChange(actualizarLuces);
posFolder.add(rectLight.position, 'z', -30, 30, 0.1).onChange(actualizarLuces);
posFolder.open();

const targetFolder = lightFolder.addFolder('Apunta a');
targetFolder.add(params, 'targetX', -50, 30, 0.1).onChange(actualizarLuces);
targetFolder.add(params, 'targetY', -50, 30, 0.1).onChange(actualizarLuces);
targetFolder.add(params, 'targetZ', -50, 30, 0.1).onChange(actualizarLuces);

// --- Hover sobre neko ---
const raycaster = new THREE.Raycaster();
const puntero = new THREE.Vector2(10, 10); // fuera de pantalla al inicio
let sobreNeko = false;
let ultimoCambio = 0;
const INTERVALO = 250; // ms entre cambios de color

canvas.addEventListener('pointermove', (e) => {
  const r = canvas.getBoundingClientRect();
  puntero.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  puntero.y = -((e.clientY - r.top) / r.height) * 2 + 1;
});

canvas.addEventListener('pointerleave', () => {
  puntero.set(10, 10);
});

function coloresAleatorios() {
  luces.forEach((luz) => {
    luz.color.setHSL(Math.random(), 1, 0.5); // colores vivos
  });
}

function restaurarColor() {
  luces.forEach((luz) => luz.color.set(params.color));
}


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

renderizador.setAnimationLoop((tiempo) => {
  if (neko) {
    neko.rotation.y += 0.03;

    raycaster.setFromCamera(puntero, camera);
    const encima = raycaster.intersectObject(neko, true).length > 0;

    if (encima) {
      if (tiempo - ultimoCambio > INTERVALO) {
        coloresAleatorios();
        ultimoCambio = tiempo;
        backgroundMusic.setVolume(0.5 + 2);
      }
    } else if (sobreNeko) {
      restaurarColor(); // acaba de salir
      backgroundMusic.setVolume(0.5);
    }

    sobreNeko = encima;
    canvas.style.cursor = encima ? 'pointer' : 'default';
  }

  renderizador.render(escena, camera);
});