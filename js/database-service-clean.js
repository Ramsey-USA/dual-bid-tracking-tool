// Firestore Database Service (Clean Version)
import { db } from './firebase-config.js';
import {
  collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, where, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

class DatabaseService {
  constructor() {
    this.db = db;
  }

  async addEstimator(estimatorData) {
    const docRef = await addDoc(collection(this.db, 'estimators'), {
      ...estimatorData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  }

  async getEstimatorsByCompany(company) {
    const q = query(collection(this.db, 'estimators'), where('company', '==', company));
    const querySnapshot = await getDocs(q);
    const estimators = [];
    querySnapshot.forEach((doc) => {
      estimators.push({ id: doc.id, ...doc.data() });
    });
    estimators.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return estimators;
  }

  async addJob(jobData) {
    const docRef = await addDoc(collection(this.db, 'jobs'), {
      ...jobData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  }

  async getJobsByCompany(company) {
    const q = query(collection(this.db, 'jobs'), where('company', '==', company));
    const querySnapshot = await getDocs(q);
    const jobs = [];
    querySnapshot.forEach((doc) => {
      jobs.push({ id: doc.id, ...doc.data() });
    });
    return jobs;
  }

  async updateJob(jobId, jobData) {
    const jobRef = doc(this.db, 'jobs', jobId);
    await updateDoc(jobRef, jobData);
  }

  async deleteJob(jobId) {
    await deleteDoc(doc(this.db, 'jobs', jobId));
  }
}

const dbService = new DatabaseService();
export default dbService;