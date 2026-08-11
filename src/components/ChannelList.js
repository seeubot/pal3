import React, { useState, useEffect } from 'react';
import ChannelCard from './ChannelCard';
import LoadingScreen from './LoadingScreen';
import StatusToast from './StatusToast';
import { API_URL } from '../utils/config';
import { FiActivity } from 'react-icons/fi';

const ChannelList = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch(API_URL, {
          cache: "no-store",
          headers: { Accept: "application/json" }
        });
        if (!response.ok) throw new Error("Failed to fetch channels");
        const data = await response.json();
        if (data.channels?.length) {
          setChannels(data.channels);
        } else {
          throw new Error("No channels available");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  if (loading) return <LoadingScreen message="Loading channels..." />;

  return (
    <div className="channels-screen">
      <StatusToast message={error} type="error" />
      
      <header className="channels-header">
        <div className="logo-section">
          <div className="logo-icon">
            <FiActivity size={24} />
          </div>
          <h1 className="logo-text">Sportlink</h1>
        </div>
        <div className="live-indicator">
          <span className="pulse-dot"></span>
          <span className="live-label">LIVE</span>
        </div>
      </header>

      <div className="channels-grid">
        {channels.map(channel => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
      </div>
    </div>
  );
};

export default ChannelList;
