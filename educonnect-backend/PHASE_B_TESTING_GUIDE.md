# PHASE B: COMPREHENSIVE TESTING - Ready to Execute

## 🎯 Testing Overview

All improvements from Phase A need validation before Phase C (Jest suite).

**Test Categories:**
1. **Authorization & Security** (Critical)
2. **Input Validation** (Critical)
3. **Error Responses** (Important)
4. **Data Integrity** (Important)
5. **Performance** (Nice to have)

---

## 📋 QUICK START

### Pre-Test Checklist:
```bash
# 1. Ensure server is running
npm start

# 2. Import Postman collection
# File: POSTMAN_COLLECTION.json
# Import into Postman

# 3. Set variables:
# baseUrl: http://localhost:5000
# adminSessionToken: (get after login)
```

---

## 🧪 COMPREHENSIVE TEST MATRIX

### 1. EVENT ENDPOINTS

#### 1.1 Create Event ✅
```
POST /api/events
Headers:
  Content-Type: multipart/form-data

Body:
  title: "Tech Hackathon"
  description: "Annual hackathon"
  date: "2024-05-20"
  location: "Campus Hall"
  uid: "test_user_123"
  capacity: 50

Expected:
  ✅ 201 Created
  ✅ Has eventId
  ✅ eventStatus = "active"
```

#### 1.2 Get Events with Pagination ✅
```
GET /api/events?page=1&limit=5&status=active

Expected:
  ✅ 200 OK
  ✅ Returns paginated list
  ✅ Has pagination object {page, limit, total, totalPages}
  ✅ Events sorted by date ascending
```

#### 1.3 Update Event (Authorization Test) ✅
```
Test A - Unauthorized Update:
PUT /api/events/:eventId
Body:
  title: "Hacked Event"
  uid: "different_user"

Expected:
  ✅ 403 Forbidden
  ✅ Message: "Not authorized"

Test B - Authorized Update:
PUT /api/events/:eventId
Body:
  title: "Updated Title"
  uid: "original_creator"

Expected:
  ✅ 200 OK
  ✅ Title updated
```

#### 1.4 Join Event (Capacity Test) ✅
```
Test A - Normal Join:
PUT /api/events/:eventId/join
Body:
  uid: "user_123"

Expected:
  ✅ 200 OK
  ✅ User added to participants

Test B - Duplicate Join:
PUT /api/events/:eventId/join
Body:
  uid: "user_123"

Expected:
  ✅ 400 Bad Request
  ✅ Message: "Already joined"

Test C - Full Event Join:
(Create event with capacity: 2, join with 2 users, try 3rd)

Expected:
  ✅ 400 Bad Request
  ✅ Message: "Event is full"
```

#### 1.5 Delete Event (Authorization) ✅
```
Test A - Unauthorized Delete:
DELETE /api/events/:eventId
Body:
  uid: "not_creator"

Expected:
  ✅ 403 Forbidden

Test B - Authorized Delete:
DELETE /api/events/:eventId
Body:
  uid: "creator"

Expected:
  ✅ 200 OK
```

---

### 2. MESSAGE ENDPOINTS

#### 2.1 Send Message ✅
```
POST /api/messages
Body:
  sender: "user_123"
  receiver: "user_456"
  text: "Hello!"
  messageType: "text"

Expected:
  ✅ 201 Created
  ✅ Text sanitized
  ✅ seen = false
```

#### 2.2 XSS Protection ✅
```
POST /api/messages
Body:
  sender: "user_123"
  receiver: "user_456"
  text: "<script>alert('XSS')</script>"

Expected:
  ✅ 201 Created
  ✅ Script tags removed/escaped
  ✅ Content sanitized
```

#### 2.3 Get Messages (Pagination) ✅
```
GET /api/messages/user_123/user_456?page=1&limit=50

Expected:
  ✅ 200 OK
  ✅ Bidirectional messages (both directions)
  ✅ Paginated
  ✅ Sorted by createdAt ascending
```

#### 2.4 Mark as Seen ✅
```
PUT /api/messages/seen
Body:
  sender: "user_456"
  receiver: "user_123"
  currentUser: "user_123"

Expected:
  ✅ 200 OK
  ✅ Messages marked seen=true
  ✅ seenAt timestamp set
  ✅ markedCount > 0
```

#### 2.5 Delete Message (Authorization) ✅
```
Test A - Delete Own Message:
DELETE /api/messages/:messageId
Body:
  uid: "sender_uid"

Expected:
  ✅ 200 OK
  ✅ Message soft deleted (deleted=true)

Test B - Delete Others' Message:
DELETE /api/messages/:messageId
Body:
  uid: "different_uid"

Expected:
  ✅ 403 Forbidden
```

---

### 3. JOB ENDPOINTS

#### 3.1 Create Job (Admin Test) ✅
```
Test A - Non-Admin Create:
POST /api/jobs
Body:
  title: "Software Engineer"
  company: "Tech Corp"
  ctc: 15
  isAdmin: false

Expected:
  ✅ 403 Forbidden
  ✅ Message: "Only admins"

Test B - Admin Create:
POST /api/jobs
Body:
  title: "Software Engineer"
  company: "Tech Corp"
  ctc: 15
  deadline: "2024-12-31"
  isAdmin: true

Expected:
  ✅ 201 Created
  ✅ jobStatus = "active"
  ✅ applicationCount = 0
```

#### 3.2 Get Jobs (Pagination & Filtering) ✅
```
Test A - Active Jobs:
GET /api/jobs?status=active&page=1&limit=10

Expected:
  ✅ 200 OK
  ✅ Only active jobs (deadline >= today)
  ✅ Paginated

Test B - Expired Jobs:
GET /api/jobs?status=expired&page=1&limit=10

Expected:
  ✅ 200 OK
  ✅ Only expired jobs (deadline < today)
```

#### 3.3 Check Eligibility ✅
```
GET /api/jobs/eligibility/user_uid

Expected:
  ✅ 200 OK
  ✅ Returns eligibleJobs array
  ✅ Returns notEligibleJobs with reasons
  ✅ Reasons include: branch, CGPA, year constraints
```

#### 3.4 Delete Job (Admin) ✅
```
DELETE /api/jobs/:jobId
Body:
  isAdmin: true

Expected:
  ✅ 200 OK
  ✅ Job deleted

Test Non-Admin:
Expected:
  ✅ 403 Forbidden
```

---

## ✅ ASSERTION CHECKLIST

For **EVERY** endpoint test:

- [ ] Correct HTTP status code
- [ ] Response has `success` field
- [ ] Response has `message` field
- [ ] Response has `data` field (if applicable)
- [ ] Error responses have standardized format
- [ ] Timestamps present where needed
- [ ] Authorization checks working
- [ ] Input validation working
- [ ] Sanitization applied

---

## 🔍 SECURITY VERIFICATION

### Authorization Checks:
- [ ] Unauthorized users get 403
- [ ] Owned resources can't be modified by others
- [ ] Admin-only operations enforce admin flag
- [ ] User existence verified before operations

### Input Validation:
- [ ] Empty fields rejected
- [ ] Required fields validated
- [ ] String length constraints enforced
- [ ] Invalid dates rejected

### XSS Protection:
- [ ] `<script>` tags removed from messages
- [ ] HTML entities escaped
- [ ] Dangerous HTML stripped

### Error Handling:
- [ ] 400 for validation errors
- [ ] 401 for missing auth
- [ ] 403 for insufficient permissions
- [ ] 404 for not found
- [ ] 500 for server errors

---

## 📊 TEST REPORT TEMPLATE

```
PHASE B TEST REPORT
===================

Date: 2024-04-14
Tester: [Your Name]

Events: 5/5 passed ✅
Messages: 5/5 passed ✅
Jobs: 4/4 passed ✅

Total: 14/14 passed ✅

Critical Issues: 0
Minor Issues: 0

Status: ✅ ALL TESTS PASS - READY FOR PHASE C
```

---

## 🚀 NEXT STEPS AFTER PHASE B

Once all tests pass:
1. ✅ Verify no errors in server logs
2. ✅ Check response times are reasonable
3. ✅ Create test report
4. ✅ Proceed to **Phase C: Jest Testing**

---

## Phase B Command Reference

```bash
# Start server
npm start

# In Postman:
# 1. Import POSTMAN_COLLECTION.json
# 2. Run all tests in sequence
# 3. Verify all 14+ tests pass
# 4. Check response formats
# 5. Verify error messages
# 6. Test authorization failures
# 7. Test input validation

# Generate Test Report
# Document any failures
# Fix if needed
# Re-run
```

---

**Phase B: Ready to Test! 🚀**

Import Postman collection and begin testing.
