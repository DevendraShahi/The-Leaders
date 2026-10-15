import { apiError } from '@/lib/middleware';
export function POST() { return apiError('Accounts must be created by a newsroom administrator.', 410); }
