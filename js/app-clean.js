// Dual Bid Tracking App - Main Application File
// This version works with ES modules and dynamically loads Firebase

class BidTrackingApp {
    constructor() {
        this.currentCompany = localStorage.getItem('currentCompany') || 'mhc';
        this.currentView = 'table';
        this.jobs = [];
        this.estimators = [];
        this.stats = {};
        this.firebaseLoaded = false;
        this.dbService = null;
        this.unsubscribeJobs = null;
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing Dual Bid Tracking App...');
            
            this.setupEventListeners();
            this.setCompanyTheme();
            
            // Try to load Firebase
            await this.loadFirebase();
            
            if (this.firebaseLoaded) {
                await this.loadInitialData();
                this.subscribeToJobUpdates();
            } else {
                // Load mock data for demonstration
                this.loadMockData();
            }
            
            this.renderPage();
            
            console.log('✅ App initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            this.showNotification('Error loading application. Using demo mode.', 'warning');
            this.loadMockData();
            this.renderPage();
        }
    }

    async loadFirebase() {
        try {
            console.log('🔥 Loading Firebase...');
            
            // Dynamic import to avoid module errors
            const { dbService } = await import('./database-service.js');
            this.dbService = dbService;
            this.firebaseLoaded = true;
            
            console.log('✅ Firebase loaded successfully');
            this.showNotification('Connected to Firebase database', 'success');
            
        } catch (error) {
            console.warn('⚠️ Firebase not available, using demo mode:', error.message);
            this.firebaseLoaded = false;
        }
    }

    loadMockData() {
        console.log('📊 Loading mock data for demonstration...');
        
        // Mock statistics
        this.stats = {
            total: 12,
            inProgress: 5,
            submitted: 4,
            followUp: 2,
            overdue: 1,
            won: 3,
            lost: 0,
            noBid: 0,
            totalValue: 2450000,
            wonValue: 890000,
            pendingValue: 1560000
        };

        // Mock jobs
        this.jobs = [
            {
                id: '1',
                title: 'Downtown Office Complex',
                client: 'ABC Development',
                location: 'Phoenix, AZ',
                estimator: 'John Smith',
                deadline: new Date('2024-01-15'),
                bidValue: 850000,
                status: 'in-progress',
                notes: 'Large commercial project',
                company: this.currentCompany,
                createdAt: new Date('2024-01-01')
            },
            {
                id: '2',
                title: 'Residential Subdivision',
                client: 'XYZ Homes',
                location: 'Scottsdale, AZ',
                estimator: 'Jane Doe',
                deadline: new Date('2024-01-20'),
                bidValue: 1200000,
                status: 'submitted',
                notes: 'Multi-family housing project',
                company: this.currentCompany,
                createdAt: new Date('2024-01-02')
            },
            {
                id: '3',
                title: 'Shopping Center Renovation',
                client: 'Retail Partners LLC',
                location: 'Tempe, AZ',
                estimator: 'Mike Johnson',
                deadline: new Date('2024-01-10'),
                bidValue: 400000,
                status: 'follow-up-required',
                notes: 'Requires additional information',
                company: this.currentCompany,
                createdAt: new Date('2024-01-03')
            }
        ];

        // Mock estimators
        this.estimators = [
            { id: '1', name: 'John Smith', company: this.currentCompany },
            { id: '2', name: 'Jane Doe', company: this.currentCompany },
            { id: '3', name: 'Mike Johnson', company: this.currentCompany }
        ];

        this.showNotification('Demo mode: Using sample data', 'info');
    }

    setupEventListeners() {
        console.log('🎯 Setting up event listeners...');

        // Company selector
        const companySelect = document.getElementById('company-select');
        if (companySelect) {
            companySelect.value = this.currentCompany;
            companySelect.addEventListener('change', (e) => {
                this.switchCompany(e.target.value);
            });
        }

        // Add job button
        const addJobBtn = document.getElementById('add-job-btn');
        if (addJobBtn) {
            addJobBtn.addEventListener('click', () => {
                this.showAddJobModal();
            });
        }

        // View toggle buttons
        const tableViewBtn = document.getElementById('table-view-btn');
        const cardViewBtn = document.getElementById('card-view-btn');
        
        if (tableViewBtn) {
            tableViewBtn.addEventListener('click', () => {
                this.switchView('table');
            });
        }
        
        if (cardViewBtn) {
            cardViewBtn.addEventListener('click', () => {
                this.switchView('card');
            });
        }

        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }

        // Modal close handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal();
            }
            if (e.target.classList.contains('close-btn')) {
                this.hideModal();
            }
        });

        console.log('✅ Event listeners set up');
    }

    switchCompany(companyId) {
        this.currentCompany = companyId;
        localStorage.setItem('currentCompany', companyId);
        this.setCompanyTheme();
        this.loadMockData(); // Reload data for new company
        this.renderPage();
        this.showNotification(`Switched to ${this.getCompanyName(companyId)}`, 'success');
    }

    switchView(view) {
        this.currentView = view;
        
        // Update active button
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${view}-view-btn`)?.classList.add('active');
        
        // Show/hide appropriate containers
        const tableContainer = document.querySelector('.table-container');
        const cardContainer = document.querySelector('.card-container');
        
        if (view === 'table') {
            if (tableContainer) tableContainer.style.display = 'block';
            if (cardContainer) cardContainer.style.display = 'none';
        } else {
            if (tableContainer) tableContainer.style.display = 'none';
            if (cardContainer) cardContainer.style.display = 'block';
        }
        
        this.renderJobs();
    }

    handleSearch(searchTerm) {
        if (!searchTerm.trim()) {
            this.renderJobs();
            return;
        }

        const filteredJobs = this.jobs.filter(job => 
            job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.location?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        this.renderJobs(filteredJobs);
    }

    renderPage() {
        this.renderStats();
        this.renderEstimatorFilter();
        this.renderJobs();
        this.updateCompanyInfo();
    }

    renderStats() {
        this.updateStatCard('total-jobs', this.stats.total || 0);
        this.updateStatCard('in-progress', this.stats.inProgress || 0);
        this.updateStatCard('submitted', this.stats.submitted || 0);
        this.updateStatCard('follow-up', this.stats.followUp || 0);
        this.updateStatCard('overdue', this.stats.overdue || 0);
        this.updateStatCard('won', this.stats.won || 0);
        
        this.updateBidValueCard();
    }

    updateStatCard(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    updateBidValueCard() {
        const totalValueEl = document.getElementById('total-bid-value');
        const wonValueEl = document.getElementById('won-value');
        const pendingValueEl = document.getElementById('pending-value');
        
        if (totalValueEl) totalValueEl.textContent = this.formatCurrency(this.stats.totalValue || 0);
        if (wonValueEl) wonValueEl.textContent = this.formatCurrency(this.stats.wonValue || 0);
        if (pendingValueEl) pendingValueEl.textContent = this.formatCurrency(this.stats.pendingValue || 0);
    }

    renderJobs(jobsToRender = this.jobs) {
        if (this.currentView === 'table') {
            this.renderTableView(jobsToRender);
        } else {
            this.renderCardView(jobsToRender);
        }
    }

    renderTableView(jobs) {
        const tbody = document.querySelector('.jobs-table tbody');
        if (!tbody) return;

        if (jobs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center" style="padding: 2rem; color: #6b7280; font-style: italic;">
                        No jobs found. <a href="#" onclick="app.showAddJobModal()" style="color: var(--primary-color);">Add your first job</a>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = jobs.map(job => `
            <tr>
                <td class="job-title">${this.escapeHtml(job.title)}</td>
                <td>${this.escapeHtml(job.client)}</td>
                <td>${this.escapeHtml(job.location || 'N/A')}</td>
                <td>${this.escapeHtml(job.estimator || 'Unassigned')}</td>
                <td>
                    <div class="deadline">
                        <span class="deadline-date">${this.formatDate(job.deadline)}</span>
                        <span class="deadline-countdown ${this.getDeadlineClass(job.deadline)}">
                            ${this.getDeadlineText(job.deadline)}
                        </span>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${job.status}">${this.formatStatus(job.status)}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="app.editJob('${job.id}')" title="Edit">
                            ✏️
                        </button>
                        <button class="action-btn delete" onclick="app.handleJobDelete('${job.id}')" title="Delete">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderCardView(jobs) {
        const container = document.querySelector('.jobs-grid');
        if (!container) return;

        if (jobs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-content">
                        <h3>No jobs found</h3>
                        <p>Get started by adding your first job</p>
                        <button class="btn btn-primary" onclick="app.showAddJobModal()">
                            <span>📝</span> Add Job
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = jobs.map(job => `
            <div class="job-card">
                <div class="job-card-header">
                    <h3 class="job-card-title">${this.escapeHtml(job.title)}</h3>
                    <p class="job-card-client">${this.escapeHtml(job.client)}</p>
                </div>
                <div class="job-card-body">
                    <div class="job-card-detail">
                        <strong>Location:</strong>
                        <span>${this.escapeHtml(job.location || 'N/A')}</span>
                    </div>
                    <div class="job-card-detail">
                        <strong>Estimator:</strong>
                        <span>${this.escapeHtml(job.estimator || 'Unassigned')}</span>
                    </div>
                    <div class="job-card-detail">
                        <strong>Deadline:</strong>
                        <span>${this.formatDate(job.deadline)}</span>
                    </div>
                    <div class="job-card-detail">
                        <strong>Bid Value:</strong>
                        <span>${this.formatCurrency(job.bidValue)}</span>
                    </div>
                    <div class="job-card-detail">
                        <strong>Status:</strong>
                        <span class="status-badge ${job.status}">${this.formatStatus(job.status)}</span>
                    </div>
                </div>
                <div class="job-card-actions">
                    <button class="btn btn-outline" onclick="app.editJob('${job.id}')">
                        <span>✏️</span> Edit
                    </button>
                    <button class="btn btn-danger" onclick="app.handleJobDelete('${job.id}')">
                        <span>🗑️</span> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderEstimatorFilter() {
        const estimatorFilter = document.getElementById('estimator-filter');
        if (!estimatorFilter) return;

        estimatorFilter.innerHTML = `
            <option value="all">All Estimators</option>
            ${this.estimators.map(estimator => `
                <option value="${estimator.name}">${estimator.name}</option>
            `).join('')}
        `;
    }

    updateCompanyInfo() {
        const companyName = this.getCompanyName(this.currentCompany);
        document.title = `${companyName} - Bid Tracking Dashboard`;
        
        // Update any company-specific elements
        const logoText = document.querySelector('.logo h1');
        if (logoText) {
            logoText.textContent = companyName;
        }
    }

    // Modal Methods
    showAddJobModal() {
        this.showNotification('Demo mode: Add job functionality available with Firebase', 'info');
    }

    editJob(jobId) {
        this.showNotification('Demo mode: Edit job functionality available with Firebase', 'info');
    }

    handleJobDelete(jobId) {
        if (!confirm('Are you sure you want to delete this job?')) {
            return;
        }
        
        this.showNotification('Demo mode: Job would be deleted with Firebase', 'info');
        // Remove from local array for demo
        this.jobs = this.jobs.filter(job => job.id !== jobId);
        this.renderJobs();
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    hideModal() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // Utility Methods
    getCompanyName(companyId) {
        const companies = {
            'mhc': 'MH Construction',
            'hdd': 'High Desert Drywall'
        };
        return companies[companyId] || companyId;
    }

    setCompanyTheme() {
        document.body.className = `${this.currentCompany}-theme`;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    }

    formatDate(date) {
        if (!date) return 'N/A';
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString();
    }

    formatStatus(status) {
        return status.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    getDeadlineClass(deadline) {
        if (!deadline) return '';
        const d = deadline instanceof Date ? deadline : new Date(deadline);
        const now = new Date();
        const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'overdue';
        if (diffDays <= 7) return 'soon';
        return '';
    }

    getDeadlineText(deadline) {
        if (!deadline) return '';
        const d = deadline instanceof Date ? deadline : new Date(deadline);
        const now = new Date();
        const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
        if (diffDays === 0) return 'Due today';
        if (diffDays === 1) return 'Due tomorrow';
        return `${diffDays} days remaining`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, initializing app...');
    window.app = new BidTrackingApp();
});

console.log('📋 App.js module loaded successfully');

export default BidTrackingApp;