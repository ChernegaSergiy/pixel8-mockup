# Interactive Pixel 8 Mockup

Run from this directory:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/`. An internet connection is not required.

Drag to rotate the phone, scroll to zoom, and right-drag to pan. Upload a PNG, JPEG, or WebP image and choose whether to fit or crop it. PNG exports use the selected aspect ratio and resolution; screenshots are not sent to a server or stored between sessions.

The model is an independent interpretation of the Pixel 8, not an official Google model. The body dimensions of 70.8 × 150.5 × 8.9 mm and 20:9 screen aspect ratio follow [Google's specifications](https://support.google.com/pixelphone/answer/7158570). Corner radii, bezel width, camera, back panel, and buttons are approximate. The front uses the provided generated `pixel8-generated.png`; the sides and back use generated material textures on 3D geometry. These textures are not photographs of a Pixel 8. The screen has approximate rounded corners and a circular camera cutout.

Three.js is bundled locally; its license is in `vendor/three-LICENSE.txt`.
