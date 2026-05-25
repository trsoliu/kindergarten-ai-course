# 认识人工智能：AI 小助手就在身边

幼儿园大班 40 分钟 AI 启蒙分享课。

## 使用方式

本地预览：

```bash
python3 -m http.server 8123
```

打开：

```text
http://localhost:8123/
```

翻页：

- 左右方向键：上一页 / 下一页
- `N`：显示或隐藏教师提示
- `F`：全屏

## 抓气球小游戏

本地预览时，课堂互动页默认打开本地小游戏：

```text
http://localhost:8124/
```

启动方式：

```bash
cd /Users/admin/work/gesture-balloon-game
python3 -m http.server 8124
```

发布到 GitHub Pages 后，按钮会自动打开线上小游戏：

```text
https://trsoliu.github.io/gesture-balloon-game/
```

## 视频说明

本地上课时，如果目录里有开场视频 MP4，网页会优先播放本地视频。

公开发布到 GitHub Pages 时，仓库不提交第三方 MP4 文件，网页会自动切换为原视频的 YouTube 嵌入播放。

## 图片素材

生活场景图为 AI 生成后放入 `assets/`；豆包图标来自豆包官网公开 favicon 资源，用于课堂识别。
小爱同学、小艺等品牌页不使用自绘或仿制 logo，只保留文字名称；课堂主题页使用非品牌化的主题标识，避免把概念图标误当成品牌 logo。
网页 favicon 使用自制的中性课堂图标，不使用任何第三方品牌标识。

## GitHub Pages

这是纯静态网站，上传到 GitHub 后可以直接用 GitHub Pages 从 `main` 分支根目录发布。
