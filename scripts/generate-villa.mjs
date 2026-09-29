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
 * @returns {{ positions: Float32Array, normals: Float32Array, indices: Uint16Array }}
 */
function boxGeometry(w, h, d, pos) {
  const hx = w / 2;
  const hy = h / 2;
  const hz = d / 2;
  const [px, py, pz] = pos;

  // 24 verts (unique normals per face)
  const faces = [
    // +Z
    [
      [-hx, -hy, hz],
      [hx, -hy, hz],
      [hx, hy, hz],
      [-hx, hy, hz],
      [0, 0, 1],
    ],
    // -Z
    [
      [hx, -hy, -hz],
      [-hx, -hy, -hz],
      [-hx, hy, -hz],
      [hx, hy, -hz],
      [0, 0, -1],
    ],
    // +X
    [
      [hx, -hy, hz],
      [hx, -hy, -hz],
      [hx, hy, -hz],
      [hx, hy, hz],
      [1, 0, 0],
    ],
    // -X
    [
      [-hx, -hy, -hz],
      [-hx, -hy, hz],
      [-hx, hy, hz],
      [-hx, hy, -hz],
      [-1, 0, 0],
    ],
    // +Y
    [
      [-hx, hy, hz],
      [hx, hy, hz],
      [hx, hy, -hz],
      [-hx, hy, -hz],
      [0, 1, 0],
    ],
    // -Y
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

/** @type {{ name: string, color: Rgba, boxes: [number, number, number, number, number, number][] }[]} */
const spaces = [
  {
    name: "eksterior",
    color: [0.91, 0.886, 0.847, 1],
    boxes: [
      // lawn (thin)
      [28, 0.04, 22, 0, 0.02, 1],
      // podium
      [14.2, 0.25, 9.2, 0, 0.12, 0],
      // walls
      [13.6, 3.2, 0.35, 0, 1.85, -4.2],
      [0.35, 3.2, 8.4, -6.7, 1.85, 0],
      [0.35, 3.2, 8.4, 6.7, 1.85, 0],
      // roof
      [14.4, 0.2, 9.4, 0, 3.55, 0],
      [14.8, 0.08, 9.8, 0, 3.7, 0],
      // glass panels (as solid tinted boxes)
      [3.2, 2.4, 0.12, -2.2, 1.7, -4.01],
      [2.4, 2.6, 0.12, 2.4, 1.8, -4.01],
      // path + planters
      [1.8, 0.12, 3.5, 2.4, 0.2, -5.8],
      [0.6, 1.1, 0.6, -5.2, 0.7, -5.2],
      [0.5, 0.9, 0.5, 5.4, 0.55, -5.0],
      [1.2, 0.35, 0.8, -4.5, 0.3, -5.5],
    ],
  },
  {
    name: "ruang tamu",
    color: [0.78, 0.7, 0.6, 1],
    boxes: [
      [7.5, 0.08, 6.5, -2.2, 0.28, -0.3],
      [7.5, 2.9, 0.12, -2.2, 1.75, 2.9],
      [0.12, 2.9, 6.5, 1.55, 1.75, -0.3],
      [2.8, 0.45, 1.0, -3.4, 0.55, 0.8],
      [2.8, 0.55, 0.35, -3.4, 0.95, 1.2],
      [1.4, 0.4, 0.8, -1.2, 0.5, -0.4],
      [0.08, 1.6, 2.2, -5.7, 1.4, -1.5],
      [1.8, 0.04, 0.9, -0.4, 1.1, 2.2],
    ],
  },
  {
    name: "kamar",
    color: [0.85, 0.82, 0.76, 1],
    boxes: [
      [5.2, 0.08, 5.0, 3.8, 0.28, 0.6],
      [5.2, 2.9, 0.12, 3.8, 1.75, 3.05],
      [0.12, 2.9, 5.0, 1.7, 1.75, 0.6],
      [2.2, 0.35, 1.8, 4.2, 0.55, 1.4],
      [2.3, 0.55, 0.25, 4.2, 0.85, 2.25],
      [0.45, 0.4, 0.45, 2.8, 0.5, 2.0],
      [1.6, 2.2, 0.5, 5.8, 1.4, -1.2],
    ],
  },
  {
    name: "dek",
    color: [0.55, 0.46, 0.38, 1],
    boxes: [
      [10.5, 0.12, 4.2, 0, 0.35, 5.6],
      [10.5, 0.9, 0.08, 0, 0.85, 7.65],
      [0.08, 0.9, 4.2, -5.2, 0.85, 5.6],
      [0.08, 0.9, 4.2, 5.2, 0.85, 5.6],
      [1.6, 0.4, 0.7, -2.5, 0.6, 5.4],
      [1.6, 0.4, 0.7, -0.5, 0.6, 5.4],
      [0.7, 0.35, 0.7, -1.5, 0.55, 6.4],
      [3.5, 0.05, 2.2, 3.2, 0.32, 5.8],
      [0.5, 0.7, 0.5, 4.8, 0.75, 7.2],
    ],
  },
];

// Build interleaved buffer data
const positionChunks = [];
const normalChunks = [];
const indexChunks = [];
/** @type {{ name: string, meshIndex: number, color: Rgba, indexCount: number, indexByteOffset: number, vertexCount: number, vertexByteOffset: number }[]} */
const meshMeta = [];

let vertexOffset = 0;
let indexByteOffset = 0;
let vertexByteOffset = 0;

for (const space of spaces) {
  const allPos = [];
  const allNorm = [];
  const allIdx = [];
  let localVerts = 0;

  for (const [w, h, d, x, y, z] of space.boxes) {
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

  const pos = new Float32Array(allPos);
  const norm = new Float32Array(allNorm);
  const idx = new Uint16Array(allIdx);

  meshMeta.push({
    name: space.name,
    meshIndex: meshMeta.length,
    color: space.color,
    indexCount: idx.length,
    indexByteOffset,
    vertexCount: localVerts,
    vertexByteOffset,
  });

  indexChunks.push(Buffer.from(idx.buffer));
  indexByteOffset += idx.byteLength;
  // align to 4
  if (indexByteOffset % 4 !== 0) {
    const pad = 4 - (indexByteOffset % 4);
    indexChunks.push(Buffer.alloc(pad));
    indexByteOffset += pad;
  }

  positionChunks.push(Buffer.from(pos.buffer));
  normalChunks.push(Buffer.from(norm.buffer));
  vertexByteOffset += pos.byteLength;
  vertexOffset += localVerts;
}

const indexBuffer = Buffer.concat(indexChunks);
const positionBuffer = Buffer.concat(positionChunks);
const normalBuffer = Buffer.concat(normalChunks);

// Layout: indices | positions | normals  (all aligned)
const indexPad = (4 - (indexBuffer.length % 4)) % 4;
const alignedIndex = Buffer.concat([indexBuffer, Buffer.alloc(indexPad)]);
const posOffset = alignedIndex.length;
const normOffset = posOffset + positionBuffer.length;
const binBuffer = Buffer.concat([alignedIndex, positionBuffer, normalBuffer]);

const accessors = [];
const bufferViews = [];
const meshes = [];
const materials = [];
const nodes = [];
const sceneNodes = [];

// buffer views: one for all indices, one for all positions, one for all normals
bufferViews.push({
  buffer: 0,
  byteOffset: 0,
  byteLength: alignedIndex.length,
  target: 34963,
});
bufferViews.push({
  buffer: 0,
  byteOffset: posOffset,
  byteLength: positionBuffer.length,
  target: 34962,
});
bufferViews.push({
  buffer: 0,
  byteOffset: normOffset,
  byteLength: normalBuffer.length,
  target: 34962,
});

let runningIndexOffset = 0;
let runningVertexOffset = 0;

for (const meta of meshMeta) {
  const matIndex = materials.length;
  materials.push({
    name: `mat_${meta.name}`,
    pbrMetallicRoughness: {
      baseColorFactor: meta.color,
      metallicFactor: 0.05,
      roughnessFactor: 0.85,
    },
  });

  // Compute min/max for positions of this mesh
  const posStart = runningVertexOffset * 3;
  const posCount = meta.vertexCount * 3;
  const slice = new Float32Array(
    positionBuffer.buffer,
    positionBuffer.byteOffset + posStart * 4,
    posCount,
  );
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < meta.vertexCount; i++) {
    for (let a = 0; a < 3; a++) {
      const v = slice[i * 3 + a];
      if (v < min[a]) min[a] = v;
      if (v > max[a]) max[a] = v;
    }
  }

  const indexAccessor = accessors.length;
  accessors.push({
    bufferView: 0,
    byteOffset: runningIndexOffset,
    componentType: 5123,
    count: meta.indexCount,
    type: "SCALAR",
  });

  const posAccessor = accessors.length;
  accessors.push({
    bufferView: 1,
    byteOffset: runningVertexOffset * 12,
    componentType: 5126,
    count: meta.vertexCount,
    type: "VEC3",
    max,
    min,
  });

  const normAccessor = accessors.length;
  accessors.push({
    bufferView: 2,
    byteOffset: runningVertexOffset * 12,
    componentType: 5126,
    count: meta.vertexCount,
    type: "VEC3",
  });

  const meshIndex = meshes.length;
  meshes.push({
    name: meta.name,
    primitives: [
      {
        attributes: { POSITION: posAccessor, NORMAL: normAccessor },
        indices: indexAccessor,
        material: matIndex,
      },
    ],
  });

  const nodeIndex = nodes.length;
  nodes.push({ name: meta.name, mesh: meshIndex });
  sceneNodes.push(nodeIndex);

  // advance offsets — account for per-mesh index padding that was applied when building
  let nextIndex = runningIndexOffset + meta.indexCount * 2;
  if (nextIndex % 4 !== 0) nextIndex += 4 - (nextIndex % 4);
  runningIndexOffset = nextIndex;
  runningVertexOffset += meta.vertexCount;
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
const jsonChunk = Buffer.concat([
  json,
  Buffer.alloc(jsonPad, 0x20), // spaces
]);

const binPad = (4 - (binBuffer.length % 4)) % 4;
const binChunk = Buffer.concat([binBuffer, Buffer.alloc(binPad)]);

const totalLength =
  12 + 8 + jsonChunk.length + 8 + binChunk.length;

const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546c67, 0); // glTF
header.writeUInt32LE(2, 4);
header.writeUInt32LE(totalLength, 8);

const jsonHeader = Buffer.alloc(8);
jsonHeader.writeUInt32LE(jsonChunk.length, 0);
jsonHeader.writeUInt32LE(0x4e4f534a, 4); // JSON

const binHeader = Buffer.alloc(8);
binHeader.writeUInt32LE(binChunk.length, 0);
binHeader.writeUInt32LE(0x004e4942, 4); // BIN

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(
  outPath,
  Buffer.concat([header, jsonHeader, jsonChunk, binHeader, binChunk]),
);
console.log(`Wrote ${outPath} (${totalLength} bytes)`);
console.log(
  "Nodes:",
  nodes.map((n) => n.name).join(", "),
);
