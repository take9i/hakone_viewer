# hakone_player

## preparing

### map tiles

```sh
aws s3 sync s3://data-osada/_tilesets/ _tmp/ --profile skc --dryrun
# cd _tmp/ && mbtileserver -p 7777  # alternative on local
mb-util _tmp/maptiles.mbtiles public/tiles
find . -name '.DS_Store' -type f -delete
aws s3 sync public/tiles/ s3://public-osada/tiles/ --profile skc --dryrun
```

### 3d tiles

```sh
aws s3 sync s3://data-osada/pleatau/hakone/ _tmp/ --profile skc --dryrun
unzip _tmp/14382_hakone-machi_3DTiles_GeoPackage_Json_2.zip -d _tmp
mkdir -p public/3dtiles/hakone
unzip _tmp/14382_hakone-machi_3DTiles_GeoPackage_Json/01_building/14382_hakone-machi_building.zip -d public/3dtiles/hakone
aws s3 sync public/3dtiles/ s3://public-osada/3dtiles/ --profile skc --dryrun
```
