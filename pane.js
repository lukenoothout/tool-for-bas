import { Pane } from "tweakpane";

export const pane = new Pane();

export const PARAMS = {
  width: 1920,
  height: 1080,
  layout: 0,
  palette: 0,
  running: false,
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

const palette = settings.addBlade({
  view: "list",
  label: "palette",
  options: [
    { text: "blue", value: 0 },
    { text: "green", value: 1 },
    { text: "yellow", value: 2 },
    { text: "red", value: 3 },
    { text: "orange", value: 4 },
  ],
  value: 0,
});

const run = settings.addButton({
  title: "Generate",
});

run.on("click", () => {
  PARAMS.running = true;
});

palette.on("change", () => {
  PARAMS.palette = palette.value;
});

layout.on("change", () => {
  PARAMS.layout = layout.value;
});
