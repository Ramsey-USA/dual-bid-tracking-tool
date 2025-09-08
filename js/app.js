/**
 * MH Construction & High Desert Drywall - Job Bidding Dashboard
 * Dual-company construction project management application
 * 
 * Features:
 * - Dual company support with automatic theme switching
 * - Real-time search and filtering
 * - Data export (CSV/PDF)
 * - Responsive design
 * - Local data persistence with company separation
 */

class JobBiddingDashboard {
    constructor() {
        this.jobs = [];
        this.filteredJobs = [];
        this.currentCompany = 'mhc'; // Default to MH Construction
        this.currentView = 'table';
        this.editingJobId = null;
        
        // Company configurations
        this.companies = {
            mhc: {
                name: 'MH Construction',
                subtitle: 'Professional Construction Services',
                theme: 'mhc-theme',
                estimators: ['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Lisa Chen']
            },
            hdd: {
                name: 'High Desert Drywall',
                subtitle: 'Precision Drywall Solutions',
                theme: 'hdd-theme',
                estimators: ['David Rodriguez', 'Emily Thompson', 'James Martinez', 'Anna Foster']
            }
        };
        
        this.initializeApp();
        this.loadSampleData();
    }
    
    initializeApp() {
        this.loadStoredData();
        this.bindEvents();
        this.updateCompanyTheme();
        this.updateEstimatorOptions();
        this.renderDashboard();
        this.updateStats();
    }
    
    loadStoredData() {
        // Load stored company preference
        const storedCompany = localStorage.getItem('selectedCompany');
        if (storedCompany && this.companies[storedCompany]) {
            this.currentCompany = storedCompany;
            document.getElementById('company-select').value = storedCompany;
        }
        
        // Load stored jobs
        const storedJobs = localStorage.getItem('constructionJobs');
        if (storedJobs) {
            this.jobs = JSON.parse(storedJobs);
        }
        
        this.applyFilters();
    }
    
    saveData() {
        localStorage.setItem('constructionJobs', JSON.stringify(this.jobs));
        localStorage.setItem('selectedCompany', this.currentCompany);
    }
    
    loadSampleData() {
        // Only load sample data if no jobs exist
        if (this.jobs.length === 0) {
            this.jobs = [
                {
                    id: this.generateId(),
                    projectName: 'Downtown Office Complex',
                    client: 'Metro Development Corp',
                    location: 'Phoenix, AZ',
                    estimator: 'John Smith',
                    deadline: '2025-01-15',
                    followUpDate: '2025-01-12',
                    status: 'In Progress',
                    description: 'Large-scale commercial office building with underground parking and retail space.',
                    estimatingCost: 45000,
                    bidAmount: 2500000,
                    bondAmount: 125000,
                    company: 'mhc',
                    createdAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    projectName: 'Residential Subdivision Phase 2',
                    client: 'Desert Homes LLC',
                    location: 'Scottsdale, AZ',
                    estimator: 'Sarah Johnson',
                    deadline: '2025-01-20',
                    followUpDate: '2025-01-25',
                    status: 'Submitted',
                    description: '45 single-family homes with community amenities and landscaping.',
                    estimatingCost: 35000,
                    bidAmount: 1800000,
                    bondAmount: 90000,
                    company: 'mhc',
                    createdAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    projectName: 'Highway 101 Bridge Repair',
                    client: 'Arizona Department of Transportation',
                    location: 'Tempe, AZ',
                    estimator: 'Mike Wilson',
                    deadline: '2025-01-10',
                    followUpDate: '2025-01-13',
                    status: 'Follow-up Required',
                    description: 'Infrastructure repair and reinforcement of aging bridge structure.',
                    estimatingCost: 25000,
                    bidAmount: 850000,
                    bondAmount: 42500,
                    company: 'mhc',
                    createdAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    projectName: 'Commercial Drywall Installation',
                    client: 'Valley Business Center',
                    location: 'Mesa, AZ',
                    estimator: 'David Rodriguez',
                    deadline: '2025-01-18',
                    followUpDate: '2025-01-22',
                    status: 'In Progress',
                    description: 'Complete drywall installation for 50,000 sq ft office complex.',
                    estimatingCost: 8000,
                    bidAmount: 125000,
                    bondAmount: 6250,
                    company: 'hdd',
                    createdAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    projectName: 'Luxury Home Drywall Package',
                    client: 'Pinnacle Custom Homes',
                    location: 'Paradise Valley, AZ',
                    estimator: 'Emily Thompson',
                    deadline: '2025-01-25',
                    followUpDate: '2025-01-30',
                    status: 'Submitted',
                    description: 'High-end residential drywall with custom textures and specialty finishes.',
                    estimatingCost: 5000,
                    bidAmount: 75000,
                    bondAmount: 3750,
                    company: 'hdd',
                    createdAt: new Date().toISOString()
                }
            ];
            this.saveData();
            this.applyFilters();
        }
    }
    
    bindEvents() {
        // Company selector
        document.getElementById('company-select').addEventListener('change', (e) => {
            this.setCompany(e.target.value);
        });
        
        // Navigation buttons
        document.getElementById('add-job-btn').addEventListener('click', () => {
            this.openJobModal();
        });
        
        document.getElementById('export-btn').addEventListener('click', () => {
            this.openExportModal();
        });
        
        // Search and filters
        document.getElementById('search-input').addEventListener('input', () => {
            this.applyFilters();
        });
        
        document.getElementById('clear-search').addEventListener('click', () => {
            document.getElementById('search-input').value = '';
            this.applyFilters();
        });
        
        document.getElementById('status-filter').addEventListener('change', () => {
            this.applyFilters();
        });
        
        document.getElementById('estimator-filter').addEventListener('change', () => {
            this.applyFilters();
        });
        
        document.getElementById('clear-filters').addEventListener('click', () => {
            this.clearFilters();
        });
        
        // View toggle
        document.getElementById('table-view').addEventListener('click', () => {
            this.setView('table');
        });
        
        document.getElementById('card-view').addEventListener('click', () => {
            this.setView('card');
        });
        
        // Modal events
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeJobModal();
        });
        
        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.closeJobModal();
        });
        
        document.getElementById('job-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveJob();
        });
        
        // Export modal events
        document.getElementById('close-export-modal').addEventListener('click', () => {
            this.closeExportModal();
        });
        
        document.getElementById('cancel-export').addEventListener('click', () => {
            this.closeExportModal();
        });
        
        document.getElementById('confirm-export').addEventListener('click', () => {
            this.exportData();
        });
        
        // Close modals on backdrop click
        document.getElementById('job-modal').addEventListener('click', (e) => {
            if (e.target.id === 'job-modal') {
                this.closeJobModal();
            }
        });
        
        document.getElementById('export-modal').addEventListener('click', (e) => {
            if (e.target.id === 'export-modal') {
                this.closeExportModal();
            }
        });
    }
    
    setCompany(companyCode) {
        if (!this.companies[companyCode]) return;
        
        this.currentCompany = companyCode;
        this.updateCompanyTheme();
        this.updateEstimatorOptions();
        this.applyFilters();
        this.saveData();
    }
    
    updateCompanyTheme() {
        const company = this.companies[this.currentCompany];
        
        // Update body theme class
        document.body.className = company.theme;
        
        // Update header text
        document.getElementById('company-title').textContent = company.name;
        document.getElementById('company-subtitle').textContent = company.subtitle;
        
        // Update export modal label
        document.getElementById('export-all-label').textContent = `All ${company.name} Jobs`;
    }
    
    updateEstimatorOptions() {
        const estimators = this.companies[this.currentCompany].estimators;
        
        // Update modal estimator dropdown
        const modalEstimatorSelect = document.getElementById('estimator');
        modalEstimatorSelect.innerHTML = '<option value="">Select Estimator</option>';
        estimators.forEach(estimator => {
            const option = document.createElement('option');
            option.value = estimator;
            option.textContent = estimator;
            modalEstimatorSelect.appendChild(option);
        });
        
        // Update filter estimator dropdown
        const filterEstimatorSelect = document.getElementById('estimator-filter');
        filterEstimatorSelect.innerHTML = '<option value="">All Estimators</option>';
        estimators.forEach(estimator => {
            const option = document.createElement('option');
            option.value = estimator;
            option.textContent = estimator;
            filterEstimatorSelect.appendChild(option);
        });
    }
    
    applyFilters() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const statusFilter = document.getElementById('status-filter').value;
        const estimatorFilter = document.getElementById('estimator-filter').value;
        
        this.filteredJobs = this.jobs.filter(job => {
            // Filter by company first
            if (job.company !== this.currentCompany) return false;
            
            // Apply search filter
            const matchesSearch = !searchTerm || 
                job.projectName.toLowerCase().includes(searchTerm) ||
                job.client.toLowerCase().includes(searchTerm) ||
                job.location.toLowerCase().includes(searchTerm);
            
            // Apply status filter
            const matchesStatus = !statusFilter || job.status === statusFilter;
            
            // Apply estimator filter
            const matchesEstimator = !estimatorFilter || job.estimator === estimatorFilter;
            
            return matchesSearch && matchesStatus && matchesEstimator;
        });
        
        this.renderDashboard();
        this.updateStats();
    }
    
    clearFilters() {
        document.getElementById('search-input').value = '';
        document.getElementById('status-filter').value = '';
        document.getElementById('estimator-filter').value = '';
        this.applyFilters();
    }
    
    setView(viewType) {
        this.currentView = viewType;
        
        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${viewType}-view`).classList.add('active');
        
        // Show/hide containers
        document.getElementById('table-container').style.display = viewType === 'table' ? 'block' : 'none';
        document.getElementById('card-container').style.display = viewType === 'card' ? 'block' : 'none';
        
        this.renderDashboard();
    }
    
    renderDashboard() {
        if (this.filteredJobs.length === 0) {
            this.showEmptyState();
            return;
        }
        
        this.hideEmptyState();
        
        if (this.currentView === 'table') {
            this.renderTableView();
        } else {
            this.renderCardView();
        }
    }
    
    renderTableView() {
        const tbody = document.getElementById('jobs-table-body');
        tbody.innerHTML = '';
        
        this.filteredJobs.forEach(job => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="job-title">${this.escapeHtml(job.projectName)}</div>
                </td>
                <td>
                    <div class="deadline">
                        <div class="deadline-date">${this.formatDate(job.deadline)}</div>
                        <div class="deadline-countdown ${this.getDeadlineClass(job.deadline)}">${this.getDeadlineText(job.deadline)}</div>
                    </div>
                </td>
                <td>
                    ${job.followUpDate ? `
                        <div class="deadline">
                            <div class="deadline-date">${this.formatDate(job.followUpDate)}</div>
                        </div>
                    ` : '<span class="text-muted">—</span>'}
                </td>
                <td>${this.formatCurrency(job.estimatingCost || 0)}</td>
                <td>${this.formatCurrency(job.bidAmount || 0)}</td>
                <td>${this.formatCurrency(job.bondAmount || 0)}</td>
                <td>
                    <span class="status-badge ${this.getStatusClass(job.status)}">${job.status}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="dashboard.editJob('${job.id}')" title="Edit Job">✏️</button>
                        <button class="action-btn delete" onclick="dashboard.deleteJob('${job.id}')" title="Delete Job">🗑️</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    renderCardView() {
        const container = document.getElementById('jobs-card-container');
        container.innerHTML = '';
        
        this.filteredJobs.forEach(job => {
            const card = document.createElement('div');
            card.className = 'job-card';
            card.innerHTML = `
                <div class="job-card-header">
                    <h3 class="job-card-title">${this.escapeHtml(job.projectName)}</h3>
                    <p class="job-card-client">${this.escapeHtml(job.client)}</p>
                </div>
                <div class="job-card-body">
                    <div class="job-card-detail">
                        <strong>Location:</strong>
                        <span>${this.escapeHtml(job.location)}</span>
                    </div>
                    <div class="job-card-detail">
                        <strong>Estimator:</strong>
                        <span>${this.escapeHtml(job.estimator)}</span>
                    </div>
                    <div class="job-card-detail">
                        <strong>Deadline:</strong>
                        <span>${this.formatDate(job.deadline)} <small class="${this.getDeadlineClass(job.deadline)}">(${this.getDeadlineText(job.deadline)})</small></span>
                    </div>
                    ${job.followUpDate ? `
                        <div class="job-card-detail">
                            <strong>Follow-up Date:</strong>
                            <span>${this.formatDate(job.followUpDate)}</span>
                        </div>
                    ` : ''}
                    <div class="job-card-detail">
                        <strong>Estimating Cost:</strong>
                        <span>${this.formatCurrency(job.estimatingCost || 0)}</span>
                    </div>
                    <div class="job-card-detail">
                        <strong>Bid Amount:</strong>
                        <span>${this.formatCurrency(job.bidAmount || 0)}</span>
                    </div>
                    <div class="job-card-detail">
                        <strong>Bond Amount:</strong>
                        <span>${this.formatCurrency(job.bondAmount || 0)}</span>
                    </div>
                    <div class="job-card-detail">
                        <strong>Status:</strong>
                        <span class="status-badge ${this.getStatusClass(job.status)}">${job.status}</span>
                    </div>
                    ${job.description ? `<div class="job-card-detail"><strong>Description:</strong><br><span>${this.escapeHtml(job.description)}</span></div>` : ''}
                </div>
                <div class="job-card-actions">
                    <button class="btn btn-outline" onclick="dashboard.editJob('${job.id}')">✏️ Edit</button>
                    <button class="btn btn-danger" onclick="dashboard.deleteJob('${job.id}')">🗑️ Delete</button>
                </div>
            `;
            container.appendChild(card);
        });
    }
    
    showEmptyState() {
        document.getElementById('table-container').style.display = 'none';
        document.getElementById('card-container').style.display = 'none';
        document.getElementById('empty-state').style.display = 'block';
    }
    
    hideEmptyState() {
        document.getElementById('empty-state').style.display = 'none';
        document.getElementById('table-container').style.display = this.currentView === 'table' ? 'block' : 'none';
        document.getElementById('card-container').style.display = this.currentView === 'card' ? 'block' : 'none';
    }
    
    updateStats() {
        // Get jobs for each company
        const mhcJobs = this.jobs.filter(job => job.company === 'mhc');
        const hddJobs = this.jobs.filter(job => job.company === 'hdd');
        const allJobs = this.jobs;
        
        // Calculate totals
        const mhcTotal = mhcJobs.length;
        const hddTotal = hddJobs.length;
        const totalJobs = allJobs.length;
        
        // Calculate in progress
        const mhcProgress = mhcJobs.filter(job => job.status === 'In Progress').length;
        const hddProgress = hddJobs.filter(job => job.status === 'In Progress').length;
        const totalProgress = mhcProgress + hddProgress;
        
        // Calculate submitted
        const mhcSubmitted = mhcJobs.filter(job => job.status === 'Submitted').length;
        const hddSubmitted = hddJobs.filter(job => job.status === 'Submitted').length;
        const totalSubmitted = mhcSubmitted + hddSubmitted;
        
        // Calculate follow-ups
        const mhcFollowup = mhcJobs.filter(job => job.status === 'Follow-up Required').length;
        const hddFollowup = hddJobs.filter(job => job.status === 'Follow-up Required').length;
        const totalFollowup = mhcFollowup + hddFollowup;
        
        // Calculate overdue
        const mhcOverdue = mhcJobs.filter(job => this.isOverdue(job.deadline)).length;
        const hddOverdue = hddJobs.filter(job => this.isOverdue(job.deadline)).length;
        const totalOverdue = mhcOverdue + hddOverdue;
        
        // Calculate won jobs
        const mhcWon = mhcJobs.filter(job => job.status === 'Won').length;
        const hddWon = hddJobs.filter(job => job.status === 'Won').length;
        const totalWon = mhcWon + hddWon;
        
        // Calculate bid values
        const mhcBidValue = mhcJobs.reduce((sum, job) => sum + (job.bidAmount || 0), 0);
        const hddBidValue = hddJobs.reduce((sum, job) => sum + (job.bidAmount || 0), 0);
        const totalBidValue = mhcBidValue + hddBidValue;
        
        // Update total jobs
        document.getElementById('total-jobs').textContent = totalJobs;
        document.getElementById('mhc-total').textContent = mhcTotal;
        document.getElementById('hdd-total').textContent = hddTotal;
        
        // Update in progress
        document.getElementById('in-progress-jobs').textContent = totalProgress;
        document.getElementById('mhc-progress').textContent = mhcProgress;
        document.getElementById('hdd-progress').textContent = hddProgress;
        
        // Update submitted
        document.getElementById('submitted-jobs').textContent = totalSubmitted;
        document.getElementById('mhc-submitted').textContent = mhcSubmitted;
        document.getElementById('hdd-submitted').textContent = hddSubmitted;
        
        // Update follow-ups
        document.getElementById('followup-jobs').textContent = totalFollowup;
        document.getElementById('mhc-followup').textContent = mhcFollowup;
        document.getElementById('hdd-followup').textContent = hddFollowup;
        
        // Update overdue
        document.getElementById('overdue-jobs').textContent = totalOverdue;
        document.getElementById('mhc-overdue').textContent = mhcOverdue;
        document.getElementById('hdd-overdue').textContent = hddOverdue;
        
        // Update won jobs
        document.getElementById('won-jobs').textContent = totalWon;
        document.getElementById('mhc-won').textContent = mhcWon;
        document.getElementById('hdd-won').textContent = hddWon;
        
        // Update bid values
        document.getElementById('total-bid-value').textContent = this.formatCurrency(totalBidValue);
        document.getElementById('mhc-bid-value').textContent = this.formatCurrency(mhcBidValue);
        document.getElementById('hdd-bid-value').textContent = this.formatCurrency(hddBidValue);
    }
    
    openJobModal(job = null) {
        this.editingJobId = job ? job.id : null;
        const modal = document.getElementById('job-modal');
        const form = document.getElementById('job-form');
        
        // Update modal title
        document.getElementById('modal-title').textContent = job ? 'Edit Job' : 'Add New Job';
        document.getElementById('submit-text').textContent = job ? 'Update Job' : 'Save Job';
        
        // Reset form
        form.reset();
        
        // Populate form if editing
        if (job) {
            document.getElementById('project-name').value = job.projectName;
            document.getElementById('client').value = job.client;
            document.getElementById('location').value = job.location;
            document.getElementById('estimator').value = job.estimator;
            document.getElementById('deadline').value = job.deadline;
            document.getElementById('follow-up-date').value = job.followUpDate || '';
            document.getElementById('status').value = job.status;
            document.getElementById('description').value = job.description || '';
            document.getElementById('estimating-cost').value = job.estimatingCost || '';
            document.getElementById('bid-amount').value = job.bidAmount || '';
            document.getElementById('bond-amount').value = job.bondAmount || '';
        }
        
        modal.style.display = 'flex';
        document.getElementById('project-name').focus();
    }
    
    closeJobModal() {
        document.getElementById('job-modal').style.display = 'none';
        this.editingJobId = null;
    }
    
    saveJob() {
        const formData = new FormData(document.getElementById('job-form'));
        const jobData = {
            projectName: formData.get('projectName').trim(),
            client: formData.get('client').trim(),
            location: formData.get('location').trim(),
            estimator: formData.get('estimator'),
            deadline: formData.get('deadline'),
            followUpDate: formData.get('followUpDate') || null,
            status: formData.get('status'),
            description: formData.get('description').trim(),
            estimatingCost: parseFloat(formData.get('estimatingCost')) || 0,
            bidAmount: parseFloat(formData.get('bidAmount')) || 0,
            bondAmount: parseFloat(formData.get('bondAmount')) || 0,
            company: this.currentCompany
        };
        
        // Validation
        if (!jobData.projectName || !jobData.client || !jobData.location || 
            !jobData.estimator || !jobData.deadline || !jobData.status) {
            alert('Please fill in all required fields.');
            return;
        }
        
        if (this.editingJobId) {
            // Update existing job
            const jobIndex = this.jobs.findIndex(job => job.id === this.editingJobId);
            if (jobIndex !== -1) {
                this.jobs[jobIndex] = { ...this.jobs[jobIndex], ...jobData };
            }
        } else {
            // Create new job
            const newJob = {
                id: this.generateId(),
                ...jobData,
                createdAt: new Date().toISOString()
            };
            this.jobs.push(newJob);
        }
        
        this.saveData();
        this.applyFilters();
        this.closeJobModal();
    }
    
    editJob(jobId) {
        const job = this.jobs.find(job => job.id === jobId);
        if (job) {
            this.openJobModal(job);
        }
    }
    
    deleteJob(jobId) {
        const job = this.jobs.find(job => job.id === jobId);
        if (job && confirm(`Are you sure you want to delete "${job.projectName}"?`)) {
            this.jobs = this.jobs.filter(job => job.id !== jobId);
            this.saveData();
            this.applyFilters();
        }
    }
    
    openExportModal() {
        document.getElementById('export-modal').style.display = 'flex';
    }
    
    closeExportModal() {
        document.getElementById('export-modal').style.display = 'none';
    }
    
    exportData() {
        const format = document.querySelector('input[name="export-format"]:checked').value;
        const scope = document.querySelector('input[name="export-scope"]:checked').value;
        
        const dataToExport = scope === 'filtered' ? this.filteredJobs : 
            this.jobs.filter(job => job.company === this.currentCompany);
        
        this.showLoading();
        
        setTimeout(() => {
            if (format === 'csv') {
                this.exportToCSV(dataToExport);
            } else {
                this.exportToPDF(dataToExport);
            }
            this.hideLoading();
            this.closeExportModal();
        }, 1000);
    }
    
    exportToCSV(jobs) {
        const headers = ['Project Name', 'Client', 'Location', 'Estimator', 'Deadline', 'Follow-up Date', 'Status', 'Estimating Cost', 'Bid Amount', 'Bond Amount', 'Description', 'Company'];
        const csvContent = [
            headers.join(','),
            ...jobs.map(job => [
                `"${job.projectName}"`,
                `"${job.client}"`,
                `"${job.location}"`,
                `"${job.estimator}"`,
                job.deadline,
                job.followUpDate || '',
                `"${job.status}"`,
                job.estimatingCost || 0,
                job.bidAmount || 0,
                job.bondAmount || 0,
                `"${job.description || ''}"`,
                this.companies[job.company].name
            ].join(','))
        ].join('\n');
        
        this.downloadFile(csvContent, `${this.companies[this.currentCompany].name}_Jobs_${this.formatDateForFilename(new Date())}.csv`, 'text/csv');
    }
    
    exportToPDF(jobs) {
        // Simple PDF content (in a real app, you'd use a PDF library)
        const companyName = this.companies[this.currentCompany].name;
        const content = `${companyName} - Job Report
Generated: ${new Date().toLocaleDateString()}

${jobs.map(job => `
Project: ${job.projectName}
Client: ${job.client}
Location: ${job.location}
Estimator: ${job.estimator}
Deadline: ${this.formatDate(job.deadline)}
Follow-up Date: ${job.followUpDate ? this.formatDate(job.followUpDate) : 'N/A'}
Status: ${job.status}
Estimating Cost: ${this.formatCurrency(job.estimatingCost || 0)}
Bid Amount: ${this.formatCurrency(job.bidAmount || 0)}
Bond Amount: ${this.formatCurrency(job.bondAmount || 0)}
Description: ${job.description || 'N/A'}
---
`).join('')}`;
        
        this.downloadFile(content, `${companyName}_Report_${this.formatDateForFilename(new Date())}.txt`, 'text/plain');
    }
    
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }
    
    showLoading() {
        document.getElementById('loading-overlay').style.display = 'flex';
    }
    
    hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }
    
    // Utility functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    formatDateForFilename(date) {
        return date.toISOString().split('T')[0];
    }
    
    getStatusClass(status) {
        return status.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }
    
    isOverdue(deadline) {
        return new Date(deadline) < new Date().setHours(0, 0, 0, 0);
    }
    
    getDeadlineClass(deadline) {
        const today = new Date().setHours(0, 0, 0, 0);
        const deadlineDate = new Date(deadline).getTime();
        const daysUntil = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntil < 0) return 'overdue';
        if (daysUntil <= 3) return 'soon';
        return '';
    }
    
    getDeadlineText(deadline) {
        const today = new Date().setHours(0, 0, 0, 0);
        const deadlineDate = new Date(deadline).getTime();
        const daysUntil = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntil < 0) return `${Math.abs(daysUntil)} days overdue`;
        if (daysUntil === 0) return 'Due today';
        if (daysUntil === 1) return 'Due tomorrow';
        return `${daysUntil} days remaining`;
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
}

// Initialize the dashboard when the page loads
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new JobBiddingDashboard();
});

// Make dashboard available globally for onclick handlers
window.dashboard = dashboard;