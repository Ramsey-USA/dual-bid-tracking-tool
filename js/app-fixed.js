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
    this.currentCompany = 'mhc';
    this.estimators = [];
    this.jobs = [];
    this.allJobs = [];
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

  // Apply CSS theme class based on currentCompany
  applyTheme() {
    try {
      document.body.classList.remove('mhc-theme', 'hdd-theme');
      const isHdd = (this.currentCompany || '').toLowerCase() === 'hdd';
      if (isHdd) document.body.classList.add('hdd-theme');
      else document.body.classList.add('mhc-theme');

      // Update header and footer text/icons
      const titleEl = document.getElementById('company-title');
      const subtitleEl = document.getElementById('company-subtitle');
      const footerName = document.getElementById('footer-company-name');
      const footerTagline = document.getElementById('footer-company-tagline');
      const companyIcon = document.getElementById('company-icon');
      const footerIcon = document.getElementById('footer-icon');
      const estimatorsModalTitle = document.getElementById('estimators-modal-title');

      if (isHdd) {
        if (titleEl) titleEl.textContent = 'High Desert Drywall';
        if (subtitleEl) subtitleEl.textContent = 'Specialty Drywall & Finishing';
        if (footerName) footerName.textContent = 'High Desert Drywall';
        if (footerTagline) footerTagline.textContent = 'Precision Drywall Solutions';
        if (companyIcon) companyIcon.textContent = '🏢';
        if (footerIcon) footerIcon.textContent = '🏢';
        if (estimatorsModalTitle) estimatorsModalTitle.textContent = 'Manage Estimators - High Desert Drywall';
      } else {
        if (titleEl) titleEl.textContent = 'MH Construction';
        if (subtitleEl) subtitleEl.textContent = 'Professional Construction Services';
        if (footerName) footerName.textContent = 'MH Construction';
        if (footerTagline) footerTagline.textContent = 'Building Excellence Since 2010';
        if (companyIcon) companyIcon.textContent = '🪖';
        if (footerIcon) footerIcon.textContent = '🪖';
        if (estimatorsModalTitle) estimatorsModalTitle.textContent = 'Manage Estimators - MH Construction';
      }

      // Update any other references such as export label
      const exportAllLabel = document.getElementById('export-all-label');
      if (exportAllLabel) exportAllLabel.textContent = isHdd ? 'All High Desert Drywall Jobs' : 'All Company Jobs';

    } catch (e) {
      // ignore
    }
  }

  async loadInitialData() {
    try {
      // ensure theme set before rendering
      this.applyTheme();
      const dbService = await getDbService();

      // Load estimators for the current company (used in forms/filters)
      this.estimators = await dbService.getEstimatorsByCompany(this.currentCompany);

      // Load jobs for both companies so dashboard totals reflect combined data
      const mhcPromise = dbService.getJobsByCompany('mhc').catch(() => []);
      const hddPromise = dbService.getJobsByCompany('hdd').catch(() => []);
      const [mhcJobs, hddJobs] = await Promise.all([mhcPromise, hddPromise]);
      this.allJobs = Array.isArray(mhcJobs) || Array.isArray(hddJobs) ? [...(mhcJobs || []), ...(hddJobs || [])] : [];

      // Set visible jobs based on the selected company; if no selection, show combined
      if ((this.currentCompany || '').toLowerCase() === 'mhc') {
        this.jobs = await dbService.getJobsByCompany('mhc').catch(() => []);
      } else if ((this.currentCompany || '').toLowerCase() === 'hdd') {
        this.jobs = await dbService.getJobsByCompany('hdd').catch(() => []);
      } else {
        this.jobs = this.allJobs.slice();
      }

      this.populateEstimatorDropdown();
      this.populateEstimatorFilter();
      this.renderJobs();
    } catch (err) {
      console.error('Error loading data', err);
      // Fallback to empty lists so UI remains usable
      this.estimators = this.estimators || [];
      this.jobs = this.jobs || [];
      this.allJobs = this.allJobs || (Array.isArray(this.jobs) ? this.jobs.slice() : []);
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
      const companySelect = document.getElementById('company-select');
      const addJobBtn = document.getElementById('add-job-btn');
      const manageEstimatorsBtn = document.getElementById('manage-estimators-btn');
      const tableViewBtn = document.getElementById('table-view');
      const cardViewBtn = document.getElementById('card-view');

      if (companySelect) {
        companySelect.addEventListener('change', async (e) => {
          this.currentCompany = e.target.value;
          // apply theme immediately for visual feedback
          this.applyTheme();
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
    const jobs = (Array.isArray(this.jobs) ? this.jobs : []).filter(j => (estimatorFilter ? j.estimator === estimatorFilter : true));

    // Always update both views so they remain in sync. Visibility is controlled by switchView.
    try {
      this.renderTableView(jobs);
    } catch (e) {
      console.error('renderTableView failed', e);
    }
    try {
      this.renderCardView(jobs);
    } catch (e) {
      console.error('renderCardView failed', e);
    }

    // Ensure correct container visibility
    const tableContainer = document.getElementById('table-container');
    const cardContainer = document.getElementById('card-container');
    if (tableContainer) tableContainer.style.display = this.currentView === 'table' ? 'block' : 'none';
    if (cardContainer) cardContainer.style.display = this.currentView === 'card' ? 'block' : 'none';

    // Update main dashboard stats and empty state
    try {
      this.updateDashboardStats(jobs);
    } catch (e) {
      console.error('updateDashboardStats failed', e);
    }
  }

  // Debug panel helpers
  _ensureDebugPanel() {
    if (document.getElementById('app-debug-panel')) return;
    const panel = document.createElement('div');
    panel.id = 'app-debug-panel';
    panel.style.position = 'fixed';
    panel.style.right = '12px';
    panel.style.bottom = '12px';
    panel.style.padding = '8px 12px';
    panel.style.background = 'rgba(0,0,0,0.75)';
    panel.style.color = 'white';
    panel.style.fontSize = '12px';
    panel.style.borderRadius = '8px';
    panel.style.zIndex = 99999;
    panel.style.maxWidth = '320px';
    panel.style.boxShadow = '0 6px 18px rgba(0,0,0,0.4)';
    panel.innerHTML = '<strong>App Debug</strong><div id="app-debug-content" style="margin-top:6px"></div>';
    document.body.appendChild(panel);
  }

  _updateDebugPanel(jobs) {
    const el = document.getElementById('app-debug-content');
    if (!el) return;
    const total = Array.isArray(this.jobs) ? this.jobs.length : 0;
    const shown = jobs ? jobs.length : 0;
    const sample = (jobs || []).slice(0,5).map(j => this.escapeHtml(this.getJobField(j, ['projectName','name','title','project']) || j.id || 'no-title')).join('<br>');
    el.innerHTML = `Total in memory: ${total}<br>Shown (filtered): ${shown}<br><hr style="border-color:rgba(255,255,255,0.08)"><div style="max-height:120px;overflow:auto">${sample || '<em>no jobs</em>'}</div>`;
  }

  // Helper to get a job field from possible alternate keys
  getJobField(job, keys) {
    for (const k of keys) {
      if (job && typeof job[k] !== 'undefined' && job[k] !== null) return job[k];
    }
    return '';
  }

  // Update main dashboard counters to reflect current jobs
  updateDashboardStats(jobs) {
    // Use combined allJobs for totals (both MHC and HDD)
    const allJobs = Array.isArray(this.allJobs) ? this.allJobs : (Array.isArray(this.jobs) ? this.jobs : []);
    const visibleJobs = Array.isArray(jobs) ? jobs : [];

    const totals = {
      total: allJobs.length,
      mhc: allJobs.filter(j => (j.company || '').toLowerCase() === 'mhc').length,
      hdd: allJobs.filter(j => (j.company || '').toLowerCase() === 'hdd').length,
      inProgress: allJobs.filter(j => (j.status || '').toLowerCase() === 'in progress').length,
      submitted: allJobs.filter(j => (j.status || '').toLowerCase() === 'submitted').length,
      followup: allJobs.filter(j => (j.status || '').toLowerCase() === 'follow-up required' || (j.status || '').toLowerCase() === 'follow-up' || (j.status || '').toLowerCase() === 'follow up' ).length,
      won: allJobs.filter(j => (j.status || '').toLowerCase() === 'won').length,
      overdue: 0,
      totalBidValue: 0,
      mhcBidValue: 0,
      hddBidValue: 0
    };

    const now = new Date();
    allJobs.forEach(j => {
      const bid = parseFloat(j.bidAmount) || parseFloat(j.bid_amount) || 0;
      const company = (j.company || '').toLowerCase();
      totals.totalBidValue += bid;
      if (company === 'mhc') totals.mhcBidValue += bid;
      if (company === 'hdd') totals.hddBidValue += bid;

      // overdue detection: deadline exists and is before today and status not 'won'/'lost'
      const dl = this.getJobField(j, ['deadline','dueDate','date']);
      if (dl) {
        const dlDate = new Date(dl);
        if (!isNaN(dlDate) && dlDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
          const st = (j.status || '').toLowerCase();
          if (st !== 'won' && st !== 'lost') totals.overdue += 1;
        }
      }
    });

    // Update DOM elements if present
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setText('total-jobs', totals.total);
    setText('mhc-total', totals.mhc);
    setText('hdd-total', totals.hdd);
    setText('in-progress-jobs', totals.inProgress);
    setText('mhc-progress', allJobs.filter(j => (j.company||'').toLowerCase()==='mhc' && (j.status||'').toLowerCase()==='in progress').length);
    setText('hdd-progress', allJobs.filter(j => (j.company||'').toLowerCase()==='hdd' && (j.status||'').toLowerCase()==='in progress').length);
    setText('submitted-jobs', totals.submitted);
    setText('mhc-submitted', allJobs.filter(j => (j.company||'').toLowerCase()==='mhc' && (j.status||'').toLowerCase()==='submitted').length);
    setText('hdd-submitted', allJobs.filter(j => (j.company||'').toLowerCase()==='hdd' && (j.status||'').toLowerCase()==='submitted').length);
    setText('followup-jobs', totals.followup);
    setText('mhc-followup', allJobs.filter(j => (j.company||'').toLowerCase()==='mhc' && ((j.status||'').toLowerCase()==='follow-up required' || (j.status||'').toLowerCase()==='follow-up' || (j.status||'').toLowerCase()==='follow up')).length);
    setText('hdd-followup', allJobs.filter(j => (j.company||'').toLowerCase()==='hdd' && ((j.status||'').toLowerCase()==='follow-up required' || (j.status||'').toLowerCase()==='follow-up' || (j.status||'').toLowerCase()==='follow up')).length);
    setText('overdue-jobs', totals.overdue);
    setText('mhc-overdue', allJobs.filter(j => (j.company||'').toLowerCase()==='mhc' && (() => {
      const dl = this.getJobField(j, ['deadline','dueDate','date']);
      return dl ? (new Date(dl) < new Date(now.getFullYear(), now.getMonth(), now.getDate())) : false;
    })()).length);
    setText('hdd-overdue', allJobs.filter(j => (j.company||'').toLowerCase()==='hdd' && (() => {
      const dl = this.getJobField(j, ['deadline','dueDate','date']);
      return dl ? (new Date(dl) < new Date(now.getFullYear(), now.getMonth(), now.getDate())) : false;
    })()).length);
    setText('won-jobs', totals.won);
    setText('mhc-won', allJobs.filter(j => (j.company||'').toLowerCase()==='mhc' && (j.status||'').toLowerCase()==='won').length);
    setText('hdd-won', allJobs.filter(j => (j.company||'').toLowerCase()==='hdd' && (j.status||'').toLowerCase()==='won').length);
    setText('total-bid-value', `$${totals.totalBidValue.toFixed(2)}`);
    setText('mhc-bid-value', `$${totals.mhcBidValue.toFixed(2)}`);
    setText('hdd-bid-value', `$${totals.hddBidValue.toFixed(2)}`);

    // Update footer trackers if present
    try {
      setText('footer-total-jobs', totals.total);
      setText('footer-total-value', `$${totals.totalBidValue.toFixed(2)}`);
      const copyEl = document.getElementById('footer-copyright-company');
      if (copyEl) {
        copyEl.textContent = (this.currentCompany || '').toLowerCase() === 'hdd' ? 'High Desert Drywall' : 'MH Construction';
      }
    } catch (e) {
      // ignore footer update errors
    }

    // Empty state visibility: base on visible jobs
    const emptyState = document.getElementById('empty-state');
    if (emptyState) emptyState.style.display = (visibleJobs && visibleJobs.length > 0) ? 'none' : 'block';
  }

  renderTableView(jobs) {
    const tbody = document.getElementById('jobs-table-body');
    if (!tbody) return;
    if (!jobs.length) {
      tbody.innerHTML = '<tr><td colspan="8">No jobs found.</td></tr>';
      return;
    }
    tbody.innerHTML = jobs.map(job => `
      <tr>
        <td>${this.escapeHtml(job.projectName)}</td>
        <td>${job.deadline || ''}</td>
        <td>${job.followUpDate || ''}</td>
        <td>${typeof job.estimatingCost !== 'undefined' && job.estimatingCost !== null ? '$' + Number(job.estimatingCost).toFixed(2) : ''}</td>
        <td>${typeof job.bidAmount !== 'undefined' && job.bidAmount !== null ? '$' + Number(job.bidAmount).toFixed(2) : ''}</td>
        <td>${typeof job.bondAmount !== 'undefined' && job.bondAmount !== null ? '$' + Number(job.bondAmount).toFixed(2) : ''}</td>
        <td>${this.escapeHtml(job.status || '')}</td>
        <td class="table-actions"><button data-id="${job.id}" class="edit-btn">Edit</button></td>
      </tr>
    `).join('');
    // attach edit listeners
    tbody.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', (e) => this.editJob(e.target.dataset.id)));
  }

  renderCardView(jobs) {
    const container = document.getElementById('jobs-card-container');
    if (!container) return;
    if (!jobs.length) { container.innerHTML = '<div>No jobs found.</div>'; return; }
    container.innerHTML = jobs.map(job => {
      const id = job.id || job.key || '';
      const projectName = this.escapeHtml(this.getJobField(job, ['projectName','name','title','project']) || 'Untitled');
      const client = this.escapeHtml(this.getJobField(job, ['client','customer']) || '');
      const location = this.escapeHtml(this.getJobField(job, ['location','site','address']) || '');
      const estimator = this.escapeHtml(this.getJobField(job, ['estimator','assignedTo']) || '');
      const deadline = this.getJobField(job, ['deadline','dueDate','date']) || '';
      const followUp = this.getJobField(job, ['followUpDate','follow_up_date']) || '';
      const estimatingCost = (typeof job.estimatingCost !== 'undefined' && job.estimatingCost !== null) ? '$' + Number(job.estimatingCost).toFixed(2) : (this.getJobField(job, ['estimating_cost','estimateCost']) || '');
      const bidAmount = (typeof job.bidAmount !== 'undefined' && job.bidAmount !== null) ? '$' + Number(job.bidAmount).toFixed(2) : (this.getJobField(job, ['bid_amount','amount']) || '');
      const bondAmount = (typeof job.bondAmount !== 'undefined' && job.bondAmount !== null) ? '$' + Number(job.bondAmount).toFixed(2) : (this.getJobField(job, ['bond_amount']) || '');
      const statusRaw = (this.getJobField(job, ['status','state']) || '').toString();
      const status = this.escapeHtml(statusRaw);
      let statusClass = 'no-bid';
      const st = statusRaw.toLowerCase();
      if (st.includes('progress')) statusClass = 'in-progress';
      else if (st.includes('submitted')) statusClass = 'submitted';
      else if (st.includes('follow')) statusClass = 'follow-up-required';
      else if (st.includes('won')) statusClass = 'won';
      else if (st.includes('lost')) statusClass = 'lost';

      const description = this.escapeHtml(this.getJobField(job, ['description','desc']) || '');

      return `
      <div class="job-card" data-id="${id}">
        <div class="job-card-header">
          <div class="job-card-title">${projectName}</div>
          <div class="job-card-client text-muted">${client}</div>
        </div>
        <div class="job-card-body">
          <div class="job-card-detail"><strong>Location:</strong> ${location}</div>
          <div class="job-card-detail"><strong>Estimator:</strong> ${estimator}</div>
          <div class="job-card-detail"><strong>Deadline:</strong> ${deadline}</div>
          <div class="job-card-detail"><strong>Follow-up:</strong> ${followUp}</div>
          <div class="job-card-detail"><strong>Estimating Cost:</strong> ${estimatingCost}</div>
          <div class="job-card-detail"><strong>Bid Amount:</strong> ${bidAmount}</div>
          <div class="job-card-detail"><strong>Bond Amount:</strong> ${bondAmount}</div>
          <div class="job-card-detail"><strong>Status:</strong> <span class="status-badge ${statusClass}">${status}</span></div>
          <p class="text-muted">${description}</p>
        </div>
        <div class="job-card-actions">
          <button class="edit-card-btn btn-primary" data-id="${id}" aria-label="Edit ${this.escapeHtml(projectName)}" title="Edit this job">✏️ Edit</button>
        </div>
      </div>
      `;
    }).join('');

    // attach edit listeners for cards
    container.querySelectorAll('.edit-card-btn').forEach(btn => btn.addEventListener('click', (e) => this.editJob(e.target.dataset.id)));
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