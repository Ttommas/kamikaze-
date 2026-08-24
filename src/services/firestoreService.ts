import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs, 
  writeBatch,
  getDocFromServer
} from 'firebase/firestore';
import { getApps, initializeApp, getApp } from 'firebase/app';
import firebaseConfigFile from '../../firebase-applet-config.json';
import { 
  Workshop, 
  Enrollment, 
  WalletConfig, 
  BitacoraVideoConfig, 
  BitacoraEntry, 
  EventItem, 
  Artist,
  PaymentStatus
} from '../types';
import { 
  INITIAL_WORKSHOPS, 
  INITIAL_WALLET_CONFIG, 
  INITIAL_BITACORA_VIDEO, 
  BITACORA_DATA, 
  EVENTS_DATA, 
  ARTISTS_DATA,
  INITIAL_ENROLLMENTS
} from '../data/initialData';

// Initialize Firebase App
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigFile.apiKey || 'AIzaSyCBXVayIwRqc5VqTMk1Wr2gTyGEoEn_u0U',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigFile.authDomain || 'kamikaze-506118.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigFile.projectId || 'kamikaze-506118',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigFile.storageBucket || 'kamikaze-506118.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigFile.messagingSenderId || '213341248529',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigFile.appId || '1:213341248529:web:8c0ec2553d59ec1e8c65b0',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// Test Firestore Connection
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'config', 'health_check'));
    return true;
  } catch (error) {
    console.log('Firestore status:', error);
    return true;
  }
}

// ----------------------------------------------------
// 1. WORKSHOPS
// ----------------------------------------------------
export function subscribeWorkshops(callback: (workshops: Workshop[]) => void) {
  const colRef = collection(db, 'workshops');
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      // Auto-seed initial workshops if collection is empty
      console.log('Seeding initial workshops to Firestore...');
      try {
        const batch = writeBatch(db);
        INITIAL_WORKSHOPS.forEach((ws) => {
          const docRef = doc(db, 'workshops', ws.id);
          batch.set(docRef, ws);
        });
        await batch.commit();
      } catch (err) {
        console.warn('Could not seed initial workshops:', err);
      }
      callback(INITIAL_WORKSHOPS);
    } else {
      const items = snapshot.docs.map((d) => d.data() as Workshop);
      callback(items);
    }
  }, (err) => {
    console.error('Error fetching workshops from Firestore:', err);
  });
}

export async function saveWorkshopToFirestore(workshop: Workshop) {
  try {
    const docRef = doc(db, 'workshops', workshop.id);
    await setDoc(docRef, workshop, { merge: true });
    console.log(`Workshop ${workshop.id} saved to Firestore successfully`);
  } catch (err) {
    console.error('Error saving workshop to Firestore:', err);
    throw err;
  }
}

export async function deleteWorkshopFromFirestore(workshopId: string) {
  try {
    const docRef = doc(db, 'workshops', workshopId);
    await deleteDoc(docRef);
    console.log(`Workshop ${workshopId} deleted from Firestore`);
  } catch (err) {
    console.error('Error deleting workshop from Firestore:', err);
    throw err;
  }
}

// ----------------------------------------------------
// 2. ENROLLMENTS
// ----------------------------------------------------
export function subscribeEnrollments(callback: (enrollments: Enrollment[]) => void) {
  const colRef = collection(db, 'enrollments');
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      // Seed initial dummy enrollments if needed
      if (INITIAL_ENROLLMENTS && INITIAL_ENROLLMENTS.length > 0) {
        try {
          const batch = writeBatch(db);
          INITIAL_ENROLLMENTS.forEach((enr) => {
            const docRef = doc(db, 'enrollments', enr.id);
            batch.set(docRef, enr);
          });
          await batch.commit();
        } catch (e) {
          console.warn('Could not seed enrollments:', e);
        }
      }
      callback(INITIAL_ENROLLMENTS);
    } else {
      const items = snapshot.docs.map((d) => d.data() as Enrollment);
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(items);
    }
  }, (err) => {
    console.error('Error fetching enrollments from Firestore:', err);
  });
}

export async function saveEnrollmentToFirestore(enrollment: Enrollment) {
  try {
    const docRef = doc(db, 'enrollments', enrollment.id);
    await setDoc(docRef, enrollment, { merge: true });
    console.log(`Enrollment ${enrollment.id} saved to Firestore successfully`);
  } catch (err) {
    console.error('Error saving enrollment to Firestore:', err);
    throw err;
  }
}

export async function updateEnrollmentStatusInFirestore(enrollmentId: string, newStatus: PaymentStatus) {
  try {
    const docRef = doc(db, 'enrollments', enrollmentId);
    await setDoc(docRef, { paymentStatus: newStatus }, { merge: true });
  } catch (err) {
    console.error('Error updating enrollment in Firestore:', err);
    throw err;
  }
}

export async function deleteEnrollmentFromFirestore(enrollmentId: string) {
  try {
    const docRef = doc(db, 'enrollments', enrollmentId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting enrollment from Firestore:', err);
    throw err;
  }
}

// ----------------------------------------------------
// 3. CONFIG (WALLET & BITACORA VIDEO)
// ----------------------------------------------------
export function subscribeWalletConfig(callback: (config: WalletConfig) => void) {
  const docRef = doc(db, 'config', 'wallet');
  return onSnapshot(docRef, async (snapshot) => {
    if (!snapshot.exists()) {
      try {
        await setDoc(docRef, INITIAL_WALLET_CONFIG);
      } catch (e) {
        console.warn('Could not seed wallet config:', e);
      }
      callback(INITIAL_WALLET_CONFIG);
    } else {
      callback(snapshot.data() as WalletConfig);
    }
  }, (err) => {
    console.error('Error fetching wallet config from Firestore:', err);
  });
}

export async function saveWalletConfigToFirestore(newConfig: WalletConfig) {
  try {
    const docRef = doc(db, 'config', 'wallet');
    await setDoc(docRef, newConfig, { merge: true });
    console.log('Wallet config saved to Firestore');
  } catch (err) {
    console.error('Error saving wallet config to Firestore:', err);
    throw err;
  }
}

export function subscribeBitacoraVideo(callback: (config: BitacoraVideoConfig) => void) {
  const docRef = doc(db, 'config', 'bitacora_video');
  return onSnapshot(docRef, async (snapshot) => {
    if (!snapshot.exists()) {
      try {
        await setDoc(docRef, INITIAL_BITACORA_VIDEO);
      } catch (e) {
        console.warn('Could not seed bitacora video config:', e);
      }
      callback(INITIAL_BITACORA_VIDEO);
    } else {
      callback(snapshot.data() as BitacoraVideoConfig);
    }
  }, (err) => {
    console.error('Error fetching bitacora video from Firestore:', err);
  });
}

export async function saveBitacoraVideoToFirestore(newConfig: BitacoraVideoConfig) {
  try {
    const docRef = doc(db, 'config', 'bitacora_video');
    await setDoc(docRef, newConfig, { merge: true });
    console.log('Bitacora video saved to Firestore');
  } catch (err) {
    console.error('Error saving bitacora video to Firestore:', err);
    throw err;
  }
}

// ----------------------------------------------------
// 4. BITACORA ENTRIES
// ----------------------------------------------------
export function subscribeBitacoraEntries(callback: (entries: BitacoraEntry[]) => void) {
  const colRef = collection(db, 'bitacora_entries');
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      try {
        const batch = writeBatch(db);
        BITACORA_DATA.forEach((entry) => {
          const docRef = doc(db, 'bitacora_entries', entry.id);
          batch.set(docRef, entry);
        });
        await batch.commit();
      } catch (e) {
        console.warn('Could not seed bitacora entries:', e);
      }
      callback(BITACORA_DATA);
    } else {
      const items = snapshot.docs.map((d) => d.data() as BitacoraEntry);
      callback(items);
    }
  }, (err) => {
    console.error('Error fetching bitacora entries from Firestore:', err);
  });
}

export async function saveBitacoraEntriesToFirestore(entries: BitacoraEntry[]) {
  try {
    const batch = writeBatch(db);
    entries.forEach((entry) => {
      const docRef = doc(db, 'bitacora_entries', entry.id);
      batch.set(docRef, entry, { merge: true });
    });
    await batch.commit();
    console.log('Bitacora entries saved to Firestore');
  } catch (err) {
    console.error('Error saving bitacora entries to Firestore:', err);
    throw err;
  }
}

// ----------------------------------------------------
// 5. EVENTS
// ----------------------------------------------------
export function subscribeEvents(callback: (events: EventItem[]) => void) {
  const colRef = collection(db, 'events');
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      try {
        const batch = writeBatch(db);
        EVENTS_DATA.forEach((ev) => {
          const docRef = doc(db, 'events', ev.id);
          batch.set(docRef, ev);
        });
        await batch.commit();
      } catch (e) {
        console.warn('Could not seed events:', e);
      }
      callback(EVENTS_DATA);
    } else {
      const items = snapshot.docs.map((d) => d.data() as EventItem);
      callback(items);
    }
  }, (err) => {
    console.error('Error fetching events from Firestore:', err);
  });
}

export async function saveEventsToFirestore(events: EventItem[]) {
  try {
    const batch = writeBatch(db);
    events.forEach((ev) => {
      const docRef = doc(db, 'events', ev.id);
      batch.set(docRef, ev, { merge: true });
    });
    await batch.commit();
    console.log('Events saved to Firestore');
  } catch (err) {
    console.error('Error saving events to Firestore:', err);
    throw err;
  }
}

// ----------------------------------------------------
// 6. ARTISTS
// ----------------------------------------------------
export function subscribeArtists(callback: (artists: Artist[]) => void) {
  const colRef = collection(db, 'artists');
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      try {
        const batch = writeBatch(db);
        ARTISTS_DATA.forEach((art) => {
          const docRef = doc(db, 'artists', art.id);
          batch.set(docRef, art);
        });
        await batch.commit();
      } catch (e) {
        console.warn('Could not seed artists:', e);
      }
      callback(ARTISTS_DATA);
    } else {
      const items = snapshot.docs.map((d) => d.data() as Artist);
      callback(items);
    }
  }, (err) => {
    console.error('Error fetching artists from Firestore:', err);
  });
}

export async function saveArtistsToFirestore(artists: Artist[]) {
  try {
    const batch = writeBatch(db);
    artists.forEach((art) => {
      const docRef = doc(db, 'artists', art.id);
      batch.set(docRef, art, { merge: true });
    });
    await batch.commit();
    console.log('Artists saved to Firestore');
  } catch (err) {
    console.error('Error saving artists to Firestore:', err);
    throw err;
  }
}

export async function saveWorkshopsListToFirestore(workshops: Workshop[]) {
  try {
    const batch = writeBatch(db);
    workshops.forEach((ws) => {
      const docRef = doc(db, 'workshops', ws.id);
      batch.set(docRef, ws, { merge: true });
    });
    await batch.commit();
    console.log('All workshops batch-saved to Firestore');
  } catch (err) {
    console.error('Error batch-saving workshops to Firestore:', err);
    throw err;
  }
}

export async function saveAllDataToFirestore(data: {
  workshops?: Workshop[];
  enrollments?: Enrollment[];
  walletConfig?: WalletConfig;
  bitacoraVideo?: BitacoraVideoConfig;
  bitacoraEntries?: BitacoraEntry[];
  events?: EventItem[];
  artists?: Artist[];
}) {
  try {
    const batch = writeBatch(db);

    if (data.workshops) {
      data.workshops.forEach((w) => {
        batch.set(doc(db, 'workshops', w.id), w, { merge: true });
      });
    }

    if (data.enrollments) {
      data.enrollments.forEach((enr) => {
        batch.set(doc(db, 'enrollments', enr.id), enr, { merge: true });
      });
    }

    if (data.walletConfig) {
      batch.set(doc(db, 'config', 'wallet'), data.walletConfig, { merge: true });
    }

    if (data.bitacoraVideo) {
      batch.set(doc(db, 'config', 'bitacora_video'), data.bitacoraVideo, { merge: true });
    }

    if (data.bitacoraEntries) {
      data.bitacoraEntries.forEach((entry) => {
        batch.set(doc(db, 'bitacora_entries', entry.id), entry, { merge: true });
      });
    }

    if (data.events) {
      data.events.forEach((ev) => {
        batch.set(doc(db, 'events', ev.id), ev, { merge: true });
      });
    }

    if (data.artists) {
      data.artists.forEach((art) => {
        batch.set(doc(db, 'artists', art.id), art, { merge: true });
      });
    }

    await batch.commit();
    console.log('All data successfully synced to Firestore!');
    return true;
  } catch (error) {
    console.error('Error syncing all data to Firestore:', error);
    throw error;
  }
}

