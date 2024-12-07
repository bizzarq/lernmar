
let container = document.getElementById("lernmar");

if (!container) {
  throw new Error("could not find lernmar root element.");
}

let description = document.createElement("div");
description.innerText = "This is the Lernmar SCORM player"

container.replaceChildren(description);
