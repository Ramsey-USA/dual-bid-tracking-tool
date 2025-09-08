# MH Construction & High Desert Drywall - Job Bidding Dashboard

A comprehensive, responsive web application for tracking construction project bids, designed for both MH Construction and High Desert Drywall (HDD) companies. Features dual-company branding with seamless switching between company views.

![MH Construction Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 🏗️ Features

### Dual Company Support
- **Company Selector**: Switch between MH Construction and High Desert Drywall
- **Separate Data Views**: Each company sees only their projects and statistics
- **Dual Branding**: Automatic theme switching with company-specific color schemes
- **Data Isolation**: Jobs are automatically filtered by selected company

### Core Functionality
- **Job Management**: Add, edit, and delete construction project bids
- **Real-time Search**: Search across project names, clients, and locations
- **Advanced Filtering**: Filter by status and estimator (company-specific)
- **Dual View Modes**: Switch between table and card views
- **Data Export**: Export to Excel (CSV) and PDF formats
- **Deadline Tracking**: Automatic overdue alerts and deadline notifications

### Data Fields
- Project Name
- Client Information
- Location
- Assigned Estimator
- Deadline with countdown
- Follow-up with countdown
- Project Status (In Progress, Submitted, Won, Lost, No Bid)
- Project Description
- Estimating Cost (from the architect)
- Bond Amount (% of Estimating Cost)
- Bid Amount (from our Estimator)
- Company Assignment (automatic)

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Professional Branding**: Dual color schemes for both companies
- **Intuitive Interface**: Clean, construction industry-appropriate design
- **Local Data Storage**: Persistent data storage with company separation
- **Real-time Statistics**: Live dashboard metrics per company

## 🎨 Dual Company Design System

### MH Construction Theme
**Color Palette:**
```css
/* MH Construction - Desert Tan and Military Green */
--mhc-primary-green: #4a5d23;        /* Military Green - Primary brand color */
--mhc-primary-green-light: #5a6d33;  /* Lighter variant for hover states */
--mhc-primary-green-dark: #3a4d13;   /* Darker variant for emphasis */
--mhc-desert-tan: #d2b48c;           /* Desert Tan - Secondary brand color */
--mhc-desert-tan-light: #e2c49c;     /* Lighter variant */
--mhc-desert-tan-dark: #c2a47c;      /* Darker variant */
```

### High Desert Drywall Theme
**Color Palette:**
```css
/* High Desert Drywall - US Navy Colors */
--hdd-navy-blue: #000080;            /* Navy Blue - Primary brand color */
--hdd-navy-blue-light: #1a1a9a;      /* Lighter variant for hover states */
--hdd-navy-blue-dark: #000066;       /* Darker variant for emphasis */
--hdd-gold: #ffd700;                 /* Gold - Secondary brand color */
--hdd-gold-light: #ffdf1a;           /* Lighter variant */
--hdd-gold-dark: #e6c200;            /* Darker variant */
```

### Dynamic Theme System
```css
/* Automatic theme switching based on company selection */
body.mhc-theme {
    --primary-color: var(--mhc-primary-green);
    --secondary-color: var(--mhc-desert-tan);
}

body.hdd-theme {
    --primary-color: var(--hdd-navy-blue);
    --secondary-color: var(--hdd-gold);
}
```

### Supporting Colors
```css
/* Status Colors (consistent across both themes) */
--status-progress: #3b82f6;      /* Blue - In Progress */
--status-submitted: #f59e0b;     /* Orange - Submitted */
--status-followup: #ef4444;      /* Red - Follow-up Required */
--status-won: #10b981;           /* Green - Won */
--status-lost: #6b7280;          /* Gray - Lost */
--status-nobid: #8b5cf6;         /* Purple - No Bid */

/* Gray Scale (shared) */
--gray-50: #f9fafb;   /* Lightest background */
--gray-100: #f3f4f6;  /* Light background */
--gray-200: #e5e7eb;  /* Border color */
--gray-300: #d1d5db;  /* Input borders */
--gray-400: #9ca3af;  /* Placeholder text */
--gray-500: #6b7280;  /* Secondary text */
--gray-600: #4b5563;  /* Primary text */
--gray-700: #374151;  /* Dark text */
--gray-800: #1f2937;  /* Darkest text */
```

### Typography System
```css
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Font Sizes */
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */
```

### Spacing & Layout System
```css
/* Consistent spacing scale */
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */

/* Border Radius & Shadows */
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */

--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

### Responsive Breakpoints
```css
/* Mobile First Approach */
@media (max-width: 768px) {
    /* Tablet and below */
    .header-content { flex-direction: column; }
    .company-selector { order: -1; margin-bottom: var(--spacing-2); }
    .search-filter-container { gap: var(--spacing-3); }
    .filter-controls { flex-direction: column; }
    .stats { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
}

@media (max-width: 480px) {
    /* Mobile phones */
    .logo h1 { font-size: var(--font-size-2xl); }
    .stat-number { font-size: var(--font-size-3xl); }
    .form-row { grid-template-columns: 1fr; }
}
```

## 🚀 Quick Start

### Option 1: GitHub Pages (Recommended)
1. Fork this repository
2. Go to repository Settings → Pages
3. Select "Deploy from a branch" → "main" → "/ (root)"
4. Your dashboard will be available at `https://yourusername.github.io/mh-construction-dashboard`

### Option 2: Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mh-construction-dashboard.git
   cd mh-construction-dashboard
   ```

2. Open `index.html` in your web browser or serve with a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   ```

3. Navigate to `http://localhost:8000` in your browser

## 📁 Project Structure

```
mh-construction-dashboard/
├── index.html              # Main application file (8.1KB)
├── css/
│   └── styles.css          # Dual-theme styling system (18.2KB)
├── js/
│   └── app.js              # Application logic with company support (24.3KB)
├── assets/                 # Directory for images and other assets
├── README.md               # This documentation file
└── .gitignore             # Git ignore configuration
```

## 🏢 Company Management

### Switching Between Companies
1. Use the company selector dropdown in the header
2. Choose between "MH Construction" or "High Desert Drywall"
3. Dashboard automatically updates with company-specific:
   - Color theme and branding
   - Job listings and statistics
   - Estimator lists
   - Data filtering

### Company-Specific Features
- **Automatic Data Filtering**: Only shows jobs for selected company
- **Theme Switching**: Instant visual branding change
- **Separate Statistics**: Metrics calculated per company
- **Isolated Estimator Lists**: Only shows estimators from current company
- **Company Assignment**: New jobs automatically assigned to current company

## 🎯 Usage Guide

### Company Selection
1. Click the company dropdown in the header
2. Select "MH Construction" for desert tan/military green theme
3. Select "High Desert Drywall" for navy blue/gold theme
4. Dashboard updates automatically with company branding and data

### Adding a New Job
1. Ensure correct company is selected
2. Click the "Add New Job" button in the header
3. Fill in all required fields (marked with *)
4. Job is automatically assigned to current company
5. Click "Save Job" to add to dashboard

### Searching and Filtering
- **Search**: Use the search bar to find jobs by project name, client, or location
- **Status Filter**: Filter jobs by their current status
- **Estimator Filter**: Filter jobs by assigned estimator (company-specific)
- **Clear Filters**: Reset all filters to show all jobs for current company

### Viewing Options
- **Table View**: Comprehensive tabular display with all job details
- **Card View**: Clean card layout for easier browsing

### Exporting Data
1. Click "Export Data" button
2. Choose between Excel (CSV) or PDF format
3. Select to export filtered results or all data (for current company)
4. Download will start automatically

### Managing Jobs
- **Edit**: Click the edit (✏️) button on any job to modify details
- **Delete**: Click the delete (🗑️) button to remove a job (with confirmation)

## 🔧 Technical Specifications

### Dual Company Architecture
- **Theme System**: CSS custom properties with dynamic switching
- **Data Separation**: JavaScript filtering by company field
- **State Management**: Company preference stored in localStorage
- **Automatic Assignment**: New jobs inherit current company selection

### HTML Structure
- **Semantic HTML5**: Proper use of header, main, section, and article elements
- **Company Selector**: Dropdown integration in header navigation
- **Accessibility**: ARIA labels, proper form labels, and semantic structure
- **Meta Tags**: Viewport, charset, and description for SEO and mobile optimization

### CSS Architecture
- **Dual Theme Variables**: Separate color palettes for each company
- **Dynamic Theme Classes**: Body classes for theme switching
- **Mobile-First Design**: Responsive breakpoints starting from mobile
- **Component-Based**: Modular CSS classes for reusability
- **Animation System**: Smooth transitions for theme switching

### JavaScript Features
- **Company Management**: Theme switching and data filtering
- **ES6+ Syntax**: Modern JavaScript with classes and arrow functions
- **Local Storage API**: Persistent data storage with company separation
- **Event Delegation**: Efficient event handling for dynamic content
- **Modular Architecture**: Clean separation of concerns with class-based structure

### Performance Optimizations
- **Lightweight**: Total bundle size < 55KB (uncompressed)
- **No Dependencies**: Zero external JavaScript libraries
- **Efficient DOM Manipulation**: Minimal reflows and repaints
- **Theme Caching**: Company preference persistence
- **Optimized Filtering**: Efficient company-based data separation

## 📊 Sample Data Structure

### Job Object Schema
```javascript
{
    id: "unique-identifier",
    projectName: "Downtown Office Complex",
    client: "Metro Development Corp",
    location: "Phoenix, AZ",
    estimator: "John Smith",
    deadline: "2025-01-15",
    status: "In Progress",
    description: "Project description...",
    company: "mhc", // "mhc" or "hdd"
    createdAt: "2025-01-01T00:00:00.000Z"
}
```

### Company Codes
- `"mhc"` - MH Construction
- `"hdd"` - High Desert Drywall

### Sample Data Included
**MH Construction (3 projects):**
- Downtown Office Complex (In Progress)
- Residential Subdivision Phase 2 (Submitted)
- Highway 101 Bridge Repair (Follow-up Required)

**High Desert Drywall (2 projects):**
- Commercial Drywall Installation (In Progress)
- Luxury Home Drywall Package (Submitted)

## 🎨 Customization Guide

### Adding New Companies
1. **CSS**: Add new color variables and theme class in `styles.css`
2. **HTML**: Add new option to company selector in `index.html`
3. **JavaScript**: Update company handling logic in `app.js`

### Modifying Company Colors
To update color schemes, modify the CSS custom properties:

```css
:root {
    /* Add new company colors */
    --new-company-primary: #your-primary-color;
    --new-company-secondary: #your-secondary-color;
}

/* Add new theme class */
body.new-company-theme {
    --primary-color: var(--new-company-primary);
    --secondary-color: var(--new-company-secondary);
}
```

### Adding New Status Types
1. **HTML**: Add new option to status select elements
2. **CSS**: Add corresponding status badge style
3. **JavaScript**: Update status handling if needed

### Extending Data Fields
1. **HTML**: Add form inputs to the job modal
2. **CSS**: Style new inputs following existing patterns
3. **JavaScript**: Update job object structure and form handling

## 📱 Mobile Optimization

### Responsive Features
- **Touch-Friendly**: Minimum 44px touch targets
- **Company Selector**: Optimized for mobile interaction
- **Readable Text**: Minimum 16px font size on mobile
- **Optimized Forms**: Large input fields and buttons
- **Theme Switching**: Smooth transitions on mobile devices

### Mobile-Specific Styles
```css
@media (max-width: 768px) {
    .company-selector { order: -1; margin-bottom: var(--spacing-2); }
    .company-select { width: 200px; }
    .nav .btn { width: 100%; justify-content: center; }
    .filter-controls { flex-direction: column; align-items: stretch; }
}
```

## 🔒 Security & Privacy

### Data Handling
- **Local Storage Only**: No data transmitted to external servers
- **Company Separation**: Data isolated by company selection
- **Client-Side Processing**: All operations performed in browser
- **No Cookies**: Uses localStorage for company preferences
- **HTTPS Ready**: Designed for secure HTTPS deployment

### Browser Compatibility
- **Chrome**: 60+ (Full support including theme switching)
- **Firefox**: 55+ (Full support including theme switching)
- **Safari**: 12+ (Full support including theme switching)
- **Edge**: 79+ (Full support including theme switching)
- **Mobile Browsers**: iOS Safari 12+, Chrome Mobile 60+

## 🚀 Deployment Options

### GitHub Pages (Free)
```bash
# After pushing to GitHub
1. Repository Settings → Pages
2. Source: Deploy from branch
3. Branch: main, Folder: / (root)
4. Save and wait for deployment
```

### Static Hosting Services
- **Netlify**: Drag and drop deployment with instant theme switching
- **Vercel**: Git-based deployment with automatic builds
- **Firebase Hosting**: Google's hosting platform
- **AWS S3**: Static website hosting

### Traditional Web Hosting
Upload all files to any web server supporting static files. Ensure:
- All files maintain directory structure
- Server supports HTTPS (recommended)
- Proper MIME types for .css and .js files

## 🆘 Troubleshooting

### Common Issues

**Theme not switching:**
```javascript
// Check if company selector is working
console.log('Current company:', dashboard.currentCompany);
console.log('Body classes:', document.body.className);
```

**Company data not filtering:**
```javascript
// Verify company field in jobs
console.log('Jobs with company field:', dashboard.jobs.map(job => ({
    name: job.projectName,
    company: job.company
})));
```

**Dashboard not loading:**
```bash
# Check browser console for errors
# Ensure files are served over HTTP/HTTPS (not file://)
# Verify all files are in correct locations
```

### Performance Monitoring
```javascript
// Check theme switching performance
console.time('Theme Switch');
dashboard.setCompanyTheme('hdd');
console.timeEnd('Theme Switch');

// Monitor data filtering efficiency
console.time('Company Filter');
dashboard.applyFilters();
console.timeEnd('Company Filter');
```

## 📄 License

This project is created specifically for MH Construction and High Desert Drywall. All rights reserved.

## 🏗️ About the Companies

### MH Construction
Primary construction company specializing in commercial and residential projects. Uses desert tan and military green branding to reflect Arizona's construction heritage.

### High Desert Drywall (HDD)
Specialized drywall contractor operating under the MH Construction umbrella. Uses US Navy colors (navy blue and gold) to convey precision, reliability, and professional excellence.

---

**Built with ❤️ for MH Construction & High Desert Drywall**  
*Professional construction project management for both companies under one unified platform*

