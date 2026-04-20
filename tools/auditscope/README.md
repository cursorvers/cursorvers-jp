# AuditScope - 医療AI論文 daily digest OSS (LP)

このディレクトリは Cursorvers.edu サイト上の **AuditScope ランディングページ** を提供します。

AuditScope 本体は **別リポジトリの OSS template** (予定: `github.com/cursorvers/auditscope`)。
本ディレクトリはそのツールを紹介・オンボードするための単一ページ LP で、コンテンツ生成や購読配信は行いません。

## Positioning

- AuditScope 本体 = 医療AI論文の daily digest を、利用者自身の Gmail に届ける self-hosted OSS (MIT)。
- 本 LP = OSS の存在と使い方を日本語で説明する静的ページ (cursorvers.jp/tools/auditscope/)。
- 私たちは論文の要約を publish しません。道具だけを配ります (note 等での公開記事とは明確に棲み分け)。

## Directory Layout

```
tools/auditscope/
├── index.html         # LP (static, build 不要)
├── README.md          # このファイル
├── taxonomy.json      # governance 7 軸ラベル用の参照データ (将来利用)
└── scripts/
    └── build.mjs      # 旧週刊ダイジェスト時代のビルドスクリプト (未使用・参考保持)
```

- `issues/` と `feed.xml` は pivot (2026-04-20) により廃止。
- 旧 `/tools/auditscope/issues/*` URL は `_redirects` で `/tools/auditscope/` に 301。

## LP の管理方法

LP は単一の静的 HTML です。ビルドステップはありません。

- Tailwind CDN + Font Awesome CDN を使用。
- デザインシステム (brand-flame #FF4500 ほか) は cursorvers-jp 全体と揃えています。
- 修正したら `git add` / `git commit` のうえ通常デプロイ (Cloudflare Pages) に乗せるだけです。

### プレビュー

```
open tools/auditscope/index.html
```

もしくは任意のローカル静的サーバで配信してください (Python: `python -m http.server`, Node: `npx serve` など)。

## Content 要素

LP は以下のセクションで構成されます。更新時は HTML 内のアンカーコメントを参照してください。

1. Hero — 「医療AI論文 daily digest を、あなた専用の Gmail に。」
2. Why 違うか (3 カード) — 3 クラスタ特化 / governance 7 軸 overlay / 非公開 self-hosted
3. 10 分セットアップ (5 steps) — template fork → Gemini key → Gmail App Password → Secrets → config 編集
4. 届くメール sample — TL;DR / 今日の1本 / Deployment / Use / Safety / Footer
5. Safety 7 themes — prompt injection / PHI leak / model drift / automation bias / adversarial / bias / accountability
6. GitHub + GuideScope back-link
7. Disclaimer + MIT

## Disclaimer

LP 内文言を以下の方針で維持します (臨床の現場感に合わせたツール紹介という性格のため)。

- 医師法上の医療行為を構成しない旨を明記。
- 診断・治療推奨ではなく、文献情報の提示に留まる旨を明記。
- 臨床判断は担当医師の責任である旨を明記。

## 将来の拡張余地

- `taxonomy.json`: governance 7 軸ラベル付けを LP 側で静的に可視化する余地あり。
- `scripts/build.mjs`: LP 単独描画では不要だが、将来 issue 形式を再導入する場合に参考として残置。

---

**Note**: AuditScope は cursorvers-jp エコシステム内のツール紹介 LP です。本体 OSS と LP の双方が MIT / 非商用上も使いやすい形で提供されます。
