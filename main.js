import * as THREE from "three";
import { MindARThree } from "mindar-image-three";

window.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const patternURL = atob(params.get("pattern"));
  const videoURL = atob(params.get("video"));
  
  // console.log(`Pattern  URL : ${patternURL}\nVideo    URL : ${videoURL}`);

  window.history.replaceState({}, document.title, window.location.pathname);

  const mindarThree = new MindARThree({
    container: document.querySelector("#container"),
    imageTargetSrc: patternURL,
  });

  const { renderer, scene, camera } = mindarThree;
  const anchor = mindarThree.addAnchor(0);

  const video = document.createElement("video");
  video.src = videoURL;
  video.crossOrigin = "anonymous";
  video.loop = true;
  video.playsInline = true;
  video.muted = false;
  video.preload = "auto";
  video.style.display = "none";
  document.body.appendChild(video);

  const texture = new THREE.VideoTexture(video);
  const geometry = new THREE.PlaneGeometry(1, 0.55);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const plane = new THREE.Mesh(geometry, material);
  anchor.group.add(plane);

  anchor.onTargetFound = () => {
    video.play().catch((err) => {
      console.warn("⚠️ MARKER LOST:", err);
    });
  };

  anchor.onTargetLost = () => {
    video.pause();
  };

  await mindarThree.start();
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });

  try {
    await video.play();
  } catch (err) {
    console.warn("⚠️ AUTOPLAY PREVENTED, [ MARKER LOST ]");
  }
});
