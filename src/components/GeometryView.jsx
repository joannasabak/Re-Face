import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Rhino3dmLoader } from 'three/addons/loaders/3DMLoader.js';
import { runCompute, loadRhino } from '../scripts/rhinoCompute.js';

export default function GeometryView({ data, path, onUpdateMetadata }) {
  const containerRef = useRef(null)
  const computeRef = useRef(null)
  const latestProps = useRef({ data, path, onUpdateMetadata })
  const previousData = useRef(data)
  const previousPath = useRef(path)

  useEffect(() => {
    latestProps.current = { data, path, onUpdateMetadata }
  })

  //this effect loads three and compute when the component is initialized
  useEffect(() => {
    const container = containerRef.current
    let disposed = false
    let animationId
    let latestRequest = 0   // used to ignore results that arrive after a newer request
    let zoomedPath = null   // which definition the camera was last fitted to

    const loader = new Rhino3dmLoader()
    loader.setLibraryPath('https://cdn.jsdelivr.net/npm/rhino3dm@8.0.0-beta2/')

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
    scene.add(new THREE.HemisphereLight(0xffffff, 0xc9dcef, 2))
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
    // A new light's default position follows THREE.Object3D.DEFAULT_UP, which changes
    // once any view has set it, so set the position explicitly.
    directionalLight.position.set(0, 1, 0)
    scene.add(directionalLight)

    // add a cube to the scene
    // const geometry = new THREE.BoxGeometry(10, 10, 10)

    // //assign mesh normal material to the torus
    // // const material = new THREE.MeshNormalMaterial()

    // //assign color material to the torus
    // const material = new THREE.MeshStandardMaterial({ color: 0xffffff})

    // const cube = new THREE.Mesh(geometry, material)
    // scene.add(cube)

    // THREE.Object3D.DEFAULT_UP.set(0, 0, 1); // Rhino Z is Three.js Y axis. Uncomment for Compute

    function animate() {
      animationId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    async function compute() {
      const { data, path, onUpdateMetadata } = latestProps.current
      const request = ++latestRequest
      const doc = await runCompute(data, path)
      // skip this result if the page closed or a newer request was sent meanwhile
      if (disposed || request !== latestRequest) return

      if (doc.metadata) {
        onUpdateMetadata?.(doc.metadata)
      }

      const buffer = new Uint8Array(doc.toByteArray()).buffer
      const renderStart = performance.now()
      loader.parse(buffer, function (object) {
        if (disposed || request !== latestRequest) return

        // remove the previous model and free its memory
        for (const child of [...scene.children]) {
          if (!child.isLight) {
            scene.remove(child)
            disposeObject(child)
          }
        }

        scene.add(object)
        console.log(`3D model parsing: ${((performance.now() - renderStart) / 1000).toFixed(3)} seconds`)

        // fit the camera the first time each definition loads, not on every slider change
        if (zoomedPath !== path) {
          zoomCameraToSelection(camera, controls, object.children)
          zoomedPath = path
        }
      })
    }
    computeRef.current = compute

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

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
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', onResize)
      controls.dispose()
      loader.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    }
  }, [])

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

function disposeObject(object) {
  object.traverse((child) => {
    child.geometry?.dispose()
    const materials = Array.isArray(child.material) ? child.material : [child.material]
    for (const material of materials) {
      if (!material) continue
      material.map?.dispose()
      material.dispose()
    }
  })
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
