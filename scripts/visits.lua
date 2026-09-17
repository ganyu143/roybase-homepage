-- /api/visits 访问计数。文件读改写，并发精度到天级（个人站流量可忽略）。
-- 部署时以 content_by_lua_block 内联进 vhost（任务 8），路径用容器内 /www 前缀。
local path = "/www/sites/roybase-homepage/index/data/visits.count"
local f = io.open(path, "r")
local n = 0
if f then n = tonumber(f:read("*a")) or 0; f:close() end
n = n + 1
local w = io.open(path, "w")
w:write(tostring(n)); w:close()
ngx.header.content_type = "application/json"
ngx.say('{"visits":' .. n .. '}')
