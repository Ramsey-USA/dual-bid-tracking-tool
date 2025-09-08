// Main App Logic for Dual Bid Tracking Dashboard

let dbServicePromise = null;
function getDbService() {
  if (!dbServicePromise) {
    dbServicePromise = import('./database-service-clean.js')
      .then(mod => mod.default)
      .catch(err => {
        console.error('Failed to load database service:', err);
        // Provide a minimal stub so UI still works (read-only / empty)
        return {
          getEstimatorsByCompany: async () => [],
          getJobsByCompany: async () => [],
          addEstimator: async () => { throw new Error('Database unavailable'); },
          addJob: async () => { throw new Error('Database unavailable'); },
          updateJob: async () => { throw new Error('Database unavailable'); },
          deleteJob: async () => { throw new Error('Database unavailable'); }
        };
      });
  }
  return dbServicePromise;
}

class App {
  constructor() {
    console.log('App initializing');
    this.currentCompany = 'mhc';
    this.estimators = [];
    this.jobs = [];
    this.currentView = 'table';

    // Bind methods
    this.setupEventListeners = this.setupEventListeners.bind(this);
    this.loadInitialData = this.loadInitialData.bind(this);

    // If DOM is already ready, initialize immediately. Otherwise wait for DOMContentLoaded.
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        try {
          this.setupEventListeners();
          this.loadInitialData();
        } catch (err) {
          console.error('Error during init (DOMContentLoaded):', err);
        }
      });
    } else {
      try {
        this.setupEventListeners();
        this.loadInitialData();
      } catch (err) {
        console.error('Error during init:', err);
      }
    }
  }

  async loadInitialData() {
    try {
      const dbService = await getDbService();
      this.estimators = await dbService.getEstimatorsByCompany(this.currentCompany);
      this.jobs = await dbService.getJobsByCompany(this.currentCompany);
      this.populateEstimatorDropdown();
      this.populateEstimatorFilter();
      this.renderJobs();
    } catch (err) {
      console.error('Error loading data', err);
      // Fallback to empty lists so UI remains usable
      this.estimators = this.estimators || [];
      this.jobs = this.jobs || [];
      this.populateEstimatorDropdown();
      this.populateEstimatorFilter();
      this.renderJobs();
    }
  }

  // Populate estimator select inside job form
  populateEstimatorDropdown() {
    const select = document.getElementById('estimator');
    if (!select) return;
    select.innerHTML = '<option value="">Select Estimator</option>' +
      (this.estimators || []).map(est => `<option value="${this.escapeHtml(est.name)}">${this.escapeHtml(est.name)}</option>`).join('');
  }

  // Populate estimator filter select in controls
  populateEstimatorFilter() {
    const select = document.getElementById('estimator-filter');
    if (!select) return;
    select.innerHTML = '<option value="">All Estimators</option>' +
      (this.estimators || []).map(est => `<option value="${this.escapeHtml(est.name)}">${this.escapeHtml(est.name)}</option>`).join('');
    // Replace onchange to avoid duplicate listeners
    select.onchange = () => this.renderJobs();
  }

  setupEventListeners() {
    try {
      console.log('Attaching event listeners');
      const companySelect = document.getElementById('company-select');
      const addJobBtn = document.getElementById('add-job-btn');
      const manageEstimatorsBtn = document.getElementById('manage-estimators-btn');
      const tableViewBtn = document.getElementById('table-view');
      const cardViewBtn = document.getElementById('card-view');

      console.log({ companySelect: !!companySelect, addJobBtn: !!addJobBtn, manageEstimatorsBtn: !!manageEstimatorsBtn });

      if (companySelect) {
        companySelect.addEventListener('change', async (e) => {
          this.currentCompany = e.target.value;
          await this.loadInitialData();
        });
      }

      if (addJobBtn) addJobBtn.addEventListener('click', () => this.showAddJobModal());
      else console.warn('Add Job button not found');

      if (manageEstimatorsBtn) manageEstimatorsBtn.addEventListener('click', () => this.showEstimatorsModal());
      if (tableViewBtn) tableViewBtn.addEventListener('click', () => this.switchView('table'));
      if (cardViewBtn) cardViewBtn.addEventListener('click', () => this.switchView('card'));

      // Job modal buttons
      const closeJobModal = document.getElementById('close-modal');
      const cancelJob = document.getElementById('cancel-btn');
      const jobForm = document.getElementById('job-form');
      console.log({ closeJobModal: !!closeJobModal, cancelJob: !!cancelJob, jobForm: !!jobForm });
      if (closeJobModal) closeJobModal.addEventListener('click', () => this.hideModal('job-modal'));
      if (cancelJob) cancelJob.addEventListener('click', () => this.hideModal('job-modal'));
      if (jobForm) jobForm.addEventListener('submit', (e) => this.handleJobSubmit(e));

      // Estimators
      const closeEstimatorsModal = document.getElementById('close-estimators-modal');
      const addEstimatorBtn = document.getElementById('add-estimator-btn');
      const newEstimatorInput = document.getElementById('new-estimator-name');
      if (closeEstimatorsModal) closeEstimatorsModal.addEventListener('click', () => this.hideModal('estimators-modal'));
      if (addEstimatorBtn && newEstimatorInput) {
        addEstimatorBtn.addEventListener('click', async () => {
          const name = newEstimatorInput.value.trim();
          if (!name) return;
          try {
            const dbService = await getDbService();
            await dbService.addEstimator({ name, company: this.currentCompany });
            newEstimatorInput.value = '';
            await this.loadInitialData();
          } catch (err) {
            console.error('Error adding estimator', err);
            alert('Unable to add estimator: ' + err.message);
          }
        });
      }

      // Click outside modal to close
      window.addEventListener('click', (e) => {
        const jobModal = document.getElementById('job-modal');
        const estimatorsModal = document.getElementById('estimators-modal');
        if (e.target === jobModal) this.hideModal('job-modal');
        if (e.target === estimatorsModal) this.hideModal('estimators-modal');
      });
    } catch (err) {
      console.error('Error attaching event listeners:', err);
    }
  }

  async handleJobSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const jobId = form.jobId.value || null;
    const data = {
      projectName: form.projectName.value.trim(),
      client: form.client.value.trim(),
      location: form.location.value.trim(),
      estimator: form.estimator.value,
      deadline: form.deadline.value || null,
      followUpDate: form.followUpDate ? form.followUpDate.value : null,
      estimatingCost: form.estimatingCost ? parseFloat(form.estimatingCost.value) || 0 : 0,
      bidAmount: form.bidAmount ? parseFloat(form.bidAmount.value) || 0 : 0,
      bondAmount: form.bondAmount ? parseFloat(form.bondAmount.value) || 0 : 0,
      status: form.status.value || 'In Progress',
      description: form.description ? form.description.value : '',
      company: this.currentCompany
    };
    try {
      const dbService = await getDbService();
      if (jobId) {
        await dbService.updateJob(jobId, data);
      } else {
        await dbService.addJob(data);
      }
      this.hideModal('job-modal');
      await this.loadInitialData();
    } catch (err) {
      console.error('Error saving job', err);
      alert('Unable to save job: ' + (err.message || err));
    }
  }

  showAddJobModal() {
    this.populateEstimatorDropdown();
    const form = document.getElementById('job-form');
    if (form) {
      form.reset();
      form.jobId.value = '';
    }
    const modal = document.getElementById('job-modal');
    if (modal) modal.style.display = 'flex';
    document.body.classList.add('modal-open');
    // focus first input for accessibility & confirmation
    const firstInput = document.querySelector('#job-form input, #job-form select, #job-form textarea');
    if (firstInput) {
      try { firstInput.focus(); } catch (e) { /* ignore */ }
    }
  }

  showEstimatorsModal() {
    const modal = document.getElementById('estimators-modal');
    if (modal) modal.style.display = 'flex';
    this.renderEstimatorsList();
  }

  hideModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
    document.body.classList.remove('modal-open');
  }

  switchView(view) {
    this.currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById(`${view}-view`);
    if (btn) btn.classList.add('active');
    document.getElementById('table-container').style.display = view === 'table' ? 'block' : 'none';
    document.getElementById('card-container').style.display = view === 'card' ? 'block' : 'none';
    this.renderJobs();
  }

  renderJobs() {
    const filter = document.getElementById('estimator-filter');
    const estimatorFilter = filter ? filter.value : '';
    const jobs = this.jobs.filter(j => (estimatorFilter ? j.estimator === estimatorFilter : true));
    if (this.currentView === 'table') this.renderTableView(jobs);
    else this.renderCardView(jobs);
  }

  renderTableView(jobs) {
    const tbody = document.getElementById('jobs-table-body');
    if (!tbody) return;
    if (!jobs.length) {
      tbody.innerHTML = '<tr><td colspan="5">No jobs found.</td></tr>';
      return;
    }
    tbody.innerHTML = jobs.map(job => `
      <tr>
        <td>${this.escapeHtml(job.projectName)}</td>
        <td>${job.deadline || ''}</td>
        <td>${this.escapeHtml(job.estimator || '')}</td>
        <td>${this.escapeHtml(job.status || '')}</td>
        <td><button data-id="${job.id}" class="edit-btn">Edit</button></td>
      </tr>
    `).join('');
    // attach edit listeners
    tbody.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', (e) => this.editJob(e.target.dataset.id)));
  }

  renderCardView(jobs) {
    const container = document.getElementById('jobs-card-container');
    if (!container) return;
    if (!jobs.length) { container.innerHTML = '<div>No jobs found.</div>'; return; }
    container.innerHTML = jobs.map(job => `
      <div class="job-card">
        <h3>${this.escapeHtml(job.projectName)}</h3>
        <p><strong>Estimator:</strong> ${this.escapeHtml(job.estimator||'')}</p>
        <p><strong>Deadline:</strong> ${job.deadline||''}</p>
      </div>
    `).join('');
  }

  renderEstimatorsList() {
    const container = document.getElementById('estimators-list');
    if (!container) return;
    if (!this.estimators.length) { container.innerHTML = '<div>No estimators.</div>'; return; }
    container.innerHTML = this.estimators.map(est => `<div>${this.escapeHtml(est.name)}</div>`).join('');
  }

  editJob(id) {
    const job = this.jobs.find(j => j.id === id);
    if (!job) return;
    const form = document.getElementById('job-form');
    form.jobId.value = job.id || '';
    form.projectName.value = job.projectName || '';
    form.client.value = job.client || '';
    form.location.value = job.location || '';
    form.estimator.value = job.estimator || '';
    form.deadline.value = job.deadline || '';
    form.followUpDate.value = job.followUpDate || '';
    form.estimatingCost.value = job.estimatingCost || '';
    form.bidAmount.value = job.bidAmount || '';
    form.bondAmount.value = job.bondAmount || '';
    form.status.value = job.status || '';
    form.description.value = job.description || '';
    document.getElementById('job-modal').style.display = 'block';
    document.body.classList.add('modal-open');
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
  }
}

window.app = new App();