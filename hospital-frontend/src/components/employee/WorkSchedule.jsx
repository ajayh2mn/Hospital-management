import React, { useState, useEffect } from 'react';
import { Card, Badge, Spinner } from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaCheckCircle } from 'react-icons/fa';
import { getMyProfile } from '../../api/employeeApi';

const SHIFTS = {
  CHIEF_MEDICAL_OFFICER: { label:'Chief Medical Officer', start:'08:00', end:'16:00', days:[1,2,3,4,5], color:'#7c3aed' },
  SENIOR_DOCTOR:         { label:'Senior Doctor',         start:'09:00', end:'17:00', days:[1,2,3,4,5], color:'#6d28d9' },
  JUNIOR_DOCTOR:         { label:'Junior Doctor',         start:'08:00', end:'18:00', days:[1,2,3,4,5,6], color:'#5b21b6' },
  HEAD_NURSE:            { label:'Head Nurse',            start:'07:00', end:'15:00', days:[1,2,3,4,5,6], color:'#0e7490' },
  STAFF_NURSE:           { label:'Staff Nurse',           start:'07:00', end:'15:00', days:[1,2,3,4,5,6,0], color:'#0369a1' },
  RECEPTIONIST:          { label:'Receptionist',          start:'08:00', end:'17:00', days:[1,2,3,4,5,6], color:'#b45309' },
  PHARMACIST:            { label:'Pharmacist',            start:'09:00', end:'18:00', days:[1,2,3,4,5,6], color:'#065f46' },
  LAB_TECHNICIAN:        { label:'Lab Technician',        start:'07:00', end:'15:00', days:[1,2,3,4,5], color:'#1e40af' },
  HR_MANAGER:            { label:'HR Manager',            start:'09:00', end:'18:00', days:[1,2,3,4,5], color:'#92400e' },
  ACCOUNTANT:            { label:'Accountant',            start:'09:00', end:'18:00', days:[1,2,3,4,5], color:'#065f46' },
  ADMIN_STAFF:           { label:'Admin Staff',           start:'09:00', end:'17:00', days:[1,2,3,4,5], color:'#374151' },
};

const DAYS = [
  { short:'Mon', full:'Monday',    idx:1 },
  { short:'Tue', full:'Tuesday',   idx:2 },
  { short:'Wed', full:'Wednesday', idx:3 },
  { short:'Thu', full:'Thursday',  idx:4 },
  { short:'Fri', full:'Friday',    idx:5 },
  { short:'Sat', full:'Saturday',  idx:6 },
  { short:'Sun', full:'Sunday',    idx:0 },
];

const WorkSchedule = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const todayIdx = new Date().getDay();

  useEffect(() => {
    getMyProfile()
      .then(r => setProfile(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  const shift = SHIFTS[profile?.designation] || SHIFTS.ADMIN_STAFF;

  const shiftHours = () => {
    const [sh, sm] = shift.start.split(':').map(Number);
    const [eh, em] = shift.end.split(':').map(Number);
    return ((eh * 60 + em) - (sh * 60 + sm)) / 60;
  };

  const weekDates = DAYS.map(d => {
    const today = new Date();
    const diff = d.idx - todayIdx;
    const date = new Date(today);
    date.setDate(today.getDate() + diff);
    return { ...d, date };
  });

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
        <h4 className="fw-bold mb-0"><FaCalendarAlt className="me-2" />Work Schedule</h4>
        <Badge style={{ background: `${shift.color}33`, border: `1px solid ${shift.color}66`, color: shift.color, fontSize: '0.78rem', padding: '5px 12px' }}>
          {shift.label}
        </Badge>
      </div>

      {/* Shift summary card */}
      <Card className="border-0 mb-4">
        <Card.Body>
          <div className="d-flex flex-wrap gap-4">
            {[
              { icon:'🕐', label:'Shift Start',  value: shift.start },
              { icon:'🕔', label:'Shift End',    value: shift.end },
              { icon:'⏱️', label:'Hours / Day', value: `${shiftHours()}h` },
              { icon:'📆', label:'Working Days', value: `${shift.days.length} days/week` },
            ].map(item => (
              <div key={item.label} style={{ textAlign:'center', minWidth: 80 }}>
                <div style={{ fontSize:'1.6rem' }}>{item.icon}</div>
                <div style={{ fontSize:'1.1rem', fontWeight:700, color:'#fff' }}>{item.value}</div>
                <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.4)' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Weekly calendar */}
      <Card className="border-0">
        <Card.Header style={{ background:'transparent', borderBottom:'1px solid rgba(255,255,255,0.08)', fontWeight:600 }}>
          This Week's Schedule
        </Card.Header>
        <Card.Body>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:8 }}>
            {weekDates.map(day => {
              const isWorkDay = shift.days.includes(day.idx);
              const isToday   = day.idx === todayIdx;
              return (
                <div key={day.short} style={{
                  borderRadius: 14, padding: '14px 8px', textAlign:'center',
                  background: isToday
                    ? `${shift.color}33`
                    : isWorkDay
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(255,255,255,0.02)',
                  border: isToday
                    ? `2px solid ${shift.color}`
                    : '1px solid rgba(255,255,255,0.07)',
                  opacity: isWorkDay ? 1 : 0.45,
                }}>
                  <div style={{ fontSize:'0.7rem', color: isToday ? shift.color : 'rgba(255,255,255,0.45)', fontWeight:600, marginBottom:4 }}>
                    {day.short.toUpperCase()}
                  </div>
                  <div style={{ fontSize:'1.1rem', fontWeight:700, color: isToday ? '#fff' : 'rgba(255,255,255,0.7)', marginBottom:6 }}>
                    {day.date.getDate()}
                  </div>
                  {isWorkDay ? (
                    <>
                      <div style={{ fontSize:'0.65rem', color: isToday ? shift.color : 'rgba(255,255,255,0.5)', marginBottom:2 }}>{shift.start}</div>
                      <div style={{ width:1, height:14, background:'rgba(255,255,255,0.2)', margin:'0 auto 2px' }} />
                      <div style={{ fontSize:'0.65rem', color: isToday ? shift.color : 'rgba(255,255,255,0.5)' }}>{shift.end}</div>
                      <FaCheckCircle size={11} style={{ color: isToday ? shift.color : '#10b981', marginTop:5 }} />
                    </>
                  ) : (
                    <div style={{ fontSize:'0.62rem', color:'rgba(255,255,255,0.3)', marginTop:4 }}>OFF</div>
                  )}
                  {isToday && (
                    <div style={{ marginTop:6, padding:'2px 6px', borderRadius:10, background:shift.color, fontSize:'0.6rem', fontWeight:700, color:'#fff' }}>
                      TODAY
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card.Body>
      </Card>

      {/* Monthly overview strip */}
      <Card className="border-0 mt-3">
        <Card.Header style={{ background:'transparent', borderBottom:'1px solid rgba(255,255,255,0.08)', fontWeight:600 }}>
          This Month at a Glance
        </Card.Header>
        <Card.Body>
          <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
            {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth()+1, 0).getDate() }, (_, i) => {
              const d = new Date(new Date().getFullYear(), new Date().getMonth(), i + 1);
              const isWork = shift.days.includes(d.getDay());
              const isPast = d <= new Date();
              const isT    = d.toDateString() === new Date().toDateString();
              return (
                <div key={i} title={d.toDateString()} style={{
                  width:28, height:28, borderRadius:6,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'0.7rem', fontWeight: isT ? 700 : 400,
                  background: isT
                    ? shift.color
                    : isWork && isPast
                      ? 'rgba(16,185,129,0.2)'
                      : isWork
                        ? 'rgba(255,255,255,0.06)'
                        : 'rgba(255,255,255,0.02)',
                  border: isT ? 'none' : `1px solid ${isWork ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}`,
                  color: isT ? '#fff' : isWork ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)',
                }}>
                  {i + 1}
                </div>
              );
            })}
          </div>
          <div style={{ display:'flex', gap:16, marginTop:12, fontSize:'0.72rem', color:'rgba(255,255,255,0.4)', flexWrap:'wrap' }}>
            <span>🟣 Today &nbsp; 🟢 Work day (past) &nbsp; ⬜ Upcoming work &nbsp; ▫️ Off day</span>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default WorkSchedule;
