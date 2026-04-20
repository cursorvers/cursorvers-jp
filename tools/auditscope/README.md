# AuditScope - 医療AIガバナンス Weekly Digest

医療AIガバナンスの最新動向を週次でお届けするニュースレター/ダイジェスト。

## Directory Layout

```
tools/auditscope/
├── index.html          # メインランディングページ
├── README.md           # このファイル（開発者向けドキュメント）
├── feed.xml            # RSS 2.0 フィード
├── issues/             # 各号のMarkdownファイル格納ディレクトリ
│   ├── .gitkeep
│   ├── 2026-01-08.md   # 例: 第1号（2026年1月8日水曜配信）
│   ├── 2026-01-15.md   # 例: 第2号（2026年1月15日水曜配信）
│   └── ...
└── scripts/            # ビルド・配信用スクリプト
    ├── .gitkeep
    ├── build.js        # 静的サイト生成
    ├── feed-generator.js # RSS フィード生成
    └── ...
```

## Issue Format

各号は `issues/YYYY-MM-DD.md` 形式で作成します。ファイル名の日付は配信日（毎週水曜）を基準とします。

### Frontmatter 仕様

```yaml
---
title: "第1号: 医療AIガバナンス入門"
date: "2026-01-08"
issue: 1
status: "published" | "draft"
tags: ["governance", "safety", "guidelines"]
excerpt: "医療AIガバナンスの基礎概念と最新動向をわかりやすく解説"
---
```

### 記事構造例

```markdown
---
title: "第1号: 医療AIガバナンス入門"
date: "2026-01-08"
issue: 1
status: "published"
tags: ["governance", "safety", "guidelines"]
excerpt: "医療AIガバナンスの基礎概念と最新動向をわかりやすく解説"
---

# 第1号: 医療AIガバナンス入門

## 今週のハイライト

- 厚労省の新ガイドライン更新
- 医療機関でのAI導入事例
- リスク管理のベストプラクティス

## トピック1: ガイドライン更新

[内容...]

## トピック2: 導入事例

[内容...]

## まとめ

[内容...]

---

**次号予告**: 第2号は2026年1月15日（水）7:00 JST配信予定
```

## 新しい号の作成手順

1. `issues/` ディレクトリに新しいMarkdownファイルを作成
   - ファイル名: `YYYY-MM-DD.md`（配信予定日）
   - 水曜日の日付を使用

2. Frontmatterを適切に設定
   - `title`: その号のタイトル
   - `date`: 配信日（YYYY-MM-DD形式）
   - `issue`: 号数（連番）
   - `status`: 公開状態（draft/published）
   - `tags`: 関連タグ
   - `excerpt`: 短い概要

3. 記事コンテンツを執筆

4. ビルドコマンドを実行（準備中）

## ビルドシステム（計画中）

```bash
# 静的サイト生成
npm run build

# RSS フィード更新
npm run feed:generate

# プレビュー（開発用）
npm run preview
```

## 配信スケジュール

- **配信日**: 毎週水曜日
- **配信時間**: 7:00 JST
- **フォーマット**: HTML + RSS
- **配信方法**: Buttondown（予定）

## 関連ツール連携

- **GuideScope**: ガイドライン検索ツール
- **Evidence Pack**: 実装エビデンス集（準備中）

## 技術仕様

- **Static Site**: Pure HTML/CSS/JS
- **Dependencies**: なし（zero dependencies）
- **RSS**: RSS 2.0 準拠
- **Newsletter**: Buttondown 連携（予定）

## 開発・運用

- issues/ 内のMarkdownファイルから自動的にHTML生成
- RSS フィードは最新10件を自動更新
- index.html の「最新号」セクションを動的更新

---

**Note**: このツールは cursorvers-jp サイトの一部として運用され、Cursorvers.edu エコシステムの一環として医療AIガバナンスの知識共有を目的としています。