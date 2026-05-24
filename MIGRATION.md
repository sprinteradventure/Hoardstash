# HoardStash Naming Migration — Complete

## Summary
Migrated from `craftswap` → `hoardstash` across all local files.

---

## ✅ Changes Made (Local)

| File/Location | Change |
|--------------|--------|
| `workspace/` | Renamed directory `craftswap/` → `hoardstash/` |
| `hoardstash/README.md` | Updated title, domain, removed "TBD" domain line |
| `hoardstash/PROJECT_BREAKDOWN.md` | Fixed directory tree reference |
| `hoardstash/.next/` | Deleted (will regenerate with new paths) |
| `PROJECT_SWITCHER.md` | Updated paths |
| `TOOLS.md` | Updated project catalog |
| `MEMORY.md` | Logged migration |

---

## 🔴 External Changes Required

### 1. Vercel Project Name
**Location:** `.vercel/project.json`  
**Current:** `"projectName": "craftswap"`  
**Action:** Rename project in Vercel dashboard or via CLI:
```bash
vercel projects rename craftswap hoardstash
```

### 2. Git Remote (if pushing to GitHub)
**Current:** No remote configured  
**Action:** If you have a GitHub repo, update the remote URL:
```bash
git remote add origin https://github.com/YOURNAME/hoardstash.git
```

### 3. Supabase Project (Optional)
Check if Supabase project name needs updating at:  
https://supabase.com/dashboard/project/shtljdcrvtfedtaygmke/settings/general

---

## 🔄 Next Steps

1. **Deploy to Vercel** — Run `vercel` or push to trigger deployment
2. **Verify domain** — Ensure https://www.hoardstash.com is configured
3. **Test all flows** — Login, checkout, seller dashboard

---

## 📦 Verified Configs (Correct)

| Service | Status | Notes |
|---------|--------|-------|
| `package.json` name | ✅ | `"hoardstash"` |
| `NEXT_PUBLIC_URL` | ✅ | `https://www.hoardstash.com` |
| Supabase URL | ✅ | Active |
| Stripe keys | ✅ | Live keys present |

---

*Migration logged: 2026-03-29*
