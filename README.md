# roybase-homepage

roybase.top 静态个人主页 — 自托管服务枢纽、导航工具、日志与收藏。

## 技术栈

纯 HTML/CSS/JS，零构建零依赖。

## 文件结构

```
index.html          主页
css/style.css       样式
js/main.js          前端逻辑
articles/*.html     文章
404.html            404 页
robots.txt          SEO
sitemap.xml         SEO
scripts/            参考副本（真相在 /opt/homepage-status/）
data/               运行时生成（gitignore）
```

## 部署

托管在 jdy 服务器 1Panel（站点 id=7，alias=roybase-homepage）。

### 日常维护

```bash
# 在 jdy 上直接改文件
ssh jdy 'cd /opt/1panel/www/sites/roybase-homepage/index && vim index.html'

# 验证
ssh jdy '/root/bin/hp.sh verify'

# 提交 + 推送
ssh jdy 'cd /opt/1panel/www/sites/roybase-homepage/index && git add -A && git commit -m "feat: ..." && git push'
```

### 从 GitHub 拉取

```bash
ssh jdy 'cd /opt/1panel/www/sites/roybase-homepage/index && git pull'
```

## 安全头

CSP / HSTS / X-Content-Type-Options / X-Frame-Options / Referrer-Policy 双域（www + 裸域）覆盖。

## 相关

- 服务器运维：`jdcloud-ops` skill
- 站点维护：`roybase-homepage` skill
