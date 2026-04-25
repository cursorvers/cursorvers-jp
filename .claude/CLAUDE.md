# Cursorvers-jp - 著者ハブ + 日本語 LP

note-first canonical な著者ハブ + LP の静的サイト。

---

## メディア資産デプロイ — iOS Safari cache 落とし穴

PR #15-#27 (2026-04-25) の実体験から得た教訓。同種の動画/オーディオ差し替えタスクで繰り返さないこと。

### 根本原因

iOS WebKit の `<video>` / `<audio>` は **AVPlayer system-level cache** が **path-keyed**。query string (`?v=20260425`) は cache key に含まれないため、`?v=` bump では iPhone Safari に新しいアセットが届かない。PC Safari は HTTP cache で動くため query bump が効き、iPhone だけ古い動画を表示し続ける非対称が発生する。

### 5 つの予防ルール (CI 強制対象)

これらは `.github/workflows/media-asset-policy.yml` + `scripts/lint-media-asset-policy.mjs` で PR 時に自動検証される。違反で CI fail。

- **R1: ローカル video/audio に `?v=` query を付けない**
  - 差し替えたければ file path そのものを rename する (`git mv hero.mp4 hero_v2.mp4`)
  - external URL (pexels.com 等) の query token は対象外
- **R2: video/audio file を modify せず、rename (add + delete) する**
  - `git diff --name-status` で `M` ステータスの video は fail
  - `R` (rename) または `A`/`D` ペアは OK
- **R3: service worker (sw.js) は video 拡張子を cache bypass する**
  - `fetch(event.request)` を video 拡張子に対して通す pattern が無ければ warn
  - これが欠けると SW cache で古い動画が延命する
- **R4: pre-deploy で `curl https://cursorvers.com/...` で疎通確認しない**
  - Cloudflare CDN の cache を probe が poisoning して古い asset を pin してしまう
  - smoke-test の post-deploy URL probe は `# probe-after-deploy` マーカーで許可
- **R5: `<video>` 子 `<source>` は mobile-first 順 (`max-width` → `min-width`)**
  - iOS は最初に match した source を選ぶため、PC 用が先にあるとモバイルで PC 版が再生される

### 検証手順 (必須)

1. CI (`media-asset-policy` job) が PASS していること
2. **iPhone 実機** (Safari) で反映確認 — Playwright / Lighthouse / PC Safari は build-id しか見ないので不十分
3. 反映しない場合、`?v=` を追加しない。3 回 query bump が無効なら即座に path rename に切り替える (PR #15-#27 の 5 回失敗を繰り返さない)

### 例外 override

緊急時のみ、PR に `media-asset-policy-ack` label を付けると全ルールが warning にダウングレードされる。label 付与は reviewer 合意後に限り、PR description に override 理由を必ず記す。

### 関連 PR (学習源)

- PR #15-#26: `?v=` query bump を 5 回試行し全敗 (iPhone 到達失敗)
- PR #27: `git mv hero_wave.mp4 → hero_v6_pc.mp4` + `<source>` から query 完全削除 + sw.js bump で即時反映成功
- PR #28: 本ルール群を CI 強制化 (`media-asset-policy.yml`)

---
