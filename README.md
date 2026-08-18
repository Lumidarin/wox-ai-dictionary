<p align="center">
  <a href="README.zh-CN.md">中文</a> · English
</p>

# AI Dictionary

A dictionary plugin for [Wox 2](https://github.com/Wox-launcher/Wox) that generates detailed dictionary entries with any OpenAI-compatible API.

## Features

- **Complete entries** — part of speech, British & American pronunciation (IPA), meanings with English glosses, common collocations, and usage notes
- **Always clean formatting** — the plugin renders the result card itself, so the layout stays correct no matter which model you use
- **17 explanation languages** — 简体中文 / 繁體中文 / English / 日本語 / 한국어 / Français / Deutsch / Español / Italiano / Português / Nederlands / Русский / Polski / Українська / Türkçe / Tiếng Việt / Custom
- **Look up selected text** — select any word anywhere and query it directly
- **Cross-platform** — Windows, Linux, macOS

## Install

Copy the plugin folder to your Wox plugins directory, for example:

```text
C:\Users\<your-name>\.wox\wox-user\plugins\dc59e6f7-2ec4-49f0-88d8-515f571e27d2@0.1.0
```

Restart Wox, then go to **Settings → Plugins → AI Dictionary** and fill in the **Model** and **API Key**.

> **Note**: Wox currently cannot route Node.js plugin requests through **Settings → AI**, so this plugin calls the API directly and needs its own key.

## Usage

Press `Alt+Space`, type `dic apple`, then press `Enter` to look up the word. Press `Enter` again to copy the entry.

## Configuration

| Setting | Description |
| --- | --- |
| Model | Model name from your provider, e.g. `deepseek-v4-flash` |
| API Key | Required for AI lookups |
| API Base URL | OpenAI-compatible endpoint, e.g. `https://api.deepseek.com` |
| Explanation Language | 简体中文 / 繁體中文 / English / 日本語 / 한국어 / Français / Deutsch / Español / Italiano / Português / Nederlands / Русский / Polski / Українська / Türkçe / Tiếng Việt / Custom |
| Custom Language Name | Only used when Explanation Language is Custom — the AI writes definitions in this language, card labels stay in English |
| Max Tokens / Timeout | Recommended: `350` / `30` |

## Development

```bash
node --check index.js
node test/plugin.test.js
```
