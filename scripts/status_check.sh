#!/usr/bin/env bash
# 服务状态检查 → status.json（部署到服务器 /opt/homepage-status/，cron 每 5 分钟）
set -u
OUT="${OUT:-/opt/nginx-data/www/sites/roybase-homepage/index/data/status.json}"
TMP="$(mktemp)"
{
  echo "{"
  first=1
  check() { # $1=key $2=name $3=url(或 ping:IP) $4=allowed codes
    local status code allowed="${4:-200}"
    if [[ "$3" == ping:* ]]; then
      ping -c1 -W2 "${3#ping:}" >/dev/null 2>&1 && status=up || status=down
    else
      # --noproxy "*"：服务器 env 有 http_proxy=127.0.0.1:2080（Lucky），走代理会超时返回 000 误判离线
      code=$(curl -sk --noproxy "*" -o /dev/null -w '%{http_code}' --max-time 6 "$3" 2>/dev/null || true)
      [[ ",$allowed," == *",$code,"* ]] && status=up || status=down
    fi
    [ "$first" -eq 1 ] || echo ","
    first=0
    # ping: 条目不输出 url，避免 status.json 泄露 tailnet 内网地址
    local url="${3}"
    [[ "$url" == ping:* ]] && url="<internal>"
    printf '"%s":{"name":"%s","url":"%s","status":"%s"}' "$1" "$2" "$url" "$status"
  }
  check acepanel    "AcePanel"      "https://1p.roybase.top/admin" "200,302"
  check self        "个人主页"      "https://www.roybase.top" "200"
  check siyuan      "SiYuan"        "https://siyuan.roybase.com" "200,401"
  check itools      "IT Tools"      "https://itools.roybase.com"
  check lxc         "Linux Command" "https://lxc.roybase.com"
  check apf         "FreeLLMAPI"    "https://apf.roybase.com"
  check sou         "Hermes Search" "https://sou.roybase.com"
  check ai-mon      "模型监控"      "https://ai.roybase.com/healthz"
  check lc          "llama.cpp"     "https://lc.roybase.com" "200,401"
  check hm          "Hermes Agent"  "https://hm.roybase.com" "200,302"
  check claw        "OpenClaw"      "https://claw.roybase.com" "200,403"
  check homebox     "Homebox"       "https://nas.roybase.com"
  check lucky       "Lucky"         "https://lucky.roybase.com"
  check blog        "博客"          "https://blog.roybase.top" "200,302"
  check rp          "远程 pi"       "https://rp.roybase.top/health"
  check mirror      "镜像监控"      "https://mirror.roybase.top"
  check octo      "octo 小三子"     "https://octo.roybase.top/api/health" "200"
  echo ""
  echo "}"
} > "$TMP"
chmod 644 "$TMP"
chown 1000:1000 "$TMP" 2>/dev/null || true
mv "$TMP" "$OUT"
