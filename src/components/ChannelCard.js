import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTv } from 'react-icons/fi';

const ChannelCard = ({ channel }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/watch/${channel.id}`);
  };

  return (
    <div className="channel-card" onClick={handleClick}>
      <div className="card-icon-wrapper">
        <FiTv size={24} />
      </div>
      <div className="card-content">
        <span className="channel-name">{channel.name}</span>
        <span className="live-tag">LIVE</span>
      </div>
    </div>
  );
};

export default ChannelCard;
