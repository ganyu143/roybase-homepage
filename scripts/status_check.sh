#!/usr/bin/env bash
# 服务状态检查 → status.json（部署到服务器 /opt/homepage-status/，cron 每 5 分钟）
set -u
OUT="${OUT:-/opt/1panel/www/sites/roybase-homepage/index/data/status.json}"
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
    printf '"%s":{"name":"%s","url":"%s","status":"%s"}' "$1" "$2" "$3" "$status"
  }
  check 1panel      "1Panel"        "https://1p.roybase.top"
  check term        "Web Terminal"  "https://term.roybase.top" "200,401"
  check 1panel-aipc "1Panel (aipc)" "https://www.roybase.com"
  check nas         "NAS"           "ping:100.88.88.2"
  check siyuan      "SiYuan"        "https://siyuan.roybase.com" "200,401"
  check itools      "IT Tools"      "https://itools.roybase.com"
  check lxc         "Linux Command" "https://lxc.roybase.com"
  check apf         "FreeLLMAPI"    "https://apf.roybase.com"
  check sou         "Hermes Search" "https://sou.roybase.com"
  check dsh         "DSH"           "https://dsh.roybase.top" "200,401"
  check dsh-aipc    "DSH (aipc)"    "https://dsh.roybase.com" "200,401"
  check lc          "llama.cpp"     "https://lc.roybase.com" "200,401"
  check dpan        "dPanel"        "https://dpan.roybase.com"
  check hm          "Hermes Agent"  "https://hm.roybase.com" "200,302"
  check claw        "OpenClaw"      "https://claw.roybase.com" "200,403"
  check homebox     "Homebox"       "https://nas.roybase.com"
  check bitwarden   "Bitwarden"     "https://tw.roybase.top"
  check lucky       "Lucky"         "https://lucky.roybase.com"
  echo ""
  echo "}"
} > "$TMP"
mv "$TMP" "$OUT"
