// Simple test version of app.js to verify module loading
console.log('🚀 App.js loaded successfully as ES module');

// Simple app initialization without Firebase for testing
class BidTrackingApp {
    constructor() {
        console.log('📱 BidTrackingApp initialized');
        this.currentCompany = 'mhc';
        this.init();
    }

    init() {
        console.log('🔧 Initializing app...');
        this.setCompanyTheme();
        this.setupBasicEventListeners();
        this.renderMockData();
        console.log('✅ App initialized successfully');
    }

    setCompanyTheme() {
        document.body.className = `${this.currentCompany}-theme`;
        console.log(`🎨 Theme set to: ${this.currentCompany}`);
    }

    setupBasicEventListeners() {
        // Company selector
        const companySelect = document.getElementById('company-select');
        if (companySelect) {
            companySelect.value = this.currentCompany;
            companySelect.addEventListener('change', (e) => {
                this.currentCompany = e.target.value;
                this.setCompanyTheme();
                console.log(`🔄 Switched to company: ${this.currentCompany}`);
            });
        }

        // Add job button
        const addJobBtn = document.getElementById('add-job-btn');
        if (addJobBtn) {
            addJobBtn.addEventListener('click', () => {
                alert('Add Job clicked! Firebase integration coming next...');
            });
        }

        console.log('🎯 Event listeners set up');
    }

    renderMockData() {
        // Update stats with mock data
        this.updateStatCard('total-jobs', 12);
        this.updateStatCard('in-progress', 5);
        this.updateStatCard('submitted', 4);
        this.updateStatCard('follow-up', 2);
        this.updateStatCard('overdue', 1);
        this.updateStatCard('won', 3);

        // Update bid values
        const totalValueEl = document.getElementById('total-bid-value');
        const wonValueEl = document.getElementById('won-value');
        const pendingValueEl = document.getElementById('pending-value');
        
        if (totalValueEl) totalValueEl.textContent = '$2,450,000';
        if (wonValueEl) wonValueEl.textContent = '$890,000';
        if (pendingValueEl) pendingValueEl.textContent = '$1,560,000';

        // Render mock jobs table
        this.renderMockJobs();

        console.log('📊 Mock data rendered');
    }

    updateStatCard(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    renderMockJobs() {
        const tbody = document.querySelector('.jobs-table tbody');
        if (!tbody) return;

        const mockJobs = [
            {
                title: 'Downtown Office Complex',
                client: 'ABC Development',
                location: 'Phoenix, AZ',
                estimator: 'John Smith',
                deadline: '2024-01-15',
                status: 'in-progress'
            },
            {
                title: 'Residential Subdivision',
                client: 'XYZ Homes',
                location: 'Scottsdale, AZ',
                estimator: 'Jane Doe',
                deadline: '2024-01-20',
                status: 'submitted'
            },
            {
                title: 'Shopping Center Renovation',
                client: 'Retail Partners LLC',
                location: 'Tempe, AZ',
                estimator: 'Mike Johnson',
                deadline: '2024-01-10',
                status: 'follow-up-required'
            }
        ];

        tbody.innerHTML = mockJobs.map(job => `
            <tr>
                <td class="job-title">${job.title}</td>
                <td>${job.client}</td>
                <td>${job.location}</td>
                <td>${job.estimator}</td>
                <td>
                    <div class="deadline">
                        <span class="deadline-date">${job.deadline}</span>
                        <span class="deadline-countdown">5 days remaining</span>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${job.status}">${this.formatStatus(job.status)}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="alert('Edit clicked!')" title="Edit">
                            ✏️
                        </button>
                        <button class="action-btn delete" onclick="alert('Delete clicked!')" title="Delete">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    formatStatus(status) {
        return status.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, initializing app...');
    window.app = new BidTrackingApp();
});

console.log('📋 App.js module loaded successfully');