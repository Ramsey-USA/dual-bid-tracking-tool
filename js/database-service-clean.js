// Database Service for Firebase Firestore Operations
// Using Firebase v9 modular SDK via CDN

import { 
    collection, 
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
        this.db = db;
    }

    // Job management methods
    async addJob(jobData) {
        try {
            const docRef = await addDoc(collection(this.db, 'jobs'), {
                ...jobData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            
            console.log('✅ Job added with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('❌ Error adding job:', error);
            throw error;
        }
    }

    async updateJob(jobId, jobData) {
        try {
            const jobRef = doc(this.db, 'jobs', jobId);
            await updateDoc(jobRef, {
                ...jobData,
                updatedAt: serverTimestamp()
            });
            
            console.log('✅ Job updated:', jobId);
        } catch (error) {
            console.error('❌ Error updating job:', error);
            throw error;
        }
    }

    async deleteJob(jobId) {
        try {
            await deleteDoc(doc(this.db, 'jobs', jobId));
            console.log('✅ Job deleted:', jobId);
        } catch (error) {
            console.error('❌ Error deleting job:', error);
            throw error;
        }
    }

    async getJob(jobId) {
        try {
            const jobRef = doc(this.db, 'jobs', jobId);
            const jobSnap = await getDoc(jobRef);
            
            if (jobSnap.exists()) {
                return {
                    id: jobSnap.id,
                    ...jobSnap.data()
                };
            } else {
                throw new Error('Job not found');
            }
        } catch (error) {
            console.error('❌ Error getting job:', error);
            throw error;
        }
    }

    // Get all jobs for a specific company (simplified query to avoid indexes)
    async getJobsByCompany(company) {
        try {
            const q = query(
                collection(this.db, 'jobs'),
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
            console.error('❌ Error getting jobs:', error);
            throw error;
        }
    }

    // Subscribe to real-time job updates
    subscribeToJobs(company, callback) {
        const q = query(
            collection(this.db, 'jobs'),
            where('company', '==', company)
        );

        return onSnapshot(q, (querySnapshot) => {
            const jobs = [];
            querySnapshot.forEach((doc) => {
                jobs.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Sort by created date on client side
            jobs.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });
            
            callback(jobs);
        }, (error) => {
            console.error('❌ Error in job subscription:', error);
        });
    }

    // Search jobs by title, client, or location
    async searchJobs(company, searchTerm) {
        try {
            // Get all jobs for the company first
            const jobs = await this.getJobsByCompany(company);
            
            // Filter on client side
            const filteredJobs = jobs.filter(job => 
                job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.location?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            console.log(`🔍 Found ${filteredJobs.length} jobs matching "${searchTerm}"`);
            return filteredJobs;
        } catch (error) {
            console.error('❌ Error searching jobs:', error);
            throw error;
        }
    }

    // Estimator management methods
    async addEstimator(estimatorData) {
        try {
            console.log('🟢 addEstimator called with:', estimatorData);
            const docRef = await addDoc(collection(this.db, 'estimators'), {
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
            const estimatorRef = doc(this.db, 'estimators', estimatorId);
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
            await deleteDoc(doc(this.db, 'estimators', estimatorId));
            console.log('✅ Estimator deleted:', estimatorId);
        } catch (error) {
            console.error('❌ Error deleting estimator:', error);
            throw error;
        }
    }

    // Get all estimators for a specific company (simplified query)
    async getEstimatorsByCompany(company) {
        try {
            console.log('🔵 getEstimatorsByCompany called for:', company);
            const q = query(
                collection(this.db, 'estimators'),
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
            console.log('👥 Estimators found:', estimators);
            estimators.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            return estimators;
        } catch (error) {
            console.error('❌ Error getting estimators:', error);
            throw error;
        }
    }

    // Statistics and analytics
    async getJobStatistics(company) {
        try {
            const jobs = await this.getJobsByCompany(company);
            
            const stats = {
                total: jobs.length,
                inProgress: jobs.filter(job => job.status === 'in-progress').length,
                submitted: jobs.filter(job => job.status === 'submitted').length,
                followUp: jobs.filter(job => job.status === 'follow-up-required').length,
                won: jobs.filter(job => job.status === 'won').length,
                lost: jobs.filter(job => job.status === 'lost').length,
                noBid: jobs.filter(job => job.status === 'no-bid').length,
                overdue: 0, // Will calculate based on deadlines
                totalValue: 0,
                wonValue: 0,
                pendingValue: 0
            };

            // Calculate overdue jobs and bid values
            const now = new Date();
            jobs.forEach(job => {
                const bidValue = job.bidValue || 0;
                stats.totalValue += bidValue;

                if (job.status === 'won') {
                    stats.wonValue += bidValue;
                } else if (['in-progress', 'submitted', 'follow-up-required'].includes(job.status)) {
                    stats.pendingValue += bidValue;
                }

                // Check if job is overdue
                if (job.deadline) {
                    const deadline = job.deadline.seconds ? new Date(job.deadline.seconds * 1000) : new Date(job.deadline);
                    if (deadline < now && !['won', 'lost', 'no-bid'].includes(job.status)) {
                        stats.overdue++;
                    }
                }
            });

            console.log(`📈 Calculated statistics for ${company}:`, stats);
            return stats;
        } catch (error) {
            console.error('❌ Error calculating statistics:', error);
            throw error;
        }
    }

    // Export functionality
    async exportJobs(company, format = 'json') {
        try {
            const jobs = await this.getJobsByCompany(company);
            
            if (format === 'csv') {
                // Convert to CSV
                const headers = ['Title', 'Client', 'Location', 'Estimator', 'Deadline', 'Bid Value', 'Status', 'Notes'];
                const csvRows = [headers.join(',')];
                
                jobs.forEach(job => {
                    const row = [
                        `"${job.title || ''}"`,
                        `"${job.client || ''}"`,
                        `"${job.location || ''}"`,
                        `"${job.estimator || ''}"`,
                        job.deadline ? new Date(job.deadline.seconds * 1000).toLocaleDateString() : '',
                        job.bidValue || 0,
                        `"${job.status || ''}"`,
                        `"${(job.notes || '').replace(/"/g, '""')}"`
                    ];
                    csvRows.push(row.join(','));
                });
                
                return csvRows.join('\n');
            } else {
                // Return as JSON
                return JSON.stringify(jobs, null, 2);
            }
        } catch (error) {
            console.error('❌ Error exporting jobs:', error);
            throw error;
        }
    }
}

// Create and export a single instance
export const dbService = new DatabaseService();

console.log('🗃️ Database service initialized successfully');