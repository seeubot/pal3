import { useState, useRef, useCallback, useEffect } from 'react';
import { PLAYER_CONFIG } from '../utils/config';
import { rawCookie, withCookie, formatError } from '../utils/streamUtils';

export const useStreamPlayer = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [isLive, setIsLive] = useState(false);
  
  const shakaRef = useRef(null);
  const videoRef = useRef(null);
  const channelRef = useRef(null);
  const retryCountRef = useRef(0);
  const isRefreshingRef = useRef(false);
  const restrictionsRelaxedRef = useRef(false);

  const buildConfig = useCallback((channel, relaxRestrictions = false) => {
    const restrictions = {};
    if (!relaxRestrictions) {
      if (PLAYER_CONFIG.maxH < 1080) restrictions.maxHeight = PLAYER_CONFIG.maxH;
      if (PLAYER_CONFIG.maxBw > 0) restrictions.maxBandwidth = PLAYER_CONFIG.maxBw;
    }

    return {
      drm: { clearKeys: { [channel.key_id]: channel.key } },
      manifest: {
        defaultPresentationDelay: 4,
        ignoreTextStreamFailures: true,
        retryParameters: {
          maxAttempts: 5, baseDelay: 500, backoffFactor: 2,
          fuzzFactor: 0.5, timeout: 30000
        }
      },
      streaming: {
        lowLatencyMode: false,
        bufferingGoal: PLAYER_CONFIG.buf,
        rebufferingGoal: PLAYER_CONFIG.reBuf,
        bufferBehind: PLAYER_CONFIG.behind,
        safeSeekOffset: 4,
        stallEnabled: true,
        stallThreshold: 1,
        stallSkip: 0.3,
        inaccurateManifestTolerance: 0,
        retryParameters: {
          maxAttempts: 5, baseDelay: 500, backoffFactor: 2,
          fuzzFactor: 0.5, timeout: 30000
        }
      },
      abr: {
        enabled: true,
        defaultBandwidthEstimate: PLAYER_CONFIG.bwEst,
        switchInterval: 4,
        restrictions
      }
    };
  }, []);

  const setupNetworkEngine = useCallback((player, channel) => {
    const cookie = channel.cookie;
    const raw = rawCookie(cookie);
    
    player.getNetworkingEngine().registerRequestFilter((type, request) => {
      request.headers["Referer"] = "https://www.jiotv.com/";
      request.headers["User-Agent"] = "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36";
      request.headers["Cookie"] = cookie;
      
      if (type === window.shaka.net.NetworkingEngine.RequestType.MANIFEST || 
          type === window.shaka.net.NetworkingEngine.RequestType.SEGMENT) {
        request.uris = request.uris.map(u => withCookie(u, raw));
      }
    });
  }, []);

  const reloadStream = useCallback(async () => {
    if (isRefreshingRef.current || !channelRef.current) return;
    
    isRefreshingRef.current = true;
    retryCountRef.current++;
    
    if (retryCountRef.current > 5) {
      setError("Stream unavailable. Please try again later.");
      isRefreshingRef.current = false;
      return;
    }

    setStatus(`Reconnecting... (${retryCountRef.current}/5)`);

    try {
      const response = await fetch("https://sonujson-devloper.vercel.app/Data/sports.json", {
        cache: "no-store",
        headers: { Accept: "application/json" }
      });
      const data = await response.json();
      const fresh = data.channels?.find(c => c.id === channelRef.current.id);
      
      if (fresh && shakaRef.current) {
        channelRef.current = fresh;
        shakaRef.current.configure(buildConfig(fresh, restrictionsRelaxedRef.current));
        await shakaRef.current.load(fresh.stream_url);
        retryCountRef.current = 0;
        setStatus('● Live');
        setIsLive(true);
      }
    } catch (e) {
      setTimeout(() => {
        isRefreshingRef.current = false;
        reloadStream();
      }, Math.min(2000 * retryCountRef.current, 8000));
      return;
    }
    
    isRefreshingRef.current = false;
  }, [buildConfig]);

  const initializePlayer = useCallback(async (channel, videoElement) => {
    setIsLoading(true);
    setError(null);
    setStatus('Loading stream...');
    
    channelRef.current = channel;
    videoRef.current = videoElement;
    retryCountRef.current = 0;
    restrictionsRelaxedRef.current = false;

    try {
      if (shakaRef.current) {
        shakaRef.current.destroy();
      }

      window.shaka.polyfill.installAll();
      
      if (!window.shaka.Player.isBrowserSupported()) {
        throw new Error("Browser not supported");
      }

      const player = new window.shaka.Player();
      shakaRef.current = player;
      
      await player.attach(videoElement);
      player.configure(buildConfig(channel));
      setupNetworkEngine(player, channel);

      player.addEventListener('error', async (event) => {
        const err = event.detail;
        
        if (err.code === 4014 && !restrictionsRelaxedRef.current) {
          restrictionsRelaxedRef.current = true;
          player.configure(buildConfig(channel, true));
          try {
            await player.load(channel.stream_url);
            setStatus('Playing at best available quality');
          } catch (e) {
            reloadStream();
          }
        } else if ([1001, 1002, 1003, 4012, 6006, 6007, 7000, 7001, 7002].includes(err.code)) {
          reloadStream();
        } else {
          setError(formatError(err));
        }
      });

      await player.load(channel.stream_url);
      
      try {
        await videoElement.play();
      } catch (e) {
        setStatus('Tap play to start');
      }
      
      setIsLoading(false);
      setIsLive(true);
      setStatus('● Live');
    } catch (err) {
      console.error("Player initialization failed:", err);
      setStatus('Retrying...');
      setTimeout(reloadStream, 1500);
    }
  }, [buildConfig, setupNetworkEngine, reloadStream]);

  const destroy = useCallback(() => {
    if (shakaRef.current) {
      shakaRef.current.destroy();
      shakaRef.current = null;
    }
    setIsLive(false);
    setStatus('');
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      destroy();
    };
  }, [destroy]);

  return {
    isLoading,
    error,
    status,
    isLive,
    initializePlayer,
    destroy,
    videoRef
  };
};
