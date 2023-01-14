import { useState, useEffect } from "react";
import * as Cesium from "cesium";
import dayjs from "dayjs";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import FastForwardIcon from "@mui/icons-material/FastForward";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { grey } from "@mui/material/colors";
import { getPresetCameras } from "./presetCameras.js";

// const MAPTILE_URL = 'https://api.maptiler.com/maps/jp-mierune-streets/256/{z}/{x}/{y}.png?key=Jjfw1w0QxuYiSUxyQ6mU'
// const MAPTILE_URL = 'https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=Jjfw1w0QxuYiSUxyQ6mU'
// const MAPTILE_URL = 'https://api.maptiler.com/maps/70f29ecc-6aec-4391-9474-65fee08bed94/256/{z}/{x}/{y}.png?key=Jjfw1w0QxuYiSUxyQ6mU'
const MAPTILE_URL =
  "http://localhost:7777/services/maptiles/tiles/{z}/{x}/{y}.png";

const TILESET_FEATURES_URL =
  "./3dtiles/14382_hakone-machi_building/bldg_notexture/tileset.json";

// pletau terrain
Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5N2UyMjcwOS00MDY1LTQxYjEtYjZjMy00YTU0ZTg5MmViYWQiLCJpZCI6ODAzMDYsImlhdCI6MTY0Mjc0ODI2MX0.dkwAL1CcljUV7NA7fDbhXXnmyZQU_c-G5zRx8PtEcxE";

const getJSON = (url) => fetch(url).then((response) => response.json());

const [viewer, presetCameras] = (() => {
  const viewer = new Cesium.Viewer("map", {
    imageryProvider: new Cesium.UrlTemplateImageryProvider({
      url: MAPTILE_URL,
      maximumLevel: 16,
      credit: new Cesium.Credit(
        "<ul>" +
          "<li>国土地理院<br><small>国土地理院長の承認を得て、同院発行の数値地図(国土基本情報) 電子国土基本図(地図情報)、数値地図(国土基本情報) 電子国土基本図(地名情報) 及び 基盤地図情報を使用した。(承認番号 平30情使、 第705号)</small></li>" +
          '<li>&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors</li>' +
          "</ul>"
      ),
    }),
    terrainProvider: new Cesium.CesiumTerrainProvider({
      url: Cesium.IonResource.fromAssetId(770371), // pleatau terrain
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
    terrainShadows: Cesium.ShadowMode.ENABLED,
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
  // viewer.extend(Cesium.viewerCesiumInspectorMixin);
  // viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);

  viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({ url: TILESET_FEATURES_URL })
  );

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
  // viewer.extend(Cesium.viewerCesiumInspectorMixin);
  // viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);

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
          : ["0411", "0412", "0421", "0422", "0431"].includes(
              f.properties.ftCode
            )
          ? new Cesium.DistanceDisplayCondition(0, 4000)
          : new Cesium.DistanceDisplayCondition(0, 1000);
        const anno = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(coord[0], coord[1], height),
          label: {
            text: f.properties.knj,
            font: "20px sans-serif",
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            distanceDisplayCondition: distanceDisplay,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
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
          position: Cesium.Cartesian3.fromDegrees(coord[0], coord[1], 10),
          label: {
            text: f.properties.name,
            font: "20px sans-serif",
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
              0,
              1000
            ),
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
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
        const jd = Cesium.JulianDate.fromIso8601(packet.position.epoch);
        jd.dayNumber = dayNumber;
        packet.position.epoch = Cesium.JulianDate.toIso8601(jd);
      });
    };

    const promises = czmls.map((czml) => {
      setSpecifiedDayOnCzml(czml, viewer.clock.currentTime.dayNumber);
      return viewer.dataSources.add(Cesium.CzmlDataSource.load(czml));
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
    // getJSON("./transports/shonan-monorail_czml.json"),
    // getJSON("./transports/enodenbus_czml.json"),
    // getJSON("./transports/car-r135_czml.json"),
    // getJSON("./transports/person-enoshima_czml.json")
  ]).then((czmls) => {
    loadedCzmls = czmls;
    loadTodaysCzmls(loadedCzmls);
  });

  return [viewer, presetCameras];
})();
window._viewer = viewer;

const Locator = () => {
  const [location, setLocation] = useState("default");
  const handleChange = (event) => {
    setLocation(event.target.value);
    viewer.camera.flyTo(presetCameras[event.target.value]);
  };
  return (
    <FormControl sx={{ m: 1, minWidth: 120 }}>
      <InputLabel id="demo-simple-select-label">地点</InputLabel>
      <Select
        sx={{ backgroundColor: "white" }}
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={location}
        label="地点"
        onChange={handleChange}
      >
        <MenuItem value={"default"}>初期位置</MenuItem>
        <MenuItem value={"hakoneyumoto_sta"}>箱根湯本駅</MenuItem>
        <MenuItem value={"oohiradai_sta"}>大平台駅</MenuItem>
        <MenuItem value={"miyanoshita_sta"}>宮ノ下駅</MenuItem>
        <MenuItem value={"gora_sta"}>強羅駅</MenuItem>
        <MenuItem value={"sounzan_sta"}>早雲山駅</MenuItem>
        <MenuItem value={"owakudani_sta"}>大涌谷駅</MenuItem>
        <MenuItem value={"tougenda_sta"}>桃源台駅</MenuItem>
        <MenuItem value={"ubako_sta"}>姥子駅</MenuItem>
        <MenuItem value={"motohakone"}>元箱根</MenuItem>
        <MenuItem value={"daikanzan"}>大観山</MenuItem>
        <MenuItem value={"ropeway"}>箱根ロープウェイ</MenuItem>
      </Select>
    </FormControl>
  );
};

const Timer = () => {
  const [ctime, setCTime] = useState(dayjs());
  useEffect(() => {
    viewer.scene.preRender.addEventListener(() => {
      setCTime(dayjs(Cesium.JulianDate.toIso8601(viewer.clock.currentTime)));
    });
  }, [
    dayjs(Cesium.JulianDate.toIso8601(viewer.clock.currentTime)).format(
      "YYYY-MM-DD HH:mm"
    ),
  ]);
  return (
    <DateTimePicker
      label="日時"
      value={ctime}
      onOpen={() => {
        viewer.clock.shouldAnimate = false;
      }}
      onChange={(newValue) => {
        if (newValue) {
          setCTime(newValue);
          viewer.clock.currentTime = Cesium.JulianDate.fromIso8601(
            newValue.toISOString(),
            new Cesium.JulianDate()
          );
        }
      }}
      renderInput={(params) => (
        <TextField
          sx={{ m: 1, borderRadius: 1, backgroundColor: "white" }}
          {...params}
        />
      )}
    />
  );
};

const Player = () => {
  const sx = {
    backgroundColor: grey.A100,
    "&:hover": {
      backgroundColor: grey.A400,
    },
  };

  return (
    <Stack direction="row" spacing={1} sx={{ m: 1 }}>
      <IconButton
        aria-label="skipprev"
        sx={sx}
        onClick={() => {
          viewer.clock.currentTime.secondsOfDay -= 3600;
        }}
      >
        <SkipPreviousIcon />
      </IconButton>
      <IconButton
        aria-label="stop"
        sx={sx}
        onClick={() => {
          viewer.clock.shouldAnimate = false;
          viewer.scene.maximumRenderTimeChange = Infinity;
        }}
      >
        <StopIcon />
      </IconButton>
      <IconButton
        aria-label="play"
        sx={sx}
        onClick={() => {
          viewer.clock.shouldAnimate = true;
          viewer.clock.multiplier = 5;
          viewer.scene.maximumRenderTimeChange = 60;
        }}
      >
        <PlayArrowIcon />
      </IconButton>
      <IconButton
        aria-label="ff"
        sx={sx}
        onClick={() => {
          viewer.clock.shouldAnimate = true;
          viewer.clock.multiplier = 60;
          viewer.scene.maximumRenderTimeChange = 60;
        }}
      >
        <FastForwardIcon />
      </IconButton>
      <IconButton
        aria-label="skipnext"
        sx={sx}
        onClick={() => {
          viewer.clock.currentTime.secondsOfDay += 3600;
        }}
      >
        <SkipNextIcon />
      </IconButton>
    </Stack>
  );
};

const App = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div id="top-bar">
        <Locator />
      </div>
      <div id="top-right-bar">
        <Timer />
      </div>
      <div id="bottom-bar">
        <Player />
      </div>
    </LocalizationProvider>
  );
};

export default App;
