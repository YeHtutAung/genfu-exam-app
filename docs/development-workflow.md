# Development Workflow

## Encoding

Project source files are UTF-8. If Japanese text appears garbled in PowerShell, switch the session to UTF-8 before reviewing file contents:

```powershell
chcp 65001
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [System.Text.UTF8Encoding]::new()
```

When checking whether a file is actually corrupted, verify with Node instead of relying on terminal rendering:

```powershell
node -e "const fs=require('fs'); const s=fs.readFileSync('src/pages/Exam.jsx','utf8'); console.log(!s.includes('\uFFFD'))"
```

## Admin API Smoke Test

The admin upload APIs must reject anonymous users, reject normal users, and allow admins through the authorization layer.

Run against a deployed or preview URL:

```powershell
$env:SMOKE_BASE_URL='https://your-preview.vercel.app'
$env:SMOKE_USER_TOKEN='normal-user-access-token'
$env:SMOKE_ADMIN_TOKEN='admin-access-token'
npm run smoke:admin-auth
```

`SMOKE_USER_TOKEN` and `SMOKE_ADMIN_TOKEN` are Supabase access tokens. The admin token must belong to a user whose `profiles.role` is `admin`.

If only `SMOKE_BASE_URL` is set, the script still verifies that anonymous requests return `401`.
