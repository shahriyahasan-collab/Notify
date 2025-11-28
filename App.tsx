import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NOTIFICATION_MESSAGES } from './constants';

// Inline SVG icons to ensure zero external dependencies causing render blocks
const IconBell = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
);

const IconStop = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
);

const IconPlay = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="5 3 19 12 5 21 5 3"/></svg>
);

const IconShield = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);

const App: React.FC = () => {
  // State
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [logs, setLogs] = useState<{ id: number; message: string; time: string }[]>([]);
  
  // Refs to manage interval and mounting
  const intervalRef = useRef<number | null>(null);
  
  const sendRandomNotification = useCallback(() => {
    // Note: We check Notification.permission here, but inside the try/catch we handle if it throws.
    // On some mobile devices, the permission property lags slightly after granting, so we attempt anyway if logic dictates.
    
    const randomIdx = Math.floor(Math.random() * NOTIFICATION_MESSAGES.length);
    const content = NOTIFICATION_MESSAGES[randomIdx];

    let sent = false;

    // Try sending actual browser notification
    if (Notification.permission === 'granted') {
      try {
        // Mobile specific: Service Worker registration is often required for notifications on Android Chrome PWA
        // However, standard Notification API works for active pages.
        new Notification(content.title, {
          body: content.body,
          icon: content.icon,
          silent: false,
          tag: 'random-notify' // prevents stacking if needed, or remove to stack
        });
        sent = true;
      } catch (e) {
        console.error("Notification failed", e);
      }
    }

    // Log to screen
    const now = new Date();
    setLogs(prev => [
      { 
        id: Date.now(), 
        message: `${content.title}: ${content.body}`, 
        time: now.toLocaleTimeString() 
      },
      ...prev.slice(0, 49) // Keep last 50
    ]);
  }, []);

  const startNotifications = useCallback(() => {
    setIsRunning(true);
    // Clear any existing interval just in case
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }

    // Send one immediately to confirm it works
    sendRandomNotification();

    // Start interval
    intervalRef.current = window.setInterval(() => {
      sendRandomNotification();
    }, 2000);
  }, [sendRandomNotification]);

  const stopNotifications = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Check permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      const currentPerm = Notification.permission;
      setPermission(currentPerm);
      
      // Auto-start if previously granted
      if (currentPerm === 'granted') {
        startNotifications();
      }
    }
    
    return () => stopNotifications();
  }, [startNotifications, stopNotifications]);

  const handleGrantPermission = async () => {
    if (!('Notification' in window)) {
      alert("This browser does not support desktop notifications");
      return;
    }

    try {
      // Important: This must be triggered by a direct user action (click)
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        // Mobile Fix: Sometimes immediate execution fails if the permission state hasn't propagated.
        // We set a tiny timeout to ensure the browser registers the 'granted' state before firing the first one.
        setTimeout(() => {
            startNotifications();
        }, 100);
      } else {
        // If the user dismissed it or it was automatically denied
        alert("Permission was not granted. If you want notifications, please enable them in your browser settings (Site Settings > Notifications).");
      }
    } catch (error) {
      console.error("Error requesting permission", error);
      alert("Something went wrong requesting permission. Please check your browser settings.");
    }
  };

  // UI Components
  const PermissionRequest = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-6 bg-white rounded-2xl shadow-xl max-w-sm mx-auto mt-10 border border-slate-100">
      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
        <IconBell className="w-8 h-8" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Enable Notifications</h2>
        <p className="text-slate-500">
          We need permission to send you random alerts every 2 seconds.
        </p>
      </div>
      <button
        onClick={handleGrantPermission}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-200"
      >
        Allow & Start
      </button>
      <p className="text-xs text-slate-400 max-w-xs">
        Note: If nothing happens, check your phone's notification settings for Chrome.
      </p>
    </div>
  );

  const PermissionDenied = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-6 bg-red-50 rounded-2xl shadow-sm max-w-sm mx-auto mt-10 border border-red-100">
       <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
        <IconShield className="w-8 h-8" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Permission Denied</h2>
        <p className="text-slate-600 mb-4">
          We cannot send notifications. Please reset permissions in your browser settings and reload the page.
        </p>
        <button 
            onClick={() => window.location.reload()}
            className="text-sm text-red-600 font-semibold hover:underline"
        >
            Reload Page
        </button>
      </div>
    </div>
  );

  const MainControls = () => (
    <div className="flex flex-col h-full max-w-md mx-auto w-full">
      {/* Header Status Area */}
      <div className={`p-6 text-white transition-colors duration-500 rounded-b-3xl shadow-lg ${isRunning ? 'bg-green-500' : 'bg-slate-700'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold tracking-wider uppercase opacity-80">Status</span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 text-xs font-semibold">
             {isRunning ? 'ACTIVE' : 'STOPPED'}
          </span>
        </div>
        <h1 className="text-3xl font-bold leading-tight">
          {isRunning ? 'Sending Alerts...' : 'Notifications Paused'}
        </h1>
        <p className="opacity-90 mt-2 text-sm">
          {isRunning ? 'You should receive a new notification every 2 seconds.' : 'Press start to resume.'}
        </p>
      </div>

      {/* Control Actions */}
      <div className="p-6 flex-none">
        {isRunning ? (
          <button
            onClick={stopNotifications}
            className="group relative w-full overflow-hidden rounded-2xl bg-red-500 p-8 text-white shadow-xl shadow-red-200 transition-all active:scale-95 hover:bg-red-600"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative flex flex-col items-center gap-3">
              <IconStop className="w-12 h-12" />
              <span className="text-2xl font-bold tracking-tight">STOP</span>
              <span className="text-sm font-medium text-red-100">Click to halt notifications</span>
            </div>
          </button>
        ) : (
          <button
            onClick={startNotifications}
            className="group relative w-full overflow-hidden rounded-2xl bg-slate-800 p-8 text-white shadow-xl shadow-slate-200 transition-all active:scale-95 hover:bg-slate-900"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative flex flex-col items-center gap-3">
              <IconPlay className="w-12 h-12" />
              <span className="text-2xl font-bold tracking-tight">START</span>
              <span className="text-sm font-medium text-slate-300">Resume random alerts</span>
            </div>
          </button>
        )}
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-hidden flex flex-col px-6 pb-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Notification Log</h3>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl p-6">
              <p>No notifications yet</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 font-medium truncate">{log.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{log.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-slate-50 font-sans">
       {!('Notification' in window) ? (
         <div className="p-8 text-center text-slate-500 mt-20">
           This browser does not support notifications.
         </div>
       ) : (
         <>
           {permission === 'default' && <PermissionRequest />}
           {permission === 'denied' && <PermissionDenied />}
           {permission === 'granted' && <MainControls />}
         </>
       )}
    </div>
  );
};

export default App;