import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { runCompute, loadRhino } from '../scripts/rhinoCompute.js';

// active = false pauses drawing while the page is hidden; results still load in the background
// onUpdatePanels is called with the tagged panels each time new geometry arrives
// matches (the API's list of panel matches, or null) colours the panels by their match
export default function GeometryView({ data, path, onUpdateMetadata, onUpdatePanels, matches, active = true }) {
  const containerRef = useRef(null)
  const computeRef = useRef(null)
  const renderLoopRef = useRef(null)
  const highlightRef = useRef(null)
  const latestProps = useRef({ data, path, onUpdateMetadata, onUpdatePanels, active })
  const previousData = useRef(data)
  const previousPath = useRef(path)

  useEffect(() => {
    latestProps.current = { data, path, onUpdateMetadata, onUpdatePanels, active }
  })

  //this effect loads three and compute when the component is initialized
  useEffect(() => {
    const container = containerRef.current
    let disposed = false
    let animationId = null
    let latestRequest = 0   // used to ignore results that arrive after a newer request
    let zoomedPath = null   // which definition the camera was last fitted to

    // alpha: true makes the canvas see-through, so the page's graph paper shows behind the model
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 40, 15)
    camera.up.set(0, 0, 1)

    const scene = new THREE.Scene()
    // no scene.background: the paper background comes from the page CSS

    const controls = new OrbitControls(camera, renderer.domElement)

    // soft, even light
    scene.add(new THREE.HemisphereLight(0xffffff, 0xc9dcef, 1))
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
    // A new light's default position follows THREE.Object3D.DEFAULT_UP, which changes
    // once any view has set it, so set the position explicitly.
    directionalLight.position.set(0, 1, 0)
    scene.add(directionalLight)

    // a soft "photo studio" all around the model, so smooth surfaces like glass have something to reflect
    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    const environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = environment
    scene.environmentIntensity = 0.5 // the lights below do most of the lighting
    pmremGenerator.dispose()

    // how each material from Grasshopper looks (the "material" user string)
    const materials = createMaterials()

    // a group that holds all the meshes of the current facade
    const model = new THREE.Group()
    scene.add(model)

    // removes the current facade from the scene and frees its memory
    function clearModel() {
      for (const child of [...model.children]) {
        model.remove(child)
        child.geometry.dispose()
      }
    }

    // gives every mesh its material: its normal one, or a match colour if it's a matched panel
    function highlight(matches) {
      // look-up table: panel id -> status, e.g. { "0": "exact", "1": "missing" }
      const statusById = {}
      if (matches !== null) {
        for (const match of matches) {
          statusById[match.panelId] = match.status
        }
      }

      for (const mesh of model.children) {
        const tags = mesh.userData
        const status = statusById[tags.panel_id]

        if (tags.part === "panel" && status !== undefined) {
          mesh.material = materials["match-" + status]
        } else {
          mesh.material = chooseMaterial(materials, tags)
        }
      }
    }
    highlightRef.current = highlight

    function animate() {
      animationId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }

    function startRendering() {
      if (animationId !== null) return
      onResize() // the window may have been resized while the page was hidden
      animate()
    }

    function stopRendering() {
      if (animationId === null) return
      cancelAnimationFrame(animationId)
      animationId = null
    }
    renderLoopRef.current = { startRendering, stopRendering }

    async function compute() {
      const { data, path, onUpdateMetadata, onUpdatePanels } = latestProps.current
      const request = ++latestRequest
      const result = await runCompute(data, path)
      console.log(result.parts.length, "meshes:", result.parts.map((part) => part.tags))

      // skip this result if the page closed or a newer request was sent meanwhile
      if (disposed || request !== latestRequest) {
        for (const part of result.parts) {
          part.geometry.dispose()
        }
        return
      }

      onUpdateMetadata?.(result.metadata)

      // swap the old facade for the new one: one three.js mesh per Rhino mesh
      clearModel()
      for (const part of result.parts) {
        const material = chooseMaterial(materials, part.tags)
        const mesh = new THREE.Mesh(part.geometry, material)
        mesh.userData = part.tags // keep the tags on the mesh, to find its match later
        model.add(mesh)
      }

      // tell the page which panels this facade has, so it can ask the API for matches
      onUpdatePanels?.(collectPanels(result.parts))

      // fit the camera the first time each definition loads, not on every slider change
      if (zoomedPath !== path) {
        zoomCameraToSelection(camera, controls, model.children)
        zoomedPath = path
      }
    }
    computeRef.current = compute

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    if (latestProps.current.active) startRendering()

    async function start() {
      await loadRhino()
      if (disposed) return
      compute()
    }
    start()

    // React calls this when the component is removed from the page
    return () => {
      disposed = true
      computeRef.current = null
      renderLoopRef.current = null
      highlightRef.current = null
      stopRendering()
      window.removeEventListener('resize', onResize)
      controls.dispose()
      clearModel()
      for (const material of Object.values(materials)) {
        material.dispose()
      }
      environment.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    }
  }, [])

  //this effect pauses drawing while the page is hidden and resumes it when shown
  useEffect(() => {
    if (active) renderLoopRef.current?.startRendering()
    else renderLoopRef.current?.stopRendering()
  }, [active])

  //this effect colours the panels whenever the match results change
  useEffect(() => {
    highlightRef.current?.(matches ?? null)
  }, [matches])

  //this effect watches for changes in the incoming data or definition
  useEffect(() => {
    if (previousData.current === data && previousPath.current === path) return
    previousData.current = data
    previousPath.current = path

    console.log(data)
    if (data) {
      computeRef.current?.()
    }
  }, [data, path])

  return (
    <div id="viewport">
      <div id="threejs-container" ref={containerRef}></div>
    </div>
  )
}

// One three.js material per kind of material tag. Add a line here for a new one, e.g. "infill".
function createMaterials() {
  return {
    // anything without a known material tag
    default: new THREE.MeshStandardMaterial({
      color: 0xc8ced6, // light grey
      metalness: 0,
      roughness: 0.8,
      side: THREE.DoubleSide,
    }),

    frame: new THREE.MeshStandardMaterial({
      color: 0x3b4a5a, // dark blue-grey
      metalness: 0.4,
      roughness: 0.5,
      side: THREE.DoubleSide,
    }),

    glass: new THREE.MeshPhysicalMaterial({
      color: 0xcfe3f2, // a slight blue tint
      metalness: 0,
      roughness: 0.05, // very smooth, so it reflects the environment
      transparent: true,
      opacity: 0.3,
      depthWrite: false, // see-through objects shouldn't hide what's behind them
      side: THREE.DoubleSide,
    }),

    // panel matching: "match-" + the status the API sends back for each panel
    "match-exact": createMatchMaterial(0x3fa36b),   // green
    "match-adapted": createMatchMaterial(0xe0a030), // amber
    "match-missing": createMatchMaterial(0xd0453c), // red
  }
}

// A coloured, slightly see-through material for highlighting matched panels
function createMatchMaterial(color) {
  return new THREE.MeshPhysicalMaterial({
    color: color,
    metalness: 0,
    roughness: 0.3,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
}

// Picks the material for one mesh from its tags, e.g. { material: "glass" } -> the glass material
function chooseMaterial(materials, tags) {
  const material = materials[tags.material]
  if (material === undefined) {
    return materials.default
  }
  return material
}

// The panels to send to /match: every mesh tagged part = "panel", as { id, width, height } in mm.
// User strings are text, so the sizes are turned into numbers here.
function collectPanels(parts) {
  const panels = []
  for (const part of parts) {
    const tags = part.tags
    if (tags.part !== "panel") {
      continue
    }

    const width = Number(tags.width)
    const height = Number(tags.height)
    if (tags.panel_id === undefined || Number.isNaN(width) || Number.isNaN(height)) {
      console.warn("Skipped a panel without a panel_id, width or height:", tags)
      continue
    }

    panels.push({ id: tags.panel_id, width: width, height: height })
  }
  return panels
}

function zoomCameraToSelection(camera, controls, selection, fitOffset = 1.1) {
  const box = new THREE.Box3()
  for (const object of selection) {
    if (!object.isLight) box.expandByObject(object)
  }

  if (box.isEmpty()) return

  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const maxSize = Math.max(size.x, size.y, size.z)
  const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * camera.fov / 360))
  const fitWidthDistance = fitHeightDistance / camera.aspect
  const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance)

  const direction = controls.target.clone().sub(camera.position).normalize().multiplyScalar(distance)
  controls.maxDistance = distance * 10
  controls.target.copy(center)

  camera.near = distance / 100
  camera.far = distance * 100
  camera.updateProjectionMatrix()
  camera.position.copy(controls.target).sub(direction)
  controls.update()
}