import './style.css'
import{ OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
console.log('main.js')

import * as THREE from 'three';
console.log(THREE);


import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';

const scenePath = '/src/escaparate.glb';

const loader = new GLTFLoader();
loader.load(
  scenePath,
  (gltf) => {
    escena.add(gltf.scene);
    console.log('Modelo cargado', gltf);
  },
  undefined,
  (error) => console.error('Error al cargar el modelo', error)
);

const rutaGato = "/src/neko.glb";
let neko;

const load = new GLTFLoader();
load.load(
  rutaGato,
  (gltf) => {
    neko = gltf.scene;
    neko.position.y = 3.5;
    neko.position.x = 2;
    neko.position.z = -2;
    escena.add(neko);
    console.log('Modelo cargado', gltf);
  },
  undefined,
  (error) => console.error('Error al cargar el modelo', error)
);

const canvas = document.getElementById('lienzo');
console.log(canvas);

function ajusteCanvas() {
//leer tamaño de canvas en CSS y guardar una variable 
let anchoCanvas = canvas.getBoundingClientRect().width;
let altoCanvas = canvas.getBoundingClientRect().height;
console.log(anchoCanvas, altoCanvas);

//Asignar esa variable a nuestro renderizado 
console.log('devicePixelRatio', window.devicePixelRatio);
let dpr = Math.min(devicePixelRatio, 2);
//Calcular relacion de aspect (aspect ratio)
//Calcular la densidad de pixeles (pixel ratio)

}
ajusteCanvas();
window.addEventListener('resize', ajusteCanvas);

//Configuracion de escena 3D
//Crear un rederizador 
const renderizador = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});
renderizador.setPixelRatio(Math.min(devicePixelRatio, 2));
renderizador.setSize(
  canvas.getBoundingClientRect().width,
  canvas.getBoundingClientRect().height
);

//Crear una escena
const escena = new THREE.Scene();
escena.background = new THREE.Color(0x460673);
const gizmo = new THREE.AxesHelper(5);

//Crear una camara
const camera = new THREE.PerspectiveCamera(
  40, //fov
  canvas.getBoundingClientRect().width / canvas.getBoundingClientRect().height, //aspect ratio
  0.1, //near
  500 //far
);

const orbit = new OrbitControls(camera, renderizador.domElement);

camera.position.z = 10;
camera.position.y = 2;
camera.lookAt(new THREE.Vector3(0, 0, 0));

orbit.update();

const ambientLight = new THREE.AmbientLight(0x333333, 10);
escena.add(ambientLight);

const intensity = 3; const width = 4; const height = 4;

import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
escena.add(RectAreaLightHelper(rectLight));

const rectLight = new THREE.RectAreaLight( 0xffffff, intensity, width, height );
rectLight.position.set( 6, 9, 0 );
rectLight.rotation.x = Math.PI /4;
rectLight.lookAt( 5, 10, 0 );
escena.add( rectLight )

const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const box = new THREE.Mesh(boxGeometry, boxMaterial);
//escena.add(box);
//box.position.x += 0.5;
//box.position.y += 5;

const gridHelper = new THREE.GridHelper(20, 20);
escena.add(gridHelper);

function animate() {
  if (neko) {
    neko.rotation.y += 0.03;
  } 
  renderizador.render(escena, camera);
}
renderizador.setAnimationLoop(animate);

