import * as C from "cesium";
import { getPresetCameras } from "./presetCameras.js";
/*global jsnx*/

// const MAPTILE_URL = 'https://api.maptiler.com/maps/jp-mierune-streets/256/{z}/{x}/{y}.png?key=Jjfw1w0QxuYiSUxyQ6mU'
// const MAPTILE_URL = 'https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=Jjfw1w0QxuYiSUxyQ6mU'
// const MAPTILE_URL = 'https://api.maptiler.com/maps/70f29ecc-6aec-4391-9474-65fee08bed94/256/{z}/{x}/{y}.png?key=Jjfw1w0QxuYiSUxyQ6mU'
const MAPTILE_URL = "http://localhost:7777/services/maptiles/tiles/{z}/{x}/{y}.png";

const TILESET_FEATURES_URL = "./3dtiles/14382_hakone-machi_building/bldg_notexture/tileset.json";

// pletau terrain
C.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5N2UyMjcwOS00MDY1LTQxYjEtYjZjMy00YTU0ZTg5MmViYWQiLCJpZCI6ODAzMDYsImlhdCI6MTY0Mjc0ODI2MX0.dkwAL1CcljUV7NA7fDbhXXnmyZQU_c-G5zRx8PtEcxE";

const GEOID = 36.7071;
const tail = (ary) => ary[ary.length - 1];
const zip = (...args) => args[0].map((_, i) => args.map((arg) => arg[i]));
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
  infoBox: false,
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
      viewer.entities.add({
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
viewer.entities.add({
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
    // heightReference: C.HeightReference.RELATIVE_TO_GROUND
  },
});

document.addEventListener("keydown", (event) => {
  switch (event.code) {
    case "KeyS":
    case "ArrowDown":
      speed = Math.max(--speed, -100);
      break;
    case "KeyW":
    case "ArrowUp":
      // speed up
      speed = Math.min(++speed, 100);
      break;
    case "KeyA":
    case "ArrowLeft":
      // turn left
      hpRoll.heading -= deltaRadians;
      hpRoll.heading += hpRoll.heading < 0.0 ? C.Math.TWO_PI : 0;
      break;
    case "KeyD":
    case "ArrowRight":
      // turn right
      hpRoll.heading += deltaRadians;
      hpRoll.heading -= hpRoll.heading > C.Math.TWO_PI ? C.Math.TWO_PI : 0;
      break;
    default:
  }
});

viewer.scene.preUpdate.addEventListener(() => {
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

getJSON("./_roads_nw.json").then((json) => {
  const nw = new jsnx.MultiDiGraph();
  nw.addEdgesFrom(json);
  window._nw = nw;

  let personOnEdge = [
    [139.105047306, 35.233695833, 93.730600826532],
    [139.10396225, 35.233333472, 94.61836036288149],
    0,
  ];
  let personPosition = C.Cartesian3.fromDegrees(personOnEdge[0][0], personOnEdge[0][1], personOnEdge[0][2] + GEOID);
  let personDistance = 0;
  let personSpeed = 20;
  let lastTime = viewer.clock.currentTime;
  let personTurnTo = null;
  let fromBehind = false;

  const person = viewer.entities.add({
    position: new C.CallbackProperty(() => personPosition, false),
    name: "person",
    ellipsoid: {
      radii: new C.Cartesian3(2, 2, 2),
      material: C.Color.WHITE,
      shadows: C.ShadowMode.ENABLED,
    },
  });
  const anchor = viewer.entities.add({
    position: new C.CallbackProperty(() => {
      const up = C.Cartesian3.multiplyByScalar(
        C.Cartesian3.normalize(personPosition, new C.Cartesian3()),
        20,
        new C.Cartesian3()
      );
      return C.Cartesian3.add(personPosition, up, new C.Cartesian3());
    }, false),
    name: "anchor",
    ellipsoid: {
      radii: new C.Cartesian3(0.2, 0.2, 0.2),
      material: C.Color.WHITE,
    },
  });
  window.anchor = anchor;

  document.addEventListener("keydown", (event) => {
    switch (event.code) {
      case "KeyA":
      case "ArrowLeft":
        personTurnTo = "left";
        console.log(personTurnTo);
        break;
      case "KeyD":
      case "ArrowRight":
        personTurnTo = "right";
        console.log(personTurnTo);
        break;
      case "Space":
        fromBehind = !fromBehind;
        if (fromBehind) {
          const p = anchor.position.getValue();
          const diff = C.Cartesian3.subtract(viewer.camera.position, p, new C.Cartesian3());
          const mat = C.Matrix4.inverseTransformation(C.Transforms.eastNorthUpToFixedFrame(p), new C.Matrix4());
          anchor.viewFrom = C.Matrix4.multiplyByPointAsVector(mat, diff, new C.Cartesian3());
          viewer.trackedEntity = anchor;
        } else {
          viewer.trackedEntity = undefined;
        }
        break;
      default:
    }
  });

  const getAngle = (v1, v2) => {
    const dot = (v1, v2) => v1[0] * v2[0] + v1[1] * v2[1];
    const mag = (v) => Math.hypot(v[0], v[1]);
    const c = dot(v1, v2) / (mag(v1) * mag(v2));
    return Math.acos(Math.min(Math.max(c, -1), 1));
  };
  const getEdges = (node) => {
    return nw
      .neighbors(node)
      .map((nextNode) => Object.keys(nw.getEdgeData(node, nextNode)).map((key) => [node, nextNode, key]))
      .flat();
  };
  const getEdgeVec = (edge) => {
    const vec = (p1, p2) => [p2[0] - p1[0], p2[1] - p1[1]];
    const { coords } = nw.getEdgeData(...edge);
    return vec(coords[0], tail(coords));
  };
  const getCoord = (c1, c2, r) => {
    const rr = 1 - r;
    return [c1[0] * rr + c2[0] * r, c1[1] * rr + c2[1] * r, c1[2] * rr + c2[2] * r];
  };

  viewer.scene.preUpdate.addEventListener((scene, time) => {
    const dt = C.JulianDate.secondsDifference(time, lastTime);
    personDistance += dt * personSpeed;
    const { coords, distances } = nw.getEdgeData(...personOnEdge);
    if (tail(distances) <= personDistance) {
      const nextEdges = getEdges(personOnEdge[1]).map((ne) => [
        getAngle(getEdgeVec(personOnEdge), getEdgeVec(ne)),
        ne,
      ]);
      let sorter = null;
      if (personTurnTo == "left") {
        sorter = (a, b) => Math.abs(a[0] - Math.PI / 2) - Math.abs(b[0] - Math.PI / 2);
        personTurnTo = null;
      } else if (personTurnTo == "right") {
        sorter = (a, b) => Math.abs(a[0] + Math.PI / 2) - Math.abs(b[0] + Math.PI / 2);
        personTurnTo = null;
      } else {
        sorter = (a, b) => Math.abs(a[0]) - Math.abs(b[0]);
      }
      personOnEdge = [...nextEdges].sort(sorter)[0][1];
      personPosition = C.Cartesian3.fromDegrees(personOnEdge[0][0], personOnEdge[0][1], personOnEdge[0][2] + GEOID);
      personDistance = 0;
    } else {
      for (const [c1, c2, d1, d2] of zip(
        coords.slice(0, -1),
        coords.slice(1),
        distances.slice(0, -1),
        distances.slice(1)
      )) {
        if (d1 <= personDistance && personDistance < d2) {
          const r = (personDistance - d1) / (d2 - d1);
          const c = getCoord(c1, c2, r);
          personPosition = C.Cartesian3.fromDegrees(c[0], c[1], c[2] + GEOID + 5);
        }
      }
    }
    if (fromBehind) {
      viewer.trackedEntity = undefined;
      const p = anchor.position.getValue();
      const diff = C.Cartesian3.subtract(viewer.camera.position, p, new C.Cartesian3());
      const diff2 = C.Cartesian3.multiplyByScalar(
        C.Cartesian3.normalize(diff, new C.Cartesian3()),
        Math.min(C.Cartesian3.magnitude(diff), 100),
        new C.Cartesian3()
      );
      const mat = C.Matrix4.inverseTransformation(C.Transforms.eastNorthUpToFixedFrame(p), new C.Matrix4());
      anchor.viewFrom = C.Matrix4.multiplyByPointAsVector(mat, diff2, new C.Cartesian3());
      viewer.trackedEntity = anchor;
    }
    lastTime = time;
  });
});

window._viewer = viewer;
window.Cesium = C;

export { viewer, presetCameras };
