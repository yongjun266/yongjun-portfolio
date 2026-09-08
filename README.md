# 张泳珺 · 个人作品集网站

新版围绕内容运营、视频创作、AI 创作组织。包含首页、5 个案例详情页、视频作品墙和 404，共 8 个 HTML 页面。11 条真实视频均有封面和播放入口，不再使用 AI 视频占位。

桌面端加入 Target Cursor：普通状态为深橙圆点与四角跟随；悬停链接、按钮和案例时锁定目标，视频和图片分别显示 PLAY / VIEW。触屏设备、系统“减少动态效果”模式或脚本不可用时自动使用系统鼠标。

## 打开网站

双击 `start-preview.cmd`，打开 http://127.0.0.1:4322/。电脑已安装 Node.js 即可，不需安装开发依赖。请通过预览服务访问，不要直接双击 dist/index.html。

手机与电脑连接同一 Wi-Fi，运行 `start-phone-preview.cmd`，在手机浏览器输入窗口显示的局域网地址。电脑须保持运行，防火墙须允许该服务。手机不能通过 127.0.0.1 访问电脑。

如果端口已占用，可使用现有预览，或运行 `node preview.mjs 4324 --lan` 更换端口。此网站当前没有公网地址；发送给异地面试官前，需要部署 dist。

## 页面

- `/`：四项精选 → 内容运营 → AI 创作 → 视频创作 → AI Content Lab / 店小策 → 关于与联系。
- `/work/ai-sandbox/`：广州沙盘 → 小红书视频与真实笔记分析。
- `/work/dewu/`：得物运营与商业化。
- `/work/ai-assisted-editing/`：家居、母婴的 AI 辅助过程与完整成片。
- `/work/ai-video/`：东方幻想、镜中人偶、桃子腮红三个 AI 视频实验。
- `/work/xiaohongshu/`：早期摄影与生活方式账号运营。
- `/videos/`：ABLPOWER 产品宣传、出镜口播，以及后置情景短片和混剪截图。
- `/resume.pdf`：当前简历原文件。

## 更新内容

| 内容 | 维护位置 |
|---|---|
| 姓名、联系方式、到岗标签 | src/data/profile.ts |
| 案例正文、职责、来源、数据、案例中的视频 | src/data/cases.json |
| 首页与作品墙的视频标题、封面、分类、时长 | src/data/videos.json |
| 首页结构、工作台和店小策文案 | src/pages/index.astro |
| 视频作品墙 | src/pages/videos.astro |
| 案例共用模板 | src/pages/work/[id].astro |
| 视频封面与大尺寸播放入口 | src/components/VideoCard.astro |
| 图片与原生视频 | src/components/Media.astro |
| 响应式与新布局 | src/styles/refactor.css（基础样式在 global.css） |
| 播放器、图片查看、导航、复制等交互 | src/scripts/interactions.ts |
| 素材来源及原文件校验值 | asset-sources.json |

视频放在 public/videos，封面放在 public/images。更新视频须同步 cases.json 和 videos.json 中引用的条目；不要只替换其中一处。新增图片应将宽高补入 src/data/image-sizes.json。

建议视频采用 MP4（H.264 / AAC），最长边 1280 或合适的高清尺寸，保留原比例，启用 faststart。当前 11 条网页副本共约 124 MB，原片共约 733 MB。不会在首页提前下载 MP4；点击播放才加载，支持进度拖动。大尺寸播放器关闭时暂停并释放资源，失效时提供提示与直接访问链接。桌面原片没有修改。

## 开发与构建

Node.js 24.18.0；Astro 7.3.1；TypeScript 6.0.3。版本固定于 package-lock.json。

```sh
npm ci
npm run dev
npm run check
npm run build
node preview.mjs 4322 --lan
```

构建生成 dist。受限环境可设置 ASTRO_TELEMETRY_DISABLED=1 关闭构建遥测。静态网页没有在线 AI 调用、数据库、登录或外部字体依赖。无需复制开发工具或视频转换依赖来部署。

## 内容口径

- 沙盘：本人说明用 GPT 6.0 约半小时制作网页；不是整条视频的制作耗时。实际视频仅证明网页运行效果，未提供开发录像、源码和 Demo 地址。
- 小红书沙盘：首页 700+ 播放，截图显示 754 播放；数据更新至 09-07 00:00，截图没有年份。
- 得物：新历史截图单篇 2.55 万阅读，简历 25,491 原口径在详情说明中保留；1,454 好物访问、约 50 商单、约 3,000 元个人收入为简历及本人说明。17.63 万与旧 11.3 万不相加、不计算差值增长。
- 早期小红书：1,000+ 自然流涨粉、单条 1 万+ 浏览来自旧作品集，周期未明确。
- AI 视频标题依据画面命名；未编造工具链、客户、Prompt 数、工时、奖项或海外账号业绩。
- 母婴上升图形是解释性素材，不是统计或产品效果证据；不是本人出镜。
- ABLPOWER 70+ 条为整体实习内容交付，不是单条视频成绩。
- 个人工作台为真实界面截图，不能据此推断在线可用性或效率；店小策约 8 → 3 分钟来自项目自测，非普遍效果。

完整逐项判断见《作品资产清单.md》，重构结果见《重构交付说明.md》，验证范围见 verification.md。
