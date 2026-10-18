# EchoFlow · 英语原声剧学习与追剧工作台

> Watch. Listen. Speak. Grow.
> 看见自己的进步，让英语自然发生。

EchoFlow 是一个专为 ADHD 用户设计的低阻力英语原声剧学习网站。它结合了追剧进度管理、系统化英语听力口语训练、以及自动安排的复习系统，让用户只需要点击按钮就能开始学习，不需要自己管理复杂的计划。

**核心原则：用户负责执行，系统负责安排。**

---

## 技术栈

- **React 18** + **TypeScript**
- **Vite 5** 构建
- **Tailwind CSS 3** 样式
- **React Router 6** 路由
- **localStorage** 数据持久化（纯前端，无需服务器）

---

## 本地运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
# 打开 http://localhost:5173

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

---

## 项目结构

```
src/
├── main.tsx                 # 入口
├── App.tsx                  # 路由配置
├── index.css                # 全局样式 + Tailwind
├── types/
│   └── index.ts             # TypeScript 数据模型
├── data/
│   ├── shows.ts             # 剧集数据（小谢尔顿141集 + 走遍美国26集）
│   └── expressions.ts       # 通用英语表达库
├── lib/
│   ├── storage.ts           # localStorage 读写 + 进度计算 + 复习调度
│   └── AppContext.tsx       # 全局状态管理（Reducer）
├── components/
│   ├── Layout.tsx           # 布局 + 底部/顶部导航
│   ├── ProgressBar.tsx      # 进度条
│   ├── EpisodeCircle.tsx    # 剧集圆圈按钮
│   ├── EpisodeGrid.tsx      # 剧集圆圈网格
│   ├── ShowProgressCard.tsx # 剧集进度卡片
│   ├── Toast.tsx            # 轻量提示
│   └── ui.tsx               # 通用组件（Button/Card/Chip）
├── features/
│   └── training/
│       ├── TrainingWizard.tsx  # 9步标准训练 SOP
│       └── MiniPractice.tsx    # 3分钟低阻力训练
└── pages/
    ├── HomePage.tsx         # 首页
    ├── WatchMapPage.tsx     # 追剧地图
    ├── EpisodeDetailPage.tsx# 剧集详情
    ├── LearningPage.tsx     # 英语学习入口
    ├── ReviewPage.tsx       # 复习
    ├── ProgressPage.tsx     # 我的成长
    └── SettingsPage.tsx     # 设置
```

---

## 已实现功能（P0 全部完成）

### 追剧地图 Watch Map
- ✅ 《小谢尔顿》7 季 141 集完整数据（含真实英文标题）
- ✅ 《走遍美国》26 集，每集 3 个 Act
- ✅ 逐集圆圈打勾系统（点击切换观看/未观看）
- ✅ 季度进度表，可展开查看逐集圆圈
- ✅ 总进度与季度进度动态计算（纯函数，无矛盾）
- ✅ 圆圈点击动画、撤销支持、防抖
- ✅ 进度自动保存到 localStorage

### 首页 Home
- ✅ 自动推荐下一集（基于上次观看位置）
- ✅ 继续观看卡片
- ✅ 今日英语训练入口（标准 + 3分钟模式）
- ✅ 复习卡片（仅显示有待复习内容时）
- ✅ 追剧地图概览

### 剧集详情 Episode Detail
- ✅ 观看状态与训练状态分离显示
- ✅ 「我已经看完了」一键标记
- ✅ 完成后显示反馈 + 下一集/训练/首页三个选项
- ✅ 《走遍美国》支持逐 Act 完成
- ✅ 观看记录（折叠展示）

### 英语学习 Learning
- ✅ 9 步标准训练 SOP：
  1. 自然观看
  2. 选择 30-60 秒片段
  3. 关闭字幕听第一遍
  4. 打开字幕核对（快捷问题选择）
  5. 再次关闭字幕听
  6. 学习两个实用语块（支持自定义输入 / 通用表达库）
  7. 发音模仿
  8. 主动表达（用表达讲自己的事）
  9. 完成训练
- ✅ 3 分钟低阻力训练模式（独立记录为 mini practice）
- ✅ 训练进度自动保存，关闭后可断点续学
- ✅ 观看状态与训练状态独立保存
- ✅ 根据剧集自动匹配训练重点（小谢尔顿侧重听力，走遍美国侧重口语）

### 复习 Review
- ✅ 间隔复习调度（第 1、3、7 天）
- ✅ 每次只显示一个表达（单任务原则）
- ✅ 主动回忆模式（先尝试回忆，再查看答案）
- ✅ 未完成的复习保留，不制造逾期/惩罚

### 我的成长 Progress
- ✅ 观看集数统计（分剧集 + 总计）
- ✅ 训练次数统计（完整训练 / 3分钟训练）
- ✅ 表达收藏数量（已保存 / 已复习）
- ✅ 成就墙（季度完成、全剧完成等）
- ✅ 明确区分"学习活动记录"与"真实语言能力"

### 设置 Settings
- ✅ JSON 导出学习记录
- ✅ JSON 导入学习记录（支持替换 / 合并策略）
- ✅ 清空数据
- ✅ 明确说明数据存储在浏览器本地，不自动跨设备同步

### 历史观看进度导入
- ✅ 按季度批量标记
- ✅ 标记到某一集（自动勾选此前所有集数）

### ADHD 友好设计
- ✅ 首页只需要点一个按钮就能开始
- ✅ 看完剧不强制训练也能获得进度
- ✅ 训练中断后可继续，不算失败
- ✅ 3 分钟模式提供低阻力选项
- ✅ 没有逾期、断签、惩罚
- ✅ 绝大部分操作可通过点击完成

### 响应式与兼容性
- ✅ 桌面端顶部导航，移动端底部导航
- ✅ 圆圈最小触控区域 44px
- ✅ 支持减少动态效果（prefers-reduced-motion）
- ✅ 无控制台错误
- ✅ Safari / Chrome 兼容

---

## 暂未实现功能（P1 / P2 预留）

### P1（已预留架构，可后续实现）
- ⏳ 完整剧集标题（小谢尔顿标题已内置，部分季标题待核实）
- ⏳ PNG 纪念卡导出（季度/全剧完成时）
- ⏳ 本地视频导入（MP4 + SRT/VTT 字幕）
- ⏳ A-B 循环播放
- ⏳ 浏览器录音及回放（MediaRecorder API）
- ⏳ 季度完成庆祝动画（当前有 Toast 提示）

### P2（预留扩展架构，不影响核心功能）
- ⏳ AI 自动提取语块
- ⏳ AI 口语互动对话
- ⏳ AI 表达反馈（纠错）
- ⏳ 跨设备云同步
- ⏳ PWA 离线支持

> 所有未实现功能均为渐进增强，不影响 P0 核心功能的完整使用。网站在没有 AI、没有视频文件的情况下完全可用。

---

## 数据模型

核心数据类型定义在 `src/types/index.ts`：

- **Show**: 剧集（id, title, totalEpisodes, seasons, lastWatchedEpisodeId）
- **Season**: 季度（id, showId, seasonNumber, episodeCount, episodeIds）
- **Episode**: 集（id, watched, watchedAt, acts, trainingStatus）
- **TrainingSession**: 训练记录（id, episodeId, mode, currentStep, completedSteps, status）
- **Expression**: 表达收藏（id, text, meaning, example, sourceType, showId, episodeId）
- **ReviewRecord**: 复习记录（id, expressionId, reviewStage, nextReviewAt, completedReviews）
- **Achievement**: 成就（id, type, showId, seasonId, unlockedAt）

所有 ID 稳定唯一，进度由纯函数统一计算，避免不同页面显示不一致。

---

## 测试验证结果

| 测试项 | 结果 |
|--------|------|
| 小谢尔顿 7 季 141 集数据 | ✅ 通过 |
| 走遍美国 26 集 + 每集 3 Act | ✅ 通过 |
| 点击圆圈打勾 + 进度更新 | ✅ 通过（S1E1 点击后 1/22，总 1/141） |
| 再次点击撤销 | ✅ 通过（恢复 0/22） |
| 跨集推荐（看完 E1 推荐 E2） | ✅ 通过 |
| 观看状态与训练状态独立 | ✅ 通过 |
| 刷新页面数据保留 | ✅ 通过（localStorage） |
| 训练断点续学（STEP 05 恢复） | ✅ 通过 |
| 3 分钟训练独立记录 | ✅ 通过（session.mode = mini） |
| 复习调度（第 1/3/7 天） | ✅ 通过 |
| 复习完成后阶段推进 | ✅ 通过（reviewStage 0→1） |
| 设置页导入/导出 JSON | ✅ 通过 |
| 批量补录进度 | ✅ 通过 |
| 移动端底部导航 | ✅ 通过 |
| 无控制台错误 | ✅ 通过 |
| npm run build 成功 | ✅ 通过 |
| TypeScript 类型检查通过 | ✅ 通过 |

---

## 设计说明

### 配色
- 主背景 `#F8F9F5`
- 主文字 `#253238`
- 完成绿色 `#74B89A`
- 强调蓝色 `#8BAFC7`
- 卡片背景 `#FFFFFF`
- 辅助灰色 `#E6EAE7`

### 视觉原则
- 极简、温柔、低刺激
- 圆形完成按钮模拟"集印章"的成就感
- 进度条平滑填充动画
- 支持系统减少动态效果设置

---

## 数据备份

所有数据保存在浏览器 `localStorage`，key 为 `echoflow_data_v1`。

**重要提示**：
- 第一版不支持跨设备自动同步
- Mac 和 iPhone 之间的数据互不相通
- 请定期通过「设置 → 导出学习记录」备份
- 清除浏览器数据会导致进度丢失

未来版本可扩展账号与云同步功能。
