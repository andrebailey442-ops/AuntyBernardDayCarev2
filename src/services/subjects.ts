import { collection, getDocs, doc, setDoc, query, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Subject } from '@/lib/types';
import { SUBJECTS } from '@/lib/data';

const COLLECTION_NAME = 'subjects';

export const initializeSubjectData = async () => {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        const batch = writeBatch(db);
        SUBJECTS.forEach(item => {
            const docRef = doc(db, COLLECTION_NAME, item.id);
            batch.set(docRef, item);
        });
        await batch.commit();
    }
}

export const getSubjects = async (): Promise<Subject[]> => {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Subject);
};
