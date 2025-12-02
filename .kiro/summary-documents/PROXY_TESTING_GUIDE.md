# Proxy Server Testing Guide

## Quick Answer to Your Questions

### Q1: How do I make sure my SOAP API frontend + backend logic is correct?

**Answer:** Run these tests in order:

1. **Unit Tests** (5 min)
   ```bash
   cd backend
   pytest tests/test_wsdl_analyzer.py -v
   pytest tests/test_soap_xml_analyzer.py -v
   ```

2. **Live SOAP API Test** (2 min)
   ```bash
   ./test_soap_validation.sh
   ```

3. **End-to-End Test** (10 min)
   - Upload a WSDL file in your app
   - Generate portal
   - Download project
   - Configure with SOAP endpoint
   - Test CRUD operations in browser

### Q2: How can I be sure my proxy server works for both REST and SOAP?

**Answer:** Test both scenarios:

---

## REST API Proxy Testing

### Test 1: JSONPlaceholder (REST)

This is what you already tested successfully! ✅

```bash
# 1. Download project with REST API
# 2. Config should look like:
{
  "baseUrl": "https://jsonplaceholder.typicode.com",
  "apiType": "rest",
  "auth": { "mode": "none" },
  "resources": [
    {
      "name": "users",
      "endpoint": "/users",
      "operations": {
        "list": { "method": "GET", "path": "/users" },
        "detail": { "method": "GET", "path": "/users/{id}" }
      }
    }
  ]
}

# 3. Test it:
curl http://localhost:4000/proxy/users
curl http://localhost:4000/proxy/users/1
```

**Expected:** JSON data from JSONPlaceholder ✅

---

## SOAP API Proxy Testing

### Test 2: Country Info Service (SOAP)

```bash
# 1. Analyze SOAP API in your app
# Use WSDL: http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?WSDL

# 2. Generate and download project

# 3. Edit proxy-server/config.json:
{
  "baseUrl": "http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso",
  "apiType": "soap",
  "soapNamespace": "http://www.oorsprong.org/websamples.countryinfo",
  "auth": {
    "mode": "none"
  },
  "resources": [
    {
      "name": "countries",
      "endpoint": "/",
      "operations": {
        "list": {
          "method": "POST",
          "soapAction": "ListOfCountryNamesByName",
          "soapOperation": "ListOfCountryNamesByName"
        }
      },
      "fieldMappings": []
    }
  ]
}

# 4. Start servers
./start.sh

# 5. Test proxy (REST → SOAP translation)
curl http://localhost:4000/proxy/countries

# 6. Test in browser
# Open http://localhost:5173
# Click "Countries"
# Should see list of countries from SOAP API
```

**Expected:** 
- Proxy receives REST GET request
- Proxy builds SOAP envelope
- Proxy calls SOAP endpoint
- Proxy parses SOAP response
- Proxy returns JSON to frontend
- Frontend displays data ✅

---

## Comprehensive Proxy Test Matrix

| Test Case | API Type | Auth | Status | How to Test |
|-----------|----------|------|--------|-------------|
| REST - List | REST | None | ✅ Tested | JSONPlaceholder /users |
| REST - Detail | REST | None | ✅ Tested | JSONPlaceholder /users/1 |
| REST - Create | REST | None | ⚠️ Need to test | POST to JSONPlaceholder |
| REST - Bearer Auth | REST | Bearer | ❌ Not tested | Need API with auth |
| SOAP - List | SOAP | None | ⚠️ Need to test | Country Info Service |
| SOAP - Detail | SOAP | None | ❌ Not tested | Need SOAP API |
| SOAP - Create | SOAP | None | ❌ Not tested | Need SOAP API |
| SOAP - WSSE Auth | SOAP | WSSE | ❌ Not tested | Need secured SOAP API |
| SOAP - Field Mapping | SOAP | None | ❌ Not tested | Need SOAP with weird field names |

---

## Step-by-Step: Test SOAP Proxy Right Now

### Prerequisites
```bash
# Make sure backend is running
cd backend
uvicorn app.main:app --reload

# In another terminal, make sure frontend is running
cd frontend
npm run dev
```

### Step 1: Analyze SOAP API

1. Go to http://localhost:5173
2. Click "SOAP Analyzer" (or navigate to analyzer)
3. Select "WSDL URL" mode
4. Enter: `http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?WSDL`
5. Click "Analyze"
6. Verify you see operations like "ListOfCountryNamesByName"

### Step 2: Generate Portal

1. Click "Generate Portal"
2. Verify resources are created
3. Click "Download Project"

### Step 3: Configure SOAP Proxy

```bash
# Extract downloaded project
cd ~/Downloads
unzip admin-portal-*.zip
cd admin-portal-*

# Edit proxy-server/config.json
# Replace with SOAP configuration (see above)

# Make sure it has:
# - "apiType": "soap"
# - "soapNamespace": "..."
# - "soapAction" in operations
```

### Step 4: Test Proxy

```bash
# Start servers
chmod +x start.sh
./start.sh

# In another terminal, test proxy directly
curl http://localhost:4000/health
# Should return: {"status":"ok"}

curl http://localhost:4000/proxy/countries
# Should return: JSON array of countries (converted from SOAP)
```

### Step 5: Test in Browser

1. Open http://localhost:5173 (or whatever port Vite shows)
2. Click on "Countries" in sidebar
3. **Expected:** Table showing countries from SOAP API
4. **If it works:** Your SOAP proxy is working! 🎉

---

## Debugging SOAP Proxy Issues

### Issue: "SOAP call failed"

**Check:**
```bash
# 1. Is the SOAP endpoint reachable?
curl http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso

# 2. Check proxy logs
# Look at terminal where ./start.sh is running
# Should see SOAP request/response logs

# 3. Test SOAP call manually
curl -X POST http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso \
  -H "Content-Type: text/xml" \
  -d '<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ListOfCountryNamesByName xmlns="http://www.oorsprong.org/websamples.countryinfo">
    </ListOfCountryNamesByName>
  </soap:Body>
</soap:Envelope>'
```

### Issue: "Data not showing in UI"

**Check:**
```bash
# 1. Does proxy return data?
curl http://localhost:4000/proxy/countries

# 2. Check browser console
# Open DevTools → Console
# Look for errors

# 3. Check Network tab
# See what request frontend is making
# See what response it's getting
```

### Issue: "Field names are wrong"

**Solution:** Add field mappings

```json
{
  "resources": [
    {
      "name": "countries",
      "fieldMappings": [
        {
          "normalizedName": "country_name",
          "legacyName": "sName"
        },
        {
          "normalizedName": "country_code",
          "legacyName": "sISOCode"
        }
      ]
    }
  ]
}
```

---

## Production Readiness Checklist

### For REST APIs ✅
- [x] Can proxy GET requests
- [x] Can proxy POST requests
- [x] Can proxy PUT requests
- [x] Can proxy DELETE requests
- [x] Handles errors gracefully
- [x] Field mapping works
- [x] Auth headers are added correctly

### For SOAP APIs ⚠️
- [ ] Can parse WSDL files
- [ ] Can build SOAP envelopes
- [ ] Can parse SOAP responses
- [ ] Can handle SOAP faults
- [ ] WSSE authentication works
- [ ] Field mapping works with SOAP
- [ ] Handles nested SOAP objects
- [ ] Handles SOAP arrays

### General ✅
- [x] Proxy starts without errors
- [x] Config validation works
- [x] CORS is configured correctly
- [x] Error messages are helpful
- [x] Logging is useful for debugging

---

## Quick Validation Commands

```bash
# Test REST proxy
curl http://localhost:4000/proxy/users

# Test SOAP proxy
curl http://localhost:4000/proxy/countries

# Test health check
curl http://localhost:4000/health

# Test with verbose output
curl -v http://localhost:4000/proxy/users

# Test POST
curl -X POST http://localhost:4000/proxy/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'
```

---

## Real-World SOAP Testing

### Find Real SOAP APIs

1. **Public SOAP APIs:**
   - Country Info: http://webservices.oorsprong.org/
   - Calculator: http://www.dneonline.com/calculator.asmx
   - Weather (various providers)

2. **Your Own Legacy Systems:**
   - If you have access to internal SOAP APIs
   - Best for realistic testing

3. **Mock SOAP Server:**
   - Create your own for controlled testing
   - See SOAP_VALIDATION_STRATEGY.md

### Test Checklist

For each SOAP API you test:

- [ ] WSDL analysis works
- [ ] Can make SOAP calls
- [ ] Response parsing works
- [ ] Data displays in UI
- [ ] CRUD operations work
- [ ] Authentication works (if required)
- [ ] Error handling works

---

## Success Criteria

Your proxy is production-ready when:

✅ **REST APIs:**
- Works with JSONPlaceholder (public API)
- Works with at least 2 other public REST APIs
- All CRUD operations work
- Authentication works (Bearer, API Key)

✅ **SOAP APIs:**
- Works with Country Info Service
- Works with at least 1 other public SOAP API
- Can parse common WSDL patterns
- SOAP → JSON conversion works
- Basic authentication works

✅ **General:**
- No crashes with malformed data
- Error messages are clear
- Configuration is intuitive
- Downloaded projects work immediately

---

## Next Steps

1. **Run the validation script:**
   ```bash
   ./test_soap_validation.sh
   ```

2. **Test SOAP proxy manually** (follow Step-by-Step above)

3. **Document any issues** you find

4. **Fix critical bugs** before demo/submission

5. **Create demo video** showing:
   - REST API working (JSONPlaceholder)
   - SOAP API working (Country Info)
   - Full download → configure → run flow

---

**Remember:** You don't need to support every edge case. Focus on proving that the core concept works for the most common scenarios!
