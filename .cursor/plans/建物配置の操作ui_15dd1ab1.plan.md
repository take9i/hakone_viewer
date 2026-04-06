---
name: 建物配置の操作UI
overview: "`house_a` を地形上に再配置する手段として地図クリック（トグル ON 時）を提供し、方位（heading）と地上からの高さオフセットは MUI で調整する。経度・緯度の数値入力は設けない（高さのみ UI で設定）。"
todos:
  - id: viewer-api
    content: "viewer.js: 位置・heading・高さオフセットの set/get を export（orientation 含む + requestRender）"
    status: pending
  - id: click-place-ui
    content: "App.jsx: 「クリックで配置」トグル + ScreenSpaceEventHandler（クリーンアップ付き）"
    status: pending
  - id: height-ui
    content: "App.jsx: 地上高さオフセット（m）を MUI で設定（スライダーまたは数値入力・経度緯度は置かない）"
    status: pending
  - id: heading-ui
    content: "App.jsx: heading 用の MUI スライダーまたはステップ操作"
    status: pending
  - id: css-layout
    content: 必要なら style.css にトグル・高さ・heading 用の `#house-controls`（pointer-events: auto）
    status: pending
isProject: false
---

# 建物モデル配置を操作可能にする計画

## 現状

- [`src/viewer.js`](src/viewer.js) で `houseEntity` を `houseLon` / `houseLat` と `fromDegrees(..., 1)`（地上からのオフセット）で固定追加している。
- [`src/App.jsx`](src/App.jsx) が MUI でトップバー等の UI を提供しており、[`index.html`](index.html) の `#ui` にマウントされている。
- `viewer` は `requestRenderMode: true` のため、**位置・向きを変えたあとに** `viewer.scene.requestRender()` を呼ばないと画面が更新されないことがある（建物は静的なので明示的に要求するのが安全）。

## スコープ（ユーザー合意）

- **経度・緯度の数値入力 UI は不要**とする（水平位置はクリックのみ）。
- **高さ（`RELATIVE_TO_GROUND` のオフセット[m]）はクリックでは指定できない**ため、**専用の UI で変更可能**にする（スライダーまたはメートル単位の入力など。経度緯度フィールドは置かない）。
- **地図クリックでの配置は必須**とする（トグルで ON のときのみ有効）。クリック時は **現在の UI で選んだ高さオフセット**を `setHousePlacement` に渡す。
- **方位（heading）は今回のスコープに含める**（将来扱いではなく実装する）。

## 推奨アプローチ

### 1. `viewer.js`: 建物用 API

- `setHousePlacement({ lon, lat, heightOffset })`（または同等）で `houseEntity.position` を更新。
- `setHouseHeading(headingRadians)`（または度で受け取り内部で変換）で `houseEntity.orientation` を設定。
  - 位置が変わるたびに ENU の基準が変わるため、`C.Transforms.headingPitchRollQuaternion(currentPosition, new C.HeadingPitchRoll(heading, 0, 0))` のように**現在の `houseEntity.position` を基準**にクォータニオンを計算する（Cesium の推奨パターン）。
- `getHousePlacement()` / `getHouseHeading()` は UI の初期同期・表示用に任意で export。
- 各 setter の末尾で `viewer.scene.requestRender()` を呼ぶ。
- 既存の `model`（`RELATIVE_TO_GROUND` 等）は維持。`heightOffset` は **React 側の状態**と同期し、クリック配置時は **その時点の UI の値**を常に使う（高さ変更時は位置だけ更新して `setHousePlacement({ lon, lat, heightOffset })` を再適用するか、`setHouseHeightOffset` で現在の lon/lat を保ったまま更新する）。

### 2. `App.jsx`: 地図クリックで配置（必須）

- **「クリックで配置」トグル**（例: MUI `Switch` + ラベル）を追加。
- ON の間だけ `viewer.screenSpaceEventHandler.setInputAction` で `LEFT_CLICK` を登録し、[`scene.globe.pick(ray, scene)`](https://cesium.com/learn/cesiumjs/ref-doc/Globe.html#pick) または `pickPosition` で地形上の座標を取得 → `Cartographic.fromCartesian` で lon/lat を得て、**現在の高さオフセット**とともに `setHousePlacement` に渡す。
- OFF 時は `removeInputAction` で確実に外す（車両操作・カメラ操作と干渉しないようにする）。
- `useEffect` のクリーンアップでトグル OFF 相当の解除を行い、React StrictMode の二重マウントにも耐える。

### 3. `App.jsx`: 高さオフセット（必須）

- **地上からの高さ（m）**を MUI で設定する（例: `Slider` で 0〜10 m、または `TextField` type=number）。経度・緯度の入力は置かない。
- 値変更時は、建物の現在位置（lon/lat）を維持したまま `heightOffset` だけ更新する API を呼ぶ（内部で同じ lon/lat に `fromDegrees(..., heightOffset)` を再適用）。

### 4. `App.jsx`: 方位（heading）（必須）

- **heading 専用**の UI（例: `Slider` で 0〜360°、または ± 小刻みの `IconButton`）。
- 変更時に `setHouseHeading` を呼び、`requestRender` は viewer 側に集約。

### 5. スタイル

- [`src/style.css`](src/style.css) に、トグル＋高さ＋ heading 用のコンテナ（例: `#house-controls`）を `pointer-events: auto` で配置し、既存の `#ui` の `pointer-events: none` と整合させる。

## 変更ファイル（想定）

| ファイル | 内容 |
|---------|------|
| [`src/viewer.js`](src/viewer.js) | 配置・heading の setter/getter の export；初回 `zoomTo` の有無は現状維持で可 |
| [`src/App.jsx`](src/App.jsx) | クリック配置トグル＋ハンドラ、高さ（m）用 MUI、heading 用 MUI（経度緯度テキストフィールドは置かない） |
| [`src/style.css`](src/style.css) | `#house-controls` 等の最小レイアウト |

## 注意点

- **キーボード**: 既存の車両用 WASD と競合しないよう、配置はマウスクリック（トグル ON 時）に限定する。
- **StrictMode**: クリックリスナーは `useEffect` + クリーンアップで必ず解除する。
- **ピック失敗**: 空や無効なピック時は何もしないか、短い `console.warn` のみにする。

## 成果物のイメージ

ユーザーは「クリックで配置」で水平位置を決め、**高さスライダー等で地上オフセットを調整**し、heading で向きを変えられる。経度・緯度の手入力 UI は置かない。コードの責務は「viewer.js = シーンとエンティティ」「App.jsx = トグル・クリック・高さ・heading の操作 UI」に分離する。
