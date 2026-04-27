# 项目上下文

### 项目概述

基于Coze的虚拟货币合约量化交易系统 Web管理平台，采用三层混合架构设计。

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts

## 目录结构

```
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
├── src/
│   ├── app/                # 页面路由
│   │   ├── page.tsx        # 首页 - 系统概览
│   │   ├── architecture/    # 三层混合架构页面
│   │   ├── strategies/     # 策略管理页面
│   │   ├── signals/         # 信号监控页面
│   │   ├── risk/           # 风控仪表盘页面
│   │   ├── simulation/      # 模拟盘页面
│   │   └── data/           # 数据看板页面
│   ├── components/
│   │   ├── layout/         # 布局组件
│   │   │   ├── app-layout.tsx
│   │   │   └── sidebar.tsx
│   │   ├── dashboard/      # 仪表盘组件
│   │   ├── architecture/   # 架构组件
│   │   ├── strategies/     # 策略组件
│   │   ├── signals/         # 信号组件
│   │   ├── risk/           # 风控组件
│   │   ├── simulation/      # 模拟盘组件
│   │   └── data/           # 数据组件
│   ├── hooks/              # 自定义Hooks
│   └── lib/                # 工具库
```

## 功能模块

### 1. 系统概览 (/)
- 收益率曲线展示
- 策略分布饼图
- 市场体制识别
- 系统健康状态监控
- 最近告警列表

### 2. 三层混合架构 (/architecture)
- Coze平台层可视化
- 云端核心计算层可视化
- 本地安全执行层可视化
- 数据流向示意
- 权限边界说明

### 3. 策略管理 (/strategies)
- 15个异构原子策略展示
- 低杠杆套利策略 (2-3x)
- 中杠杆趋势/动量策略 (5-8x)
- 高杠杆波动率策略 (10-15x)
- TFT元融合模型状态
- PPO资金分配裁判

### 4. 信号监控 (/signals)
- 实时K线图表
- TFT融合信号强度
- 最新交易信号列表
- 市场体制识别 (HMM)
- 多交易对切换

### 5. 风控仪表盘 (/risk)
- 五级熔断器可视化
  - L1: 策略回撤熔断 (20%)
  - L2: 策略平仓熔断 (30%)
  - L3: 单币亏损熔断 (5%)
  - L4: 保证金预警 (85%)
  - L5: 组合回撤熔断 (15%)
- 合约专项攻防模块
- 系统组件状态
- 紧急操作按钮

### 6. 模拟盘 (/simulation)
- 虚拟资金100万U
- 收益曲线
- 灰度上线进度
- 实盘准入条件
- 当前持仓管理
- 交易记录

### 7. 数据看板 (/data)
- 8个数据源状态监控
  - Binance, OKX, Bybit
  - CoinGlass, Glassnode, CryptoQuant
  - LunarCrush, The Tie
- API配额使用情况
- 市场数据表格
- 链上指标展示
- 200+技术指标库

## 开发规范

### 包管理
- **pnpm**: 必须使用 pnpm 作为包管理器

### 组件开发
- 使用 shadcn/ui 组件库
- 使用 "use client" 指令标记客户端组件
- 禁止在服务端组件中使用动态数据

### 类型定义
- 必须为所有函数参数和返回值定义类型
- 禁止使用 `any` 类型

## 常用命令

```bash
pnpm install     # 安装依赖
pnpm dev         # 启动开发服务器
pnpm build       # 构建生产版本
pnpm lint        # 代码检查
```
