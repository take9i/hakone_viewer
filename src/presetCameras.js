import { Cartesian3 } from "cesium";

const getPresetCameras = (viewer) => {
  return {
    default: {
      destination: new Cartesian3(-3943063.736175449, 3414581.6352823335, 3658893.0310073597),
      orientation: {
        direction: new Cartesian3(0.8705384941672791, 0.3972954727045973, 0.29037740535619644),
        up: new Cartesian3(-0.4863750620101659, 0.6049005745075724, 0.630503444887509),
      },
    },
    hakoneyumoto_sta: {
      destination: new Cartesian3(-3942683.754893907, 3414436.369008514, 3659210.756677864),
      orientation: {
        direction: new Cartesian3(0.6021957025269136, 0.7465491506960342, -0.2828863755170034),
        up: new Cartesian3(-0.5406617107199767, 0.6420757207192779, 0.5435289168242735),
      },
    },
    oohiradai_sta: {
      destination: new Cartesian3(-3941147.277921706, 3416285.578296058, 3659669.031053909),
      orientation: {
        direction: new Cartesian3(0.7452819468176651, 0.653884202147705, -0.13034672964570415),
        up: new Cartesian3(-0.48748842750874183, 0.6677648242210178, 0.5625345967832801),
      },
    },
    miyanoshita_sta: {
      destination: new Cartesian3(-3940040.120103487, 3417158.7651542374, 3660128.409298707),
      orientation: {
        direction: new Cartesian3(0.8713686556813627, 0.47150301702456576, 0.1356523897054038),
        up: new Cartesian3(-0.44625221671823484, 0.6467536381299178, 0.6185213744405094),
      },
    },
    gora_sta: {
      destination: new Cartesian3(-3938786.7829163955, 3417746.5841921424, 3661140.322702426),
      orientation: {
        direction: new Cartesian3(0.4601883368650594, 0.741827302962235, -0.4877693586041945),
        up: new Cartesian3(-0.5471235595524564, 0.6696375290806191, 0.5022363887946121),
      },
    },
    sounzan_sta: {
      destination: new Cartesian3(-3938446.5355911055, 3418820.141870538, 3660992.3792407177),
      orientation: {
        direction: new Cartesian3(0.4672052778947163, 0.7661930364624164, -0.4412113543233258),
        up: new Cartesian3(-0.5597155709588016, 0.6426056417916156, 0.5232365323291642),
      },
    },
    owakudani_sta: {
      destination: new Cartesian3(-3937620.2262951885, 3420280.5536470367, 3660915.795376406),
      orientation: {
        direction: new Cartesian3(0.22059741179711043, 0.7168297370220843, -0.6614317122948261),
        up: new Cartesian3(-0.5923646913782604, 0.6372108127092029, 0.493017700062397),
      },
    },
    ubako_sta: {
      destination: new Cartesian3(-3936742.4222430494, 3421144.169965465, 3660744.4289531717),
      orientation: {
        direction: new Cartesian3(0.5199079209090961, 0.6759512825277706, -0.5222888256750696),
        up: new Cartesian3(-0.49849992357408607, 0.7365959905437583, 0.4570822386742782),
      },
    },
    tougenda_sta: {
      destination: new Cartesian3(-3936001.8965315376, 3422332.022990375, 3660132.7018484944),
      orientation: {
        direction: new Cartesian3(-0.634098888351755, -0.10122966261372007, -0.7665971270479566),
        up: new Cartesian3(-0.6872553796941663, 0.5281586918573858, 0.49872681830529475),
      },
    },
    motohakone: {
      destination: new Cartesian3(-3939936.323547909, 3420965.195754268, 3657433.8708804487),
      orientation: {
        direction: new Cartesian3(0.05623367005752032, 0.5212780932672323, -0.8515321038173139),
        up: new Cartesian3(-0.6223104366784804, 0.6852409260497324, 0.3783841879195591),
      },
    },
    daikanzan: {
      destination: new Cartesian3(-3942429.944428277, 3420816.2905394314, 3655210.689862903),
      orientation: {
        direction: new Cartesian3(0.8981380481081738, 0.4315082527888794, 0.08454983332643622),
        up: new Cartesian3(-0.38552072021458256, 0.6802752175592915, 0.6233774159045935),
      },
    },
    _motohakone: {
      destination: new Cartesian3(-3939936.323547909, 3420965.195754268, 3657433.8708804487),
      orientation: {
        direction: new Cartesian3(0.05623367005752032, 0.5212780932672323, -0.8515321038173139),
        up: new Cartesian3(-0.6223104366784804, 0.6852409260497324, 0.3783841879195591),
      },
    },
    ropeway: {
      destination: new Cartesian3(-3938446.5355911055, 3418820.141870538, 3660992.3792407177),
      orientation: {
        direction: new Cartesian3(0.4672052778947163, 0.7661930364624164, -0.4412113543233258),
        up: new Cartesian3(-0.5597155709588016, 0.6426056417916156, 0.5232365323291642),
      },
      complete: () => {
        viewer.camera.flyTo({
          destination: new Cartesian3(-3937716.051903519, 3419847.8584775077, 3661098.2985461135),
          orientation: {
            direction: new Cartesian3(-0.23661663936390315, 0.46999860195354237, -0.8503610292915876),
            up: new Cartesian3(-0.6414343527727697, 0.5818146843047269, 0.5000536413329766),
          },
          duration: 15.0,
          complete: () => {
            viewer.camera.flyTo({
              destination: new Cartesian3(-3937757.2528734226, 3420256.522502103, 3660793.43000285),
              orientation: {
                direction: new Cartesian3(0.5780104062163359, 0.7519955083733278, -0.31687020322517967),
                up: new Cartesian3(-0.5427555943123525, 0.6442415853150532, 0.538859113863162),
              },
              duration: 8.0,
              complete: () => {
                viewer.camera.flyTo({
                  destination: new Cartesian3(-3936768.8754220395, 3421040.487042717, 3660874.5693126833),
                  orientation: {
                    direction: new Cartesian3(0.3328618690329079, 0.7829405403733688, -0.5255540756038114),
                    up: new Cartesian3(-0.5891341597694467, 0.607842571563527, 0.5323986757945466),
                  },
                  duration: 8.0,
                  complete: () => {
                    viewer.camera.flyTo({
                      destination: new Cartesian3(-3936006.540927307, 3422334.0577946496, 3660262.0463844277),
                      orientation: {
                        direction: new Cartesian3(-0.5466816922332984, -0.13627369091129424, -0.8261771048282265),
                        up: new Cartesian3(-0.7498454213317257, 0.5187849115877702, 0.4106020696693043),
                      },
                      duration: 8.0,
                    });
                  },
                });
              },
            });
          },
        });
      },
    },
  };
}

export { getPresetCameras };