import React, { useEffect, useRef, useState } from 'react';
import { Card } from 'react-bootstrap';
import { FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getHospitalLocation, getMyTodaySession, startMySession, endMySession } from '../../api/employeeApi';

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatHMS = (totalSeconds) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${sec}`;
};

const STATUS_CONFIG = {
  idle:    { label: 'Detecting your location…',        bg: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.2)', color: 'rgba(30,41,59,0.55)', dot: '⚪' },
  inside:  { label: 'Inside Hospital — Timer Running',  bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.35)', color: '#059669', dot: '🟢' },
  outside: { label: 'Outside Hospital — Timer Paused',  bg: 'rgba(234,179,8,0.1)',    border: 'rgba(234,179,8,0.3)',   color: '#92400e', dot: '🟡' },
  denied:  { label: 'Location Access Denied',           bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)',  color: '#dc2626', dot: '🔴' },
};

const WorkTimerCard = () => {
  const [geoStatus, setGeoStatus] = useState('idle');
  const [displaySeconds, setDisplaySeconds] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);

  const hospitalLocationRef = useRef(null);
  const closedSecondsRef = useRef(0);
  const activeSessionRef = useRef(null);
  const wasInsideRef = useRef(null);
  const deniedToastShownRef = useRef(false);

  const applySummary = (summary) => {
    const sessions = summary?.sessions || [];
    const closed = sessions
      .filter(s => s.checkOutTime)
      .reduce((sum, s) => sum + (new Date(s.checkOutTime) - new Date(s.checkInTime)) / 1000, 0);
    closedSecondsRef.current = closed;
    activeSessionRef.current = summary?.activeSession || null;
    setSessionCount(sessions.length);
    setDisplaySeconds(
      closed + (activeSessionRef.current ? (Date.now() - new Date(activeSessionRef.current.checkInTime).getTime()) / 1000 : 0)
    );
  };

  useEffect(() => {
    let cancelled = false;

    const onPosition = (pos) => {
      const loc = hospitalLocationRef.current;
      if (!loc) return;
      const { latitude, longitude } = pos.coords;
      const dist = Math.round(haversineDistance(latitude, longitude, loc.latitude, loc.longitude));
      const inside = dist <= loc.fenceRadiusMeters;
      setGeoStatus(inside ? 'inside' : 'outside');

      if (inside && wasInsideRef.current !== true) {
        wasInsideRef.current = true;
        startMySession({ latitude, longitude, distanceMeters: dist })
          .then(() => getMyTodaySession().then(r => applySummary(r.data.data)))
          .catch(() => {});
      } else if (!inside && wasInsideRef.current !== false) {
        wasInsideRef.current = false;
        endMySession({ latitude, longitude, distanceMeters: dist })
          .then(() => getMyTodaySession().then(r => applySummary(r.data.data)))
          .catch(() => {});
      }
    };

    const onError = (err) => {
      if (err.code === 1) {
        setGeoStatus('denied');
        if (!deniedToastShownRef.current) {
          deniedToastShownRef.current = true;
          toast.error('Location access denied — work timer paused. Allow location access to auto-track attendance.');
        }
      }
    };

    Promise.all([getHospitalLocation(), getMyTodaySession()])
      .then(([locRes, sumRes]) => {
        if (cancelled) return;
        hospitalLocationRef.current = locRes.data.data;
        applySummary(sumRes.data.data);
        wasInsideRef.current = activeSessionRef.current ? true : null;
        setGeoStatus(activeSessionRef.current ? 'inside' : 'idle');
      })
      .catch(() => { toast.error('Failed to load work timer'); });

    let watchId = null;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(onPosition, onError, {
        enableHighAccuracy: true, maximumAge: 5000, timeout: 15000,
      });
    } else {
      setGeoStatus('denied');
    }

    return () => {
      cancelled = true;
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const active = activeSessionRef.current;
      const live = active ? (Date.now() - new Date(active.checkInTime).getTime()) / 1000 : 0;
      setDisplaySeconds(closedSecondsRef.current + live);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const cfg = STATUS_CONFIG[geoStatus] || STATUS_CONFIG.idle;

  return (
    <Card className="border-0 mb-4">
      <Card.Body className="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div className="d-flex align-items-center gap-3">
          <div style={{
            width: 54, height: 54, borderRadius: 14, flexShrink: 0,
            background: 'rgba(71,85,105,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', color: '#475569',
          }}>
            <FaClock />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1e293b', fontFamily: 'monospace', letterSpacing: '1px' }}>
              {formatHMS(displaySeconds)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(30,41,59,0.5)' }}>Hours worked today</div>
          </div>
        </div>
        <div className="d-flex flex-column align-items-end gap-1">
          <span style={{
            padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
            background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
          }}>
            {cfg.dot} {cfg.label}
          </span>
          {sessionCount > 0 && (
            <span style={{ fontSize: '0.7rem', color: 'rgba(30,41,59,0.45)' }}>
              {sessionCount} check-in{sessionCount > 1 ? 's' : ''} today
            </span>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default WorkTimerCard;
