//sorts a Rhino object into "curve", "surface", "solid" or "other"
//Rhino stores surfaces and solids the same way
function rhinoType(geometry, rhino) {
  const type = geometry.objectType;

  if (type === rhino.ObjectType.Curve) {
    return "curve";
  }

  const isNurbsLike =
    type === rhino.ObjectType.Brep ||
    type === rhino.ObjectType.Extrusion ||
    type === rhino.ObjectType.Surface;
  if (isNurbsLike) {
    return geometry.isSolid ? "solid" : "surface";
  }

  return "other";
}

//returns text to be used by GetGeometry input
export function readGeometry(rhino, bytes, accepts) {
  const doc = rhino.File3dm.fromByteArray(bytes);
  if (!doc) {
    throw new Error("Please upload a .3dm file.");
  }

  const found = [];
  let skipped = 0;
  const objects = doc.objects();
  for (let i = 0; i < objects.count; i++) {
    const geometry = objects.get(i).geometry();
    if (accepts.includes(rhinoType(geometry, rhino))) {
      found.push(JSON.stringify(geometry.encode()));
    } else {
      skipped++;
    }
  }
  doc.delete();

  if (found.length === 0) {
    throw new Error(`No ${accepts.join(" or ")} found in this file.`);
  }

  console.log(`Rhino file: using ${found.length} object(s), skipped ${skipped} that are not a ${accepts.join(" or ")}.`);
  return found;
}