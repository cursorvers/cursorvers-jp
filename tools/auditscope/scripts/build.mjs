#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

/**
 * Parse YAML frontmatter from markdown file
 */
function parseFrontmatter(content) {
  const lines = content.split('\n');
  if (lines[0] !== '---') {
    throw new Error('Missing frontmatter delimiter');
  }
  
  const endIndex = lines.slice(1).findIndex(line => line === '---') + 1;
  if (endIndex === 0) {
    throw new Error('Missing frontmatter end delimiter');
  }
  
  const frontmatterLines = lines.slice(1, endIndex);
  const body = lines.slice(endIndex + 1).join('\n').trim();
  
  const frontmatter = {};
  for (const line of frontmatterLines) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      if (key === 'tags') {
        frontmatter[key] = value.replace(/^\[|\]$/g, '').split(',').map(t => t.trim());
      } else {
        frontmatter[key] = value;
      }
    }
  }
  
  return { frontmatter, body };
}

/**
 * Convert markdown to HTML with basic subset support
 */
function markdownToHtml(markdown) {
  const escapeHtml = (text) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };
  
  let html = markdown;
  
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold text-slate-800 mb-3 mt-6">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-slate-900 mb-4 mt-8">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-slate-900 mb-6">$1</h1>');
  
  // Bold text
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener">$1</a>');
  
  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-slate-300 pl-4 italic text-slate-600 my-4">$1</blockquote>');
  
  // List items
  html = html.replace(/^- (.+)$/gm, '<li class="mb-2">$1</li>');
  
  // Wrap consecutive list items in ul
  html = html.replace(/(<li[^>]*>.*<\/li>\s*)+/gs, '<ul class="list-disc list-inside space-y-2 mb-4">$&</ul>');
  
  // Paragraphs (split by double newlines, skip if already wrapped in tags)
  const paragraphs = html.split(/\n\s*\n/);
  html = paragraphs.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return '';
    if (trimmed.match(/^<[^>]+>/)) return trimmed;
    return `<p class="mb-4 text-slate-700 leading-relaxed">${trimmed}</p>`;
  }).join('\n\n');
  
  // Line breaks
  html = html.replace(/\n(?![<\n])/g, '<br>');
  
  return html;
}

/**
 * Render issue HTML page
 */
function renderIssueHtml(issue, issueNumber) {
  const { frontmatter, body } = issue;
  const htmlBody = markdownToHtml(body);
  
  return `<!doctype html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${frontmatter.title} | AuditScope</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Manrope:wght@400;600;800&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        jp: ['"Noto Sans JP"', 'sans-serif'],
                        en: ['"Manrope"', 'sans-serif'],
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-white text-slate-900 font-jp">
    <div class="min-h-screen">
        <header class="bg-white border-b border-slate-200 py-8">
            <div class="max-w-4xl mx-auto px-6">
                <h1 class="text-3xl font-bold text-slate-900 mb-2">AuditScope 第${issueNumber}号</h1>
                <div class="text-slate-600">
                    <time datetime="${frontmatter.date}">${frontmatter.date}</time>
                    <span class="mx-2">•</span>
                    <span>編集: ${frontmatter.editor}</span>
                </div>
            </div>
        </header>
        
        <main class="max-w-4xl mx-auto px-6 py-8">
            <article class="prose prose-slate max-w-none">
                ${htmlBody}
            </article>
        </main>
        
        <footer class="bg-slate-50 border-t border-slate-200 py-8 mt-16">
            <div class="max-w-4xl mx-auto px-6">
                <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 class="font-semibold text-amber-800 mb-2">Disclaimer</h3>
                    <p class="text-sm text-amber-700 leading-relaxed">
                        本digestは医療AIガバナンスに関する情報提供を目的とし、診断・治療・個別製品導入を推奨するものではありません。医師法上の医療行為を構成せず、医療広告ガイドラインに定める医療広告には該当しません。記載内容は発行時点の公開情報に基づき、正確性・完全性を保証しません。読者は各公式原文を自らご確認ください。
                    </p>
                </div>
            </div>
        </footer>
    </div>
</body>
</html>`;
}

/**
 * Render RSS 2.0 feed
 */
function renderRss(issues) {
  const escapeXml = (text) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };
  
  const formatRfc822 = (dateStr) => {
    const date = new Date(dateStr + 'T07:00:00+09:00');
    return date.toUTCString();
  };
  
  const items = issues.map(issue => {
    const { frontmatter } = issue;
    const link = `https://cursorvers.jp/tools/auditscope/issues/${frontmatter.date}/`;
    
    return `    <item>
      <title>${escapeXml(frontmatter.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${formatRfc822(frontmatter.date)}</pubDate>
      <description>${escapeXml(frontmatter.summary)}</description>
    </item>`;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>AuditScope — 医療AIガバナンス weekly digest</title>
    <link>https://cursorvers.jp/tools/auditscope/</link>
    <description>医療AIガバナンスの最新動向を週次でお届け</description>
    <language>ja</language>
${items}
  </channel>
</rss>`;
}

/**
 * Update latest card in index.html
 */
function updateLpLatestCard(latestIssue) {
  const indexPath = join(rootDir, 'index.html');
  let content = readFileSync(indexPath, 'utf-8');
  
  // Check if LATEST markers exist
  const hasMarkers = content.includes('<!-- LATEST:START -->') && content.includes('<!-- LATEST:END -->');
  
  if (latestIssue && hasMarkers) {
    const { frontmatter } = latestIssue;
    const issueNumber = frontmatter.title.match(/第(\d+)号/)?.[1] || '1';
    const link = `issues/${frontmatter.date}/`;
    
    const latestCard = `<!-- LATEST:START -->
            <div class="content-card rounded-xl p-8 md:p-12">
                <div class="mb-6">
                    <div class="text-sm text-slate-500 mb-2">${frontmatter.date}</div>
                    <h3 class="text-xl md:text-2xl font-bold text-slate-900 mb-3">${frontmatter.title}</h3>
                    <p class="text-slate-600 leading-relaxed">${frontmatter.summary}</p>
                </div>
                <div class="flex flex-wrap gap-2 mb-6">
                    ${frontmatter.tags.map(tag => `<span class="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full">${tag}</span>`).join('\n                    ')}
                </div>
                <a href="${link}" class="inline-flex items-center bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors">
                    第${issueNumber}号を読む
                    <i class="fa-solid fa-arrow-right ml-2"></i>
                </a>
            </div>
            <!-- LATEST:END -->`;
    
    content = content.replace(
      /<!-- LATEST:START -->.*?<!-- LATEST:END -->/s,
      latestCard
    );
  } else if (!hasMarkers) {
    // Add markers if they don't exist
    const placeholderMatch = content.match(/<div class="content-card[^>]*>.*?<\/div>/s);
    if (placeholderMatch) {
      const replacement = `<!-- LATEST:START -->
            ${placeholderMatch[0]}
            <!-- LATEST:END -->`;
      content = content.replace(placeholderMatch[0], replacement);
    }
  }
  
  writeFileSync(indexPath, content);
}

/**
 * Main build function
 */
function main() {
  const args = process.argv.slice(2);
  const specificIssue = args.includes('--issue') ? args[args.indexOf('--issue') + 1] : null;
  
  try {
    const issuesDir = join(rootDir, 'issues');
    
    // Read all markdown files (only date-prefixed files like YYYY-MM-DD.md)
    const files = readdirSync(issuesDir)
      .filter(f => f.endsWith('.md') && /^\d{4}-\d{2}-\d{2}\.md$/.test(f));
    
    if (files.length === 0) {
      console.log('No issues found, creating empty feed.xml');
      writeFileSync(join(rootDir, 'feed.xml'), renderRss([]));
      return;
    }
    
    // Parse issues
    const issues = files
      .map(file => {
        const content = readFileSync(join(issuesDir, file), 'utf-8');
        const parsed = parseFrontmatter(content);
        parsed.filename = file;
        return parsed;
      })
      .sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date));
    
    // Filter for specific issue if requested
    const issuesToBuild = specificIssue 
      ? issues.filter(issue => issue.frontmatter.date === specificIssue)
      : issues;
    
    if (specificIssue && issuesToBuild.length === 0) {
      console.error(`Issue ${specificIssue} not found`);
      process.exit(1);
    }
    
    // Build individual issue pages
    issuesToBuild.forEach(issue => {
      const { frontmatter } = issue;
      const issueNumber = frontmatter.title.match(/第(\d+)号/)?.[1] || '1';
      const outputDir = join(rootDir, 'issues', frontmatter.date);
      
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }
      
      const html = renderIssueHtml(issue, issueNumber);
      writeFileSync(join(outputDir, 'index.html'), html);
      console.log(`Built: issues/${frontmatter.date}/index.html`);
    });
    
    // Build RSS feed (always build with all issues)
    if (!specificIssue) {
      const rss = renderRss(issues);
      writeFileSync(join(rootDir, 'feed.xml'), rss);
      console.log('Built: feed.xml');
      
      // Update latest card
      updateLpLatestCard(issues[0]);
      console.log('Updated: index.html latest card');
    }
    
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}