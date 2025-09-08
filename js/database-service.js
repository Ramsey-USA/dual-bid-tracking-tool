// Database Service for Firebase Firestore Operations
// Using Firebase v9 modular SDK via C    // Get all jobs for a specific company
    async getJobsByCompany(company) {
        try {
            const q = query(
              // Get all estimators for a specific company
    async getEstimatorsByCompany(company) {
        try {
            const q = query(
                collection(db, 'estimators'),
                where('company', '==', company)
            );
            
            const querySnapshot = await getDocs(q);
            const estimators = [];
            
            querySnapshot.forEach((doc) => {
                estimators.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Sort by name on client side to avoid index requirement
            estimators.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            
            console.log(`👥 Retrieved ${estimators.length} estimators for company: ${company}`);
            return estimators;
        } catch (error) {
            console.error('Error getting estimators:', error);
            throw error;
        }
    }, 'jobs'),
                where('company', '==', company)
            );
            
            const querySnapshot = await getDocs(q);
            const jobs = [];
            
            querySnapshot.forEach((doc) => {
                jobs.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Sort by created date on client side to avoid index requirement
            jobs.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });
            
            console.log(`📊 Retrieved ${jobs.length} jobs for company: ${company}`);
            return jobs;
        } catch (error) {
            console.error('Error getting jobs:', error);
            throw error;
        }
    }ollection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDocs, 
    getDoc,
    query, 
    where, 
    orderBy, 
    limit,
    onSnapshot,
    serverTimestamp,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db } from './firebase-config.js';

class DatabaseService {
    constructor() {
        this.collections = {
            jobs: 'jobs',
            companies: 'companies',
            estimators: 'estimators',
            settings: 'settings'
        };
    }

    // ===== JOBS OPERATIONS =====
    
    /**
     * Add a new job to the database
     * @param {Object} jobData - Job data object
     * @returns {Promise<string>} - Document ID
     */
    async addJob(jobData) {
        try {
            const docRef = await addDoc(collection(db, this.collections.jobs), {
                ...jobData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            console.log('Job added with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error adding job:', error);
            throw error;
        }
    }

    /**
     * Update an existing job
     * @param {string} jobId - Job document ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<void>}
     */
    async updateJob(jobId, updateData) {
        try {
            const jobRef = doc(db, this.collections.jobs, jobId);
            await updateDoc(jobRef, {
                ...updateData,
                updatedAt: serverTimestamp()
            });
            console.log('Job updated:', jobId);
        } catch (error) {
            console.error('Error updating job:', error);
            throw error;
        }
    }

    /**
     * Delete a job
     * @param {string} jobId - Job document ID
     * @returns {Promise<void>}
     */
    async deleteJob(jobId) {
        try {
            await deleteDoc(doc(db, this.collections.jobs, jobId));
            console.log('Job deleted:', jobId);
        } catch (error) {
            console.error('Error deleting job:', error);
            throw error;
        }
    }

    /**
     * Get all jobs for a specific company
     * @param {string} companyId - Company identifier
     * @returns {Promise<Array>} - Array of jobs
     */
    async getJobsByCompany(companyId) {
        try {
            const q = query(
                collection(db, this.collections.jobs),
                where('company', '==', companyId),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const jobs = [];
            querySnapshot.forEach((doc) => {
                jobs.push({ id: doc.id, ...doc.data() });
            });
            return jobs;
        } catch (error) {
            console.error('Error getting jobs:', error);
            throw error;
        }
    }

    /**
     * Get jobs with real-time updates
     * @param {string} companyId - Company identifier
     * @param {Function} callback - Callback function for updates
     * @returns {Function} - Unsubscribe function
     */
    subscribeToJobs(companyId, callback) {
        try {
            const q = query(
                collection(db, this.collections.jobs),
                where('company', '==', companyId),
                orderBy('createdAt', 'desc')
            );
            
            return onSnapshot(q, (querySnapshot) => {
                const jobs = [];
                querySnapshot.forEach((doc) => {
                    jobs.push({ id: doc.id, ...doc.data() });
                });
                callback(jobs);
            }, (error) => {
                console.error('Error in jobs subscription:', error);
                callback([]);
            });
        } catch (error) {
            console.error('Error setting up jobs subscription:', error);
            return () => {}; // Return empty unsubscribe function
        }
    }

    /**
     * Search jobs by title or client
     * @param {string} companyId - Company identifier
     * @param {string} searchTerm - Search term
     * @returns {Promise<Array>} - Array of matching jobs
     */
    async searchJobs(companyId, searchTerm) {
        try {
            // Note: Firestore doesn't support full-text search natively
            // This is a basic implementation - consider using Algolia for advanced search
            const q = query(
                collection(db, this.collections.jobs),
                where('company', '==', companyId),
                orderBy('title')
            );
            
            const querySnapshot = await getDocs(q);
            const jobs = [];
            querySnapshot.forEach((doc) => {
                const jobData = { id: doc.id, ...doc.data() };
                if (jobData.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    jobData.client.toLowerCase().includes(searchTerm.toLowerCase())) {
                    jobs.push(jobData);
                }
            });
            return jobs;
        } catch (error) {
            console.error('Error searching jobs:', error);
            throw error;
        }
    }

    // ===== ESTIMATORS OPERATIONS =====
    
    /**
     * Add a new estimator
     * @param {Object} estimatorData - Estimator data
     * @returns {Promise<string>} - Document ID
     */
    async addEstimator(estimatorData) {
        try {
            const docRef = await addDoc(collection(db, this.collections.estimators), {
                ...estimatorData,
                createdAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error adding estimator:', error);
            throw error;
        }
    }

    /**
     * Get all estimators for a company
     * @param {string} companyId - Company identifier
     * @returns {Promise<Array>} - Array of estimators
     */
    async getEstimatorsByCompany(companyId) {
        try {
            const q = query(
                collection(db, this.collections.estimators),
                where('company', '==', companyId),
                orderBy('name')
            );
            const querySnapshot = await getDocs(q);
            const estimators = [];
            querySnapshot.forEach((doc) => {
                estimators.push({ id: doc.id, ...doc.data() });
            });
            return estimators;
        } catch (error) {
            console.error('Error getting estimators:', error);
            throw error;
        }
    }

    /**
     * Update estimator
     * @param {string} estimatorId - Estimator document ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<void>}
     */
    async updateEstimator(estimatorId, updateData) {
        try {
            const estimatorRef = doc(db, this.collections.estimators, estimatorId);
            await updateDoc(estimatorRef, updateData);
        } catch (error) {
            console.error('Error updating estimator:', error);
            throw error;
        }
    }

    /**
     * Delete estimator
     * @param {string} estimatorId - Estimator document ID
     * @returns {Promise<void>}
     */
    async deleteEstimator(estimatorId) {
        try {
            await deleteDoc(doc(db, this.collections.estimators, estimatorId));
        } catch (error) {
            console.error('Error deleting estimator:', error);
            throw error;
        }
    }

    // ===== STATISTICS OPERATIONS =====
    
    /**
     * Get job statistics for a company
     * @param {string} companyId - Company identifier
     * @returns {Promise<Object>} - Statistics object
     */
    async getJobStatistics(companyId) {
        try {
            const jobs = await this.getJobsByCompany(companyId);
            
            const stats = {
                total: jobs.length,
                inProgress: 0,
                submitted: 0,
                followUp: 0,
                overdue: 0,
                won: 0,
                lost: 0,
                noBid: 0,
                totalValue: 0,
                wonValue: 0,
                pendingValue: 0
            };

            const now = new Date();
            jobs.forEach(job => {
                const status = job.status?.toLowerCase();
                const deadline = job.deadline ? new Date(job.deadline.seconds * 1000) : null;
                const bidValue = parseFloat(job.bidValue) || 0;

                // Count by status
                switch(status) {
                    case 'in-progress':
                        stats.inProgress++;
                        break;
                    case 'submitted':
                        stats.submitted++;
                        stats.pendingValue += bidValue;
                        break;
                    case 'follow-up-required':
                        stats.followUp++;
                        break;
                    case 'won':
                        stats.won++;
                        stats.wonValue += bidValue;
                        break;
                    case 'lost':
                        stats.lost++;
                        break;
                    case 'no-bid':
                        stats.noBid++;
                        break;
                }

                // Check for overdue
                if (deadline && deadline < now && 
                    !['won', 'lost', 'no-bid'].includes(status)) {
                    stats.overdue++;
                }

                stats.totalValue += bidValue;
            });

            return stats;
        } catch (error) {
            console.error('Error getting statistics:', error);
            throw error;
        }
    }

    // ===== BATCH OPERATIONS =====
    
    /**
     * Batch update multiple jobs
     * @param {Array} updates - Array of {id, data} objects
     * @returns {Promise<void>}
     */
    async batchUpdateJobs(updates) {
        try {
            const batch = writeBatch(db);
            
            updates.forEach(update => {
                const jobRef = doc(db, this.collections.jobs, update.id);
                batch.update(jobRef, {
                    ...update.data,
                    updatedAt: serverTimestamp()
                });
            });

            await batch.commit();
            console.log('Batch update completed');
        } catch (error) {
            console.error('Error in batch update:', error);
            throw error;
        }
    }

    // ===== EXPORT OPERATIONS =====
    
    /**
     * Export jobs data
     * @param {string} companyId - Company identifier
     * @param {string} format - Export format ('csv' or 'json')
     * @returns {Promise<string>} - Exported data
     */
    async exportJobs(companyId, format = 'csv') {
        try {
            const jobs = await this.getJobsByCompany(companyId);
            
            if (format === 'json') {
                return JSON.stringify(jobs, null, 2);
            }
            
            if (format === 'csv') {
                if (jobs.length === 0) return '';
                
                const headers = Object.keys(jobs[0]).filter(key => key !== 'id');
                const csvHeaders = ['id', ...headers].join(',');
                
                const csvRows = jobs.map(job => {
                    const values = ['id', ...headers].map(header => {
                        const value = job[header];
                        if (value === null || value === undefined) return '';
                        if (typeof value === 'object') return JSON.stringify(value);
                        return `"${value.toString().replace(/"/g, '""')}"`;
                    });
                    return values.join(',');
                });
                
                return [csvHeaders, ...csvRows].join('\n');
            }
            
            throw new Error(`Unsupported export format: ${format}`);
        } catch (error) {
            console.error('Error exporting jobs:', error);
            throw error;
        }
    }
    
    // Estimator management methods
    async addEstimator(estimatorData) {
        try {
            const docRef = await addDoc(collection(db, 'estimators'), {
                ...estimatorData,
                createdAt: serverTimestamp()
            });
            
            console.log('✅ Estimator added with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('❌ Error adding estimator:', error);
            throw error;
        }
    }

    async updateEstimator(estimatorId, estimatorData) {
        try {
            const estimatorRef = doc(db, 'estimators', estimatorId);
            await updateDoc(estimatorRef, {
                ...estimatorData,
                updatedAt: serverTimestamp()
            });
            
            console.log('✅ Estimator updated:', estimatorId);
        } catch (error) {
            console.error('❌ Error updating estimator:', error);
            throw error;
        }
    }

    async deleteEstimator(estimatorId) {
        try {
            await deleteDoc(doc(db, 'estimators', estimatorId));
            console.log('✅ Estimator deleted:', estimatorId);
        } catch (error) {
            console.error('❌ Error deleting estimator:', error);
            throw error;
        }
    }
}

// Create and export singleton instance
export const dbService = new DatabaseService();
export default DatabaseService;