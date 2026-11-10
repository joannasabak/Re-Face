import rhino3dm from "https://cdn.jsdelivr.net/npm/rhino3dm@8.32.0/rhino3dm.module.min.js"
import RhinoCompute from "compute-rhino3d"
import { BufferGeometryLoader } from "three";
import { store } from "../stores/computeStore.js";

// Local RhinoCompute endpoint  
RhinoCompute.url = "http://localhost:6500/"


//modify to use remote server
//RhinoCompute.url = "url"
//RhinoCompute.apiKey = "api key"

let rhino, res
let rhinoPromise
let pendingRequests = 0
const definitionCache = new Map()
const geometryLoader = new BufferGeometryLoader();

async function runCompute(data, path) {
  pendingRequests++;
  store.computing = true;
  try {
    const def = await loadGH(path);
    res = await compute(def, data);
    const conversionStart = performance.now();
    const result = toThree(res);
    console.log(`Conversion to three.js: ${((performance.now() - conversionStart) / 1000).toFixed(3)} seconds`);
    return result;
  } finally {
    pendingRequests--;
    store.computing = pendingRequests > 0;
  }
}

async function loadRhino() {
  if (!rhinoPromise) {
    rhinoPromise = rhino3dm().then((module) => {
      console.log("Loaded rhino3dm.");
      rhino = module;
      return true;
    }).catch((error) => {
      rhinoPromise = null;
      throw error;
    });
  }
  return rhinoPromise;
}

async function loadGH(definitionPath) {
  if (!definitionCache.has(definitionPath)) {
    const definitionPromise = fetch(definitionPath).then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load Grasshopper definition (${response.status}).`);
      }
      return response.arrayBuffer().then((buffer) => new Uint8Array(buffer));
    }).catch((error) => {
      definitionCache.delete(definitionPath);
      throw error;
    });
    definitionCache.set(definitionPath, definitionPromise);
  }
  return definitionCache.get(definitionPath);
}

//check how long gh takes and if any issues with the def
async function compute(definition, definitionInputs) {
  //save start time
  const startTime = performance.now();

  const trees = [];
  for (let [key, value] of Object.entries(definitionInputs)) {
    let param = new RhinoCompute.Grasshopper.DataTree(key);
    param.append([0], Array.isArray(value) ? value : [value]);
    trees.push(param);
  }

  const res = await RhinoCompute.Grasshopper.evaluateDefinition(
    definition,
    trees
  );

  if (res.errors?.length) console.error("Grasshopper errors:", res.errors);
  if (res.warnings?.length) console.warn("Grasshopper warnings:", res.warnings);

  //save end time
  const endTime = performance.now();

  // Calculate the duration in milliseconds
  const duration = (endTime - startTime) / 1000;
  // Log the duration to the console
  console.log(`Gh script: ${duration.toFixed(3)} seconds`);
  return res;
}

//compute to three.js
function toThree(res) {
  const parts = [];
  const metadata = [];
  let skipped = 0;

  //compute answer holding the data structure
  for (const output of res.values) {
    for (const branch of Object.values(output.InnerTree)) {
      for (const item of branch) {
        const data = JSON.parse(item.data);

        //not geometry
        if (!String(item.type).includes("Geometry")) {
          metadata.push({ name: output.ParamName, value: data });
          continue;
        }

        //JSON back into a Rhino object
        const rhinoObject = rhino.CommonObject.decode(data);
        if (rhinoObject === null) {
          skipped++;
          continue;
        }

        if (rhinoObject instanceof rhino.Mesh) {
          const threeJson = rhinoObject.toThreejsJSON();
          const geometry = geometryLoader.parse(threeJson);
          const tags = readTags(rhinoObject);
          parts.push({ geometry: geometry, tags: tags });
        } else {
          skipped++;
        }

        rhinoObject.delete();
      }
    }
  }

  if (skipped > 0) {
    console.warn(`Skipped ${skipped} objects that are not meshes. Mesh them in Grasshopper before Context Bake.`);
  }

  return { parts: parts, metadata: metadata };
}

function readTags(rhinoObject) {
  const tags = {};
  const pairs = rhinoObject.getUserStrings();
  for (const pair of pairs) {
    const key = pair[0];
    const value = pair[1];
    tags[key] = value;
  }
  return tags;
}

export { loadRhino, runCompute };