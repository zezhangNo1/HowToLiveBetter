// 把 book/*.md 解析成 data.json
// 条目格式:
//   ### 1. 标题
//   <!-- 成本标签: 钱=0 时间=少 毅力=否 收益=大 口径=死亡率 -->
//   - 成本：… / 说人话：… / 收益：… / 证据等级：A / 来源：… / 备注：…
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)));
const bookDir = join(root, 'book');

const files = readdirSync(bookDir)
  .filter(f => f.endsWith('.md'))
  .sort((a, b) => parseInt(a) - parseInt(b));

const clean = s => s
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1($2)') // [text](url) -> text(url)
  .replace(/\*\*/g, '')
  .replace(/\s+/g, ' ')
  .trim();

const chapters = [];
const entries = [];
let missingTags = 0;

for (const f of files) {
  const raw = readFileSync(join(bookDir, f), 'utf8');
  const sec = parseInt(f);
  const chMatch = raw.match(/^# (\d+)\. (.+)$/m);
  const chTitle = chMatch ? chMatch[2].trim() : f.replace(/\.md$/, '');
  chapters.push({ n: sec, slug: f.replace(/\.md$/, ''), title: chTitle });

  // 按 ### 拆条目
  const parts = raw.split(/^### /m).slice(1);
  for (const part of parts) {
    const lines = part.split('\n');
    const t = lines[0].match(/^(\d+)\. (.+)$/);
    if (!t) continue;
    const no = parseInt(t[1]);
    const title = clean(t[2]);
    const tagM = part.match(/<!--\s*成本标签[:：]\s*([^>]+?)\s*-->/);
    const tags = {};
    if (tagM) {
      for (const kv of tagM[1].split(/\s+/)) {
        const [k, v] = kv.split('=');
        if (k && v) tags[k] = v;
      }
    } else {
      missingTags++;
    }

    // 六个字段，字段可能换行续写
    const fields = { cost: '', plain: '', benefit: '', ev: '', src: '', note: '' };
    const fieldMap = { '成本': 'cost', '说人话': 'plain', '收益': 'benefit', '证据等级': 'ev', '来源': 'src', '备注': 'note' };
    let cur = null;
    for (const line of lines.slice(1)) {
      const m = line.match(/^- (成本|说人话|收益|证据等级|来源|备注)[:：]\s*(.*)$/);
      if (m) { cur = fieldMap[m[1]]; fields[cur] = m[2]; }
      else if (cur && line.trim() && !line.startsWith('<!--') && !line.startsWith('#')) {
        fields[cur] += ' ' + line.trim();
      }
    }
    fields.ev = fields.ev.trim().charAt(0).toUpperCase(); // "A" / "A 级" 兜底

    for (const k of ['cost', 'plain', 'benefit', 'src', 'note']) fields[k] = clean(fields[k]);

    entries.push({
      id: `${sec}-${no}`,
      sec, no,
      title,
      ev: fields.ev,
      money: tags['钱'] || '',
      time: tags['时间'] || '',
      will: tags['毅力'] || '',
      gain: tags['收益'] || '',
      scope: tags['口径'] || '',
      cost: fields.cost,
      plain: fields.plain,
      benefit: fields.benefit,
      src: fields.src,
      note: fields.note,
    });
  }
}

const tagValues = {
  money: [...new Set(entries.map(e => e.money).filter(Boolean))],
  time: [...new Set(entries.map(e => e.time).filter(Boolean))],
  will: [...new Set(entries.map(e => e.will).filter(Boolean))],
  ev: [...new Set(entries.map(e => e.ev).filter(Boolean))],
};

const data = {
  syncedAt: '2026-10-03',
  source: 'https://github.com/eternity4719/HowToLiveBetter',
  license: 'https://creativecommons.org/licenses/by/4.0/',
  chapters, entries, tagValues,
};
writeFileSync(join(root, 'data.json'), JSON.stringify(data));
// data.js 供 file:// 双击直开使用：<script src> 不受浏览器本地文件限制
writeFileSync(join(root, 'data.js'), 'window.__DATA__=' + JSON.stringify(data) + ';');

console.log(`章节 ${chapters.length}，条目 ${entries.length}，缺成本标签 ${missingTags}`);
console.log('钱:', tagValues.money.join('/'), '| 时间:', tagValues.time.join('/'), '| 毅力:', tagValues.will.join('/'), '| 证据:', tagValues.ev.join('/'));
const noPlain = entries.filter(e => !e.plain).length;
console.log('缺说人话字段的条目:', noPlain);
