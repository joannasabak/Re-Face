# Re-Face
 
A web app for designing facades from salvaged windows. Grasshopper definitions run on Rhino.Compute and are shown in three.js. A C# API matches each facade panel against an inventory of reclaimed frames.
 
## Run it
 
You need Rhino 8 with Rhino.Compute, Node.js and the .NET 10 SDK.
 
1. **Rhino.Compute** at `http://localhost:6500`

2. **API** at `http://localhost:5080`
```
   cd api/ReFace.Api
   dotnet watch run
```
3. **Website** at `http://localhost:5173`
```
   npm install
   npm run dev
```
 
Tests: `dotnet test` in `api`.
 
## Structure
 
```
src/                      React + Vite front end
  assets/grasshopper/     Grasshopper definitions (.gh)
  scripts/                rhinoCompute.js (Compute → three.js), api.js (calls the C# API)
  components/, pages/     UI, 3D view, configurator, inventory
api/
  ReFace.Core/            models and the panel matcher
  ReFace.Api/             web API: /inventory, /match; Data/inventory.json
  ReFace.Tests/           xUnit tests for the matcher
```
 
## Panel matching
 
**Compare with inventory** sends the facade's panels to `POST /match`. `PanelMatcher` (in `ReFace.Core`) then gives each panel at most one frame from the inventory:
 
- **Fit:** a frame fits if it's no bigger than the panel and at most `Tolerance` smaller on each side. Smaller frames are made up with trim or infill.
- **Status:**
  - `exact`: both gaps are at most `ExactTolerance` (5 mm).
  - `adapted`: the frame fits, but the gaps are larger than that.
  - `missing`: no available frame fits.
- **Rotation:** with `AllowRotation`, a frame may be turned 90°.
- **Order:** panels with the fewest options are matched first, so scarce frames go where they're needed.
- **Best frame:** the smallest total gap wins. Ties go to the better condition (A, then B, then C).
- **Stock:** each match uses one frame. Unavailable items and items with zero quantity are skipped.
The result has one entry per panel, plus a summary of the counts and the frames used.
 
## Grasshopper
 
Output meshes through **Context Bake** and internalise any referenced geometry. Tag panels with the user strings `part = panel`, `panel_id`, `width` and `height` (in mm). `material` sets the look in the viewer.