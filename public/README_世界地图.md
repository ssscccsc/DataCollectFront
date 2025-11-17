# 世界地图数据使用说明

## 当前状态

当前 `world.json` 文件为空占位符，需要下载真实的世界地图数据才能显示完整地图。

## 快速获取地图数据的方法

### 方法1：使用推荐的CDN（最简单）

打开浏览器，访问以下URL之一，然后将JSON内容保存为 `world.json`：

1. **推荐**：https://cdn.jsdelivr.net/npm/echarts@5/map/json/world.json
2. 备选：https://unpkg.com/echarts@5/map/json/world.json

**操作步骤：**
1. 在浏览器中打开上述URL
2. 右键 -> "另存为" 或复制JSON内容
3. 保存为 `world.json` 到 `public` 目录

### 方法2：从GitHub下载

1. 访问：https://github.com/apache/echarts/tree/master/map/json
2. 找到 `world.json` 文件
3. 点击 "Raw" 按钮获取原始文件
4. 保存到本地 `public` 目录

### 方法3：使用命令行下载（如果网络可用）

```bash
# Windows PowerShell
Invoke-WebRequest -Uri "https://cdn.jsdelivr.net/npm/echarts@5/map/json/world.json" -OutFile "public/world.json"

# Linux/Mac
curl -o public/world.json https://cdn.jsdelivr.net/npm/echarts@5/map/json/world.json
```

### 方法4：手动创建最小地图数据

如果无法下载，可以创建一个包含主要国家的基本地图。

## 地图功能说明

### 当前功能
- ✅ 从本地 `public/world.json` 加载地图数据
- ✅ 自动检测地图数据是否有效
- ✅ 如果没有地图数据，使用散点图模式显示标记点
- ✅ 支持显示城市和国家标记（基于地域管理数据）
- ✅ 双击标记点查看统计信息（APP数量、采集次数、执行机数量）

### 地图配置
- **初始缩放级别**：1.2
- **初始中心点**：[105, 36]（亚洲区域）
- **支持操作**：缩放、拖拽
- **标记点样式**：蓝色圆点，显示地名标签

### 地域标记
- **城市级别**（level=4）：在地图上显示为标记点
- **国家级别**（level=2）：在地图上显示为标记点
- **坐标映射**：使用内置的城市和国家坐标映射表

## 验证地图数据

下载地图数据后，在浏览器控制台（F12）中会看到：
```
世界地图数据加载成功，包含 XXX 个国家/地区
```

如果没有看到此消息，说明地图数据未正确加载，将使用散点图模式。

## 文件位置

```
DataCollectFront/
└── public/
    ├── world.json          # 世界地图数据文件（需手动下载）
    └── README_世界地图.md   # 本说明文件
```

## 技术支持

如果遇到问题：
1. 检查浏览器控制台的错误信息
2. 确认 `world.json` 文件格式正确（有效的GeoJSON格式）
3. 确认文件路径正确（在 `public` 目录下）
4. 尝试重新启动开发服务器

















