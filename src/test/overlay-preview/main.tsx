import { createRoot } from 'react-dom/client';
import OverlayStudio from '@/components/admin/post-studio/OverlayStudio';
createRoot(document.getElementById('root')!).render(<OverlayStudio onBack={() => {}} />);
