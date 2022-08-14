darkModeOn();

//Resizable split panes
Split([".left", ".right"], {
  gutterSize: 4,
  sizes: [50, 50],
});

//Elements
const eReturn = document.getElementById("top-nav-left-top");
const eDarkModeToggle = document.getElementById("dark-mode-toggle");
const eDrawModeToggle = document.getElementById("draw-mode-toggle");
const eChooseFileImport = document.getElementById("choose-file-import");
const eImportUrl = document.getElementById("import-url");
const eImportUrlButton = document.getElementById("import-url-button");
const eDropZone = document.getElementById("dropzone");
const eDropZoneFile = document.getElementById("dropzone-file");
const eCanvasContainer = document.getElementById("canvas-container");
const eNotes = document.getElementById("notes");
const eNotesText = document.getElementById("notes-text");
const eNotesToggle = document.getElementById("notes-toggle");
const eMap = document.getElementById("map");

//forks may have to change these
const ghRepo = "geotaggr";
const ghUser = "raais";
const hostName = ghUser + ".github.io";
const indexUrl = "https://" + hostName + "/" + ghRepo;

var hoveringDropZone = false;

//Canvas
var canvas = new fabric.Canvas("canvas");
canvas.setHeight(window.innerHeight);
canvas.setWidth(window.innerWidth);
canvas.freeDrawingBrush.color = "#ff0";
canvas.freeDrawingBrush.width = 3;
canvas.selectionColor = "rgba(0,0,0,0)";

//Events - Canvas
canvas.on("mouse:wheel", function (opt) {
  let delta = opt.e.deltaY;
  let zoom = canvas.getZoom();
  zoom *= 0.999 ** delta;
  if (zoom > 20) zoom = 20;
  if (zoom < 0.01) zoom = 0.01;
  canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
  opt.e.preventDefault();
  opt.e.stopPropagation();
});

canvas.on("mouse:down", function (opt) {
  let evt = opt.e;
  if (evt.altKey === true) {
    this.isDragging = true;
    this.selection = false;
    this.lastPosX = evt.clientX;
    this.lastPosY = evt.clientY;
  }
});

canvas.on("mouse:move", function (opt) {
  if (this.isDragging) {
    let e = opt.e;
    let vpt = this.viewportTransform;
    vpt[4] += e.clientX - this.lastPosX;
    vpt[5] += e.clientY - this.lastPosY;
    this.requestRenderAll();
    this.lastPosX = e.clientX;
    this.lastPosY = e.clientY;
  }
});

canvas.on("mouse:up", function () {
  this.setViewportTransform(this.viewportTransform);
  this.isDragging = false;
  this.selection = true;
});

canvas.on("mouse:dblclick", function () {
  if (canvas.getActiveObjects().length == 1) {
    canvas.getActiveObjects()[0].hasControls =
      !canvas.getActiveObjects()[0].hasControls;
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Delete") {
    deleteSelectedObjects();
  }
});

document.addEventListener("paste", (event) => {
  if (event.clipboardData.getData("text/plain").startsWith("http")) {
    addImageFromUrl(event.clipboardData.getData("text/plain"));
  } else if (event.clipboardData.items[0].type.match(/image.*/)) {
    addImageFromFile(event.clipboardData.items[0].getAsFile());
  }
});

//Events - DropZone
eChooseFileImport.onclick = showDropZone;

eCanvasContainer.ondragenter = showDropZone;

eCanvasContainer.ondragleave = () => {
  if (!hoveringDropZone) {
    hideDropZone();
  }
};

eDropZone.ondragenter = () => {
  hoveringDropZone = true;
};

eMap.ondragenter = (event) => {
  event.preventDefault();
  hoveringDropZone = false;
};

eMap.ondragover = (event) => {
  event.preventDefault();
};

eImportUrlButton.onclick = () => {
  let url = eImportUrl.value;
  addImageFromUrl(url);
};

eDropZoneFile.onchange = (event) => {
  let files = event.target.files;
  for (let f of files) {
    addImageFromFile(f);
  }
  canvas.renderAll();
};

eDropZone.ondrop = (event) => {
  event.preventDefault();
  if (event.dataTransfer.items) {
    for (let i = 0; i < event.dataTransfer.items.length; i++) {
      if (event.dataTransfer.items[i].kind === "file") {
        const file = event.dataTransfer.items[i].getAsFile();
        addImageFromFile(file);
      }
    }
    canvas.renderAll();
  }
};

eDropZone.ondragover = (event) => {
  event.preventDefault();
};

document.addEventListener("dragend", hideDropZone);

document.addEventListener("drop", (event) => {
  event.preventDefault();
  hideDropZone();
});

document.addEventListener("mouseup", hideDropZone);

//Events - Dark Mode
eDarkModeToggle.onchange = (event) => {
  if (event.target.checked) {
    darkModeOn();
  } else {
    darkModeOff();
  }
};

//Events - Draw Mode
eDrawModeToggle.onchange = (event) => {
  if (event.target.checked) {
    drawModeOn();
  } else {
    drawModeOff();
  }
};

//Events - Notes
eNotesToggle.onclick = toggleNotes;

//Events - Return
eReturn.onclick = () => {
  window.open(indexUrl, "_blank");
};

//Game configuration
const urlSearchParams = new URLSearchParams(window.location.search);

var gameCode; // encoded coords&imageurl
var gameCoords = { lat: 0, lng: 0 };
var gameImage = null;

if (urlSearchParams.has("code")) {
  gameCode = urlSearchParams.get("code");
  try {
    gameCode = Base64.decode(gameCode);
  } catch (e) {
    gameCode = null;
  }
  if (gameCode) {
    if (gameCode.includes("&")) {
      if (validateCoordinates(gameCode.split("&")[0])) {
        getCoords(gameCode.split("&")[0]); //split 0,1 and parse
      } else {
        //reset
        gameCoords = { lat: 0, lng: 0 };
      }

      gameImage = decodeURIComponent(gameCode.split("&")[1]);
      if (!validateUrl(gameImage)) {
        //reset
        gameImage = null;
      }
    } else {
      if (validateCoordinates(gameCode)) {
        getCoords(gameCode);
      } else {
        //reset
        gameCoords = { lat: 0, lng: 0 };
      }
    }
  }
} else {
  if (urlSearchParams.has("coords")) {
    if (validateCoordinates(urlSearchParams.get("coords"))) {
      getCoords(urlSearchParams.get("coords"));
    } else {
      //reset
      gameCoords = { lat: 0, lng: 0 };
    }
  }
  if (urlSearchParams.has("image")) {
    gameImage = decodeURIComponent(urlSearchParams.get("image"));
    if (!validateUrl(gameImage)) {
      //reset
      gameImage = null;
    }
  }
}

if (gameImage != null) {
  addImageFromUrl(gameImage);
}

var map;

const gameAnswer = gameCoords;
var playerSubmission = { lat: 0, lng: 0 };
var playerMarker;
var playerDistance;

var once = false;

const eGuess = document.getElementById("guess");
const eResult = document.getElementById("result");
const eResultScore = document.getElementById("result-score");
const eResultDistance = document.getElementById("result-distance-km");
const eResultProgress = document.getElementById("result-progress-per");

async function mapInit() {
  map = new google.maps.Map(eMap, {
    center: { lat: 0, lng: 0 },
    zoom: 2,
    streetViewControl: false,
    draggableCursor: "crosshair",
  });

  google.maps.event.addListener(map, "click", function (event) {
    placeMarker(event.latLng);
    if (!once) {
      eGuess.style.visibility = "visible";
      once = true;
    }
  });
}

// button to guess
eGuess.onclick = guess;

//spacebar to guess
document.addEventListener("keypress", (e) => {
  if (e.key === " ") {
    if (once) {
      guess();
    }
  }
});

function guess() {
  playerDistance = google.maps.geometry.spherical.computeDistanceBetween(
    gameAnswer,
    playerSubmission
  );
  playerDistance = Math.round(playerDistance / 1000); //km

  let circleOptions = {
    strokeOpacity: 0,
    fillOpacity: 0,
    map: map,
    center: gameAnswer,
    radius: playerDistance * 1000,
  }; //radius in m
  let circle = new google.maps.Circle(circleOptions);

  //delete map markers
  playerMarker.setMap(null);
  playerMarker = undefined;
  //new map to display results
  map = new google.maps.Map(document.getElementById("map"), {
    center: gameAnswer,
    zoom: 5,
    streetViewControl: false,
    draggableCursor: "crosshair",
  });
  map.fitBounds(circle.getBounds());

  //answer marker
  new google.maps.Marker({
    position: gameAnswer,
    map: map,
    icon: {
      url: "res/target.png",
      anchor: new google.maps.Point(12, 20),
    },
    optimized: true,
  }).addListener("click", () => {
    openInGoogleMaps();
  });

  //player marker
  new google.maps.Marker({
    position: playerSubmission,
    map: map,
    icon: "res/pin.png",
    optimized: true,
  });

  let lineSymbol = {
    path: "M 0,-1 0,1",
    strokeOpacity: 0.6,
    scale: 2,
  };

  //dashed line between two markers
  new google.maps.Polyline({
    path: [gameAnswer, playerSubmission],
    strokeOpacity: 0,
    icons: [
      {
        icon: lineSymbol,
        offset: "0",
        repeat: "10px",
      },
    ],
    map: map,
  });

  //game score
  let score;
  //y = 5000-3(x)^0.8    - paste in google to see graph/curve
  score = 5000 - 3 * Math.pow(playerDistance, 0.8);
  score = Math.round(score);
  if (score < 0) {
    score = 0;
  }

  let percent = Math.round((score / 5000) * 100);

  //display results
  eResultScore.innerHTML = score;
  eResultProgress.style.width = percent + "%";
  eResultDistance.innerHTML = playerDistance.toLocaleString() + " KM";

  eGuess.style.visibility = "hidden";
  eResult.style.visibility = "visible";
}

document.getElementById("result-button-1").onclick = openInGoogleMaps;
document.getElementById("result-button-2").onclick = () => {
  let coordstr = gameAnswer.lat + "," + gameAnswer.lng;
  navigator.clipboard.writeText(coordstr);
};

function darkModeOn() {
  document.documentElement.classList.add("dark");
}
function darkModeOff() {
  document.documentElement.classList.remove("dark");
}

function drawModeOn() {
  canvas.isDrawingMode = true;
}

function drawModeOff() {
  canvas.isDrawingMode = false;
}

function toggleNotes() {
  if (eNotesToggle.innerHTML === "Show") {
    eNotes.style.transform = "translate(-50%, 5%)";
    eNotesToggle.innerHTML = "Hide";
    eNotesText.focus();
  } else {
    eNotes.style.transform = "translate(-50%, 70%)";
    eNotesToggle.innerHTML = "Show";
  }
}

function addImage(url) {
  let img = new Image();
  img.src = url;
  img.onload = function () {
    let ratio = img.naturalWidth / img.naturalHeight;
    let image = new fabric.Image(img, {
      left: 0,
      top: 0,
      angle: 0,
      width: img.width,
      height: img.width / ratio,
      originX: "left",
      originY: "top",
    });
    image.hasControls = false;
    canvas.add(image);
  };
}

function addImageFromFile(file) {
  if (file.type.match(/image.*/)) {
    addImage(URL.createObjectURL(file));
  }
}

async function addImageFromUrl(url) {
  if (await validateImageUrl(url)) {
    addImage(url);
  }
}

async function validateImageUrl(url) {
  return new Promise((resolve) => {
    let img = new Image();
    img.addEventListener("load", () => resolve(true));
    img.addEventListener("error", () => resolve(false));
    img.src = url;
  });
}

function validateCoordinates(string) {
  if (string.match(/[a-zA-Z]/)) {
    return false;
  }
  if (!string.includes(",")) {
    return false;
  }
  if (string.split(",").length != 2) {
    return false;
  }
  let lat = parseFloat(string.split(",")[0]);
  let lng = parseFloat(string.split(",")[1]);
  if (isNaN(lat) || isNaN(lng)) {
    return false;
  }
  return true;
}

function validateUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

function deleteSelectedObjects() {
  canvas.getActiveObjects().forEach((obj) => {
    canvas.remove(obj);
  });
  canvas.discardActiveObject().renderAll();
}

function showDropZone() {
  eDropZone.style.visibility = "visible";
}

function hideDropZone() {
  eDropZone.style.visibility = "hidden";
}

function getCoords(string) {
  string = string.replace(/\s/g, "");
  gameCoords.lat = parseFloat(string.split(",")[0]);
  gameCoords.lng = parseFloat(string.split(",")[1]);
}

function placeMarker(location) {
  if (playerMarker === undefined) {
    playerMarker = new google.maps.Marker({
      position: location,
      map: map,
      icon: "res/pin.png",
      optimized: true,
    });
  } else {
    playerMarker.setPosition(location);
  }
  playerSubmission.lat = playerMarker.getPosition().lat();
  playerSubmission.lng = playerMarker.getPosition().lng();
}

function openInGoogleMaps() {
  window.open(
    "https://www.google.com/maps/search/?api=1&query=" +
      gameAnswer.lat +
      "," +
      gameAnswer.lng,
    "_blank"
  );
}
