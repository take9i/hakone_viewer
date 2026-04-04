# Cesium 日影シミュレーションアプリ — 検討トップ

本資料は、**3D 地形・建物オープンデータの上に建物 CAD を重ね、太陽の影を描画して日影をシミュレーションする Web アプリ**の検討状況をまとめたトップレベル資料です。各テーマの詳細はリンク先のドキュメントを参照してください。

---

## 1. アプリの全体像


| 項目       | 内容                                                                 |
| -------- | ------------------------------------------------------------------ |
| **目的**   | 建設・設計の検討のため、任意地点で「建物の影のでき方」をシミュレーションできるようにする                       |
| **主な機能** | ① Cesium で 3D 地形・建物オープンデータを表示 ② その上に建物の CAD データを表示 ③ 日時に応じた太陽の影を描画 |
| **提供形態** | 課金・プラン制限・CAD データ管理を想定した Web サービス（サブスク想定）                           |


---

## 2. 検討状況サマリ

本資料で検討した項目は以下のとおりです。

- **影表示** — 技術的制約（カメラ背後の影欠け・山陰非表示）と対応方針
- **アプリの提供方法** — プラットフォーム載せ vs 自前 Web アプリ、Salesforce 等の位置づけ
- **DB・メタデータ・検索 UI の構築** — Airtable / kintone / Refine+Supabase 等の比較と MVP 推奨
- **CAD の蓄積と Cesium での重畳表示** — 表示パイプライン、多数 CAD の蓄積（ion／自前）、形式別の扱い
- **CAD 検索** — 条件検索・自然言語検索、メタデータ・IFC の活用
- **資材搬入可否** — 道路幅員・電柱データの表示と評価の実現方針
- **3D 地形・地図タイル・建物オープンデータの入手と配信** — 入手元と配信方法の選択肢の整理
- **最小 MVP の開発工数** — 範囲・項目別・合計目安（約 11〜26 人日）

---

### 2.1 影表示（技術的制約と対応方針）

**現状の制約**

- **問題 A**: カメラが太陽を背にすると影が消える／欠ける（任意視点で影を見たい用途には厳しい）
- **問題 B**: 視野外の地形（山など）が建物に落とす影（山陰）が描画されない

**原因**: シャドウマップ作成時のカリングがカメラ視錐台基準のため、カメラの背後にある物体がシャドウマップに含まれない。

**対応の方向性**

- **根本対応**: シャドウマップを「光の視錐・影の影響範囲」で構築するよう Cesium のカリング基準を変更
- **太陽を背にした視点**: 影が出る視点で作成したシャドウマップを保持・再利用して表示
- **運用で補う**: 「影をはっきり見るには太陽方向を向いてください」などの UI 案内

山陰を含めた正確な影表示には、カリング基準の変更が前提となる。

→ 詳細: [Cesium 影表示の現状・原因・対応方法](cesium-shadow-issues.md)

---

### 2.2 アプリの提供方法

**比較の結論**

- **既存プラットフォーム**（Salesforce / kintone / Microsoft）に載せるか、**自前で Web アプリを構築**するかの検討を実施。
- **ターゲットを中小建設会社・提案用**とした場合の推奨:
  - **第一**: **自前 Web アプリを主軸**（月額サブスク、Stripe + S3 + DB 等の定番構成）
  - **第二**: **kintone を「もう一つの入口」**として、既存 kintone 顧客向けに iframe で同じ Cesium ビューアを提供
  - **Salesforce**: 大口・エンタープライズ需要が出た段階で検討

→ 詳細: [Cesium CAD ビューアの提供方法](app-delivery-options.md)

---

### 2.3 DB・メタデータ・検索 UI の構築

**選択肢**

- Airtable / kintone / Refine + Supabase / 最小限の自前フォームの 4 案を比較。

**MVP 推奨**

- **Airtable + S3 + Cesium Viewer**
  - **Airtable**: メタデータ・物件の登録・検索 UI（小さい CAD は添付、大きい CAD は S3 の URL のみ格納）
  - **S3**: 大容量 CAD の実体
  - **Cesium Viewer**: 自前ホスト（Vercel 等）
- 自然言語検索: 自前サーバーで LLM が自然言語を Airtable の検索条件に変換 → 取得したレコードを**自前の表形式 UI**で表示し、行クリックで Cesium に CAD を表示する構成を推奨。
- 認証は Supabase Auth 等で行い、JWT を自前 API に付与して権限制御・課金と連携。

→ 詳細: [DB 部分（メタデータ・物件の登録・検索 UI）の構築方法](db-ui-construction-options.md)

---

### 2.4 CAD の蓄積と Cesium での重畳表示

**表示の定番**: 重い CAD は **CAD → glTF → 3D Tiles → Cesium** のパイプラインで表示する。3D Tiles により LOD・ストリーミング・容量削減ができ、Cesium はネイティブで 3D Tiles をサポートする。軽い単体 CAD は glTF のまま `Model` や `Entity.model` で表示可能。変換は Cesium ion に任せるか、3d-tiles-tools 等で自前実行する。

**蓄積（多数の CAD を貯めて検索で即表示）**: 自前 DB（Airtable 等）に「メタデータ ＋ **ion のアセット ID**」を保存し、検索でヒットしたレコードのアセット ID を Cesium に渡せば即表示できる。ion の REST API でアップロード・一覧を自動化可能。**DXF/DWG は ion 非対応**のため、蓄積するには事前に glTF 等へ変換する必要がある（既存ツール or 自前パイプライン）。ion SaaS にはストレージ・ストリーミングの上限があるため、大規模な場合は ion Self-Hosted や自前で 3d-tiles-tools 変換 ＋ S3 配信を検討する。

→ 詳細: [CAD データを Cesium で地形等に重畳表示する方法](cad-cesium-overlay-options.md)

---

### 2.5 CAD 検索

- 敷地形状・周辺道路・法適合などの条件検索、自然言語検索を想定。
- 実現方針: **メタデータを DB に持たせ**、**自然言語 → 検索条件（Text-to-SQL や Airtable の filterByFormula 等）に変換**して検索し、ヒットした CAD を Cesium で表示。
- 最小スコープ: Phase 1（手動メタデータ ＋ 条件検索 ＋ Cesium 表示）。
- **IFC の場合**: IFC には Property Set（プロパティセット）・属性・材質などの**メタデータがファイル内に含まれる**。これを抽出して DB に持てば検索に利用できる。その DB に対して LLM で自然言語を検索条件に変換する構成にすれば、**AI による自然言語検索**も可能である（詳細は [CAD データ検索・資材搬入可否判定](cad-search-and-delivery-assessment.md) 参照）。

→ 詳細: [CAD データ検索・資材搬入可否判定](cad-search-and-delivery-assessment.md)

---

### 2.6 資材搬入可否

- 接道の道路幅・電柱などの表示・参照、資材搬入可否の評価を想定。
- 専用の既存サービスは見当たらず、**道路幅員・電柱データを購入して Cesium/地図上に重ねて表示**し、必要に応じて NAVITIME 等と組み合わせて評価する**自前実装**が現実的と整理。

→ 詳細: [CAD データ検索・資材搬入可否判定](cad-search-and-delivery-assessment.md)

---

### 2.7 3D 地形・地図タイル・建物オープンデータの入手と配信

- **3D 地形**: Cesium ion（Japan Regional Terrain）、国土地理院の基盤地図・標高、シームレス標高タイル等から入手。配信は ion ストリーミング or 自前（quantized-mesh タイルを S3/CDN で配信）。
- **地図タイル（地形に貼る地図）**: 地理院タイル、MapTiler、OSM 系等から入手。配信は公式 URL 直参照 or 自前キャッシュ・CDN。
- **建物オープンデータ**: Cesium ion（Japan 3D Buildings、PLATEAU 由来）、PLATEAU の CityGML を自前で 3D Tiles 変換等。配信は ion or 自前ホスティング（tileset.json + タイルを CDN で配信）。

→ 詳細: [3D 地形・地図タイル・建物オープンデータの入手と配信](terrain-imagery-buildings-sources.md)

---

### 2.8 最小 MVP の開発工数

- **含めるもの**: Cesium ビューア（地形・建物・影 ＋ 選択 CAD の重畳・日時 UI）、Airtable によるメタデータ・登録、条件検索・一覧・クリックでビューアに表示。認証はなし or Supabase Auth のログインのみ。課金・資材搬入・自然言語検索は含めない。
- **工数目安**: **約 11 〜 26 人日**（最小：認証なし・手動登録のみ 〜 標準：認証＋S3 アップロード API）。1 人フル稼働で **約 2 〜 4 週間**。

→ 詳細: [最小 MVP の開発工数](mvp-development-effort.md)

---

## 3. ドキュメント一覧


| 資料                                                                             | 内容                                     |
| ------------------------------------------------------------------------------ | -------------------------------------- |
| **本資料（README.md）**                                                             | アプリ検討のトップレベル・サマリ                       |
| [cesium-shadow-issues.md](cesium-shadow-issues.md)                             | 影表示の技術的制約・原因・対応方法                      |
| [app-delivery-options.md](app-delivery-options.md)                             | 提供方法（プラットフォーム vs 自前・定番スタック）            |
| [cad-search-and-delivery-assessment.md](cad-search-and-delivery-assessment.md) | CAD 検索・資材搬入可否の要望と実現方針                  |
| [db-ui-construction-options.md](db-ui-construction-options.md)                 | メタデータ・物件の登録・検索 UI の構築案と MVP 推奨         |
| [cad-cesium-overlay-options.md](cad-cesium-overlay-options.md)                 | CAD の蓄積と Cesium での重畳表示（パイプライン・ion・形式別） |
| [mvp-development-effort.md](mvp-development-effort.md)                         | 最小 MVP の開発工数（範囲・項目別・合計目安）              |
| [terrain-imagery-buildings-sources.md](terrain-imagery-buildings-sources.md)   | 3D 地形・地図タイル・建物オープンデータの入手と配信（方法の整理） |


---

## 4. まとめ

- **コア**: Cesium 上の 3D 地形・建物 ＋ CAD 表示 ＋ 日影シミュレーション。影については Cesium のシャドウマップ仕様に起因する制約があり、根本対応（カリング基準変更）と、シャドウマップの保持・再利用や UI 案内で緩和する方針で整理済み。
- **提供**: 中小建設向けは自前 Web アプリを主軸とし、必要に応じて kintone を入口の一つとする構成。
- **データ・検索**: CAD はメタデータ付きで管理（MVP は Airtable）、自然言語検索はサーバー側 LLM で検索条件に変換し、結果を自前 UI で表示して Cesium と連携する流れ。
- **技術スタック**: 認証・課金・ストレージ・DB/UI は各資料で一貫して「定番」案（Stripe、Supabase Auth、S3、Airtable 等）で整理されている。

