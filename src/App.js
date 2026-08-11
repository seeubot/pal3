import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ChannelList from './components/ChannelList';
import VideoPlayer from './components/VideoPlayer';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<ChannelList />} />
        <Route path="/watch/:id" element={<VideoPlayer />} />
      </Routes>
    </div>
  );
}

export default App;
