<p align="center">
  中文 · <a href="README.md">English</a>
</p>

# AI 词典

适用于 [Wox 2](https://github.com/Wox-launcher/Wox) 的词典插件，使用任意 OpenAI 兼容接口生成详细词条。

## 功能

- **词条完整** — 词性、英音/美音（IPA）、释义（含英文对照）、常见搭配、用法提示
- **格式永远正确** — 结果卡片由插件自行渲染，不依赖模型输出的 Markdown
- **17 种释义语言** — 简体中文 / 繁體中文 / English / 日本語 / 한국어 / Français / Deutsch / Español / Italiano / Português / Nederlands / Русский / Polski / Українська / Türkçe / Tiếng Việt / Custom
- **划词查询** — 在任意位置选中单词即可直接查询
- **跨平台** — Windows / Linux / macOS

## 安装

将插件目录复制到 Wox 插件目录，例如：

```text
C:\Users\<用户名>\.wox\wox-user\plugins\dc59e6f7-2ec4-49f0-88d8-515f571e27d2@0.1.0
```

重启 Wox 后，进入 **设置 → 插件 → AI 词典**，填写**模型**和 **API Key**。

> **提示**：Wox 目前无法把 Node.js 插件的请求路由到「设置 → AI」，因此本插件直连接口，需要在这里单独填写自己的密钥。

## 使用

按 `Alt+Space` 打开 Wox，输入 `dic apple` 后按回车查询；再次按回车复制词条。

## 配置

| 设置 | 说明 |
| --- | --- |
| 模型 | 服务商提供的模型名，例如 `deepseek-v4-flash` |
| API Key | 调用 AI 必需 |
| API 接口地址 | OpenAI 兼容地址，例如 `https://api.deepseek.com` |
| 释义语言 | 简体中文 / 繁體中文 / English / 日本語 / 한국어 / Français / Deutsch / Español / Italiano / Português / Nederlands / Русский / Polski / Українська / Türkçe / Tiếng Việt / Custom |
| 自定义语言名称 | 仅当释义语言为「Custom」时生效 —— AI 用该语言书写释义，卡片标签保持英文结构 |
| 最大输出 token / 请求超时 | 建议 `350` / `30` |

## 开发

```bash
node --check index.js
node test/plugin.test.js
```
