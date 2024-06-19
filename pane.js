import { Pane } from "tweakpane";

export const pane = new Pane();

export const PARAMS = {
  width: 1920,
  height: 1080,
  layout: 0,
  background: { r: 238, g: 237, b: 245 },
  color1: { r: 237, g: 255, b: 0 },
  color2: { r: 59, g: 212, b: 193 },
  palette: 0,
  palette2: 2,
  backgroundFade: false,
  keyEmbedding1: 2597, //0
  keyEmbedding2: 2838, //0
  lockEmbeddings: false,
  snapToGrid: true,
  running: false,
  rangeWidth: 24, //20
  rangeHeight: 20, //20
  rangeDepth: 10, // 20
  layerScale: 5,
  scale: 60, //10
  progress: 0,
};

const settings = pane.addFolder({
  title: "Settings",
  expanded: true,
});

const width = settings.addBinding(PARAMS, "width", {
  step: 1,
});

const height = settings.addBinding(PARAMS, "height", {
  step: 1,
});

// const layout = settings.addBlade({
//   view: "list",
//   label: "layout",
//   options: [
//     { text: "Hero Image Full HD", value: 0 },
//     { text: "Info Block Full HD", value: 1 },
//     { text: "Hero Image Instagram", value: 2 },
//     { text: "Speaker Anouncement Instagram", value: 3 },
//     { text: "Info Block Instagram", value: 4 },
//     { text: "Portait Poster", value: 5 },
//   ],
//   value: 0,
// });

const background = settings.addBinding(PARAMS, "background");
const color1 = settings.addBinding(PARAMS, "color1");
const color2 = settings.addBinding(PARAMS, "color2");

// const backgroundFade = settings.addBinding(PARAMS, "backgroundFade");
const snapToGrid = settings.addBinding(PARAMS, "snapToGrid");

// layout.on("change", () => {
//   PARAMS.layout = layout.value;
// });

const keyEmbedding1 = settings.addBinding(PARAMS, "keyEmbedding1", {
  step: 1,
  min: 0,
  max: 5556,
});

const keyEmbedding2 = settings.addBinding(PARAMS, "keyEmbedding2", {
  step: 1,
  min: 0,
  max: 5556,
});

const lockEmbeddings = settings.addBinding(PARAMS, "lockEmbeddings");

const run = settings.addButton({
  title: "Generate",
});

run.on("click", () => {
  PARAMS.running = true;
});

const customize = pane.addFolder({
  title: "Customize view",
  expanded: true,
});

const rangeWidth = customize.addBinding(PARAMS, "rangeWidth", {
  step: 1,
  min: 5,
  max: 40,
});

const rangeHeight = customize.addBinding(PARAMS, "rangeHeight", {
  step: 1,
  min: 5,
  max: 40,
});

const rangeDepth = customize.addBinding(PARAMS, "rangeDepth", {
  step: 1,
  min: 5,
  max: 40,
});

const layerScale = customize.addBinding(PARAMS, "layerScale", {
  step: 1,
  min: 1,
  max: 50,
});

const scale = customize.addBinding(PARAMS, "scale", {
  step: 1,
  min: 10,
  max: 100,
});

// keyEmbedding.on("change", () => {
//   PARAMS.customSettings = true;
//   pane.refresh();
// });

// rangeWidth.on("change", () => {
//   PARAMS.customSettings = true;
//   pane.refresh();
// });

// rangeHeight.on("change", () => {
//   PARAMS.customSettings = true;
//   pane.refresh();
// });

// rangeDepth.on("change", () => {
//   PARAMS.customSettings = true;
//   pane.refresh();
// });

// scale.on("change", () => {
//   PARAMS.customSettings = true;
//   pane.refresh();
// });
