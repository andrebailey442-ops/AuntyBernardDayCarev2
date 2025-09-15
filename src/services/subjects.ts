
'use client';

import type { Subject } from '@/lib/types';
import { SUBJECTS } from '@/lib/data';

// Since subjects are static, we can just return them directly.
// No need for localStorage unless they become editable.
export const getSubjects = async (): Promise<Subject[]> => {
    return SUBJECTS;
};
