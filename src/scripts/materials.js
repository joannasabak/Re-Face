import * as THREE from "three";
 

export const MATERIAL_LIBRARY = {
    //used for anything without a known material tag
    default: { color: "#c8ced6", metalness: 0, roughness: 0.8 },
 
    frame: { color: "#3b4a5a", metalness: 0.4, roughness: 0.5 },
    glass: { color: "#cfe3f2", metalness: 0, roughness: 0.05, opacity: 0.3 },
    context: { color: "#e4e7eb", metalness: 0, roughness: 1 },
 
    //overlays
    "match-exact": { color: "#278062", metalness: 0, roughness: 0.3, opacity: 0.85 },   //green
    "match-adapted": { color: "#fec300", metalness: 0, roughness: 0.3, opacity: 0.85 }, //yellow
    "match-missing": { color: "#d9776e", metalness: 0, roughness: 0.3, opacity: 0.35 }, //red
};
 
export function createMaterials() {
    const materials = {};
    for (const name of Object.keys(MATERIAL_LIBRARY)) {
        const settings = MATERIAL_LIBRARY[name];
        materials[name] = createMaterial(settings);
    }
    return materials;
}

export function chooseMaterial(materials, tags) {
    const material = materials[tags.material];
    if (material === undefined) {
        return materials.default;
    }
    return material;
}
 
export function disposeMaterials(materials) {
    for (const material of Object.values(materials)) {
        material.dispose();
    }
}
 
function createMaterial(settings) {
    const options = {
        color: settings.color,
        metalness: settings.metalness,
        roughness: settings.roughness,
        side: THREE.DoubleSide,
    };
 
    if (settings.opacity !== undefined && settings.opacity < 1) {
        options.transparent = true;
        options.opacity = settings.opacity;
        options.depthWrite = false;
        return new THREE.MeshPhysicalMaterial(options);
    }
 
    return new THREE.MeshStandardMaterial(options);
}