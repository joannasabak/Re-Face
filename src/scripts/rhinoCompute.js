import rhino3dm from "https://cdn.jsdelivr.net/npm/rhino3dm@8.32.0/rhino3dm.module.min.js"
import RhinoCompute from "compute-rhino3d"
import { store } from "../stores/computeStore.js";

//Local RhinoCompute endpoint  
RhinoCompute.url = "http://localhost:6500/" 


//placeholder for server url
//RhinoCompute.url = "url"
//RhinoCompute.apiKey = "api key"

let rhino, doc, res
let rhinoPromise
let pendingRequests = 0
const definitionCache = new Map()

async function runCompute(data, path) {
  pendingRequests++;
  store.computing = true;
  try {
    const def = await loadGH(path);
    res = await compute(def, data);
    const conversionStart = performance.now();
    doc = createDoc(res);
    console.log(`Rhino document conversion: ${((performance.now() - conversionStart) / 1000).toFixed(3)} seconds`);
    return doc;
  } finally {
    // only hide the spinner once every request has finished
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

//eval performance & check if gh fails
async function compute(definition, definitionInputs) {
  //Save start time
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

function createDoc(res) {
  doc = new rhino.File3dm()

  let data;
  let metadata = [];

  //decode grasshopper objects and put them into a rhino document
  for (let i = 0; i < res.values.length; i++) {
    for (const value of Object.values(res.values[i].InnerTree)) {
      for (const d of value) {
        const dataType = String(d.type);

        //Geometry
        if (dataType.includes("Geometry")) {
          data = JSON.parse(d.data);
          const rhinoObject = rhino.CommonObject.decode(data);
          doc.objects().add(rhinoObject, null);
        } else {
          //Other ouputs
          const outputParameter = {
            name: res.values[i].ParamName,
            value: JSON.parse(d.data),
          };
          metadata.push(outputParameter);
        }
      }
    }
  }

  doc.metadata = metadata;

  //go through the objects in the Rhino document
  let objects = doc.objects();
  for (let i = 0; i < objects.count; i++) {
    const rhinoObject = objects.get(i);
    //asign geometry userstrings to object attributes
    if (rhinoObject.geometry().userStringCount > 0) {
      const g_userStrings = rhinoObject.geometry().getUserStrings();

      //iterate through userData and store all userdata to geometry
      for (let j = 0; j < g_userStrings.length; j++) {
        rhinoObject
          .attributes()
          .setUserString(g_userStrings[j][0], g_userStrings[j][1]);
      }
    }
  }
  return doc;
}


export { loadRhino, runCompute };