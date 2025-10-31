# Chrome Prompt API Setup Guide

## ⚡ Quick Start (3 Steps)

### Step 1: Enable Chrome Flag
1. Open Chrome Canary (version ≥ 121)
2. Navigate to: `chrome://flags/#prompt-api-for-gemini-nano`
3. Set to **Enabled**
4. **Restart Chrome** (Critical!)

### Step 2: Switch to localhost
```bash
# Start your server
python app.py

# ⚠️ MUST USE localhost (not 127.0.0.1)
✅ Correct:  http://localhost:5000/
❌ Wrong:    http://127.0.0.1:5000/
```

**Why?** Chrome treats `localhost` as a secure context for experimental APIs, but `127.0.0.1` is not.

### Step 3: Verify API Status
Open browser console (F12) and run:
```javascript
checkPromptAPI()
```

Expected output:
```
🔍 Chrome Prompt API Diagnostic Report
=====================================
📍 Current URL: http://localhost:5000/
🔒 Secure Context: ✅ YES
🤖 window.ai: ✅ Exists
🧠 languageModel: ✅ Available
```

---

## 🔧 Troubleshooting

### Problem 1: `window.ai` is undefined

**Symptoms:**
- Console shows: `🤖 window.ai: ❌ Undefined`

**Solutions:**
1. Confirm flag is enabled: `chrome://flags/#prompt-api-for-gemini-nano`
2. **Restart Chrome completely** (close all windows)
3. Wait 1-2 minutes for model download (first time only)
4. Check: `chrome://components/` → "Optimization Guide On Device Model" should show version

### Problem 2: Not a Secure Context

**Symptoms:**
- Console shows: `🔒 Secure Context: ❌ NO`
- Error: "Chrome Prompt API is NOT available"

**Solutions:**

#### Option A: Use localhost (Easiest)
```bash
# Make sure you're accessing via localhost
http://localhost:5000/   # ✅ Works
http://127.0.0.1:5000/   # ❌ Doesn't work
```

#### Option B: Setup Local HTTPS
```bash
# Install mkcert
brew install mkcert  # macOS
# or download from: https://github.com/FiloSottile/mkcert

# Generate certificates
mkcert -install
mkcert localhost 127.0.0.1

# Update Flask to use HTTPS
# app.py:
app.run(
    host='0.0.0.0',
    port=5000,
    ssl_context=('localhost+1.pem', 'localhost+1-key.pem')
)

# Access via HTTPS
https://localhost:5000/
```

### Problem 3: Model Not Downloading

**Symptoms:**
- Flag enabled, but API still unavailable after 5+ minutes

**Solutions:**
1. Check Chrome version: Must be ≥ 121
2. Check internet connection (model downloads from Google servers)
3. Manually trigger download:
   ```javascript
   // In console:
   await window.ai.languageModel.create()
   ```
4. Check download status: `chrome://components/`

---

## 🎯 Testing Checklist

- [ ] Chrome Canary installed (version ≥ 121)
- [ ] Flag enabled: `chrome://flags/#prompt-api-for-gemini-nano`
- [ ] Chrome restarted after enabling flag
- [ ] Server running on port 5000
- [ ] Accessing via `http://localhost:5000/` (not 127.0.0.1)
- [ ] `window.isSecureContext === true` in console
- [ ] `window.ai` is defined (not undefined)
- [ ] `checkPromptAPI()` shows all ✅

---

## 💡 Quick Tips

### Check API Status Anytime
```javascript
// In browser console:
checkPromptAPI()
```

### Test API Directly
```javascript
// In browser console:
const session = await window.ai.languageModel.create();
const response = await session.prompt("What is right of way?");
console.log(response);
```

### View Server Logs
When you start the server, you should see:
```
============================================================
🚀 LicensePrep Server Starting...
============================================================
📍 Access URL: http://localhost:5000/
⚠️  For Chrome Prompt API, MUST use 'localhost' not '127.0.0.1'
============================================================
```

---

## 📊 Expected Behavior

### When API is Working:
1. Ask a question in the Q&A form
2. See loading animation
3. Get structured answer with:
   - 📋 Answer
   - 💡 Explanation
   - 📝 Examples
   - 🔗 Related Topics

### When API is Not Working:
- Detailed error message with:
  - Current environment info
  - Specific problem detected
  - Step-by-step fix instructions

---

## 🚨 Common Mistakes

| Mistake | Impact | Solution |
|---------|--------|----------|
| Using `127.0.0.1` | API unavailable | Use `localhost` |
| Not restarting Chrome | Flag not applied | Close ALL Chrome windows |
| HTTP on remote server | Not secure context | Use HTTPS |
| Old Chrome version | API doesn't exist | Update to Canary ≥ 121 |

---

## 📞 Still Not Working?

1. **Run diagnostic:**
   ```javascript
   checkPromptAPI()
   ```

2. **Check console logs:**
   - Look for `[QA]` prefixed messages
   - Note any error messages

3. **Verify environment:**
   ```javascript
   console.log('URL:', window.location.href);
   console.log('Secure:', window.isSecureContext);
   console.log('API:', window.ai);
   ```

4. **Try simple test:**
   ```javascript
   // This should work if API is available:
   window.ai.languageModel.create().then(s => 
     console.log('✅ API Working!')
   ).catch(e => 
     console.log('❌ Error:', e.message)
   );
   ```

---

## 📚 Additional Resources

- [Chrome Built-in AI Documentation](https://developer.chrome.com/docs/ai/built-in)
- [Origin Trials Guide](https://developer.chrome.com/origintrials/)
- [Web Security: Secure Contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts)
- [mkcert - Local HTTPS Setup](https://github.com/FiloSottile/mkcert)

---

**Last Updated:** 2025-10-22  
**Chrome Version Required:** ≥ 121 (Canary)



