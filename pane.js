import { Pane } from "tweakpane";

export const pane = new Pane();

export const PARAMS = {
  width: 1920,
  height: 1080,
  layout: 0,
  background: { r: 238, g: 237, b: 245 },
  color1: { r: 255, g: 173, b: 237 },
  color2: { r: 221, g: 173, b: 237 },
  palette: 0,
  palette2: 2,
  mode: 0,
  highlightchance: 0.4,
  backgroundFade: false,
  customSettings: false,
  pushToGrid: true,
  running: false,
  keyEmbedding: 3658, //0
  rangeWidth: 20, //10
  rangeHeight: 20, //10
  rangeDepth: 20, // 10
  scale: 17, //10
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

const layout = settings.addBlade({
  view: "list",
  label: "layout",
  options: [
    { text: "Hero Image Full HD", value: 0 },
    { text: "Info Block Full HD", value: 1 },
    { text: "Hero Image Instagram", value: 2 },
    { text: "Speaker Anouncement Instagram", value: 3 },
    { text: "Info Block Instagram", value: 4 },
    { text: "Portait Poster", value: 5 },
  ],
  value: 0,
});

const background = settings.addBinding(PARAMS, "background");
const color1 = settings.addBinding(PARAMS, "color1");
const color2 = settings.addBinding(PARAMS, "color2");

// const palette = settings.addBlade({
//   view: "list",
//   label: "palette",
//   options: [
//     { text: "Hard Pink", value: 0 },
//     { text: "Soft Pink", value: 1 },
//     { text: "Green", value: 2 },
//     { text: "Lilac", value: 3 },
//     { text: "None", value: 4 },
//   ],
//   value: 0,
// });

// const palette2 = settings.addBlade({
//   view: "list",
//   label: "palette2",
//   options: [
//     { text: "Hard Pink", value: 0 },
//     { text: "Soft Pink", value: 1 },
//     { text: "Green", value: 2 },
//     { text: "Lilac", value: 3 },
//     { text: "None", value: 4 },
//   ],
//   value: 2,
// });

const mode = settings.addBlade({
  view: "list",
  label: "mode",
  options: [
    { text: "Separate layers", value: 0 },
    { text: "Integrated layers", value: 1 },
    { text: "Highlight", value: 2 },
  ],
  value: 0,
});

const highlightchance = settings.addBinding(PARAMS, "highlightchance", {
  min: 0,
  max: 1,
  step: 0.01,
});

// const backgroundFade = settings.addBinding(PARAMS, "backgroundFade");
const pushToGrid = settings.addBinding(PARAMS, "pushToGrid");

const randomize = settings.addBinding(PARAMS, "customSettings");
const run = settings.addButton({
  title: "Generate",
});

run.on("click", () => {
  PARAMS.running = true;
});

// palette.on("change", () => {
//   PARAMS.palette = palette.value;
// });

// palette2.on("change", () => {
//   PARAMS.palette2 = palette2.value;
// });

mode.on("change", () => {
  PARAMS.mode = mode.value;
});

layout.on("change", () => {
  PARAMS.layout = layout.value;
});

const customize = pane.addFolder({
  title: "customSettings",
  expanded: true,
});

const keyEmbedding = customize.addBinding(PARAMS, "keyEmbedding", {
  step: 1,
  min: 0,
  max: 5556,
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

const scale = customize.addBinding(PARAMS, "scale", {
  step: 1,
  min: 10,
  max: 40,
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
