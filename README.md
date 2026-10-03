# 高性价比人生指南 · H5 检索版

654 条按性价比排序的人生建议：长寿防病、急救、省钱理财、法律红线、失业兜底、婚育、出国与技能。每条写明成本、收益、证据等级和原始出处。

本仓库是 [eternity4719/HowToLiveBetter](https://github.com/eternity4719/HowToLiveBetter) 的重排检索版，纯静态、无后端、无依赖。

## 功能

- 场景直达：急救 / 被裁 / 孩子出生 / 确诊慢性病 / 老人 / 被骗
- 关键词搜索 + 组合筛选（证据等级 A/B/C、花钱、花时间、毅力、章节）
- 收藏、阅读（localStorage 本地存储）
- 单条深链分享（`#/e/章节-条号`）
- 分享卡片生成（Canvas 导出 PNG）
- 暗色模式跟随系统，目录常驻侧栏（窄屏为抽屉）

## 本地使用

直接双击 `index.html` 即可（数据经 data.js 注入，无需服务器）；或：

```
python3 -m http.server 8000
```

## 重新生成数据

```
node build.mjs   # 读取 book/*.md，产出 data.json 与 data.js
```

## 版权

正文内容按 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 转载自「高性价比人生指南」，版权归原仓库作者所有。条目内容以原仓库为准，本站数据同步于 2026-10-03。
