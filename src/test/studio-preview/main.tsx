import React from 'react';
import { createRoot } from 'react-dom/client';
import '@/app/globals.css';
import StudioEditor from '@/components/admin/social-studio/StudioEditor';
import { fixtureService } from './fixture';
const service = fixtureService();
createRoot(document.getElementById('root')!).render(<StudioEditor api={service.api} user={{ id: 'creator', role: 'superadmin' }} onExit={() => window.location.reload()} />);
