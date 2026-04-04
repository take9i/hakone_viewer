import { useState, useEffect } from "react";
import * as C from "cesium";
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
import { viewer, presetCameras } from "./viewer.js";

const Locator = ({ viewer, presetCameras }) => {
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

const Timer = ({ viewer }) => {
  const [ctime, setCTime] = useState(dayjs());
  useEffect(() => {
    viewer.scene.preRender.addEventListener(() => {
      setCTime(dayjs(C.JulianDate.toIso8601(viewer.clock.currentTime)));
    });
  }, [dayjs(C.JulianDate.toIso8601(viewer.clock.currentTime)).format("YYYY-MM-DD HH:mm")]);
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
          viewer.clock.currentTime = C.JulianDate.fromIso8601(newValue.toISOString(), new C.JulianDate());
        }
      }}
      renderInput={(params) => <TextField sx={{ m: 1, borderRadius: 1, backgroundColor: "white" }} {...params} />}
    />
  );
};

const Player = ({ viewer }) => {
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
        <Locator viewer={viewer} presetCameras={presetCameras} />
      </div>
      <div id="top-right-bar">
        <Timer viewer={viewer} />
      </div>
      <div id="bottom-bar">
        <Player viewer={viewer} />
      </div>
    </LocalizationProvider>
  );
};

export default App;
