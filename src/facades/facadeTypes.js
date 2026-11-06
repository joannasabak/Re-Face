// To add a new one: put the .gh file in assets/grasshopper, add a thumbnail
// (any image works: .svg, .png or .jpg), and add an entry to the list below.
//
// Each input's `name` must match the ParamName of the Hops
// component in Grasshopper exactly (spaces, underscores and capitals included).

import foldingDefinition from "../assets/grasshopper/Folding_facade.gh";
import steppingDefinition from "../assets/grasshopper/Stepping facade from curve.gh";
import boxyDefinition from "../assets/grasshopper/Stepping facade on volume.gh";

import foldingThumbnail from "../assets/thumbnails/folding.svg";
import steppingThumbnail from "../assets/thumbnails/stepping.svg";
import boxyThumbnail from "../assets/thumbnails/boxy.svg";

export const FACADE_TYPES = [
  {
    id: "folding",
    name: "Folding",
    description: "Pleated panels that fold in and out",
    definition: foldingDefinition,
    thumbnail: foldingThumbnail,
    inputs: [
      // TODO: check these ranges against the Grasshopper definition
      { type: "slider", name: "Density", min: 1, max: 20, step: 1, value: 2 },
      { type: "slider", name: "Articulation", min: 1, max: 30, step: 1, value: 1 },
      { type: "toggle", name: "Pleat_direction", label: "Pleat direction", value: false },
    ],
  },
  {
    id: "stepping",
    name: "Stepping",
    description: "Steps that follow a curve",
    definition: steppingDefinition,
    thumbnail: steppingThumbnail,
    inputs: [
      { type: "slider", name: "Step size", min: 0, max: 10, step: 0.1, value: 0.5 },
    ],
  },
  {
    id: "boxy",
    name: "Boxy",
    description: "Boxes protruding from a volume",
    definition: boxyDefinition,
    thumbnail: boxyThumbnail,
    inputs: [
      { type: "slider", name: "width", label: "Width", min: 0.5, max: 5, step: 0.1, value: 3 },
      { type: "slider", name: "protrusion_max", label: "Max protrusion", min: 0, max: 2, step: 0.1, value: 1 },
      { type: "slider", name: "lvl_height", label: "Level height", min: 1, max: 7, step: 0.5, value: 4 },
      { type: "toggle", name: "flip_facade", label: "Flip facade", value: true },
      // The definition also has these inputs; add them here once you know their ranges:
      // { type: "slider", name: "protrusion_min", label: "Min protrusion", min: 0, max: 2, step: 0.1, value: 0 },
      // { type: "slider", name: "horizontal_mullion", label: "Horizontal mullion", min: 0, max: 1, step: 0.05, value: 0.1 },
      // { type: "slider", name: "vertical_mullion", label: "Vertical mullion", min: 0, max: 1, step: 0.05, value: 0.1 },
    ],
  },
  // {
  //   id: "tables",
  //   name: "Tables",
  //   description: "Table-frames with stick mullion glazing."
  //   definition: tablesDefinition,
  //   thumbnail: tablesThumbnail,
  //   inputs: [{}],
  // },
];

// { Density: 2, Articulation: 1, ... } from a facade's input list
export function defaultValues(facade) {
  return Object.fromEntries(facade.inputs.map((input) => [input.name, input.value]));
}
