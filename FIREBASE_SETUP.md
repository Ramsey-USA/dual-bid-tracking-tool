# Firebase Deployment and Development Guide

## Prerequisites
1. Node.js 18+ and npm 9+
2. Firebase CLI installed globally: `npm install -g firebase-tools`
3. Firebase project created in the Firebase Console

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Project Setup
```bash
# Login to Firebase
firebase login

# Initialize Firebase project (if not already done)
firebase init

# Select:
# - Firestore
# - Hosting
# - Configure for single-page app: Yes
# - Set up automatic builds: No
```

### 3. Configure Firebase
1. Update `js/firebase-config.js` with your actual Firebase configuration
2. Replace placeholder values with your project's values from Firebase Console

### 4. Development Workflow

#### Local Development with Emulators
```bash
# Start Firebase emulators for local development
npm run firebase:emulators

# Access:
# - App: http://localhost:5000
# - Firestore UI: http://localhost:4000
# - Firestore: localhost:8080
```

#### Production Build
```bash
# Build for production
npm run build

# Test locally before deployment
npm run serve
```

### 5. Deployment

#### Deploy Everything
```bash
npm run deploy
```

#### Deploy Only Hosting
```bash
npm run deploy:hosting
```

#### Deploy Only Firestore Rules/Indexes
```bash
npm run deploy:firestore
```

## Project Structure
```
dual-bid-tracking-tool/
├── dist/                   # Built files (auto-generated)
├── css/                    # Source CSS files
├── js/                     # Source JavaScript files
│   ├── firebase-config.js  # Firebase configuration
│   ├── database-service.js # Firestore operations
│   └── app.js             # Main application
├── firebase.json          # Firebase configuration
├── firestore.rules        # Security rules
├── firestore.indexes.json # Database indexes
├── package.json           # Dependencies and scripts
└── webpack.config.js      # Build configuration
```

## Database Schema

### Jobs Collection
```javascript
{
  id: "auto-generated",
  title: "string",
  client: "string", 
  location: "string",
  estimator: "string",
  deadline: "timestamp",
  bidValue: "number",
  status: "string", // in-progress, submitted, follow-up-required, won, lost, no-bid
  notes: "string",
  company: "string", // mhc or hdd
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

### Estimators Collection
```javascript
{
  id: "auto-generated",
  name: "string",
  company: "string", // mhc or hdd
  createdAt: "timestamp"
}
```

## Security Rules
- Authentication required for all read/write operations
- Data validation enforced at database level
- Company-specific data isolation
- Prevent cross-company data access

## Performance Optimizations
- Composite indexes for complex queries
- Real-time subscriptions for live updates
- Efficient pagination for large datasets
- Optimized bundle splitting with Webpack

## Monitoring and Analytics
- Firebase Analytics integration
- Error tracking and performance monitoring
- Usage statistics and user behavior

## Environment Variables
Create `.env` file for environment-specific configuration:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
NODE_ENV=development
```

## Troubleshooting

### Common Issues
1. **Firestore permission denied**: Check security rules
2. **Emulator connection failed**: Ensure ports 4000, 5000, 8080 are available
3. **Build errors**: Verify all dependencies are installed

### Debugging
1. Enable Firestore debug logging: `firebase.firestore.setLogLevel('debug')`
2. Check browser network tab for failed requests
3. Review Firebase Console logs for server-side errors

## Production Considerations
1. Enable Firebase AppCheck for additional security
2. Set up monitoring and alerting
3. Configure custom domain if needed
4. Implement proper backup strategies
5. Set up CI/CD pipeline for automated deployments