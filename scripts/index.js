document.documentElement.classList.add("dark");

const eGithub = document.getElementById("github");

const eForm1 = document.getElementById("form1");
const eForm2 = document.getElementById("form2");

const eGame = document.getElementById("game");
const eGameClasses = eGame.className;
const ePlay = document.getElementById("play");

const eCoords = document.getElementById("coordinates");
const eCoordsClasses = eCoords.className;
const eImage = document.getElementById("image");
const eImageClasses = eImage.className;
const eImagePlaceholder = eImage.placeholder;
const eCheckbox = document.getElementById("checkbox");
const eCreate = document.getElementById("create");

const eToggle = document.getElementById("toggle");

const eGenerated = document.getElementById("generated");
const eGeneratedClose = document.getElementById("generated-close");

const eCode = document.getElementById("code");
const eCodeCopy = document.getElementById("code-copy");
const eUrlcode = document.getElementById("urlcode");
const eUrlcodeCopy = document.getElementById("urlcode-copy");
const eUnmasked = document.getElementById("unmasked");
const eUnmaskedCopy = document.getElementById("unmasked-copy");

//forks may have to change these
const ghRepo = "GeoTaggr";
const ghUser = "raais";
const ghUrl = "https://github.com/" + ghUser + "/" + ghRepo;
const hostName = ghUser + ".github.io";
const baseUrl = "https://" + hostName + "/" + ghRepo;
const gameFile = "game"; //omit .html for neatness

const inputErrorClasses =
  "bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500 dark:bg-gray-700 focus:border-red-500 block p-2.5 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500";

const disabledClasses = "dark:bg-gray-500";

eGithub.onclick = () => {
  window.open(ghUrl, "_blank");
};

eGame.onfocus = () => {
  //clear error classes
  if (eGame.getAttribute("data-error") === "true") {
    eGame.className = eGameClasses;
    eGame.value = "";
    eGame.setAttribute("data-error", "false");
  }
};

eCoords.onfocus = () => {
  //clear error classes
  if (eCoords.getAttribute("data-error") === "true") {
    eCoords.className = eCoordsClasses;
    eCoords.value = "";
    eCoords.setAttribute("data-error", "false");
  }
};

eImage.onfocus = () => {
  //clear error classes
  if (eImage.getAttribute("data-error") === "true") {
    eImage.className = eImageClasses;
    eImage.value = "";
    eImage.setAttribute("data-error", "false");
  }
};

eToggle.onchange = (event) => {
  //toggle play/create
  if (event.target.checked) {
    eForm2.style.display = "none";
    eForm1.style.display = "flex";
    eGame.focus();
  } else {
    eForm1.style.display = "none";
    eForm2.style.display = "flex";
  }
};

eCheckbox.onchange = (event) => {
  //toggle checkbox
  if (event.target.checked) {
    eImage.className = eImageClasses;
    eImage.removeAttribute("readonly");
    eImage.removeAttribute("disabled");
    eImage.placeholder = eImagePlaceholder;
  } else {
    eImage.className = eImageClasses + " " + disabledClasses;
    eImage.setAttribute("readonly", "");
    eImage.setAttribute("disabled", "");
    eImage.value = "";
    eImage.placeholder = "no image attached";
    eCoords.focus();
  }
};

ePlay.onclick = () => {
  //validate game

  let game = eGame.value;
  game = game.replace(/\s/g, "");
  if (!game.startsWith("http")) {
    //code only
    game = baseUrl + "/" + gameFile + "?code=" + game;
  }

  let url;
  if (validateUrl(game)) {
    url = new URL(game);
  } else {
    inputError(eGame, "Error: invalid URL");
    return;
  }

  if (url.hostname !== hostName) {
    inputError(eGame, "Error: invalid URL");
    return;
  }

  const urlSearchParams = url.searchParams;

  let gameCode; // Base64(coords&image)
  let gameCoords = { lat: 0, lng: 0 };
  let gameImage = null;

  //lotsa validationz
  if (urlSearchParams.has("code")) {
    gameCode = urlSearchParams.get("code");
    try {
      gameCode = Base64.decode(gameCode);
    } catch (e) {
      // not base64
      inputError(eGame, "Error: invalid code");
      return;
    }
    if (gameCode.includes("&")) {
      if (validateCoordinates(gameCode.split("&")[0])) {
        getCoords(gameCode.split("&")[0]); //split 0,1 and parse
      } else {
        inputError(eGame, "Error: invalid code");
        return;
      }

      gameImage = decodeURIComponent(gameCode.split("&")[1]);
      if (!validateUrl(gameImage)) {
        inputError(eGame, "Error: invalid code");
        return;
      }
    } else {
      if (validateCoordinates(gameCode)) {
        getCoords(gameCode);
      } else {
        inputError(eGame, "Error: invalid code");
        return;
      }
    }
  } else {
    if (urlSearchParams.has("coords")) {
      if (validateCoordinates(urlSearchParams.get("coords"))) {
        getCoords(urlSearchParams.get("coords"));
      } else {
        inputError(eGame, "Error: invalid coords");
        return;
      }
    }
    if (urlSearchParams.has("image")) {
      gameImage = decodeURIComponent(urlSearchParams.get("image"));
      if (!validateUrl(gameImage)) {
        inputError(eGame, "Error: invalid image");
        return;
      }
    }
  }

  function getCoords(string) {
    string = string.replace(/\s/g, "");
    gameCoords.lat = parseFloat(string.split(",")[0]);
    gameCoords.lng = parseFloat(string.split(",")[1]);
  }

  //if (gameImage !== null) {
  //  if ((await validateImageUrl(gameImage)) === false) {
  //    inputError(eGame, "Error: invalid image");
  //    return;
  //  }
  //}

  window.open(game, "_blank");
};

let modal;

eCreate.onclick = async () => {
  let coords = eCoords.value;
  coords = coords.replace(/\s/g, "");
  coords = coords.replace(/[\])}[{(]/g, "");
  coords = coords.replace(/[a-zA-Z]/g, "");
  coords = coords.replace(/°/g, "");
  if (!validateCoordinates(coords)) {
    inputError(eCoords, "Error: invalid coordinates");
    return;
  }

  let image = eImage.value;
  if (eImage.hasAttribute("disabled")) {
    image = null;
  } else {
    image = image.replace(/\s/g, "");
    if ((await validateImageUrl(image)) === false) {
      inputError(eImage, "Error: invalid image");
      return;
    }
    image = encodeURIComponent(image);
  }

  let code = coords;
  if (image !== null) {
    code += "&" + image;
  }
  code = Base64.encodeURI(code);

  let urlcode = baseUrl + "/" + gameFile + "?code=" + code;

  let unmasked = baseUrl + "/" + gameFile + "?coords=" + coords;

  if (image !== null) {
    unmasked += "&image=" + image;
  }

  eCode.value = code;
  eUrlcode.value = urlcode;
  eUnmasked.value = unmasked;

  modal = new Modal(eGenerated);
  modal.show();
};

eGeneratedClose.onclick = () => {
  modal.hide();
};

eCodeCopy.onclick = () => {
  copyString(eCode.value);
  modal.hide();
};
eUrlcodeCopy.onclick = () => {
  copyString(eUrlcode.value);
  modal.hide();
};
eUnmaskedCopy.onclick = () => {
  copyString(eUnmasked.value);
  modal.hide();
};

function copyString(str) {
  navigator.clipboard.writeText(str);
}

function inputError(input, str) {
  if (!input.hasAttribute("disabled")) {
    input.className = input.className + " " + inputErrorClasses;
    input.value = str;
    input.setAttribute("data-error", "true");
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
    // no letters
    return false;
  }
  if (!string.includes(",")) {
    // incorrect DD or other format
    return false;
  }
  if (string.split(",").length != 2) {
    // incorrect DD or other format
    return false;
  }
  let lat = parseFloat(string.split(",")[0]);
  let lng = parseFloat(string.split(",")[1]);
  if (isNaN(lat) || isNaN(lng)) {
    // parse error
    return false;
  }
  // all checks passed
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
