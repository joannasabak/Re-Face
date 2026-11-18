"""
Inputs:
    panels: Brep, List Access  - one item per glass pane
    frames: Brep, List Access  - frame geometry, passed through without panel data
    to_mm:  float, Item Access - model units to mm (1 if the model is in mm, 1000 if in metres)
Outputs:
    a:    meshes for Context Bake
    info: one line per panel, for checking in a Panel component
"""
import Rhino.Geometry as rg


def mesh_of(brep):
    """Turns a Brep into a single mesh."""
    mesh = rg.Mesh()
    for part in rg.Mesh.CreateFromBrep(brep, rg.MeshingParameters.FastRenderMesh) or []:
        mesh.Append(part)
    return mesh


def size_of(brep):
    """Width (horizontal) and height (vertical) of a pane, measured in the pane's own plane."""
    face = brep.Faces[0]
    ok, face_frame = face.FrameAt(face.Domain(0).Mid, face.Domain(1).Mid)
    normal = face_frame.ZAxis

    across = rg.Vector3d.CrossProduct(rg.Vector3d.ZAxis, normal)  # horizontal, along the pane
    if across.IsTiny():  # pane lies flat, like a roof: fall back to the surface's own direction
        across = face_frame.XAxis
    across.Unitize()
    up = rg.Vector3d.CrossProduct(normal, across)
    up.Unitize()

    box = brep.GetBoundingBox(rg.Plane(face_frame.Origin, across, up))  # box measured in that plane
    return box.Max.X - box.Min.X, box.Max.Y - box.Min.Y


scale = to_mm if to_mm else 1.0
a = []
info = []

for i, brep in enumerate(panels or []):
    if brep is None:
        continue
    width, height = size_of(brep)
    width_mm, height_mm = round(width * scale), round(height * scale)
    area_m2 = (width_mm / 1000.0) * (height_mm / 1000.0)
    mass_kg = area_m2 * (4 / 1000.0) * 2500 * 2

    mesh = mesh_of(brep)
    mesh.SetUserString("part", "panel")
    mesh.SetUserString("panel_id", str(i))
    mesh.SetUserString("material", "glass")
    mesh.SetUserString("width", str(width_mm))
    mesh.SetUserString("height", str(height_mm))
    mesh.SetUserString("mass", str(round(mass_kg, 1)))
    a.append(mesh)
    info.append("panel {}: {} x {} mm ({} faces)".format(i, width_mm, height_mm, brep.Faces.Count))

for brep in frames or []:
    if brep is None:
        continue
    mesh = mesh_of(brep)
    mesh.SetUserString("part", "frame")
    mesh.SetUserString("material", "frame")
    a.append(mesh)