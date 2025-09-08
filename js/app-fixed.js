// Dual Bid Tracking App with Firebase Integration
import { dbService } from './database-service-clean.js';

class BidTrackingApp {
    constructor() {
        this.currentCompany = localStorage.getItem('currentCompany') || 'mhc';
        this.currentView = 'table';
        this.jobs = [];
        this.estimators = [];
        this.stats = {};
        this.unsubscribeJobs = null;
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing Dual Bid Tracking App with Firebase...');
            
            this.setupEventListeners();
            this.setCompanyTheme();
            
            // Load initial data from Firebase
            await this.loadInitialData();
            this.subscribeToJobUpdates();
            this.renderPage();
            
            console.log('✅ App initialized successfully with Firebase');
            this.showNotification('Connected to Firebase database', 'success');
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            this.showNotification('Error connecting to Firebase. Please check your configuration.', 'error');
        }
    }

    async loadInitialData() {
        try {
            this.showLoading('Loading data from Firebase...');
            
            // Load jobs and estimators in parallel
            const [jobs, estimators] = await Promise.all([
                dbService.getJobsByCompany(this.currentCompany),
                dbService.getEstimatorsByCompany(this.currentCompany)
            ]);
            
            this.jobs = jobs;
            this.estimators = estimators;
            
            // Calculate statistics
            this.stats = await dbService.getJobStatistics(this.currentCompany);
            
            this.hideLoading();
            console.log(`📊 Loaded ${jobs.length} jobs and ${estimators.length} estimators for ${this.getCompanyName(this.currentCompany)}`);
        } catch (error) {
            this.hideLoading();
            console.error('Error loading initial data:', error);
            this.showNotification('Error loading data from Firebase. Please check your connection.', 'error');
            throw error;
        }
    }

    subscribeToJobUpdates() {
        // Unsubscribe from previous subscription if exists
        if (this.unsubscribeJobs) {
            this.unsubscribeJobs();
        }

        // Subscribe to real-time job updates
        console.log('🔄 Setting up real-time job updates...');
        this.unsubscribeJobs = dbService.subscribeToJobs(this.currentCompany, (jobs) => {
            console.log(`📡 Received ${jobs.length} jobs from Firebase`);
            this.jobs = jobs;
            this.updateStatistics();
            this.renderJobs();
            this.renderStats();
        });
    }

    async updateStatistics() {
        try {
            this.stats = await dbService.getJobStatistics(this.currentCompany);
        } catch (error) {
            console.error('Error updating statistics:', error);
        }
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

        // Export button
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.showExportModal();
            });
        }

        // Manage estimators button
        const manageEstimatorsBtn = document.getElementById('manage-estimators-btn');
        if (manageEstimatorsBtn) {
            manageEstimatorsBtn.addEventListener('click', () => {
                this.showEstimatorsModal();
            });
        }

        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
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

        // Filter selects
        const statusFilter = document.getElementById('status-filter');
        const estimatorFilter = document.getElementById('estimator-filter');
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }
        
        if (estimatorFilter) {
            estimatorFilter.addEventListener('change', () => {
                this.applyFilters();
            });
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

        // Form submission handlers
        const jobForm = document.getElementById('job-form');
        if (jobForm) {
            jobForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleJobSubmit(e);
            });
        }

        // Estimator add button
        const addEstimatorBtn = document.getElementById('add-estimator-btn');
        const newEstimatorInput = document.getElementById('new-estimator-name');
        if (addEstimatorBtn && newEstimatorInput) {
            addEstimatorBtn.addEventListener('click', async () => {
                const name = newEstimatorInput.value.trim();
                if (!name) {
                    this.showNotification('Please enter an estimator name.', 'warning');
                    return;
                }
                try {
                    this.showLoading('Saving estimator...');
                    await dbService.addEstimator({ name, company: this.currentCompany });
                    newEstimatorInput.value = '';
                    this.hideLoading();
                    this.showNotification('Estimator added successfully!', 'success');
                    await this.loadInitialData();
                    this.populateEstimatorDropdown();
                } catch (error) {
                    this.hideLoading();
                    console.error('Error saving estimator:', error);
                    this.showNotification('Error saving estimator. Please try again.', 'error');
                }
            });
        }
        console.log('✅ Event listeners set up');
    }

    async switchCompany(companyId) {
        try {
            this.currentCompany = companyId;
            localStorage.setItem('currentCompany', companyId);
            
            this.setCompanyTheme();
            await this.loadInitialData();
            this.subscribeToJobUpdates();
            this.renderPage();
            
            this.showNotification(`Switched to ${this.getCompanyName(companyId)}`, 'success');
        } catch (error) {
            console.error('Error switching company:', error);
            this.showNotification('Error switching company', 'error');
        }
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

    async handleJobSubmit(event) {
        try {
            this.showLoading('Saving job to Firebase...');
            
            const formData = new FormData(event.target);
            const jobData = {
                title: formData.get('title'),
                client: formData.get('client'),
                location: formData.get('location'),
                estimator: formData.get('estimator'),
                deadline: new Date(formData.get('deadline')),
                bidValue: parseFloat(formData.get('bidValue')) || 0,
                status: formData.get('status'),
                notes: formData.get('notes') || '',
                company: this.currentCompany
            };

            const jobId = event.target.dataset.jobId;
            
            if (jobId) {
                // Update existing job
                await dbService.updateJob(jobId, jobData);
                this.showNotification('Job updated successfully!', 'success');
            } else {
                // Add new job
                await dbService.addJob(jobData);
                this.showNotification('Job added successfully!', 'success');
            }
            
            this.hideModal();
            this.hideLoading();
            
            // Data will be updated automatically via real-time subscription
            
        } catch (error) {
            this.hideLoading();
            console.error('Error saving job:', error);
            this.showNotification('Error saving job. Please try again.', 'error');
        }
    }

    async handleJobDelete(jobId) {
        if (!confirm('Are you sure you want to delete this job?')) {
            return;
        }

        try {
            this.showLoading('Deleting job from Firebase...');
            await dbService.deleteJob(jobId);
            this.hideLoading();
            this.showNotification('Job deleted successfully!', 'success');
            
            // Data will be updated automatically via real-time subscription
            
        } catch (error) {
            this.hideLoading();
            console.error('Error deleting job:', error);
            this.showNotification('Error deleting job. Please try again.', 'error');
        }
    }

    async handleSearch(searchTerm) {
        if (!searchTerm.trim()) {
            this.renderJobs();
            return;
        }

        try {
            const searchResults = await dbService.searchJobs(this.currentCompany, searchTerm);
            this.renderJobs(searchResults);
        } catch (error) {
            console.error('Error searching jobs:', error);
            this.showNotification('Error searching jobs', 'error');
        }
    }

    applyFilters() {
        const statusFilter = document.getElementById('status-filter')?.value;
        const estimatorFilter = document.getElementById('estimator-filter')?.value;
        
        let filteredJobs = [...this.jobs];
        
        if (statusFilter && statusFilter !== 'all') {
            filteredJobs = filteredJobs.filter(job => job.status === statusFilter);
        }
        
        if (estimatorFilter && estimatorFilter !== 'all') {
            filteredJobs = filteredJobs.filter(job => job.estimator === estimatorFilter);
        }
        
        this.renderJobs(filteredJobs);
    }

    async handleExport(format) {
        try {
            this.showLoading('Exporting data from Firebase...');
            
            const exportData = await dbService.exportJobs(this.currentCompany, format);
            
            // Create download
            const blob = new Blob([exportData], { 
                type: format === 'csv' ? 'text/csv' : 'application/json' 
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.getCompanyName(this.currentCompany)}-jobs-${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.hideLoading();
            this.hideModal();
            this.showNotification('Export completed successfully!', 'success');
            
        } catch (error) {
            this.hideLoading();
            console.error('Error exporting data:', error);
            this.showNotification('Error exporting data', 'error');
        }
    }

    // UI Rendering Methods
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
        this.populateEstimatorDropdown();
        this.clearJobForm();
        this.showModal('job-modal');
    }

    editJob(jobId) {
        const job = this.jobs.find(j => j.id === jobId);
        if (job) {
            this.populateJobForm(job);
            this.populateEstimatorDropdown();
            this.showModal('job-modal');
        }
    }

    showExportModal() {
        this.showModal('export-modal');
    }

    showEstimatorsModal() {
        console.log('🟢 showEstimatorsModal called');
        this.showModal('estimators-modal');
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

    populateEstimatorDropdown() {
        const select = document.getElementById('estimator');
        if (select) {
            select.innerHTML = '<option value="">Select Estimator</option>' +
                this.estimators.map(est =>
                    `<option value="${est.name}">${est.name}</option>`
                ).join('');
        }
    }

    populateJobForm(job) {
        const form = document.getElementById('job-form');
        if (form && job) {
            form.dataset.jobId = job.id;
            form.title.value = job.title || '';
            form.client.value = job.client || '';
            form.location.value = job.location || '';
            form.estimator.value = job.estimator || '';
            form.deadline.value = job.deadline ? this.formatDateForInput(job.deadline) : '';
            form.bidValue.value = job.bidValue || '';
            form.status.value = job.status || '';
            form.notes.value = job.notes || '';
        }
    }

    clearJobForm() {
        const form = document.getElementById('job-form');
        if (form) {
            form.reset();
            delete form.dataset.jobId;
        }
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
        const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
        return d.toLocaleDateString();
    }

    formatDateForInput(date) {
        if (!date) return '';
        const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
        return d.toISOString().split('T')[0];
    }

    formatStatus(status) {
        return status.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    getDeadlineClass(deadline) {
        if (!deadline) return '';
        const d = deadline.seconds ? new Date(deadline.seconds * 1000) : new Date(deadline);
        const now = new Date();
        const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'overdue';
        if (diffDays <= 7) return 'soon';
        return '';
    }

    getDeadlineText(deadline) {
        if (!deadline) return '';
        const d = deadline.seconds ? new Date(deadline.seconds * 1000) : new Date(deadline);
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

    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loading-overlay');
        const text = document.getElementById('loading-text');
        if (overlay && text) {
            text.textContent = message;
            overlay.style.display = 'flex';
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
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

    async handleEstimatorSubmit(event) {
        try {
            this.showLoading('Saving estimator...');
            const formData = new FormData(event.target);
            const estimatorData = {
                name: formData.get('name'),
                company: this.currentCompany
            };
            console.log('🟢 handleEstimatorSubmit called with:', estimatorData);
            await dbService.addEstimator(estimatorData);
            this.hideModal();
            this.hideLoading();
            this.showNotification('Estimator added successfully!', 'success');
            // Refresh estimators list
            await this.loadInitialData();
            this.populateEstimatorDropdown();
        } catch (error) {
            this.hideLoading();
            console.error('Error saving estimator:', error);
            this.showNotification('Error saving estimator. Please try again.', 'error');
        }
    }

    destroy() {
        // Cleanup subscriptions
        if (this.unsubscribeJobs) {
            this.unsubscribeJobs();
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, initializing app...');
    window.app = new BidTrackingApp();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.app) {
        window.app.destroy();
    }
});

console.log('📋 App.js module loaded successfully');

export default BidTrackingApp;