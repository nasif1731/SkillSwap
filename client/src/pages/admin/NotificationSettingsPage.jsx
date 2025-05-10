import { useEffect, useState } from 'react';

const NotificationSettingsPage = () => {
  const [settings, setSettings] = useState({
    email: true,
    sms: false,
    disputeAlerts: true,
    verificationUpdates: true,
  });

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const saveSettings = async () => {
    const token = localStorage.getItem('token');
    await fetch('/api/admin/notification-settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    });
    alert('Settings updated!');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🔔 Notification Settings</h1>
      {Object.entries(settings).map(([key, value]) => (
        <div key={key} className="flex items-center mb-3">
          <input
            type="checkbox"
            checked={value}
            onChange={() => handleToggle(key)}
            className="mr-2"
          />
          <label>{key.replace(/([A-Z])/g, ' $1')}</label>
        </div>
      ))}
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={saveSettings}>
        Save Preferences
      </button>
    </div>
  );
};

export default NotificationSettingsPage;
