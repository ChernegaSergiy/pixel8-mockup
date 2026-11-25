import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';

const viewport = document.querySelector('#viewport');
const message = document.querySelector('#message');
const fit = document.querySelector('#fit');
const background = document.querySelector('#background');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0xffffff, 0);
viewport.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 9 / 16, 0.1, 3000);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 175;
controls.maxDistance = 1200;
controls.target.set(0, 0, 0);

scene.add(new THREE.HemisphereLight(0xeaf5ff, 0x303039, 2.1));
const key = new THREE.DirectionalLight(0xffffff, 2.6);
key.position.set(-130, 180, 230);
scene.add(key);
const rim = new THREE.DirectionalLight(0xa8c5e6, 1.7);
rim.position.set(160, -25, -180);
scene.add(rim);

function roundedShape(width, height, radius) {
  const left = -width / 2, bottom = -height / 2;
  const right = width / 2, top = height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(left + radius, bottom);
  shape.lineTo(right - radius, bottom);
  shape.quadraticCurveTo(right, bottom, right, bottom + radius);
  shape.lineTo(right, top - radius);
  shape.quadraticCurveTo(right, top, right - radius, top);
  shape.lineTo(left + radius, top);
  shape.quadraticCurveTo(left, top, left, top - radius);
  shape.lineTo(left, bottom + radius);
  shape.quadraticCurveTo(left, bottom, left + radius, bottom);
  return shape;
}

function roundedPlane(width, height, radius) {
  const geometry = new THREE.ShapeGeometry(roundedShape(width, height, radius), 24);
  const positions = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let index = 0; index < positions.count; index++) {
    uv.setXY(index, positions.getX(index) / width + 0.5, positions.getY(index) / height + 0.5);
  }
  uv.needsUpdate = true;
  return geometry;
}

function roundedBody(width, height, depth, radius, material) {
  const geometry = new THREE.ExtrudeGeometry(roundedShape(width, height, radius), { depth, bevelEnabled: false, curveSegments: 24 });
  geometry.translate(0, 0, -depth / 2);
  return new THREE.Mesh(geometry, material);
}

const phone = new THREE.Group();
scene.add(phone);
const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x252a2e, roughness: 0.4, metalness: 0.5 });
const body = roundedBody(70.8, 150.5, 8.9, 10.5, bodyMaterial);
phone.add(body);

const screenWidth = 64.0;
const screenHeight = screenWidth * 20 / 9;
const screenCanvas = document.createElement('canvas');
screenCanvas.width = 1080;
screenCanvas.height = 2400;
const screenContext = screenCanvas.getContext('2d');
const screenTexture = new THREE.CanvasTexture(screenCanvas);
screenTexture.colorSpace = THREE.SRGBColorSpace;
screenTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
const screen = new THREE.Mesh(roundedPlane(screenWidth, screenHeight, 7.2), new THREE.MeshBasicMaterial({ map: screenTexture }));
screen.position.z = 4.8;
phone.add(screen);

const cameraLens = new THREE.Mesh(new THREE.CircleGeometry(1.25, 32), new THREE.MeshBasicMaterial({ color: 0x11171b }));
cameraLens.position.set(0, screenHeight / 2 - 3.4, 4.9);
phone.add(cameraLens);

const frameImage = new Image();
frameImage.onload = () => {
  const source = document.createElement('canvas');
  source.width = 715;
  source.height = 1455;
  source.getContext('2d').drawImage(frameImage, 155, 45, 715, 1455, 0, 0, 715, 1455);
  const texture = new THREE.CanvasTexture(source);
  texture.colorSpace = THREE.SRGBColorSpace;
  const frame = new THREE.Mesh(roundedPlane(70.8, 150.5, 10.5), new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }));
  frame.position.z = 4.65;
  phone.add(frame);
};
frameImage.src = 'assets/pixel8-generated.png';
frameImage.onerror = () => { message.textContent = 'Не вдалося завантажити текстуру корпусу.'; };

const backMaterial = new THREE.MeshStandardMaterial({ color: 0x424a4b, metalness: 0.35, roughness: 0.32 });
const back = roundedBody(67.6, 147.3, 0.65, 9.5, backMaterial);
back.position.z = -4.52;
phone.add(back);
const cameraBar = roundedBody(65, 17, 3.3, 7.8, new THREE.MeshStandardMaterial({ color: 0x666c6b, metalness: 0.75, roughness: 0.29 }));
cameraBar.position.set(0, 42, -6.3);
phone.add(cameraBar);
const lensHousing = roundedBody(33, 11, 0.5, 5.3, new THREE.MeshStandardMaterial({ color: 0x14191b, roughness: 0.22, metalness: 0.35 }));
lensHousing.position.set(-11, 42, -8.1);
phone.add(lensHousing);
for (const offset of [-19, -4]) {
  const lens = new THREE.Mesh(new THREE.CircleGeometry(3.5, 32), new THREE.MeshStandardMaterial({ color: 0x17252f, roughness: 0.18, metalness: 0.45, side: THREE.DoubleSide }));
  lens.position.set(offset, 42, -8.38);
  phone.add(lens);
}
const flash = new THREE.Mesh(new THREE.CircleGeometry(2.1, 32), new THREE.MeshBasicMaterial({ color: 0xe0d3b6, side: THREE.DoubleSide }));
flash.position.set(21, 42, -8.02);
phone.add(flash);
for (const [height, length] of [[35, 11], [15, 19]]) {
  const button = roundedBody(0.8, length, 2.1, 0.35, bodyMaterial);
  button.position.set(35.6, height, 0);
  phone.add(button);
}

let screenshot;
function updateScreen() {
  if (!screenshot) return;
  const width = screenCanvas.width, height = screenCanvas.height;
  screenContext.fillStyle = '#ffffff';
  screenContext.fillRect(0, 0, width, height);
  const scale = fit.value === 'cover' ? Math.max(width / screenshot.naturalWidth, height / screenshot.naturalHeight) : Math.min(width / screenshot.naturalWidth, height / screenshot.naturalHeight);
  const imageWidth = screenshot.naturalWidth * scale, imageHeight = screenshot.naturalHeight * scale;
  screenContext.drawImage(screenshot, (width - imageWidth) / 2, (height - imageHeight) / 2, imageWidth, imageHeight);
  screenTexture.needsUpdate = true;
}
function loadImage(url, done) {
  const image = new Image();
  image.onload = () => { screenshot = image; updateScreen(); done?.(); };
  image.onerror = () => { message.textContent = 'Не вдалося відкрити зображення.'; done?.(); };
  image.src = url;
}
loadImage('assets/example.png');
document.querySelector('#upload').addEventListener('change', event => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { message.textContent = 'Виберіть PNG, JPEG або WebP.'; return; }
  const url = URL.createObjectURL(file);
  loadImage(url, () => URL.revokeObjectURL(url));
  message.textContent = `Зображення: ${file.name}`;
});
fit.addEventListener('change', updateScreen);

function setView(x, y, z) {
  controls.target.set(0, 0, 0);
  camera.position.set(x, y, z);
  camera.up.set(0, 1, 0);
  controls.update();
}
document.querySelector('#front').addEventListener('click', () => setView(0, 0, 355));
document.querySelector('#iso').addEventListener('click', () => setView(185, 135, 300));
document.querySelector('#back').addEventListener('click', () => setView(0, 0, -355));
setView(0, 0, 355);

function resize() {
  const width = viewport.clientWidth, height = viewport.clientHeight;
  if (!width || !height) return;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(viewport);
resize();

background.addEventListener('change', () => {
  const color = background.value === 'dark' ? 0x17242f : 0xe4ebef;
  renderer.setClearColor(color, background.value === 'transparent' ? 0 : 1);
});

document.querySelector('#download').addEventListener('click', () => {
  const [width, height] = document.querySelector('#size').value.split('x').map(Number);
  const oldPixelRatio = renderer.getPixelRatio();
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
  renderer.domElement.toBlob(blob => {
    if (!blob) { message.textContent = 'Не вдалося створити PNG.'; return; }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pixel8-mockup.png';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
  renderer.setPixelRatio(oldPixelRatio);
  resize();
});

renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); });
