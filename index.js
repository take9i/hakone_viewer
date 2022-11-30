"use strict";

const tail = (ar, i = -1) => ar[ar.length + i];
const flatten = nested => Array.prototype.concat.apply([], nested);
function zip() {
  const args = [].slice.call(arguments);
  return args[0].map((_, i) => args.map(arg => arg[i]));
}
function fetch(url) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open("GET", url);
    req.onload = () => {
      if (req.status == 200) {
        resolve(req.response);
      } else {
        reject(new Error(req.statusText));
      }
    };
    req.onerror = () => {
      reject(new Error("Network Error"));
    };
    req.send();
  });
}
function getJSON(url) {
  return fetch(url).then(JSON.parse);
}

// ---

// const MAPTILE_URL = 'https://api.maptiler.com/maps/jp-mierune-streets/256/{z}/{x}/{y}.png?key=Jjfw1w0QxuYiSUxyQ6mU'
const MAPTILE_URL = 'https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=Jjfw1w0QxuYiSUxyQ6mU'
// const MAPTILE_URL = './data/_maptiles/{z}/{x}/{y}.png'

const TILESET_FEATURES_URL = './data/3dtiles/14382_hakone-machi_building/bldg_notexture/tileset.json'
const CAMERA_DESTINATION = Cesium.Cartesian3.fromDegrees(139.103528, 35.233333, 400)

// pletau terrain
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5N2UyMjcwOS00MDY1LTQxYjEtYjZjMy00YTU0ZTg5MmViYWQiLCJpZCI6ODAzMDYsImlhdCI6MTY0Mjc0ODI2MX0.dkwAL1CcljUV7NA7fDbhXXnmyZQU_c-G5zRx8PtEcxE';

let viewer;
(function() {
  let fireworks = null;

  const presetCameras = {
    default: {
      destination: new Cesium.Cartesian3(-3943063.736175449, 3414581.6352823335, 3658893.0310073597),
      orientation: {
        direction: new Cesium.Cartesian3(0.8705384941672791, 0.3972954727045973, 0.29037740535619644),
        up: new Cesium.Cartesian3(-0.4863750620101659, 0.6049005745075724, 0.630503444887509)
      },
      complete: () => {
        viewer.clock.currentTime.secondsOfDay = (8 + 3) * 3600;
        $("#playButton").click();
      }
    },
    hakoneyumoto_sta: {
      destination: new Cesium.Cartesian3(-3942683.754893907, 3414436.369008514, 3659210.756677864),
      orientation: {
        direction: new Cesium.Cartesian3(0.6021957025269136, 0.7465491506960342, -0.2828863755170034),
        up: new Cesium.Cartesian3(-0.5406617107199767, 0.6420757207192779, 0.5435289168242735)
      }
    },
    oohiradai_sta: {
      destination: new Cesium.Cartesian3(-3941147.277921706, 3416285.578296058, 3659669.031053909),
      orientation: {
        direction: new Cesium.Cartesian3(0.7452819468176651, 0.653884202147705, -0.13034672964570415),
        up: new Cesium.Cartesian3(-0.48748842750874183, 0.6677648242210178, 0.5625345967832801)
      }
    },
    miyanoshita_sta: {
      destination: new Cesium.Cartesian3(-3940040.120103487, 3417158.7651542374, 3660128.409298707),
      orientation: {
        direction: new Cesium.Cartesian3(0.8713686556813627, 0.47150301702456576, 0.1356523897054038),
        up: new Cesium.Cartesian3(-0.44625221671823484, 0.6467536381299178, 0.6185213744405094)
      }
    },
    gora_sta: {
      destination: new Cesium.Cartesian3(-3938786.7829163955, 3417746.5841921424, 3661140.322702426),
      orientation: {
        direction: new Cesium.Cartesian3(0.4601883368650594, 0.741827302962235, -0.4877693586041945),
        up: new Cesium.Cartesian3(-0.5471235595524564, 0.6696375290806191, 0.5022363887946121)
      }
    },
    sounzan_sta: {
      destination: new Cesium.Cartesian3(-3938446.5355911055, 3418820.141870538, 3660992.3792407177),
      orientation: {
        direction: new Cesium.Cartesian3(0.4672052778947163, 0.7661930364624164, -0.4412113543233258),
        up: new Cesium.Cartesian3(-0.5597155709588016, 0.6426056417916156, 0.5232365323291642)
      }
    },
    owakudani_sta: {
      destination: new Cesium.Cartesian3(-3937620.2262951885, 3420280.5536470367, 3660915.795376406),
      orientation: {
        direction: new Cesium.Cartesian3(0.22059741179711043, 0.7168297370220843, -0.6614317122948261),
        up: new Cesium.Cartesian3(-0.5923646913782604, 0.6372108127092029, 0.493017700062397)
      }
    },
    // ubako_sta: {
    //   destination: new Cesium.Cartesian3(-3936742.4222430494, 3421144.169965465, 3660744.4289531717),
    //   orientation: {
    //     direction: new Cesium.Cartesian3(0.5199079209090961, 0.6759512825277706, -0.5222888256750696),
    //     up: new Cesium.Cartesian3(-0.49849992357408607, 0.7365959905437583, 0.4570822386742782)
    //   }
    // },
    tougenda_sta: {
      destination: new Cesium.Cartesian3(-3936001.8965315376, 3422332.022990375, 3660132.7018484944),
      orientation: {
        direction: new Cesium.Cartesian3(-0.634098888351755, -0.10122966261372007, -0.7665971270479566),
        up: new Cesium.Cartesian3(-0.6872553796941663, 0.5281586918573858, 0.49872681830529475)
      }
    },
    motohakone: {
      destination: new Cesium.Cartesian3(-3939936.323547909, 3420965.195754268, 3657433.8708804487),
      orientation: {
        direction: new Cesium.Cartesian3(0.05623367005752032, 0.5212780932672323, -0.8515321038173139),
        up: new Cesium.Cartesian3(-0.6223104366784804, 0.6852409260497324, 0.3783841879195591)
      },
    },
    daikanzan: {
      destination: new Cesium.Cartesian3(-3942429.944428277, 3420816.2905394314, 3655210.689862903),
      orientation: {
        direction: new Cesium.Cartesian3(0.8981380481081738, 0.4315082527888794, 0.08454983332643622),
        up: new Cesium.Cartesian3(-0.38552072021458256, 0.6802752175592915, 0.6233774159045935)
      },
    },
    _motohakone: {
      destination: new Cesium.Cartesian3(-3939936.323547909, 3420965.195754268, 3657433.8708804487),
      orientation: {
        direction: new Cesium.Cartesian3(0.05623367005752032, 0.5212780932672323, -0.8515321038173139),
        up: new Cesium.Cartesian3(-0.6223104366784804, 0.6852409260497324, 0.3783841879195591)
      },
      complete: () => {
        if (fireworks) {
          return;
        }
        viewer.clock.currentTime.secondsOfDay = ((19 + 3) * 60 + 30) * 60; // 19:30:00
        $("#playButton").click();
        setTimeout(() => {
          fireworks = createFireworks();
        }, 3000);
        setTimeout(() => {
          removeFireworks(fireworks);
          fireworks = null;
        }, 60000);
      }
    },
    ropeway: {
      destination: new Cesium.Cartesian3(-3938446.5355911055, 3418820.141870538, 3660992.3792407177),
      orientation: {
        direction: new Cesium.Cartesian3(0.4672052778947163, 0.7661930364624164, -0.4412113543233258),
        up: new Cesium.Cartesian3(-0.5597155709588016, 0.6426056417916156, 0.5232365323291642)
      },
      complete: () => {
        // const secs = viewer.clock.currentTime.secondsOfDay;
        // viewer.clock.currentTime.secondsOfDay =
        //   secs + (720 - (secs % 720)) + 115; // 毎時00,12,24,36,48分
        $("#forwardButton2").click();
        viewer.camera.flyTo({
          destination: new Cesium.Cartesian3(-3937716.051903519, 3419847.8584775077, 3661098.2985461135),
          orientation: {
            direction: new Cesium.Cartesian3(-0.23661663936390315, 0.46999860195354237, -0.8503610292915876),
            up: new Cesium.Cartesian3(-0.6414343527727697, 0.5818146843047269, 0.5000536413329766)
          },
          duration: 15.0,
          complete: () => {
            viewer.camera.flyTo({
              destination: new Cesium.Cartesian3(-3937757.2528734226, 3420256.522502103, 3660793.43000285),
              orientation: {
                direction: new Cesium.Cartesian3(0.5780104062163359, 0.7519955083733278, -0.31687020322517967),
                up: new Cesium.Cartesian3(-0.5427555943123525, 0.6442415853150532, 0.538859113863162)
              },
              duration: 8.0,
              complete: () => {
                viewer.camera.flyTo({
                  destination: new Cesium.Cartesian3(-3936768.8754220395, 3421040.487042717, 3660874.5693126833),
                  orientation: {
                    direction: new Cesium.Cartesian3(0.3328618690329079, 0.7829405403733688, -0.5255540756038114),
                    up: new Cesium.Cartesian3(-0.5891341597694467, 0.607842571563527, 0.5323986757945466)
                  },
                  duration: 8.0,
                  complete: () => {
                    viewer.camera.flyTo({
                      destination: new Cesium.Cartesian3(-3936006.540927307, 3422334.0577946496, 3660262.0463844277),
                      orientation: {
                        direction: new Cesium.Cartesian3(-0.5466816922332984, -0.13627369091129424, -0.8261771048282265),
                        up: new Cesium.Cartesian3(-0.7498454213317257, 0.5187849115877702, 0.4106020696693043)
                      },
                      duration: 8.0,
                    })
                  }
                })
              }
            });

          }
        });
      }
    }
  };

  viewer = new Cesium.Viewer("map", {
    imageryProvider: new Cesium.UrlTemplateImageryProvider({
      url: MAPTILE_URL,
      maximumLevel: 18,
      credit: new Cesium.Credit(
        "<ul>" +
          "<li>国土地理院<br><small>国土地理院長の承認を得て、同院発行の数値地図(国土基本情報) 電子国土基本図(地図情報)、数値地図(国土基本情報) 電子国土基本図(地名情報) 及び 基盤地図情報を使用した。(承認番号 平30情使、 第705号)</small></li>" +
          '<li>&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors</li>' +
          "</ul>"
      )
    }),
    terrainProvider: new Cesium.CesiumTerrainProvider({
      // url: MAPTILE_URL,
      // maximumLevel: 18,
      url: Cesium.IonResource.fromAssetId(770371),  // pleatau terrain
      requestVertexNormals: true
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
    terrainShadows: Cesium.ShadowMode.ENABLED
  });

  viewer.scene.globe.depthTestAgainstTerrain = true;
  viewer.scene.globe.enableLighting = true;
  viewer.scene.globe.maximumScreenSpaceError = 1; // if more refine terrain
  viewer.shadowMap.maximumDistance = 1000.0;
  // viewer.shadowMap.softShadows = true;
  viewer.shadowMap.size = 4096;
  viewer.clock.multiplier = 1;
  viewer.clock.shouldAnimate = true;
  viewer.scene.fog.density = 0.001;
  viewer.scene.fog.screenSpaceErrorFactor = 4;
  // viewer.scene.debugShowFramesPerSecond = true;
  // viewer.extend(Cesium.viewerCesiumInspectorMixin);
  // viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);

  viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({ url: TILESET_FEATURES_URL })
  );

  // const credit = new Cesium.Credit(
  //   '<a href="https://landscapes.skcj.info/"><img src="logo.png"/></a>'
  // );
  // viewer.scene.frameState.creditDisplay.addDefaultCredit(credit);

  $('[data-toggle="tooltip"]').tooltip();

  viewer.camera.setView(presetCameras.default);
  presetCameras.default.complete();

  // ---
  viewer.selectedEntityChanged.addEventListener(function(selectedEntity) {
    if (Cesium.defined(selectedEntity)) {
      if (Cesium.defined(selectedEntity.name)) {
        console.log('Selected ' + selectedEntity.name);
        viewer.trackedEntity = selectedEntity;
      } else {
        console.log('Unknown entity selected.');
      }
    } else {
      console.log('Deselected.');
      viewer.trackedEntity = null;
    }
  });

  // ---

  // getJSON("./annos/anno_wt.geojson").then(annogj => {
  getJSON("./data/anno.geojson").then(annogj => {
    annogj.features.map(f => {
      const coord = f.geometry.coordinates;
      const height =
        f.properties.annoCtg == "_" ? 300: 15;
      const distanceDisplay = ["0312", "0352"].includes(f.properties.ftCode)
        ? undefined
        : ["0422", "0431"].includes(f.properties.ftCode)
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
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
        }
      });
    });
  });

  // ---

  // const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  // handler.setInputAction(e => {
  //   const feature = viewer.scene.pick(e.position);
  //   if (feature instanceof Cesium.Cesium3DTileFeature) {
  //     feature.show = false;
  //     viewer.scene.requestRender();
  //   }
  // }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

  document.addEventListener("keydown", e => {
    const getSecondsAfter = seconds =>
      Cesium.JulianDate.addSeconds(
        viewer.clock.currentTime,
        seconds,
        new Cesium.JulianDate()
      );
    switch (e.key) {
      // case "f":
      //   if (!fireworks) {
      //     fireworks = createFireworks();
      //   }
      //   break;
      // case "F":
      //   if (fireworks) {
      //     removeFireworks(fireworks);
      //     fireworks = null;
      //   }
      //   break;
      case "p":
        console.log(
          viewer.camera.position,
          viewer.camera.direction,
          viewer.camera.up
        );
        break;
    }
  });

  $("#resetCameraButton").on("click", () => {
    viewer.camera.flyTo(presetCameras.default);
  });
  $(".dropdown-menu .dropdown-item").click(e => {
    const value = $(e.currentTarget).attr("value");
    viewer.camera.flyTo(presetCameras[value]);
  });
  $("#datetimepicker").datetimepicker({
    defaultDate: Cesium.JulianDate.toIso8601(viewer.clock.currentTime),
    format: "YYYY/MM/DD HH:mm",
    locale: "ja",
    focusOnShow: false,
    icons: {
      time: "fa fa-clock"
    }
  });
  $("#datetimepicker").focusin(e => {
    viewer.clock.shouldAnimate = false;
    $(".player")
      .removeClass("btn-primary")
      .addClass("btn-secondary");
    $("#stopButton").addClass("btn-primary");
  });
  $("#datetimepicker").on("change.datetimepicker", e => {
    viewer.clock.currentTime = Cesium.JulianDate.fromIso8601(
      e.date.toISOString(),
      new Cesium.JulianDate()
    );
  });
  $("#stopButton").on("click", e => {
    viewer.clock.shouldAnimate = false;
    viewer.scene.maximumRenderTimeChange = Infinity;
    $(".player")
      .removeClass("btn-primary")
      .addClass("btn-secondary");
    $(e.currentTarget)
      .removeClass("btn-secondary")
      .addClass("btn-primary");
  });
  $("#playButton").on("click", e => {
    viewer.clock.shouldAnimate = true;
    viewer.clock.multiplier = 1;
    viewer.scene.maximumRenderTimeChange = 60;
    $(".player")
      .removeClass("btn-primary")
      .addClass("btn-secondary");
    $(e.currentTarget)
      .removeClass("btn-secondary")
      .addClass("btn-primary");
  });
  $("#forwardButton1").on("click", e => {
    viewer.clock.shouldAnimate = true;
    viewer.clock.multiplier = 5;
    viewer.scene.maximumRenderTimeChange = 60;
    $(".player")
      .removeClass("btn-primary")
      .addClass("btn-secondary");
    $(e.currentTarget)
      .removeClass("btn-secondary")
      .addClass("btn-primary");
  });
  $("#forwardButton2").on("click", e => {
    viewer.clock.shouldAnimate = true;
    viewer.clock.multiplier = 60;
    viewer.scene.maximumRenderTimeChange = 60;
    $(".player")
      .removeClass("btn-primary")
      .addClass("btn-secondary");
    $(e.currentTarget)
      .removeClass("btn-secondary")
      .addClass("btn-primary");
  });
  $("#forwardButton3").on("click", e => {
    viewer.clock.shouldAnimate = true;
    viewer.clock.multiplier = 3600;
    viewer.scene.maximumRenderTimeChange = 60;
    $(".player")
      .removeClass("btn-primary")
      .addClass("btn-secondary");
    $(e.currentTarget)
      .removeClass("btn-secondary")
      .addClass("btn-primary");
  });

  // ---

  let loadedCzmls = [];
  let lastLoadAt = null;
  let lastCzdses = [];
  function loadTodaysCzmls(czmls) {
    function setSpecifiedDayOnCzml(czml, dayNumber) {
      czml.slice(1).forEach(packet => {
        const jd = Cesium.JulianDate.fromIso8601(packet.position.epoch);
        jd.dayNumber = dayNumber;
        packet.position.epoch = Cesium.JulianDate.toIso8601(jd);
      });
    }

    const promises = czmls.map(czml => {
      setSpecifiedDayOnCzml(czml, viewer.clock.currentTime.dayNumber);
      return viewer.dataSources.add(Cesium.CzmlDataSource.load(czml));
    });
    Promise.all(promises).then(czdses => {
      lastLoadAt = viewer.clock.currentTime;
      lastCzdses = czdses;
    });
  }

  Promise.all([
    getJSON("./data/vehicles/train_down_czml.json"),
    getJSON("./data/vehicles/train_up_czml.json"),
    getJSON("./data/vehicles/cablecar_down_czml.json"),
    getJSON("./data/vehicles/cablecar_up_czml.json"),
    getJSON("./data/vehicles/ropeway_1_czml.json"),
    getJSON("./data/vehicles/ropeway_2_czml.json"),
    getJSON("./data/vehicles/ropeway_3_czml.json"),
    getJSON("./data/vehicles/vehicle_yumoto_czml.json"),
    // getJSON("./transports/shonan-monorail_czml.json"),
    // getJSON("./transports/enodenbus_czml.json"),
    // getJSON("./transports/car-r135_czml.json"),
    // getJSON("./transports/person-enoshima_czml.json")
  ]).then(czmls => {
    loadedCzmls = czmls;
    loadTodaysCzmls(loadedCzmls);
  });

  viewer.scene.preRender.addEventListener(() => {
    if (!viewer.clock.shouldAnimate) {
      return;
    }
    const mom = moment(Cesium.JulianDate.toIso8601(viewer.clock.currentTime));
    $("#datetimepicker").datetimepicker("date", mom);
    const ct = viewer.clock.currentTime;
    if (
      lastLoadAt &&
      lastLoadAt.dayNumber != ct.dayNumber &&
      ct.secondsOfDay > 5 * 3600
    ) {
      // AM02:00を回ったらdataSourcesを削除
      lastCzdses.forEach(czds => {
        viewer.dataSources.remove(czds, true);
      });
      loadTodaysCzmls(loadedCzmls);
    }
  });

  // --

  function createFireworks() {
    Cesium.Math.setRandomNumberSeed(315);

    var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
      Cesium.Cartesian3.fromDegrees(139.4791299, 35.3054307)
    );
    var emitterInitialLocation = new Cesium.Cartesian3(0.0, 0.0, 330.0);
    var particleCanvas;

    function getImage() {
      if (!Cesium.defined(particleCanvas)) {
        particleCanvas = document.createElement("canvas");
        particleCanvas.width = 20;
        particleCanvas.height = 20;
        var context2D = particleCanvas.getContext("2d");
        context2D.beginPath();
        context2D.arc(8, 8, 8, 0, Cesium.Math.TWO_PI, true);
        context2D.closePath();
        context2D.fillStyle = "rgb(255, 255, 255)";
        context2D.fill();
      }
      return particleCanvas;
    }

    var minimumExplosionSize = 80.0;
    var maximumExplosionSize = 160.0;
    var particlePixelSize = new Cesium.Cartesian2(7.0, 7.0);
    var burstSize = 200.0;
    var lifetime = 10.0;
    var numberOfFireworks = 20.0;
    var emitterModelMatrixScratch = new Cesium.Matrix4();

    function createFirework(offset, color, bursts) {
      var position = Cesium.Cartesian3.add(
        emitterInitialLocation,
        offset,
        new Cesium.Cartesian3()
      );
      var emitterModelMatrix = Cesium.Matrix4.fromTranslation(
        position,
        emitterModelMatrixScratch
      );
      var particleToWorld = Cesium.Matrix4.multiply(
        modelMatrix,
        emitterModelMatrix,
        new Cesium.Matrix4()
      );
      var worldToParticle = Cesium.Matrix4.inverseTransformation(
        particleToWorld,
        particleToWorld
      );

      var size = Cesium.Math.randomBetween(
        minimumExplosionSize,
        maximumExplosionSize
      );
      var particlePositionScratch = new Cesium.Cartesian3();
      var force = function(particle) {
        var position = Cesium.Matrix4.multiplyByPoint(
          worldToParticle,
          particle.position,
          particlePositionScratch
        );
        if (Cesium.Cartesian3.magnitudeSquared(position) >= size * size) {
          Cesium.Cartesian3.clone(Cesium.Cartesian3.ZERO, particle.velocity);
        }
      };

      var normalSize =
        (size - minimumExplosionSize) /
        (maximumExplosionSize - minimumExplosionSize);
      var minLife = 0.8;
      var maxLife = 1.6;
      var life = normalSize * (maxLife - minLife) + minLife;

      return new Cesium.ParticleSystem({
        image: getImage(),
        startColor: color,
        endColor: color.withAlpha(0.0),
        particleLife: life,
        speed: 100.0,
        imageSize: particlePixelSize,
        emissionRate: 0,
        emitter: new Cesium.SphereEmitter(0.1),
        bursts: bursts,
        lifetime: lifetime,
        updateCallback: force,
        modelMatrix: modelMatrix,
        emitterModelMatrix: emitterModelMatrix
      });
    }

    let fireworks = [];
    var colorOptions = [
      { minimumRed: 0.75, green: 0.0, minimumBlue: 0.8, alpha: 1.0 },
      { red: 0.0, minimumGreen: 0.75, minimumBlue: 0.8, alpha: 1.0 },
      { red: 0.0, green: 0.0, minimumBlue: 0.8, alpha: 1.0 },
      { minimumRed: 0.75, minimumGreen: 0.75, blue: 0.0, alpha: 1.0 }
    ];
    for (var i = 0; i < numberOfFireworks; ++i) {
      var offset = new Cesium.Cartesian3(
        Cesium.Math.randomBetween(-80, 80),
        Cesium.Math.randomBetween(-80, 80),
        Cesium.Math.randomBetween(-50, 50)
      );
      var color = Cesium.Color.fromRandom(
        colorOptions[i % colorOptions.length]
      );
      var bursts = [];
      for (var j = 0; j < 3; ++j) {
        bursts.push(
          new Cesium.ParticleBurst({
            time: Cesium.Math.nextRandomNumber() * lifetime,
            minimum: burstSize,
            maximum: burstSize
          })
        );
      }
      const firework = createFirework(offset, color, bursts);
      viewer.scene.primitives.add(firework);
      fireworks.push(firework);
    }
    return fireworks;
  }

  function removeFireworks(fireworks) {
    fireworks.forEach(firework => {
      viewer.scene.primitives.remove(firework);
    });
  }
})();
