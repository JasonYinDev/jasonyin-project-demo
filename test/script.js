/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */
/************* GEOLOCATION *************/
const getPosBtn = document.querySelector("#get-position");
getPosBtn.addEventListener("click", getPos);

var geoWatchID = null;
const watchPosBtn = document.querySelector("#watch-position");
watchPosBtn.addEventListener("click", () => (geoWatchID = watchPos()));

const clearWatchBtn = document.querySelector("#clear-watch");
clearWatchBtn.addEventListener("click", clearWatch);

const posStatusEl = document.querySelector("#pos-status");

const positionEl = document.querySelector("#position");

function showPosition(position) {
  const {
    latitude,
    longitude,
    altitude,
    accuracy,
    altitudeAccuracy,
    heading,
    speed
  } = position.coords;

  positionEl.textContent = `
latitude [degrees]: ${latitude}

longitude [degrees]: ${longitude}

altitude [meters]: ${altitude}
      
accuracy [meters]: ${accuracy}

altitudeAccuracy [meters]: ${altitudeAccuracy}

heading [degrees]: ${heading}
      
speed [m/s]: ${speed}

timestamp: ${Date(position.timestamp)}
`;
}

function getPosSuccess(position) {
  posStatusEl.textContent = "Got Current Position";
  showPosition(position);
  console.log("position: ", position);
}

function geoWatchSuccess(position) {
  posStatusEl.textContent = "Watching";
  watchPosBtn.disabled = true;
  clearWatchBtn.disabled = false;

  showPosition(position);
  console.log("position: ", position);
}

function geoError(err) {
  posStatusEl.textContent = "Error";
  alert(
    "Sorry, no position available." +
      " error code: " +
      err.code +
      " error.message: " +
      err.message
  );
  console.error(err);
}

var geoOptions = {
  enableHighAccuracy: true,
  maximumAge: 30000,
  timeout: 27000
};

function watchPos() {
  clearWatch();

  posStatusEl.textContent = "Loading";

  if ("geolocation" in navigator) {
    const geoWatchID = navigator.geolocation.watchPosition(
      geoWatchSuccess,
      geoError,
      geoOptions
    );
  } else {
    alert("Geolocation is not supported in your browser");
    console.error("Geolocation is not supported in your browser");
  }

  return geoWatchID;
}

function clearWatch() {
  geoWatchID === null ? navigator.geolocation.clearWatch(geoWatchID) : false;
  posStatusEl.textContent = "Stopped Watching";
  watchPosBtn.disabled = false;
  clearWatchBtn.disabled = true;
}

function getPos() {
  clearWatch();

  posStatusEl.textContent = "Loading";
  
  navigator.geolocation.getCurrentPosition(getPosSuccess, geoError, geoOptions);
}
/************* end GEOLOCATION *************/

/************* DEVICE ORIENTATION *************/
const getOrientationBtn = document.querySelector("#get-orientation");

getOrientationBtn.addEventListener("click", () => {
  getOrientation();
  getOrientationBtn.disabled = true;
  stopGetOrientationBtn.disabled = false;
});

const stopGetOrientationBtn = document.querySelector("#stop-get-orientation");

stopGetOrientationBtn.addEventListener("click", () => {
  window.removeEventListener("deviceorientation", handleOrientation, true);
  orientationStatusEl.textContent = "Stopped Observing Orientation";
  getOrientationBtn.disabled = false;
  stopGetOrientationBtn.disabled = true;
});

const orientationStatusEl = document.querySelector("#orientation-status");

const orientationEl = document.querySelector("#orientation");

function handleOrientation(event) {
  orientationStatusEl.textContent = "Observing Orientation";

  const { absolute, alpha, beta, gamma } = event;

  orientationEl.textContent = `
absolute: ${absolute}

alpha [degrees]: ${alpha}
    
beta [degrees]: ${beta}
    
gamma [degrees]: ${gamma}
  `;
  console.log("device orientation: ", event);
}

function getOrientation() {
  if (window.DeviceOrientationEvent) {
    orientationStatusEl.textContent = "Loading";
    window.addEventListener("deviceorientation", handleOrientation, true);
  } else {
    alert("DeviceOrientationEvent is not supported by your browser.");
    console.error("DeviceOrientationEvent is not supported by your browser.");
  }
}
/************* end DEVICE ORIENTATION *************/

/************* ABSOLUTE ORIENTATION *************/
const observeAbsBtn = document.querySelector("#observe-abs-orientation");
observeAbsBtn.onclick = observeAbsOrientation;

const stopObserveAbsBtn = document.querySelector("#stop-observe-abs");
stopObserveAbsBtn.onclick = () => {
  absSensor.stop();
  observeAbsBtn.disabled = false;
  stopObserveAbsBtn.disabled = true;
};

const absEl = document.querySelector("#abs-orientation");

function makeAbsSensor(options) {
  try {
    return new AbsoluteOrientationSensor(options);
  } catch (error) {
    // Handle construction errors.
    if (error.name === "SecurityError") {
      // See the note above about feature policy.
      console.log("Sensor construction was blocked by a feature policy.");
    } else if (error.name === "ReferenceError") {
      console.log("Sensor is not supported by the User Agent.");
    } else {
      throw error;
    }
  }
}

const absSensor = makeAbsSensor();

absSensor.onactivate = () => {
  console.log("abs sensor activated");
  observeAbsBtn.disabled = true;
  stopObserveAbsBtn.disabled = false;
};

absSensor.onreading = () => {
  console.log("abs", absSensor.quaternion);
  absEl.textContent = absSensor.quaternion;
};

absSensor.onerror = event => {
  if (event.error.name === "NotAllowedError") {
    // Branch to code for requesting permission.
  } else if (event.error.name === "SecurityError") {
    console.log("No permissions to use AbsoluteOrientationSensor.");
  } else if (event.error.name == "NotReadableError") {
    console.log("Sensor is not available.");
  }
};

function observeAbsOrientation() {
  Promise.all([
    navigator.permissions.query({ name: "accelerometer" }),
    navigator.permissions.query({ name: "magnetometer" }),
    navigator.permissions.query({ name: "gyroscope" })
  ]).then(results => {
    if (results.every(result => result.state === "granted")) {
      absSensor.start();
      console.log(
        "all permissions necessary to use AbsoluteOrientationSensor has been granted."
      );
    } else if (results.every(result => result.state === "prompt")) {
      absSensor.start();
      console.log(
        "all permissions necessary to use AbsoluteOrientationSensor has been granted."
      );
    } else if (results.some(result => result.state === "denied")) {
      console.log("No permissions to use AbsoluteOrientationSensor.");
      // in future permissions can be navigator.permissions.request()'ed
      console.log(
        "in future permissions can be navigator.permissions.request()'ed."
      );
    }
  });
}
/************* end ABSOLUTE ORIENTATION *************/
