// Simple Firebase Connection Test
import { dbService } from './database-service.js';

async function testFirebaseConnection() {
    console.log('🔥 Testing Firebase connection...');
    
    try {
        // Try to get jobs for a company
        const jobs = await dbService.getJobsByCompany('mhc');
        console.log('✅ Firebase connection successful!');
        console.log(`📊 Found ${jobs.length} jobs for MH Construction`);
        
        // Try to get estimators
        const estimators = await dbService.getEstimatorsByCompany('mhc');
        console.log(`👥 Found ${estimators.length} estimators for MH Construction`);
        
        return true;
    } catch (error) {
        console.error('❌ Firebase connection failed:', error);
        return false;
    }
}

// Test on page load
document.addEventListener('DOMContentLoaded', () => {
    testFirebaseConnection();
});

// Make test available globally
window.testFirebaseConnection = testFirebaseConnection;