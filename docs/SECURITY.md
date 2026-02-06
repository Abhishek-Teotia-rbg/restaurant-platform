# Security Guidelines for JavaScript Modules

## 🔐 Configuration Security

### Firebase Configuration
**IMPORTANT:** Never commit actual Firebase credentials to source control.

#### Development Setup
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your actual Firebase credentials in `.env`

3. The config files (`firebase-config.dev.js` and `firebase-config.prod.js`) will use these environment variables

4. Add `.env` to `.gitignore` (already done)

#### Production Deployment
For production, use your hosting platform's environment variable system:

**Firebase Hosting:**
```bash
firebase functions:config:set \
  firebase.api_key="your-key" \
  firebase.auth_domain="your-domain" \
  firebase.vapid_key="your-vapid-key"
```

**Vercel/Netlify:**
Set environment variables in the platform dashboard.

**Traditional Hosting:**
Use a secure config endpoint:
```javascript
// Load config from secure endpoint
const response = await fetch('/api/config');
const config = await response.json();
await initializeFirebase(config);
```

### VAPID Key for FCM
To generate a VAPID key for Firebase Cloud Messaging:

1. Go to Firebase Console → Project Settings → Cloud Messaging
2. Under "Web Push certificates", generate a new key pair
3. Add the public key to your `.env` as `FIREBASE_VAPID_KEY`

## 🛡️ Input Validation & Sanitization

All user inputs are validated and sanitized:

```javascript
import { sanitizeInput, sanitizeHtml } from './validators.js';

// Sanitize text input
const clean = sanitizeInput(userInput);

// Sanitize HTML
const safeHtml = sanitizeHtml(htmlContent);
```

### XSS Prevention
The modules include built-in XSS prevention:
- HTML escaping in `utils.js`
- Input sanitization in `validators.js`
- Content Security Policy headers recommended (set in Firebase hosting config)

## 🔒 Authentication Security

### Password Requirements
Enforced password requirements:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### Token Management
- Auth tokens are automatically managed by Firebase
- Tokens are refreshed automatically
- Never store tokens in localStorage (handled by Firebase SDK)

### Session Security
```javascript
// Check authentication before sensitive operations
import { isAuthenticated, getCurrentUser } from './auth.js';

if (!isAuthenticated()) {
  redirectToLogin();
  return;
}
```

## 🚨 API Security

### CSRF Protection
All API calls include authentication tokens:

```javascript
// Tokens automatically added to requests
const token = await getIdToken();
headers['Authorization'] = `Bearer ${token}`;
```

### Rate Limiting
Implement rate limiting in Cloud Functions:

```javascript
// In your Cloud Function
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

## 📝 Data Validation

### Client-Side Validation
Always validate on client:
```javascript
import { validateForm } from './validators.js';

const result = validateForm(data, schema);
if (!result.isValid) {
  showError(result.errors);
  return;
}
```

### Server-Side Validation
**ALWAYS validate on server too:**
```javascript
// In Cloud Functions
exports.createOrder = functions.https.onCall((data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }
  
  // Validate data
  if (!data.items || !Array.isArray(data.items)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid items');
  }
  
  // Process order...
});
```

## 🔐 Firestore Security

### Security Rules
Ensure proper Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Orders can be read by creator and admins
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
    }
  }
}
```

## 📦 Storage Security

### File Upload Validation
Files are validated before upload:

```javascript
import { validateFile, uploadImage } from './storage.js';

// Validate first
const validation = validateFile(file, {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png']
});

if (!validation.isValid) {
  showError(validation.error);
  return;
}

// Then upload
await uploadImage(file, path);
```

### Storage Security Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only upload to their own directory
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId
        && request.resource.size < 5 * 1024 * 1024 // 5MB limit
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

## 🔍 Monitoring & Logging

### Error Logging
Errors are logged but sensitive data is filtered:

```javascript
// Good: Log error message only
console.error('Login failed:', error.code);

// Bad: Don't log sensitive data
console.error('Login failed:', { email, password }); // ❌ NEVER DO THIS
```

### Security Monitoring
Monitor for suspicious activity:
- Failed login attempts
- Invalid token usage
- Unusual API patterns
- File upload abuse

## 🚫 Common Vulnerabilities & Prevention

### SQL Injection
✅ **Prevented:** Using Firestore (NoSQL) with parameterized queries

### XSS (Cross-Site Scripting)
✅ **Prevented:** Input sanitization and HTML escaping

### CSRF (Cross-Site Request Forgery)
✅ **Prevented:** Firebase authentication tokens

### Sensitive Data Exposure
✅ **Prevented:** 
- No credentials in code
- Environment variables for secrets
- Server-side validation

### Broken Authentication
✅ **Prevented:**
- Firebase Authentication
- Secure password requirements
- Token-based sessions

## 📋 Security Checklist

Before deploying to production:

- [ ] Replace all placeholder credentials with actual values
- [ ] Set up environment variables properly
- [ ] Configure Firebase Security Rules
- [ ] Enable HTTPS only
- [ ] Set up Content Security Policy
- [ ] Configure CORS properly
- [ ] Enable Firebase App Check
- [ ] Set up rate limiting
- [ ] Configure backup strategy
- [ ] Set up monitoring and alerts
- [ ] Review and test authentication flows
- [ ] Validate all user inputs server-side
- [ ] Test file upload limits
- [ ] Review API endpoint security
- [ ] Enable Firebase security features (App Check, reCAPTCHA)

## 🆘 Incident Response

If you suspect a security breach:

1. **Immediately revoke compromised credentials**
2. Rotate all API keys and secrets
3. Review access logs
4. Notify affected users
5. Update security rules
6. Document the incident

## 📚 Additional Resources

- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/get-started)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)

---

**Remember:** Security is an ongoing process, not a one-time setup. Regularly review and update security measures.
