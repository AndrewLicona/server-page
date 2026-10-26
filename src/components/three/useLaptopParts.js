import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useAcerTextures, styleLaptopMesh } from "./laptopMaterials";

/**
 * Cuánto sube el borde superior de la tapa cuando esta se cierra un poco.
 *
 * Al girar la tapa hacia delante el borde superior se endereza y sube unos
 * centímetros. Reservamos esa altura en el encuadre para que la cámara no lo
 * recorte en los fotogramas donde la tapa está a medio cerrar.
 */
const LID_LIFT = 0.035;

/**
 * Normal dominante de una malla (suma de las normales de sus vértices).
 */
function dominantNormal(geometry) {
  const attribute = geometry.getAttribute("normal");
  const normal = new THREE.Vector3();
  if (!attribute) return normal.set(0, 1, 0);

  for (let i = 0; i < attribute.count; i++) {
    normal.x += attribute.getX(i);
    normal.y += attribute.getY(i);
    normal.z += attribute.getZ(i);
  }
  if (normal.lengthSq() < 1e-9) normal.set(0, 1, 0);
  return normal.normalize();
}

/**
 * Localiza las cuatro esquinas del LCD: la zona visible de la pantalla.
 *
 * En el GLB la malla `display` es el cristal de la pantalla y la malla `bezel`
 * es el marco que lo rodea. Entre las dos dejan un hueco exacto: el rectángulo
 * del LCD, que es la única parte de la malla con superficie (el resto es el
 * perfil curvo del bisel, formado por triángulos minúsculos). Por eso se
 * busca el triángulo más grande: sus vértices son las esquinas de la pantalla.
 *
 * Devuelve las esquinas ordenadas como lo ve el usuario: abajo-izquierda,
 * abajo-derecha, arriba-derecha, arriba-izquierda.
 */
function findLcdCorners(displayMesh) {
  const geometry = displayMesh.geometry;
  const position = geometry.getAttribute("position");
  const index = geometry.index;
  if (!position || !index) return null;

  const readVertex = (i) => new THREE.Vector3().fromBufferAttribute(position, i);

  // --- Triángulos de la malla ------------------------------------------------
  const triangles = [];
  let maxArea = 0;
  for (let i = 0; i < index.count; i += 3) {
    const a = readVertex(index.getX(i));
    const b = readVertex(index.getX(i + 1));
    const c = readVertex(index.getX(i + 2));
    const area = new THREE.Vector3()
      .subVectors(b, a)
      .cross(new THREE.Vector3().subVectors(c, a))
      .length() / 2;
    triangles.push({ ids: [index.getX(i), index.getX(i + 1), index.getX(i + 2)], area });
    if (area > maxArea) maxArea = area;
  }
  if (!(maxArea > 0.01)) return null;

  const ids = new Set();
  triangles.forEach((triangle) => {
    if (triangle.area > maxArea * 0.5) {
      triangle.ids.forEach((id) => ids.add(id));
    }
  });
  if (ids.size !== 4) return null;

  const points = [...ids].map(readVertex);

  // --- Ejes de la pantalla -------------------------------------------------
  // La pantalla mira hacia el frente (-Z): lo que ve el usuario está en ese
  // lado, de modo que su "derecha" es el eje -X del mundo.
  const normal = dominantNormal(geometry);
  if (normal.z > 0) normal.negate();

  const up = new THREE.Vector3(0, 1, 0);
  up.addScaledVector(normal, -up.dot(normal));
  if (up.lengthSq() < 1e-9) return null;
  up.normalize();

  const right = new THREE.Vector3()
    .crossVectors(normal.clone().negate(), up)
    .normalize();

  const projected = points
    .map((point) => ({ point, r: point.dot(right), u: point.dot(up) }))
    .sort((a, b) => a.u - b.u);

  const bottom = projected.slice(0, 2).sort((a, b) => a.r - b.r);
  const top = projected.slice(2).sort((a, b) => a.r - b.r);

  // --- Validación: tiene que ser un rectángulo plausible -------------------
  const width = bottom[1].r - bottom[0].r;
  const height = top[0].u - bottom[0].u;
  if (!(width > 0.05) || !(height > 0.05)) return null;
  if (Math.abs(top[1].r - top[0].r - width) > width * 0.2) return null;
  if (Math.abs(top[0].u - top[1].u) > height * 0.2) return null;

  return {
    corners: [bottom[0].point, bottom[1].point, top[1].point, top[0].point],
    width,
    height,
    normal,
  };
}

/**
 * Panel de la pantalla: un quad exacto sobre el rectángulo del LCD.
 *
 * Los UV de la malla original son degenerados (todas las caras tienen area
 * cero en espacio UV), por lo que no se puede mapear ninguna textura encima:
 * el dashboard aparecia deformado y fuera de sitio. En su lugar creamos un
 * rectangulo propio, con UV limpias, cuyas esquinas son las del propio LCD.
 * Asi el dashboard queda literalmente sobre la pantalla del modelo, dentro del
 * marco, y no flotando delante.
 */
function buildScreenPanel(displayMesh) {
  const lcd = findLcdCorners(displayMesh);
  if (!lcd) return null;

  const { corners, width, height, normal } = lcd;

  // Centro del LCD y un pequeño reborde para que el marco lo recorte.
  const center = new THREE.Vector3();
  corners.forEach((corner) => center.add(corner));
  center.divideScalar(corners.length);

  const inset = 0.996;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      corners
        .map((corner) => {
          const point = corner
            .clone()
            .sub(center)
            .multiplyScalar(inset)
            .add(center)
            .addScaledVector(normal, 0.0012);
          return [point.x, point.y, point.z];
        })
        .flat(),
      3
    )
  );
  geometry.setAttribute(
    "uv",
    new THREE.Float32BufferAttribute(
      [0, 0, 1, 0, 1, 1, 0, 1],
      2
    )
  );
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  geometry.computeVertexNormals();

  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    toneMapped: false,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const panel = new THREE.Mesh(geometry, material);
  panel.name = "screen-panel";
  panel.renderOrder = 2;
  panel.userData.screenSize = { width, height };
  return panel;
}

/**
 * Prepara las piezas del GLB para poder animarlas por separado.
 *
 * El archivo exportado desde Sketchfab agrupa la tapa (marco, bisel y
 * pantalla) bajo un nodo con su propia matriz, mientras que el resto forma la
 * base. Para poder abrir y cerrar la tapa necesitamos dos grupos:
 *
 *  1. Cocemos la matriz de mundo directamente en la geometría (`applyMatrix4`).
 *     Así cada pieza queda en coordenadas de mundo y queda libre de jerarquía.
 *  2. Recreamos mallas nuevas con geometría y material clonados, en vez de
 *     reutilizar las del GLTF. Esto es obligatorio por dos razones: `useGLTF`
 *     cachea el objeto y comparte materiales entre instancias (si modificamos
 *     el material de la pantalla la contaminaríamos en todas partes), y
 *     queremos poder sustituir la pantalla por una textura viva.
 *
 * Nota sobre los nombres: el cargador de glTF sanea los nombres de nodo y
 * cambia los caracteres reservados (el punto entre otros) por "_", así que
 * "Cube.001_3" llega como "Cube_001_3". Por eso la tapa se localiza por su
 * jerarquía (la pantalla y sus hermanos) y no por el nombre del nodo.
 */
export function useLaptopParts() {
  const gltf = useGLTF("/models/laptop.glb");
  const textures = useAcerTextures();

  const parts = useMemo(() => {
    const root = gltf.scene;
    root.updateMatrixWorld(true);

    const countMeshes = (rootNode) => {
      let count = 0;
      rootNode.traverse((child) => {
        if (child.isMesh) count += 1;
      });
      return count;
    };

    // --- Localizamos el grupo de la tapa ------------------------------------
    // La pantalla es la pieza que no puede faltar: el grupo que la contiene
    // junto con el bisel y la carcasa exterior es la tapa.
    let lidRoot = null;
    root.traverse((object) => {
      if (lidRoot || !object.isMesh) return;
      if (object.material?.name !== "display") return;

      let candidate = object.parent;
      while (candidate && candidate !== root && countMeshes(candidate) < 2) {
        candidate = candidate.parent;
      }
      lidRoot = candidate && candidate !== root ? candidate : object.parent;
    });

    // Plan B: si el material no llegara con nombre, buscamos el nodo que
    // contiene la malla de la pantalla por su posición en la jerarquía.
    if (!lidRoot) {
      root.traverse((object) => {
        if (!lidRoot && /^Cube_001/.test(object.name)) lidRoot = object;
      });
    }

    const belongsToLid = (object) => {
      let current = object;
      while (current) {
        if (current === lidRoot) return true;
        current = current.parent;
      }
      return false;
    };

    // --- Separamos base y tapa ---------------------------------------------
    const base = [];
    const lid = [];

    root.traverse((object) => {
      if (!object.isMesh) return;

      const geometry = object.geometry.clone();
      geometry.applyMatrix4(object.matrixWorld);

      const material = object.material.clone();
      // El original viene con doubleSided; lo conservamos para no perder caras.
      material.side = THREE.DoubleSide;
      material.needsUpdate = true;

      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = `${object.name}:${material.name}`;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const bucket = belongsToLid(object) ? "lid" : "base";

      // Materiales del Acer real (azul cepillado, teclado negro, etc.).
      styleLaptopMesh(mesh, bucket, textures);

      (bucket === "lid" ? lid : base).push(mesh);
    });

    // --- Geometría de la pantalla ------------------------------------------
    let display = null;
    for (const mesh of lid) {
      if (mesh.material.name === "display") display = mesh;
    }

    // --- Cajas envolvente ---------------------------------------------------
    const bounds = new THREE.Box3();
    const lidBounds = new THREE.Box3();
    const baseBounds = new THREE.Box3();
    base.forEach((mesh) => {
      bounds.expandByObject(mesh);
      baseBounds.expandByObject(mesh);
    });
    lid.forEach((mesh) => {
      lidBounds.expandByObject(mesh);
      bounds.expandByObject(mesh);
    });

    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());

    // --- Esquinas del modelo ------------------------------------------------
    // Las 8 esquinas de la caja envolvente, en el marco del rig (origen en el
    // centro del portátil). La cámara las usa para calcular a qué distancia
    // encuadrar el modelo, sea cual sea su giro.
    //
    // Las esquinas de arriba se Raisean un poco: al cerrar la tapa su borde
    // superior sube (al enderezarse), y sin esta holgura la cámara podría
    // cortarlo en los fotogramas donde la tapa está a medio cerrar.
    const corners = [];
    for (const x of [bounds.min.x, bounds.max.x]) {
      for (const y of [bounds.min.y, bounds.max.y]) {
        for (const z of [bounds.min.z, bounds.max.z]) {
          const corner = new THREE.Vector3(x, y, z).sub(center);
          if (corner.y > 0) corner.y += LID_LIFT;
          corners.push(corner);
        }
      }
    }

    // --- Panel de pantalla --------------------------------------------------
    // La malla original no admite texturas (UV degenerados), asi que creamos
    // un panel propio cuyas esquinas son las del LCD: el dashboard queda
    // literalmente dentro de la pantalla del modelo.
    let screenPanel = null;
    if (display) {
      screenPanel = buildScreenPanel(display);
      if (screenPanel) lid.push(screenPanel);
    }

    // --- Bisagra ------------------------------------------------------------
    // La tapa del GLB es una placa inclinada hacia atrás que arranca en el
    // borde trasero del teclado. Girando ese borde hacia delante (rotación
    // negativa en X) la pantalla cae sobre el teclado, como en un portátil
    // real. El ángulo de cierre sale de la geometría: 101 grados.
    const hinge = new THREE.Vector3(
      (lidBounds.min.x + lidBounds.max.x) / 2,
      lidBounds.min.y,
      lidBounds.min.z
    );

    return {
      base,
      lid,
      display,
      screenPanel,
      bounds,
      baseBounds,
      lidBounds,
      size,
      center,
      corners,
      hinge,
    };
  }, [gltf, textures]);

  useEffect(() => {
    return () => {
      parts.base.forEach((mesh) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
      parts.lid.forEach((mesh) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
    };
  }, [parts]);
  return parts;
}

useGLTF.preload("/models/laptop.glb");
