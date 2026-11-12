import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { runCompute, loadRhino } from '../scripts/rhinoCompute.js';
import { createMaterials, chooseMaterial, disposeMaterials } from '../scripts/materials.js';

//active = false pauses drawing while the page is hidden; results still load in the background
//onUpdatePanels is called with the tagged panels each time new geometry arrives
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
    let latestRequest = 0
    let zoomedPath = null

 
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 40, 15)
    camera.up.set(0, 0, 1)

    const scene = new THREE.Scene()

    const controls = new OrbitControls(camera, renderer.domElement)

    //light settings
    scene.add(new THREE.HemisphereLight(0xffffff, 0xc9dcef, 1))
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
    directionalLight.position.set(0, 1, 0)
    scene.add(directionalLight)

    //room environment for reflective srfs
    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    const environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = environment
    scene.environmentIntensity = 0.5 // the lights below do most of the lighting
    pmremGenerator.dispose()
    
    const materials = createMaterials()

    //group that holds all the meshes of the current facade
    const model = new THREE.Group()
    scene.add(model)

    //removes the current facade from the scene and frees its memory
    function clearModel() {
      for (const child of [...model.children]) {
        model.remove(child)
        child.geometry.dispose()
      }
    }

    //gives every mesh its material: its normal one, or a match colour if it's a matched panel
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

      //swap the old facade for the new one: one three.js mesh per Rhino mesh
      clearModel()
      for (const part of result.parts) {
        const material = chooseMaterial(materials, part.tags)
        const mesh = new THREE.Mesh(part.geometry, material)
        mesh.userData = part.tags // keep the tags on the mesh, to find its match later
        model.add(mesh)
      }

      //tell the page which panels this facade has, so it can ask the API for matches
      onUpdatePanels?.(collectPanels(result.parts))

      //fit the camera the first time each definition loads, not on every slider change
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

    //when the component is removed from the page
    return () => {
      disposed = true
      computeRef.current = null
      renderLoopRef.current = null
      highlightRef.current = null
      stopRendering()
      window.removeEventListener('resize', onResize)
      controls.dispose()
      clearModel()
      disposeMaterials(materials);
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

    let mass = Number(tags.mass)
    if (Number.isNaN(mass)) {
      mass = 0
    }

    panels.push({ id: tags.panel_id, width: width, height: height, mass: mass  })
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