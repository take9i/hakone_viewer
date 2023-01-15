import * as C from "cesium";
import { getPresetCameras } from "./presetCameras.js";

// const MAPTILE_URL = 'https://api.maptiler.com/maps/jp-mierune-streets/256/{z}/{x}/{y}.png?key=Jjfw1w0QxuYiSUxyQ6mU'
// const MAPTILE_URL = 'https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=Jjfw1w0QxuYiSUxyQ6mU'
// const MAPTILE_URL = 'https://api.maptiler.com/maps/70f29ecc-6aec-4391-9474-65fee08bed94/256/{z}/{x}/{y}.png?key=Jjfw1w0QxuYiSUxyQ6mU'
const MAPTILE_URL = "http://localhost:7777/services/maptiles/tiles/{z}/{x}/{y}.png";

const TILESET_FEATURES_URL = "./3dtiles/14382_hakone-machi_building/bldg_notexture/tileset.json";

// pletau terrain
C.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5N2UyMjcwOS00MDY1LTQxYjEtYjZjMy00YTU0ZTg5MmViYWQiLCJpZCI6ODAzMDYsImlhdCI6MTY0Mjc0ODI2MX0.dkwAL1CcljUV7NA7fDbhXXnmyZQU_c-G5zRx8PtEcxE";

const getJSON = (url) => fetch(url).then((response) => response.json());

const viewer = new C.Viewer("map", {
  imageryProvider: new C.UrlTemplateImageryProvider({
    url: MAPTILE_URL,
    maximumLevel: 16,
    credit: new C.Credit(
      "<ul>" +
      "<li>国土地理院<br><small>国土地理院長の承認を得て、同院発行の数値地図(国土基本情報) 電子国土基本図(地図情報)、数値地図(国土基本情報) 電子国土基本図(地名情報) 及び 基盤地図情報を使用した。(承認番号 平30情使、 第705号)</small></li>" +
      '<li>&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors</li>' +
      "</ul>"
    ),
  }),
  terrainProvider: new C.CesiumTerrainProvider({
    url: C.IonResource.fromAssetId(770371), // pleatau terrain
    // maximumLevel: 18,
    requestVertexNormals: true,
  }),

  animation: false,
  baseLayerPicker: false,
  // fullscreenButton: false,
  geocoder: false,
  homeButton: false,
  //infoBox: false,
  sceneModePicker: false,
  selectionIndicator: false,
  timeline: false,
  navigationHelpButton: false,
  // navigationInstructionsInitiallyVisible: false,
  scene3DOnly: true,
  clockViewModel: null,
  vrButton: true,

  requestRenderMode: true,
  maximumRenderTimeChange: 60,
  targetFrameRate: 15,
  shadows: true,
  terrainShadows: C.ShadowMode.ENABLED,
});

viewer.scene.globe.depthTestAgainstTerrain = true;
viewer.scene.globe.enableLighting = true;
viewer.scene.globe.maximumScreenSpaceError = 1; // if more refine terrain
viewer.shadowMap.maximumDistance = 1000.0;
// viewer.shadowMap.softShadows = true;
viewer.shadowMap.size = 4096;
viewer.clock.multiplier = 1;
viewer.clock.shouldAnimate = true;
// viewer.scene.fog.density = 0.001;
// viewer.scene.fog.screenSpaceErrorFactor = 4;
// viewer.scene.debugShowFramesPerSecond = true;
// viewer.extend(C.viewerCesiumInspectorMixin);
// viewer.extend(C.viewerCesium3DTilesInspectorMixin);

viewer.scene.primitives.add(new C.Cesium3DTileset({ url: TILESET_FEATURES_URL }));

viewer.scene.globe.depthTestAgainstTerrain = true;
viewer.scene.globe.enableLighting = true;
viewer.scene.globe.maximumScreenSpaceError = 1; // if more refine terrain
viewer.shadowMap.maximumDistance = 1000.0;
// viewer.shadowMap.softShadows = true;
viewer.shadowMap.size = 4096;
viewer.clock.multiplier = 1;
viewer.clock.shouldAnimate = true;
viewer.clock.currentTime.secondsOfDay = (8 + 3) * 3600;
// viewer.scene.fog.density = 0.001;
// viewer.scene.fog.screenSpaceErrorFactor = 4;
// viewer.scene.debugShowFramesPerSecond = true;
// viewer.extend(C.viewerCesiumInspectorMixin);
// viewer.extend(C.viewerCesium3DTilesInspectorMixin);

const presetCameras = getPresetCameras(viewer);
viewer.camera.setView(presetCameras.default);

getJSON("./anno.geojson").then((geoj) => {
  geoj.features
    .filter((f) => !["0110", "0210", "0220"].includes(f.properties.ftCode))
    .map((f) => {
      const coord = f.geometry.coordinates;
      const height = f.properties.annoCtg == "_" ? 300 : 15;
      const distanceDisplay = ["0312", "0352"].includes(f.properties.ftCode)
        ? undefined
        : ["0411", "0412", "0421", "0422", "0431"].includes(f.properties.ftCode)
          ? new C.DistanceDisplayCondition(0, 4000)
          : new C.DistanceDisplayCondition(0, 1000);
      const anno = viewer.entities.add({
        position: C.Cartesian3.fromDegrees(coord[0], coord[1], height),
        label: {
          text: f.properties.knj,
          font: "20px sans-serif",
          style: C.LabelStyle.FILL_AND_OUTLINE,
          distanceDisplayCondition: distanceDisplay,
          horizontalOrigin: C.HorizontalOrigin.CENTER,
          verticalOrigin: C.VerticalOrigin.BOTTOM,
          heightReference: C.HeightReference.RELATIVE_TO_GROUND,
        },
      });
    });
});
getJSON("./bldsbl.geojson").then((geoj) => {
  geoj.features
    .filter((f) => f.properties.name)
    .map((f) => {
      const coord = f.geometry.coordinates;
      viewer.entities.add({
        position: C.Cartesian3.fromDegrees(coord[0], coord[1], 10),
        label: {
          text: f.properties.name,
          font: "20px sans-serif",
          style: C.LabelStyle.FILL_AND_OUTLINE,
          distanceDisplayCondition: new C.DistanceDisplayCondition(0, 1000),
          horizontalOrigin: C.HorizontalOrigin.CENTER,
          verticalOrigin: C.VerticalOrigin.BOTTOM,
          heightReference: C.HeightReference.RELATIVE_TO_GROUND,
        },
      });
    });
});

let loadedCzmls = [];
let lastLoadAt = null;
let lastCzdses = [];
const loadTodaysCzmls = (czmls) => {
  const setSpecifiedDayOnCzml = (czml, dayNumber) => {
    czml.slice(1).forEach((packet) => {
      const jd = C.JulianDate.fromIso8601(packet.position.epoch);
      jd.dayNumber = dayNumber;
      packet.position.epoch = C.JulianDate.toIso8601(jd);
    });
  };

  const promises = czmls.map((czml) => {
    setSpecifiedDayOnCzml(czml, viewer.clock.currentTime.dayNumber);
    return viewer.dataSources.add(C.CzmlDataSource.load(czml));
  });
  Promise.all(promises).then((czdses) => {
    lastLoadAt = viewer.clock.currentTime;
    lastCzdses = czdses;
  });
};

Promise.all([
  getJSON("./data/vehicles/train_down_czml.json"),
  getJSON("./data/vehicles/train_up_czml.json"),
  getJSON("./data/vehicles/cablecar_down_czml.json"),
  getJSON("./data/vehicles/cablecar_up_czml.json"),
  getJSON("./data/vehicles/ropeway_1_czml.json"),
  getJSON("./data/vehicles/ropeway_2_czml.json"),
  getJSON("./data/vehicles/ropeway_3_czml.json"),
  getJSON("./data/vehicles/vehicle_yumoto_czml.json"),
  getJSON("./data/vehicles/pedestrian_a_czml.json"),
  getJSON("./data/vehicles/pedestrian_b_czml.json"),
]).then((czmls) => {
  loadedCzmls = czmls;
  loadTodaysCzmls(loadedCzmls);
});

const position = C.Cartesian3.fromDegrees(139.103528, 35.233333, 150);
let speed = 0;
const hpRoll = new C.HeadingPitchRoll();
const deltaRadians = C.Math.toRadians(3.0);
const speedVector = new C.Cartesian3();
const vehicleModelMatrix = C.Transforms.headingPitchRollToFixedFrame(position, hpRoll);
const vehicleRotation = new C.Matrix3();
const vehicle = viewer.entities.add({
  position: new C.CallbackProperty(() => position, false),
  orientation: new C.CallbackProperty(
    () => C.Quaternion.fromRotationMatrix(C.Matrix4.getMatrix3(vehicleModelMatrix, vehicleRotation)),
    false
  ),
  name: "vehicle",
  box: {
    dimensions: new C.Cartesian3(5, 2, 2),
    material: C.Color.ORANGE,
    shadows: C.ShadowMode.ENABLED,
  },
});

document.addEventListener("keydown", function (e) {
  switch (e.keyCode) {
    case 40:
      // speed down
      speed = Math.max(--speed, -100);
      break;
    case 38:
      // speed up
      speed = Math.min(++speed, 100);
      break;
    case 39:
      // turn right
      hpRoll.heading += deltaRadians;
      if (hpRoll.heading > C.Math.TWO_PI) {
        hpRoll.heading -= C.Math.TWO_PI;
      }
      break;
    case 37:
      // turn left
      hpRoll.heading -= deltaRadians;
      if (hpRoll.heading < 0.0) {
        hpRoll.heading += C.Math.TWO_PI;
      }
      break;
    default:
  }
});

viewer.scene.preUpdate.addEventListener((scene, time) => {
  C.Cartesian3.multiplyByScalar(C.Cartesian3.UNIT_X, speed / 10, speedVector);
  C.Matrix4.multiplyByPoint(vehicleModelMatrix, speedVector, position);
  C.Transforms.headingPitchRollToFixedFrame(
    position,
    hpRoll,
    C.Ellipsoid.WGS84,
    C.Transforms.eastNorthUpToFixedFrame,
    vehicleModelMatrix
  );
});

window._viewer = viewer;
window.Cesium = C;

export { viewer, presetCameras };