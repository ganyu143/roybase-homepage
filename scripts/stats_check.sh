#!/usr/bin/env bash
# 服务器统计 → stats.json（部署到 /opt/homepage-status/，cron 每 10 分钟）
set -u
OUT="${OUT:-/opt/1panel/www/sites/home.roybase.top/data/stats.json}"
uptime_sec=$(awk '{print int($1)}' /proc/uptime)
load=$(cut -d' ' -f1 /proc/loadavg)
mem_total=$(awk '/MemTotal/{print $2}' /proc/meminfo)
mem_avail=$(awk '/MemAvailable/{print $2}' /proc/meminfo)
mem_pct=$(( (mem_total - mem_avail) * 100 / mem_total ))
printf '{"uptime_sec":%d,"load":%s,"mem_pct":%d,"ts":"%s"}\n' \
  "$uptime_sec" "$load" "$mem_pct" "$(date -Iseconds)" > "$OUT"