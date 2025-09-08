// Sample data initialization for Firebase
import { dbService } from './database-service-clean.js';

// Sample jobs for testing
const sampleJobs = [
    {
        title: 'Downtown Office Complex',
        client: 'ABC Development',
        location: 'Phoenix, AZ',
        estimator: 'John Smith',
        deadline: new Date('2024-02-15'),
        bidValue: 850000,
        status: 'in-progress',
        notes: 'Large commercial project with multiple phases',
        company: 'mhc'
    },
    {
        title: 'Residential Subdivision Phase 1',
        client: 'XYZ Homes',
        location: 'Scottsdale, AZ',
        estimator: 'Jane Doe',
        deadline: new Date('2024-02-20'),
        bidValue: 1200000,
        status: 'submitted',
        notes: 'Multi-family housing development',
        company: 'mhc'
    },
    {
        title: 'Shopping Center Renovation',
        client: 'Retail Partners LLC',
        location: 'Tempe, AZ',
        estimator: 'Mike Johnson',
        deadline: new Date('2024-01-30'),
        bidValue: 400000,
        status: 'follow-up-required',
        notes: 'Waiting for updated architectural plans',
        company: 'mhc'
    },
    {
        title: 'Medical Office Building',
        client: 'Healthcare Realty',
        location: 'Mesa, AZ',
        estimator: 'Sarah Williams',
        deadline: new Date('2024-03-01'),
        bidValue: 650000,
        status: 'in-progress',
        notes: 'Specialized medical facility requirements',
        company: 'hdd'
    },
    {
        title: 'Warehouse Distribution Center',
        client: 'Logistics Corp',
        location: 'Chandler, AZ',
        estimator: 'Tom Anderson',
        deadline: new Date('2024-02-10'),
        bidValue: 920000,
        status: 'submitted',
        notes: 'High ceiling requirements, special ventilation',
        company: 'hdd'
    }
];

// Sample estimators
const sampleEstimators = [
    { name: 'John Smith', company: 'mhc' },
    { name: 'Jane Doe', company: 'mhc' },
    { name: 'Mike Johnson', company: 'mhc' },
    { name: 'Sarah Williams', company: 'hdd' },
    { name: 'Tom Anderson', company: 'hdd' },
    { name: 'Lisa Chen', company: 'hdd' }
];

// Function to initialize sample data
export async function initializeSampleData() {
    try {
        console.log('🗃️ Initializing sample data...');
        
        // Add sample estimators first
        console.log('👥 Adding sample estimators...');
        for (const estimator of sampleEstimators) {
            await dbService.addEstimator(estimator);
        }
        
        // Add sample jobs
        console.log('📋 Adding sample jobs...');
        for (const job of sampleJobs) {
            await dbService.addJob(job);
        }
        
        console.log('✅ Sample data initialized successfully!');
        console.log(`📊 Added ${sampleJobs.length} jobs and ${sampleEstimators.length} estimators`);
        
        return true;
    } catch (error) {
        console.error('❌ Error initializing sample data:', error);
        return false;
    }
}

// Function to clear all data (useful for testing)
export async function clearAllData() {
    try {
        console.log('🧹 Clearing all data...');
        
        // Get all jobs for both companies
        const mhcJobs = await dbService.getJobsByCompany('mhc');
        const hddJobs = await dbService.getJobsByCompany('hdd');
        
        // Delete all jobs
        for (const job of [...mhcJobs, ...hddJobs]) {
            await dbService.deleteJob(job.id);
        }
        
        // Get all estimators for both companies
        const mhcEstimators = await dbService.getEstimatorsByCompany('mhc');
        const hddEstimators = await dbService.getEstimatorsByCompany('hdd');
        
        // Delete all estimators
        for (const estimator of [...mhcEstimators, ...hddEstimators]) {
            await dbService.deleteEstimator(estimator.id);
        }
        
        console.log('✅ All data cleared successfully!');
        return true;
    } catch (error) {
        console.error('❌ Error clearing data:', error);
        return false;
    }
}

// Make functions available globally for testing in browser console
if (typeof window !== 'undefined') {
    window.initializeSampleData = initializeSampleData;
    window.clearAllData = clearAllData;
}