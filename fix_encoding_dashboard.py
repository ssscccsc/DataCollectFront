# -*- coding: utf-8 -*-
import re

file_path = 'src/views/dashboard/index.vue'

# Read the file in binary mode to handle encoding issues
with open(file_path, 'rb') as f:
    content_bytes = f.read()

# Decode with 'latin-1' to preserve all bytes, then replace known problematic patterns
content = content_bytes.decode('latin-1')

# Define replacements for known garbled characters and patterns
replacements = {
    '哈尔?': '哈尔滨',
    '石家?': '石家庄',
    '意大?': '意大利',
    '俄罗?': '俄罗斯',
    '加拿?': '加拿大',
    '标?': '标记',
    'level=4?': 'level=4）',
    'level=2?': 'level=2）',
    '数据?': '数据点',
    '屏幕坐?': '屏幕坐标',
    '显示的坐?': '显示的坐标',
    '简化版?': '简化版本',
    '检测双?': '检测双击',
    '双击?00ms内连续点击相同数据点?': '双击（300ms内连续点击相同数据点）',
    '第一次点?': '第一次点击',
    '包?': '包含',
    '个国?地区': '个国家/地区',
    '模式显?': '模式显示',
    '保存?': '保存到',
    '参?': '参考',
    '0?0小时 0分钟': '0天0小时 0分钟',
    '对话?': '对话框',
    '统?': '统计',
}

for old, new in replacements.items():
    content = content.replace(old, new)

# Encode back to UTF-8 for saving
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Encoding fixed!')











