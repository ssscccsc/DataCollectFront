# -*- coding: utf-8 -*-
import re

# 读取文件
with open('src/views/dashboard/index.vue', 'rb') as f:
    content_bytes = f.read()

# 尝试解码为UTF-8
try:
    content = content_bytes.decode('utf-8')
except:
    content = content_bytes.decode('utf-8', errors='ignore')

# 修复所有乱码字符的替换规则（使用更精确的匹配）
replacements = [
    # 城市和国家名称（精确匹配）
    (r"'哈尔[^']*':", "'哈尔滨':"),
    (r"'石家[^']*':", "'石家庄':"),
    (r"'意大[^']*':", "'意大利':"),
    (r"'俄罗[^']*':", "'俄罗斯':"),
    (r"'加拿[^']*':", "'加拿大':"),
    # HTML标签
    (r'\?/span>', '</span>'),
    (r'对话[^>]*>', '对话框 -->'),
    (r'统[^>]*>', '统计'),
    # 注释中的乱码
    (r'坐[^\s]*\s+const', '坐标\n    const'),
    (r'标[^\s]*\s+const', '标记\n    const'),
    (r'level=4[^\s)]*', 'level=4）'),
    (r'level=2[^\s)]*', 'level=2）'),
    (r'数据[^\s]*\s+const', '数据点\n        const'),
    (r'屏幕坐[^\s]*\s+option', '屏幕坐标\n            option'),
    (r'显示的坐[^\s]*\s+const', '显示的坐标\n              const'),
    (r'简化版[^\s]*\s+const', '简化版本\n              const'),
    (r'检测双[^\s]*\s+let', '检测双击\n          let'),
    (r'双击[^\s]*00ms内连续点击相同数据点[^\s]*\s+if', '双击（300ms内连续点击相同数据点）\n              if'),
    (r'第一次点[^\s]*\s+lastClickTime', '第一次点击\n                lastClickTime'),
    (r'包[^\s,]*', '包含'),
    (r'个国[^\s,]*地区', '个国家/地区'),
    (r'模式显[^\s,]*', '模式显示'),
    (r'保存[^\s,]*', '保存到'),
    (r'参[^\s,]*', '参考'),
    (r'0[^\s]*0小时', '0天0小时'),
]

for pattern, replacement in replacements:
    content = re.sub(pattern, replacement, content)

# 写入文件
with open('src/views/dashboard/index.vue', 'w', encoding='utf-8') as f:
    f.write(content)

print('编码修复完成')

