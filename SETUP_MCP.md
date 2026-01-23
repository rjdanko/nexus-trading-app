# MCP Server Setup Guide

This project includes a configuration file (`mcp-servers.json`) for connecting to Vercel and Supabase via the Model Context Protocol (MCP).

## Prerequisites

1.  **Vercel API Token**:
    *   Go to [Vercel Account Settings > Tokens](https://vercel.com/account/tokens).
    *   Create a new token with appropriate scopes.

2.  **Supabase Key**:
    *   You can use your `anon` key for public data, but for administrative tasks, you will need your `service_role` key.
    *   Find it in your Supabase Dashboard under **Project Settings > API**.

3.  **GitHub Personal Access Token**:
    *   Go to [GitHub Developer Settings > Personal Access Tokens (Classic)](https://github.com/settings/tokens).
    *   Generate a new token (classic) with the `repo` scope (for full control of private repositories) or public_repo (for public only).
    *   Copy the token immediately.

## Configuration

1.  Open `mcp-servers.json` in this directory.
2.  Replace `TODO_ENTER_YOUR_VERCEL_TOKEN` with your actual Vercel API token.
3.  Replace `TODO_ENTER_YOUR_SUPABASE_KEY` with your Supabase Key.
4.  Replace `TODO_ENTER_YOUR_GITHUB_TOKEN` with your GitHub Personal Access Token.

## Usage

### For Claude Desktop App:
1.  Open your Claude Desktop config file:
    *   **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
    *   **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
2.  Copy the contents of the `mcpServers` object from `mcp-servers.json` into the `mcpServers` object in your config file.

### For Other MCP Clients:
Refer to your client's documentation on how to import or define MCP servers. The configuration provided uses `npx` to run the latest versions of the official MCP servers for Vercel and Supabase.
