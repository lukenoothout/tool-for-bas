import { Pane } from "tweakpane";

export const pane = new Pane();

export const PARAMS = {
  width: 1190,
  height: 1684,
  seed: Math.floor(Math.random() * 100000),
  depth: 2,
  bgColor1: "#EEE",
  dotColor1: "#555",
  bgColor2: "#F5EAE6",
  dotColor2: "#0038FF",
  // bgColor: "#EAAAF0",
  // dotColor: "#FF8787",

  running: false,
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
const depth = settings.addBinding(PARAMS, "depth", {
  step: 1,
});
const seed = settings.addBinding(PARAMS, "seed", {
  step: 1,
});
const newSeed = settings.addButton({
  title: "Randomize",
  label: "seed",
});
const bgColor1 = settings.addBinding(PARAMS, "bgColor1");
const dotColor1 = settings.addBinding(PARAMS, "dotColor1");
const bgColor2 = settings.addBinding(PARAMS, "bgColor2");
const dotColor2 = settings.addBinding(PARAMS, "dotColor2");
// const running = settings.addBinding(PARAMS, "running");
const run = settings.addButton({
  title: "Generate",
});

newSeed.on("click", () => {
  PARAMS.seed = Math.floor(Math.random() * 100000);
  PARAMS.running = true;
  pane.refresh();
});

run.on("click", () => {
  PARAMS.running = true;
});
