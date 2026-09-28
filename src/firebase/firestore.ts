import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';

/**
 * Generic helper to fetch all documents from a Firestore collection
 */
export async function fetchCollection<T extends { id: string }>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  if (!isFirebaseConfigured) {
    const local = localStorage.getItem(`saibhishi_${collectionName}`);
    if (local) {
      try {
        return JSON.parse(local) as T[];
      } catch {
        return [];
      }
    }
    return [];
  }

  try {
    const colRef = collection(db, collectionName);
    const q = constraints.length > 0 ? query(colRef, ...constraints) : query(colRef);
    const snapshot = await getDocs(q);
    const results: T[] = [];
    snapshot.forEach((d) => {
      results.push({ id: d.id, ...d.data() } as T);
    });
    return results;
  } catch (error) {
    console.warn(`Firestore read error on ${collectionName}:`, error);
    // Fallback to local storage
    const local = localStorage.getItem(`saibhishi_${collectionName}`);
    return local ? JSON.parse(local) : [];
  }
}

/**
 * Generic helper to fetch a single document by ID
 */
export async function fetchDocById<T extends { id: string }>(
  collectionName: string,
  id: string
): Promise<T | null> {
  if (!isFirebaseConfigured) {
    const local = localStorage.getItem(`saibhishi_${collectionName}`);
    if (local) {
      const items = JSON.parse(local) as T[];
      return items.find((item) => item.id === id) || null;
    }
    return null;
  }

  try {
    const docRef = doc(db, collectionName, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as T;
    }
    return null;
  } catch (error) {
    console.warn(`Firestore read doc error on ${collectionName}/${id}:`, error);
    return null;
  }
}

/**
 * Generic helper to save or overwrite a document
 */
export async function saveDoc<T extends { id: string }>(
  collectionName: string,
  data: T
): Promise<T> {
  // Update local cache
  const localKey = `saibhishi_${collectionName}`;
  const existing = localStorage.getItem(localKey);
  let items: T[] = existing ? JSON.parse(existing) : [];
  const index = items.findIndex((i) => i.id === data.id);
  if (index >= 0) {
    items[index] = data;
  } else {
    items.unshift(data);
  }
  localStorage.setItem(localKey, JSON.stringify(items));

  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, collectionName, data.id);
      await setDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn(`Firestore write error on ${collectionName}:`, e);
    }
  }

  return data;
}

/**
 * Generic helper to delete a document (or mark archived)
 */
export async function removeDoc(collectionName: string, id: string): Promise<void> {
  const localKey = `saibhishi_${collectionName}`;
  const existing = localStorage.getItem(localKey);
  if (existing) {
    let items = JSON.parse(existing) as { id: string }[];
    items = items.filter((i) => i.id !== id);
    localStorage.setItem(localKey, JSON.stringify(items));
  }

  if (isFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (e) {
      console.warn(`Firestore delete error on ${collectionName}:`, e);
    }
  }
}
