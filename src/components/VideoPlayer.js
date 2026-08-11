import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStreamPlayer } from '../hooks/useStreamPlayer';
import LoadingScreen from './LoadingScreen';
import StatusToast from './StatusToast';
import { API_URL } from '../utils/config';
import { FiArrowLeft, FiMaximize, FiMinimize } from 'react-icons/fi';
import { BiExpand } from 'react-icons/bi';

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const { isLoading, error, status, initializePlayer, destroy } = useStreamPlayer();
  
  const [channel, setChannel] = useState(null);
  const [fitMode, setFitMode] = useState(0); // 0: contain, 1: fill, 2: cover
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const response = await fetch(API_URL, {
          cache: "no-store",
          headers: { Accept: "application/json" }
        });
        const data = await response.json();
        const found = data.channels?.find(c => c.id === id);
        
        if (found) {
          setChannel(found);
          document.title = `Sportlink · ${found.name}`;
        } else {
          throw new Error("Channel not found");
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (id) fetchChannel();
    return () => destroy();
  }, [id, destroy]);

  useEffect(() => {
    if (channel && videoRef.current) {
      initializePlayer(channel, videoRef.current);
    }
  }, [channel, initializePlayer]);

  const handleFitChange = useCallback(() => {
    setFitMode((prev) => (prev + 1) % 3);
  }, []);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      videoRef.current?.parentElement?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const handleBack = () => {
    destroy();
    navigate('/');
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!channel) return <LoadingScreen message="Loading channel..." />;
  if (isLoading) return <LoadingScreen message={status || "Initializing player..."} />;

  const fitStyles = {
    0: 'contain',
    1: 'fill', 
    2: 'cover'
  };

  return (
    <div className="player-screen">
      <StatusToast message={status || error} type={error ? "error" : ""} />
      
      <div className="player-container">
        <video
          ref={videoRef}
          className="react-player"
          style={{ objectFit: fitStyles[fitMode] }}
          playsInline
          controls={false}
        />
        
        {/* Custom Controls Overlay */}
        <div className="player-controls-overlay">
          <button className="control-btn back-btn" onClick={handleBack}>
            <FiArrowLeft size={20} />
          </button>
          
          <div className="channel-info-bar">
            <span className="live-dot-small"></span>
            <span className="channel-title-text">{channel.name}</span>
          </div>
          
          <div className="control-buttons-right">
            <button className="control-btn" onClick={handleFitChange} title="Change display mode">
              <BiExpand size={18} />
              <span className="fit-label">
                {['Fit', 'Fill', 'Zoom'][fitMode]}
              </span>
            </button>
            <button className="control-btn" onClick={handleFullscreen}>
              {isFullscreen ? <FiMinimize size={18} /> : <FiMaximize size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
