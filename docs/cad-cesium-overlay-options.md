# CAD データを Cesium で地形等に重畳表示する方法 — 検討

本資料では、**重い CAD データを WebGL（Cesium）で地形・建物オープンデータの上に重畳表示する**ための定番の方法を整理する。

---

## 1. 結論：定番の方法

重い CAD を WebGL で表示する**定番**は次の流れである。

1. **CAD（DWG / Revit / IFC 等）を glTF（.glb）に変換**する。
2. **glTF を 3D Tiles に変換**し、空間分割・LOD（レベルオブディテール）を付与する。
3. **Cesium で 3D Tiles を読み込み**、地形・タイルなどと一緒に表示する。

小さい CAD（1 棟分・数 MB 程度）であれば、3D Tiles 化せず **glTF のまま** Cesium の `Entity`（`model`）や `Primitive` で表示する選択肢もある。**データが重い・複数建物・大規模**な場合は **3D Tiles が事実上の標準**である。

---

## 2. なぜ 3D Tiles か

3D Tiles は Cesium が提唱する「大規模 3D 地理空間データのストリーミング」用仕様である。


| 観点                | 内容                                                                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HLOD（階層的 LOD）** | カメラ距離に応じて必要なタイルだけを読み込み、遠くは粗い・近くは詳細なジオメトリを表示する。描画負荷と転送量を抑えられる。                                                                                              |
| **ストリーミング**       | 全データを一括読み込みせず、視錐内・距離に応じてタイルを逐次取得する。                                                                                                                        |
| **容量削減**          | 変換時に圧縮（Draco 等）やテクスチャ最適化（WebP 等）をかけることで、元の 50〜90% 削減といった報告がある。                                                                                             |
| **Cesium との相性**   | CesiumJS は 3D Tiles をネイティブにサポートし、地形・影・クリッピングと統合されている。本プロジェクトでも既に `Cesium3DTileset` で建物タイルを表示している（[src/viewer.js](src/viewer.js) の `TILESET_FEATURES_URL`）。 |


つまり「重い CAD をブラウザで無理なく表示する」には、**CAD → glTF → 3D Tiles → Cesium** というパイプラインが定番である。

---

## 3. 変換パイプラインの選択肢

### 3.1 CAD / BIM → glTF


| 入力形式          | 主な手段                                                | 備考                                       |
| ------------- | --------------------------------------------------- | ---------------------------------------- |
| **IFC**       | ifc2gltf、ifc-gltf、Cesium ion（IFC 対応）、ifcOpenShell 等 | 建築 BIM でよく使う。オープンソースの IFC→glTF ツールが複数ある。 |
| **Revit**     | Revit2glTF（プラグイン／エクスポート）、Cesium ion                 | Revit 利用者向け。ファイル単位で glTF 出力。             |
| **DWG / DXF** | **ion は非対応**。glTF / OBJ 等に変換してから ion にアップロード。   | 後述の「DXF を ion に蓄積する場合」を参照。               |
| **その他**    | Cesium ion、各種 DCC ツール経由で glTF 出力                      | ion は .glb, .obj, .fbx, .dae 等を入力にできる。         |


- **Cesium ion** を使う場合: 上記の**対応形式**をアップロードすると、3D Tiles 化まで一括で行える（後述）。**DXF / DWG は ion の対応形式に含まれない**ため、そのままでは蓄積できない。
- **自前で変換**する場合: IFC → glTF を ifc2gltf 等で行い、得られた glTF を 3D Tiles ツールに入力する。

#### DXF を ion に蓄積する場合（追加の開発・ツール）

**Cesium ion は DXF（および DWG）を直接受け付けない。** 公式の [Tiler Data Types and Formats](https://cesium.com/learn/3d-tiling/tiler-data-formats/) で 3D モデルとして列挙されているのは、glTF、FBX、CityGML、COLLADA（.dae）、Wavefront OBJ（.obj）、IFC などであり、DXF は含まれていない。

したがって **DXF を ion に蓄積するには、ion に上げる前に DXF → glTF（または OBJ 等の対応形式）への変換が必須**である。次のいずれかが必要になる。

| やり方 | 内容 |
|--------|------|
| **既存ツールで変換してからアップロード** | DXF を glTF / .glb に変換するツールを使い、変換結果を ion に手動または REST API でアップロードする。変換ツールの例: [Aspose.CAD](https://products.aspose.app/cad/conversion/dxf-to-gltf)（オンライン・API）、[GroupDocs](https://products.groupdocs.app/conversion/dxf-to-gltf)、[Convert3D](https://convert3d.org/dxf-to-gltf) などのオンラインコンバータ。バッチでまとめて変換し、得られた .glb を ion の REST API で登録する運用にすれば、**追加開発は最小限**（スクリプトで変換ツール呼び出し ＋ ion API 呼び出し）で済む。 |
| **自前サービスで変換を自動化** | ユーザーが DXF をアップロードすると、サーバー側で DXF→glTF を実行し、続けて ion に登録するパイプラインを組む。変換エンジンとして **Aspose.CAD for JavaScript/Node** や、オープンソースの DXF リーダー ＋ glTF ライターがあればそれを使う。**既存の変換ライブラリや CLI を組み合わせる開発**は必要。 |
| **手動のみ** | 都度、上記のようなオンラインコンバータで DXF→glTF し、ion の Web UI から「Add data」でアップロードする。開発は不要だが、蓄積件数が増えると非現実的。 |

まとめると、**DXF を ion に蓄積するだけなら「既存の DXF→glTF ツール ＋ ion へのアップロード（手動 or REST API）」で足りる。** 完全に「DXF を投げるだけで ion に貯まる」ようにするには、その前に DXF→glTF を行う処理（既存ツールの利用 or 自前実装）を用意する開発が必要である。

### 3.2 glTF → 3D Tiles


| 手段                                 | 概要                                                                                                                            |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Cesium ion（3D Tiling Pipeline）** | glTF / .glb / .obj / .fbx / .dae 等をアップロードし、3D Tiles に変換。Draco 圧縮・LOD 生成・テクスチャ最適化を自動で行う。大規模モデル（数百万ポリゴン、数百 MB）も数分でタイル化できる事例がある。 |
| **3d-tiles-tools（CesiumGS）**       | オープンソースの CLI。glTF 等を 3D Tiles に変換できる。自前サーバで変換ジョブを回す場合に利用する。                                                                   |
| **自前パイプライン**                       | ifcOpenShell + 自前スクリプトで glTF を出力し、3d-tiles-tools でタイル化するなど。                                                                   |


3D Tiles 1.1 では glTF をタイル形式としてそのまま使う方向にあり、従来の b3dm（Batched 3D Model）は非推奨の扱いである。

### 3.3 Cesium 側での表示

- **3D Tiles**: `viewer.scene.primitives.add(new C.Cesium3DTileset({ url: tileset.json の URL }))` で追加。既存の建物タイルと同じ扱い。
- **単体 glTF（軽い CAD）**: `Cesium.Model.fromGltfAsync()` で `Primitive` として追加するか、`Entity` の `model.uri` に .glb を指定する。位置は `modelMatrix` または `Entity.position` で地形上に合わせる。

重畳の順序は、地形・影像 → 3D Tiles（オープンデータの建物）→ CAD 由来の 3D Tiles（または glTF）のように、**後から add したものが手前に描画**される。同一シーン内で複数 `Cesium3DTileset` を add すれば、すべて地形の上に重なる。

---

## 4. 定番の構成のまとめ


| データの規模・用途        | 推奨の流れ                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------- |
| **重い・大規模・複数建物**  | CAD/IFC → glTF → **3D Tiles** → Cesium（`Cesium3DTileset`）                                   |
| **軽い・単体の建物 CAD** | CAD → glTF → Cesium（`Model.fromGltfAsync` または `Entity.model`）                               |
| **変換を任せたい**      | **Cesium ion** にアップロードして 3D Tiles まで生成し、ion のアセット ID または配信 URL を Cesium に渡す。                |
| **自前で変換・ホストしたい** | IFC/Revit → glTF（ifc2gltf 等）→ 3d-tiles-tools で 3D Tiles 化 → 自前 CDN/ストレージで tileset.json を配信。 |


---

## 5. 多数の CAD を蓄積・検索で即表示する場合の Cesium ion

今回のような用途（**多くの CAD を蓄積し、検索結果からすぐに Cesium で表示する**）でも、Cesium ion の利用は**あり**である。一方で、規模やコストによっては「ion に任せる」か「自前で変換・配信するか」の選択が生じる。

### 5.1 ion が向いている点

| 観点 | 内容 |
|------|------|
| **変換を任せられる** | アップロードするだけで glTF 化〜3D Tiles 化まで一括。重い CAD も軽いタイルとして表示できる。 |
| **検索との組み合わせ** | 自前 DB（Airtable 等）に「CAD メタデータ ＋ **ion のアセット ID**（または配信 URL）」を保存する。検索でヒットしたレコードのアセット ID を Cesium に渡せば、`Cesium.IonResource.fromAssetId(id)` で即表示できる。 |
| **複数アセットの管理** | ion の REST API でアップロード・一覧・削除を自動化できる。新規 CAD 登録時に API で ion に送り、返ってきたアセット ID を DB に保存する運用が可能。 |

つまり「たくさんの CAD を登録し、検索で選んだものをすぐ 3D Tiles で見せる」という流れは、ion を使っても実現できる。

### 5.2 注意したい制約（SaaS の ion）

ion の **SaaS** にはストレージとストリーミングの**上限**がある（例: 無料 5 GB / 月 15 GB ストリーミング、Commercial 50 GB / 月 150 GB ストリーミング、Premium 250 GB / 月 500 GB ストリーミング）。  
「案外多くの CAD」が数十 GB を超えたり、閲覧頻度が高いとストリーミング枠を消費する。アセット数そのものにハードな上限はなく、**容量・月間転送量**でプランや Custom の検討が必要になる。

- **小〜中規模**（例: CAD 数百件、合計 50 GB 以内、月間ストリーミングも余裕）→ ion SaaS の Commercial 等で足りる可能性が高い。
- **大規模**（数千件・数百 GB・高トラフィック）→ ストレージとストリーミングの両方が伸びるため、**ion Self-Hosted**（自前 K8s 等で ion を立て、容量は自前インフラに委ねる）や、**自前で 3d-tiles-tools 変換 ＋ S3 配信**を検討した方がよい。

### 5.3 アクセス制御の考え方

「どのユーザにどの CAD を見せるか」は、**自前アプリ側**で制御する形になる。  
ion のアクセストークンはアカウント単位が基本のため、「このアセットはこの組織だけ」といった細かい権限は ion 単体では表現しづらい。  
代わりに、**検索・一覧 API で「このユーザ／組織がアクセス可能なレコードだけ」を返し、そのレコードに含まれる ion アセット ID だけをフロントに渡す**ようにすれば、結果として「見てよい CAD だけ」が Cesium で表示される。

### 5.4 まとめ（今回の用途での ion）

- **あり**で使える: 多くの CAD を蓄積し、検索で選んだものをすぐ 3D Tiles で表示する、という用途は ion と相性が良い。変換の手間が減り、REST API で登録〜アセット ID 管理を自動化できる。
- **規模が小〜中**のうちは ion SaaS で十分検討できる。**規模が大きい・コストを抑えたい**場合は、ion Self-Hosted や自前パイプライン（3d-tiles-tools ＋ S3）との比較が現実的である。

---

## 6. Cesium ion の利用例で今回に近いもの

「多数の CAD を蓄積し、検索などで選んだものをすぐ Cesium で表示する」という**製品コンセプトそのもの**を前面にした公表事例は、調査時点では見当たらない。一方で、**Cesium ion で複数アセットを蓄積・変換し、必要なものを選んで表示する**パターンは、建設・AEC 分野で実績がある。今回の用途に近いものを挙げる。

### 6.1 Propeller（建設向けプラットフォーム）

- **概要**: 土工・採石・鉱山・廃棄物処理などの大規模現場向けに、ドローン調査と設計データの可視化を提供。以前から CesiumJS で地形・点群を表示しており、**Cesium の Design Tiler（ion の IFC→3D Tiles パイプライン）** を組み込んで IFC を 3D Tiles でストリーミングするようにした。
- **今回との共通点**: ユーザーが **多数の IFC（BIM）をアップロード**し、プラットフォーム側で 3D Tiles 化して蓄積。現場・プロジェクトごとに「設計 vs 現実」を比較表示する。過去にアップロード済みの IFC も一括でタイル化し直して即時利用できるようにしている。検索は「プロジェクト・現場の選択」が中心で、メタデータでの条件検索が前面に出た事例ではないが、**「多くの CAD を貯めて、選んだものを軽く表示」** という構成は今回と近い。
- **参照**: [Propeller Streaming Complex IFC Files for Construction with 3D Tiles](https://cesium.com/blog/2025/09/29/propeller-streaming-complex-ifc-files-for-construction/)

### 6.2 TRANCITY（CalTa / 日本・鉄道インフラ等）

- **概要**: 鉄道・道路・河川・港湾・発電所などのインフラを、三次元空間上で管理するプラットフォーム。動画から SfM で 3D 化するほか、**BIM モデルや点群のアップロード**にも対応。CesiumJS ＋ **Cesium ion** で「多種大量の 3D データ」を 3D Tiles 化し、ストリーミング表示している。
- **今回との共通点**: **複数プロジェクト・複数 3D アセット**を蓄積し、時系列・位置と紐づけて「必要なものを表示」する。ion でタイル化・最適化し、ブラウザで軽く見せる。検索は時系列・位置・プロジェクト単位が中心で、建物 CAD の「敷地・法規で検索」とは違うが、**多数の 3D/CAD を ion で扱い、必要なものを選んで表示する**流れは同じ。
- **参照**: [TRANCITYはCesiumを使用し、日本の鉄道インフラの管理を実現](https://cesium.com/blog/2024/11/19/trancity-uses-cesium-to-manage-japanese-railway-projects/)

### 6.3 その他（BIM の 3D Tiles 化・メタデータ保持）

- **Blenheim Palace**: 歴史的建造物の BIM を Design Tiler で 3D Tiles 化し、**1 モデル内の 1.4 万要素**にメタデータ（材質・修復履歴など）を付与。保守計画で要素ごとに参照・色分け。「多数の独立した CAD ファイル」ではなく「1 大モデル＋メタデータ」だが、**3D Tiles ＋ メタデータで「選んで見る」** という点は参考になる。
- **日本工営**: 地形・都市モデル・環境データを Cesium（for Unreal）で統合し、防災シミュレーションや設計可視化に利用。周辺データの準備時間を大幅短縮。ion でデータを最適化・配信する利用の一例。
- **Archi Future 2025 事例レポート**: Cesium の日本コミュニティマネージャーによる紹介。BIM/IFC を ion で 3D Tiles にし、設計データを地理空間と統合して可視化する流れが、建設業界で広がっていると整理されている。

### 6.4 まとめ

- **「多数の CAD を蓄積 → 検索 → 即表示」に特化した公表事例**は見当たらないが、**ion で複数アセットを蓄積・変換し、プロジェクトや選択に応じて Cesium で表示する**使い方は、Propeller や TRANCITY などで実績がある。
- 今回のように **メタデータで検索し、ヒットした 1 件の CAD を地形上に重ねて表示する** 構成は、既存事例の「プロジェクト・現場で選ぶ」部分を「検索条件で選ぶ」に置き換えた拡張とみなせる。技術的には ion ＋ 自前 DB（検索・アセット ID 管理）の組み合わせで実現可能である。

---

## 7. 本プロジェクトとの関係

- 地形は Cesium Terrain（例: plateau）、建物オープンデータは既に 3D Tiles（`bldg_notexture`）で表示している。
- **建物の CAD データ**を「その上に重ねる」には、当該 CAD を **glTF → 3D Tiles** したうえで、同じ `viewer.scene.primitives` に別の `Cesium3DTileset` として add する形で重畳できる。
- 日影シミュレーションでは、この CAD 由来の 3D Tiles も影のキャスタ・レシーバとして扱われる。影の制約（太陽を背にすると消える等）は [Cesium 影表示の現状・原因・対応方法](cesium-shadow-issues.md) のとおり。

---

## 8. 参照

- [3D Tiles Specification](https://github.com/CesiumGS/3d-tiles)（CesiumGS）
- [Cesium ion — 3D Tiling Pipeline](https://cesium.com/platform/cesium-ion/3d-tiling-pipeline/3d-models/)
- [3d-tiles-tools](https://github.com/CesiumGS/3d-tiles-tools)（glTF 等を 3D Tiles に変換する CLI）
- [Cesium Design Tiler / IFC メタデータ対応](https://cesium.com/blog/2025/03/20/cesium-design-tiler-ifc-metadata/)（IFC → 3D Tiles の公式まわり）
- 影表示の技術的制約: [cesium-shadow-issues.md](cesium-shadow-issues.md)
- 検討トップ: [README.md](README.md)

