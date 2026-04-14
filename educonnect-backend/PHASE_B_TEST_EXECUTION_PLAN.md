# PHASE B: COMPREHENSIVE TESTING - EXECUTION PLAN

## Status: Ready to Execute

**Last Updated:** 2026-04-14  
**Phase A Status:** ✅ COMPLETE (All 5 controllers standardized)  
**Server Status:** Started  

---

## 🚀 QUICK START

### Prerequisites Check:
```bash
# 1. Server should be running
# PID: [check background task]

# 2. Postman collection ready
# File: POSTMAN_COLLECTION.json (14KB with 20+ endpoints)

# 3. Test the connection
curl http://localhost:5000/health || echo "Server not responding"
```

### Environment Setup:
```
baseUrl: http://localhost:5000
adminEmail: admin@educonnect.com
adminPassword: Gayatri@#$123321
```

---

## 📊 PHASE B TEST SCOPE

### Coverage Map:
| Endpoint Category | Endpoints | Auth | Validation | XSS | Pagination | Status |
|---|---|---|---|---|---|---|
| **Events (5)** | Create, List, Update, Delete, Join | ✅ | ✅ | N/A | ✅ | Ready |
| **Messages (4)** | Send, Get, Mark Seen, Delete | ✅ | ✅ | ✅ | ✅ | Ready |
| **Jobs (4)** | Create, List, Eligibility, Delete | ✅ | ✅ | N/A | ✅ | Ready |
| **Posts (4)** | Create, Get, Update, Delete | ✅ | ✅ | ✅ | ✅ | Ready |
| **Resources (5)** | Upload, List, Update, Delete, Like | ✅ | ✅ | ✅ | ✅ | Ready |

**Total Endpoints to Test:** 22+  
**Critical Test Scenarios:** 35+  

---

## ✅ TEST EXECUTION CHECKLIST

### Test Set 1: Authorization & Security (CRITICAL)

#### 1.1 Event Authorization
- [ ] Non-owner cannot update event (403 Forbidden)
- [ ] Non-owner cannot delete event (403 Forbidden)
- [ ] Only creator can update title/description (200 OK)
- [ ] Event capacity enforced (400 when full)

#### 1.2 Message Authorization
- [ ] Cannot delete others' messages (403 Forbidden)
- [ ] Can delete own messages (200 OK with soft delete)
- [ ] XSS payload neutralized: `<script>alert('xss')</script>` stripped
- [ ] Unauthorized users see 403 on private operations

#### 1.3 Job Authorization
- [ ] Non-admin cannot create job (403 Forbidden)
- [ ] Admin can create job (201 Created)
- [ ] Non-admin cannot delete job (403 Forbidden)
- [ ] Admin can delete job (200 OK)

#### 1.4 Post Authorization
- [ ] Non-author cannot edit post (403 Forbidden)
- [ ] Author can edit post (200 OK)
- [ ] Non-author cannot delete post (403 Forbidden)
- [ ] Comment deletion by author works (200 OK)

#### 1.5 Resource Authorization
- [ ] Non-owner cannot update resource (403 Forbidden)
- [ ] Non-owner cannot delete resource (403 Forbidden)
- [ ] Owner can update (200 OK)
- [ ] Owner can delete (200 OK)

---

### Test Set 2: Input Validation (CRITICAL)

#### 2.1 Required Fields
- [ ] Event create without title → 400 Validation Error
- [ ] Event create without date → 400 Validation Error
- [ ] Message send without text → 400 Validation Error
- [ ] Job create without title → 400 Validation Error
- [ ] Post create without content → 400 Validation Error

#### 2.2 Field Formats
- [ ] Invalid date format → 400 Validation Error
- [ ] Non-existent user ID → 404 Not Found
- [ ] Invalid email format → 400 Validation Error
- [ ] Missing required fields trigger validation (all endpoints)

#### 2.3 XSS Protection
- [ ] Script tags removed from message text
- [ ] HTML entities escaped in post content
- [ ] Comment text sanitized: `<img src=x onerror=alert('xss')>` → neutralized
- [ ] Description field sanitized in resources

---

### Test Set 3: Response Format Consistency (IMPORTANT)

#### 3.1 Success Responses (2xx)
All success responses should have:
```json
{
  "success": true,
  "message": "descriptive message",
  "data": { /* actual data */ }
}
```

Tests:
- [ ] Event create returns 201 with data
- [ ] Message send returns 201 with data
- [ ] Event list returns 200 with pagination
- [ ] Resource update returns 200 with updated data

#### 3.2 Error Responses (4xx/5xx)
All error responses should have:
```json
{
  "success": false,
  "message": "error description",
  "error": { /* error details */ }
}
```

Tests:
- [ ] 400 Bad Request has error field
- [ ] 403 Forbidden has error field
- [ ] 404 Not Found has error field
- [ ] 500 Server Error has error field

---

### Test Set 4: Data Integrity (IMPORTANT)

#### 4.1 Pagination Works
- [ ] GET /api/events?page=1&limit=5 → Returns 5 events
- [ ] GET /api/jobs?page=2&limit=10 → Correct skip/limit
- [ ] GET /api/messages?page=1 → Sorted by date
- [ ] Pagination object includes: page, limit, total, totalPages

#### 4.2 Ownership Tracking
- [ ] Event uploadedBy preserved
- [ ] Post uid tracked correctly
- [ ] Message sender/receiver correct
- [ ] Resource uploadedBy correct

#### 4.3 Timestamps
- [ ] createdAt timestamp present on new resources
- [ ] updatedAt timestamp updated on edits
- [ ] seenAt timestamp on messages marked seen
- [ ] All dates in ISO format

---

### Test Set 5: Performance & Edge Cases (NICE TO HAVE)

#### 5.1 Bulk Operations
- [ ] Pagination with 1000s of records (test page 100)
- [ ] Large file upload (test 10MB limit enforcement)
- [ ] Bulk message query (page through 500+ messages)

#### 5.2 Edge Cases
- [ ] Empty string fields handled gracefully
- [ ] Null values in optional fields
- [ ] SQL/NoSQL injection attempts blocked
- [ ] Very long strings truncated or rejected

---

## 🧪 MANUAL TEST EXECUTION STEPS

### Step 1: Admin Login
```
POST /api/admin/login
Headers:
  Content-Type: application/json

Body:
{
  "email": "admin@educonnect.com",
  "password": "Gayatri@#$123321"
}

Expected:
✅ 200 OK
✅ Response has sessionToken
✅ Save sessionToken for admin endpoints
```

### Step 2: Test Event Create (Public)
```
POST /api/events
Headers:
  Content-Type: multipart/form-data

Body:
  title: "Phase B Test Event"
  description: "Testing standardized responses"
  date: "2024-05-20"
  location: "Test Hall"
  uid: "test_user"
  capacity: 50

Expected:
✅ 201 Created
✅ Has eventId in response
✅ eventStatus = "active"
✅ Response format: {success: true, message, data}
```

### Step 3: Test Authorization (Critical)
```
Test Event Update by Different User:
PUT /api/events/:eventId
Body:
{
  uid: "different_user",
  title: "Hacked"
}

Expected:
✅ 403 Forbidden
✅ Message: "Not authorized"
```

### Step 4: Test XSS Protection (Critical)
```
POST /api/messages
body:
{
  sender: "user1",
  receiver: "user2",
  text: "<script>alert('XSS')</script>Hello"
}

Expected:
✅ 201 Created
✅ Message text has script tags removed/escaped
✅ Response success: true
```

### Step 5: Test Pagination
```
GET /api/events?page=1&limit=5

Expected:
✅ 200 OK
✅ Returns up to 5 events
✅ Pagination object present:
   {page: 1, limit: 5, total: X, totalPages: Y}
```

---

## 📋 ASSERTION TEMPLATE

For each endpoint test, verify:

```
✅ Status Code: [200/201/400/403/404]
✅ Response Format:
   - success: boolean
   - message: string (descriptive)
   - data: object (if applicable)
   - error: object (on failure)
✅ Authorization: [if applicable]
   - Correct user can access
   - Wrong user gets 403
✅ Validation: [if applicable]
   - Empty required fields → 400
   - Invalid format → 400
✅ XSS Protection: [if applicable]
   - Script tags neutralized
   - HTML escaped
✅ Data Integrity:
   - Timestamps correct
   - IDs match requests
   - Relationships intact
```

---

## 🔍 KEY VALIDATION POINTS

### Authorization (Ownership)
- Event: Only creator can edit/delete
- Message: Only sender can delete
- Post: Only author can edit/delete
- Job: Only admins can create/delete
- Resource: Only uploader can edit/delete

### Validation Rules
- Title/name fields: required, non-empty
- Dates: valid ISO format
- IDs: valid MongoDB ObjectId
- UIDs: non-empty strings
- Text fields: sanitized for XSS

### Response Consistency
- All endpoints use same format
- All errors have consistent structure
- Status codes reflect actual state
- Pagination present on list endpoints

---

## 📊 TEST REPORT TEMPLATE

```
PHASE B TEST EXECUTION REPORT
==============================

Date: [Today's Date]
Tester: Claude Code
Environment: localhost:5000

CRITICAL TESTS (Must Pass):
[ ] Authorization Tests: X/X passed
[ ] XSS Protection Tests: X/X passed
[ ] Input Validation Tests: X/X passed

IMPORTANT TESTS:
[ ] Response Format Tests: X/X passed
[ ] Data Integrity Tests: X/X passed

NICE-TO-HAVE TESTS:
[ ] Performance Tests: X/X passed
[ ] Edge Case Tests: X/X passed

TOTAL: X/X tests passed ✅

Issues Found: 0
Status: ✅ ALL CRITICAL TESTS PASS - READY FOR PHASE C

Failure Details: [If any]
```

---

## ⚡ QUICK TEST VIA CURL

```bash
# Test Server Health
curl http://localhost:5000/health

# Test Event Create
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test","date":"2024-05-20","uid":"user1","location":"Hall","capacity":50}'

# Test Authorization (Should fail with 403)
curl -X PUT http://localhost:5000/api/events/:eventId \
  -H "Content-Type: application/json" \
  -d '{"uid":"different_user","title":"Hack"}'

# Test XSS in Message
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"sender":"u1","receiver":"u2","text":"<script>alert(1)</script>test"}'
```

---

## 🎯 SUCCESS CRITERIA

Phase B is successful if:
- ✅ All 22+ endpoints respond correctly
- ✅ All authorization checks work (403 on unauthorized)
- ✅ All XSS protection active (scripts neutralized)
- ✅ All responses follow standard format
- ✅ All pagination works correctly
- ✅ Zero critical issues found

**Proceed to Phase C (Jest Tests) only if ALL critical tests pass.**

---

## Next Steps

1. Import POSTMAN_COLLECTION.json into Postman
2. Set variables: baseUrl, adminSessionToken
3. Run all test requests in sequence
4. Document any failures
5. Fix issues if found
6. Re-run until all tests pass
7. Generate test report
8. Proceed to Phase C

---

**Phase B Ready: Awaiting Test Execution** 🚀
