/**
 * Authors an original villa as glTF 2.0 binary (.glb), units in meters.
 * Named nodes: eksterior, ruang tamu, kamar, dek
 */
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "../public/models/villa.glb");

/** @typedef {[number, number, number]} Vec3 */
/** @typedef {[number, number, number, number]} Rgba */

/**
 * @param {number} w
 * @param {number} h
 * @param {number} d
 * @param {Vec3} pos
 */
function boxGeometry(w, h, d, pos) {
  const hx = w / 2;
  const hy = h / 2;
  const hz = d / 2;
  const [px, py, pz] = pos;

  const faces = [
    [
      [-hx, -hy, hz],
      [hx, -hy, hz],
      [hx, hy, hz],
      [-hx, hy, hz],
      [0, 0, 1],
    ],
    [
      [hx, -hy, -hz],
      [-hx, -hy, -hz],
      [-hx, hy, -hz],
      [hx, hy, -hz],
      [0, 0, -1],
    ],
    [
      [hx, -hy, hz],
      [hx, -hy, -hz],
      [hx, hy, -hz],
      [hx, hy, hz],
      [1, 0, 0],
    ],
    [
      [-hx, -hy, -hz],
      [-hx, -hy, hz],
      [-hx, hy, hz],
      [-hx, hy, -hz],
      [-1, 0, 0],
    ],
    [
      [-hx, hy, hz],
      [hx, hy, hz],
      [hx, hy, -hz],
      [-hx, hy, -hz],
      [0, 1, 0],
    ],
    [
      [-hx, -hy, -hz],
      [hx, -hy, -hz],
      [hx, -hy, hz],
      [-hx, -hy, hz],
      [0, -1, 0],
    ],
  ];

  const positions = new Float32Array(24 * 3);
  const normals = new Float32Array(24 * 3);
  const indices = new Uint16Array(36);
  let vi = 0;
  let ii = 0;
  for (const face of faces) {
    const n = face[4];
    const base = vi;
    for (let c = 0; c < 4; c++) {
      const p = face[c];
      positions[vi * 3] = p[0] + px;
      positions[vi * 3 + 1] = p[1] + py;
      positions[vi * 3 + 2] = p[2] + pz;
      normals[vi * 3] = n[0];
      normals[vi * 3 + 1] = n[1];
      normals[vi * 3 + 2] = n[2];
      vi++;
    }
    indices[ii++] = base;
    indices[ii++] = base + 1;
    indices[ii++] = base + 2;
    indices[ii++] = base;
    indices[ii++] = base + 2;
    indices[ii++] = base + 3;
  }
  return { positions, normals, indices };
}

/** Material palette — distinct enough to read against stone fog */
const MAT = {
  lawn: [0.42, 0.5, 0.38, 1],
  stone: [0.55, 0.52, 0.47, 1],
  plaster: [0.94, 0.91, 0.86, 1],
  roof: [0.28, 0.24, 0.21, 1],
  glass: [0.55, 0.7, 0.74, 1],
  foliage: [0.25, 0.38, 0.28, 1],
  wood: [0.52, 0.38, 0.28, 1],
  linen: [0.82, 0.78, 0.72, 1],
  darkWood: [0.28, 0.2, 0.16, 1],
  deck: [0.58, 0.45, 0.34, 1],
  water: [0.35, 0.52, 0.5, 1],
};

/**
 * @typedef {{ color: Rgba, boxes: [number, number, number, number, number, number][] }} Part
 * @type {{ name: string, parts: Part[] }[]}
 */
const spaces = [
  {
    name: "eksterior",
    parts: [
      {
        color: MAT.lawn,
        boxes: [[28, 0.04, 22, 0, 0.02, 1]],
      },
      {
        color: MAT.stone,
        boxes: [
          [14.2, 0.25, 9.2, 0, 0.12, 0],
          [1.8, 0.12, 3.5, 2.4, 0.2, -5.8],
          [1.2, 0.35, 0.8, -4.5, 0.3, -5.5],
        ],
      },
      {
        color: MAT.plaster,
        boxes: [
          [13.6, 3.2, 0.35, 0, 1.85, -4.2],
          [0.35, 3.2, 8.4, -6.7, 1.85, 0],
          [0.35, 3.2, 8.4, 6.7, 1.85, 0],
          [13.6, 3.2, 0.35, 0, 1.85, 4.2],
        ],
      },
      {
        color: MAT.roof,
        boxes: [
          [14.4, 0.2, 9.4, 0, 3.55, 0],
          [14.8, 0.08, 9.8, 0, 3.7, 0],
        ],
      },
      {
        color: MAT.glass,
        boxes: [
          [3.2, 2.4, 0.12, -2.2, 1.7, -4.01],
          [2.4, 2.6, 0.12, 2.4, 1.8, -4.01],
        ],
      },
      {
        color: MAT.foliage,
        boxes: [
          [0.6, 1.1, 0.6, -5.2, 0.7, -5.2],
          [0.5, 0.9, 0.5, 5.4, 0.55, -5.0],
        ],
      },
    ],
  },
  {
    name: "ruang tamu",
    parts: [
      {
        color: MAT.wood,
        boxes: [[7.5, 0.08, 6.5, -2.2, 0.28, -0.3]],
      },
      {
        color: MAT.plaster,
        boxes: [
          [7.5, 2.9, 0.12, -2.2, 1.75, 2.9],
          [0.12, 2.9, 6.5, 1.55, 1.75, -0.3],
          [0.12, 2.9, 6.5, -5.9, 1.75, -0.3],
        ],
      },
      {
        color: MAT.linen,
        boxes: [
          [2.8, 0.45, 1.0, -3.4, 0.55, 0.8],
          [2.8, 0.55, 0.35, -3.4, 0.95, 1.2],
        ],
      },
      {
        color: MAT.darkWood,
        boxes: [
          [1.4, 0.4, 0.8, -1.2, 0.5, -0.4],
          [0.08, 1.6, 2.2, -5.7, 1.4, -1.5],
          [1.8, 0.04, 0.9, -0.4, 1.1, 2.2],
        ],
      },
    ],
  },
  {
    name: "kamar",
    parts: [
      {
        color: MAT.wood,
        boxes: [[5.2, 0.08, 5.0, 3.8, 0.28, 0.6]],
      },
      {
        color: MAT.plaster,
        boxes: [
          [5.2, 2.9, 0.12, 3.8, 1.75, 3.05],
          [0.12, 2.9, 5.0, 1.7, 1.75, 0.6],
          [0.12, 2.9, 5.0, 6.3, 1.75, 0.6],
          [5.2, 2.9, 0.12, 3.8, 1.75, -1.85],
        ],
      },
      {
        color: MAT.linen,
        boxes: [[2.2, 0.35, 1.8, 4.2, 0.55, 1.4]],
      },
      {
        color: MAT.darkWood,
        boxes: [
          [2.3, 0.55, 0.25, 4.2, 0.85, 2.25],
          [0.45, 0.4, 0.45, 2.8, 0.5, 2.0],
          [1.6, 2.2, 0.5, 5.8, 1.4, -1.2],
        ],
      },
    ],
  },
  {
    name: "dek",
    parts: [
      {
        color: MAT.deck,
        boxes: [[10.5, 0.12, 4.2, 0, 0.35, 5.6]],
      },
      {
        color: MAT.wood,
        boxes: [
          [10.5, 0.9, 0.08, 0, 0.85, 7.65],
          [0.08, 0.9, 4.2, -5.2, 0.85, 5.6],
          [0.08, 0.9, 4.2, 5.2, 0.85, 5.6],
        ],
      },
      {
        color: MAT.linen,
        boxes: [
          [1.6, 0.4, 0.7, -2.5, 0.6, 5.4],
          [1.6, 0.4, 0.7, -0.5, 0.6, 5.4],
        ],
      },
      {
        color: MAT.darkWood,
        boxes: [[0.7, 0.35, 0.7, -1.5, 0.55, 6.4]],
      },
      {
        color: MAT.water,
        boxes: [[3.5, 0.05, 2.2, 3.2, 0.32, 5.8]],
      },
      {
        color: MAT.foliage,
        boxes: [[0.5, 0.7, 0.5, 4.8, 0.75, 7.2]],
      },
    ],
  },
];

const materials = [];
const materialKey = new Map();

/** @param {Rgba} color */
function materialIndex(color) {
  const key = color.join(",");
  if (materialKey.has(key)) return materialKey.get(key);
  const idx = materials.length;
  materials.push({
    name: `mat_${idx}`,
    pbrMetallicRoughness: {
      baseColorFactor: color,
      metallicFactor: 0.02,
      roughnessFactor: 0.88,
    },
  });
  materialKey.set(key, idx);
  return idx;
}

/** @type {{ name: string, primitives: { mat: number, positions: Float32Array, normals: Float32Array, indices: Uint16Array }[] }[]} */
const meshBuilds = [];

for (const space of spaces) {
  /** @type {{ mat: number, positions: Float32Array, normals: Float32Array, indices: Uint16Array }[]} */
  const primitives = [];
  for (const part of space.parts) {
    const allPos = [];
    const allNorm = [];
    const allIdx = [];
    let localVerts = 0;
    for (const [w, h, d, x, y, z] of part.boxes) {
      const g = boxGeometry(w, h, d, [x, y, z]);
      for (let i = 0; i < g.indices.length; i++) {
        allIdx.push(g.indices[i] + localVerts);
      }
      for (let i = 0; i < g.positions.length; i++) {
        allPos.push(g.positions[i]);
        allNorm.push(g.normals[i]);
      }
      localVerts += g.positions.length / 3;
    }
    primitives.push({
      mat: materialIndex(part.color),
      positions: new Float32Array(allPos),
      normals: new Float32Array(allNorm),
      indices: new Uint16Array(allIdx),
    });
  }
  meshBuilds.push({ name: space.name, primitives });
}

// Pack all primitive buffers: indices (aligned), then positions, then normals
const indexChunks = [];
const positionChunks = [];
const normalChunks = [];

/** @type {{ name: string, prims: { mat: number, indexCount: number, indexByteOffset: number, vertexCount: number, vertexFloatOffset: number }[] }[]} */
const packed = [];

let indexByteOffset = 0;
let vertexFloatOffset = 0;

for (const mesh of meshBuilds) {
  const prims = [];
  for (const prim of mesh.primitives) {
    prims.push({
      mat: prim.mat,
      indexCount: prim.indices.length,
      indexByteOffset,
      vertexCount: prim.positions.length / 3,
      vertexFloatOffset,
    });
    indexChunks.push(Buffer.from(prim.indices.buffer));
    indexByteOffset += prim.indices.byteLength;
    if (indexByteOffset % 4 !== 0) {
      const pad = 4 - (indexByteOffset % 4);
      indexChunks.push(Buffer.alloc(pad));
      indexByteOffset += pad;
    }
    positionChunks.push(Buffer.from(prim.positions.buffer));
    normalChunks.push(Buffer.from(prim.normals.buffer));
    vertexFloatOffset += prim.positions.length;
  }
  packed.push({ name: mesh.name, prims });
}

const indexBuffer = Buffer.concat(indexChunks);
const positionBuffer = Buffer.concat(positionChunks);
const normalBuffer = Buffer.concat(normalChunks);

const indexPad = (4 - (indexBuffer.length % 4)) % 4;
const alignedIndex = Buffer.concat([indexBuffer, Buffer.alloc(indexPad)]);
const posOffset = alignedIndex.length;
const normOffset = posOffset + positionBuffer.length;
const binBuffer = Buffer.concat([alignedIndex, positionBuffer, normalBuffer]);

const accessors = [];
const bufferViews = [
  { buffer: 0, byteOffset: 0, byteLength: alignedIndex.length, target: 34963 },
  {
    buffer: 0,
    byteOffset: posOffset,
    byteLength: positionBuffer.length,
    target: 34962,
  },
  {
    buffer: 0,
    byteOffset: normOffset,
    byteLength: normalBuffer.length,
    target: 34962,
  },
];
const meshes = [];
const nodes = [];
const sceneNodes = [];

const posF32 = new Float32Array(
  positionBuffer.buffer,
  positionBuffer.byteOffset,
  positionBuffer.byteLength / 4,
);

for (const mesh of packed) {
  const primitives = [];
  for (const prim of mesh.prims) {
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < prim.vertexCount; i++) {
      const base = prim.vertexFloatOffset + i * 3;
      for (let a = 0; a < 3; a++) {
        const v = posF32[base + a];
        if (v < min[a]) min[a] = v;
        if (v > max[a]) max[a] = v;
      }
    }

    const indexAccessor = accessors.length;
    accessors.push({
      bufferView: 0,
      byteOffset: prim.indexByteOffset,
      componentType: 5123,
      count: prim.indexCount,
      type: "SCALAR",
    });
    const posAccessor = accessors.length;
    accessors.push({
      bufferView: 1,
      byteOffset: prim.vertexFloatOffset * 4,
      componentType: 5126,
      count: prim.vertexCount,
      type: "VEC3",
      max,
      min,
    });
    const normAccessor = accessors.length;
    accessors.push({
      bufferView: 2,
      byteOffset: prim.vertexFloatOffset * 4,
      componentType: 5126,
      count: prim.vertexCount,
      type: "VEC3",
    });

    primitives.push({
      attributes: { POSITION: posAccessor, NORMAL: normAccessor },
      indices: indexAccessor,
      material: prim.mat,
    });
  }

  const meshIndex = meshes.length;
  meshes.push({ name: mesh.name, primitives });
  const nodeIndex = nodes.length;
  nodes.push({ name: mesh.name, mesh: meshIndex });
  sceneNodes.push(nodeIndex);
}

const gltf = {
  asset: { version: "2.0", generator: "Villa-iQuee/generate-villa" },
  scenes: [{ name: "villa", nodes: sceneNodes }],
  scene: 0,
  nodes,
  meshes,
  materials,
  accessors,
  bufferViews,
  buffers: [{ byteLength: binBuffer.length }],
};

const json = Buffer.from(JSON.stringify(gltf));
const jsonPad = (4 - (json.length % 4)) % 4;
const jsonChunk = Buffer.concat([json, Buffer.alloc(jsonPad, 0x20)]);
const binPad = (4 - (binBuffer.length % 4)) % 4;
const binChunk = Buffer.concat([binBuffer, Buffer.alloc(binPad)]);
const totalLength = 12 + 8 + jsonChunk.length + 8 + binChunk.length;

const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546c67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(totalLength, 8);
const jsonHeader = Buffer.alloc(8);
jsonHeader.writeUInt32LE(jsonChunk.length, 0);
jsonHeader.writeUInt32LE(0x4e4f534a, 4);
const binHeader = Buffer.alloc(8);
binHeader.writeUInt32LE(binChunk.length, 0);
binHeader.writeUInt32LE(0x004e4942, 4);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(
  outPath,
  Buffer.concat([header, jsonHeader, jsonChunk, binHeader, binChunk]),
);
console.log(`Wrote ${outPath} (${totalLength} bytes)`);
console.log("Nodes:", nodes.map((n) => n.name).join(", "));
console.log("Materials:", materials.length);
