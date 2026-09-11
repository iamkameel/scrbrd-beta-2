'use client';

import React from 'react';
import { Theme } from './types';
import { fetchGoogleWeather, GoogleWeatherData } from './googleWeatherApi';

interface GoogleWeatherWidgetProps {
  theme: Theme;
  venue?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  matchDate?: string;
  compact?: boolean;
}

export default function GoogleWeatherWidget({
  theme: D,
  venue,
  locationName,
  latitude,
  longitude,
  matchDate,
  compact = false,
}: GoogleWeatherWidgetProps) {
  const effectiveVenue = venue || locationName || "Bowden's Field";
  const wx = fetchGoogleWeather(effectiveVenue);

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: D.surf2, borderRadius: D.pill, border: `1px solid ${D.border}` }}>
        <span style={{ fontSize: '14px' }}>{wx.hourlyForecast[0]?.icon || '☀️'}</span>
        <span style={{ fontFamily: D.mono, fontSize: '12px', fontWeight: 700, color: D.textPrimary }}>
          {wx.tempC}°C
        </span>
        <span style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
          {wx.conditionLabel.split(" ")[1] || "Sunny"} · 💧{wx.precipProbPct}%
        </span>
        <span style={{ fontFamily: D.mono, fontSize: '9px', padding: '1px 5px', borderRadius: D.pill, background: `${D.emerald}20`, color: D.emerald }}>
          Google Weather API Live
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '18px',
        borderRadius: D.lg,
        background: D.surf1,
        border: `1px solid ${D.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      }}
    >
      {/* Top Bar: Google Weather API Badge & Location */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🌐</span>
          <div>
            <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
              GOOGLE WEATHER API METEOROLOGICAL TELEMETRY
            </div>
            <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
              📍 {wx.location} ({wx.coordinates.lat.toFixed(4)}°, {wx.coordinates.lng.toFixed(4)}°)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: `${D.sky}15`, padding: '4px 10px', borderRadius: D.pill, border: `1px solid ${D.sky}40` }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: D.emerald }}></span>
          <span style={{ fontFamily: D.mono, fontSize: '10px', fontWeight: 800, color: D.sky }}>
            SYNCED WITH GOOGLE MAPS & WEATHER
          </span>
        </div>
      </div>

      {/* Primary Conditions Display */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        {/* Main Temperature Card */}
        <div style={{ padding: '12px', background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '32px' }}>{wx.hourlyForecast[0]?.icon || '☀️'}</div>
          <div>
            <div style={{ fontFamily: D.mono, fontSize: '24px', fontWeight: 800, color: D.textPrimary }}>
              {wx.tempC}°C
            </div>
            <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
              Feels like {wx.feelsLikeC}°C
            </div>
          </div>
        </div>

        {/* Rain Probability */}
        <div style={{ padding: '12px', background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}` }}>
          <div style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted }}>
            PRECIPITATION PROB
          </div>
          <div style={{ fontFamily: D.mono, fontSize: '18px', fontWeight: 800, color: wx.precipProbPct > 40 ? D.rose : D.emerald, marginTop: '2px' }}>
            ☔ {wx.precipProbPct}%
          </div>
          <div style={{ fontFamily: D.body, fontSize: '10px', color: D.textMuted, marginTop: '2px' }}>
            Humidity: {wx.humidityPct}%
          </div>
        </div>

        {/* Wind Vector */}
        <div style={{ padding: '12px', background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}` }}>
          <div style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted }}>
            WIND SPEED & VECTOR
          </div>
          <div style={{ fontFamily: D.mono, fontSize: '18px', fontWeight: 800, color: D.sky, marginTop: '2px' }}>
            💨 {wx.windSpeedKmH} km/h
          </div>
          <div style={{ fontFamily: D.body, fontSize: '10px', color: D.textMuted, marginTop: '2px' }}>
            Direction: {wx.windDirection}
          </div>
        </div>

        {/* Dew & Pitch Index */}
        <div style={{ padding: '12px', background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}` }}>
          <div style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted }}>
            DEW FACTOR & UV INDEX
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <span style={{ fontFamily: D.mono, fontSize: '11px', padding: '2px 8px', borderRadius: D.pill, background: wx.dewFactor === 'HIGH' ? `${D.amber}25` : `${D.emerald}25`, color: wx.dewFactor === 'HIGH' ? D.amber : D.emerald, fontWeight: 800 }}>
              DEW: {wx.dewFactor}
            </span>
            <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textSecondary }}>
              UV {wx.uvIndex}/10
            </span>
          </div>
        </div>
      </div>

      {/* Hourly Timeline */}
      <div>
        <div style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textMuted, marginBottom: '6px' }}>
          MATCH HOURS GOOGLE WEATHER FORECAST
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {wx.hourlyForecast.map((h, i) => (
            <div
              key={i}
              style={{
                padding: '8px 12px',
                borderRadius: D.md,
                background: D.surf2,
                border: `1px solid ${D.border}`,
                textAlign: 'center',
                minWidth: '75px',
              }}
            >
              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>{h.time}</div>
              <div style={{ fontSize: '18px', margin: '2px 0' }}>{h.icon}</div>
              <div style={{ fontFamily: D.mono, fontSize: '12px', fontWeight: 800, color: D.textPrimary }}>{h.tempC}°</div>
              <div style={{ fontFamily: D.mono, fontSize: '9px', color: h.rainProbPct > 30 ? D.rose : D.sky }}>
                💧{h.rainProbPct}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pitch Impact Advice */}
      <div style={{ padding: '10px 14px', borderRadius: D.md, background: `${D.amber}15`, border: `1px solid ${D.amber}33`, display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <span style={{ fontSize: '16px' }}>🌱</span>
        <div>
          <div style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 800, color: D.amber }}>
            PITCH & CONDITIONS CURATOR ADVISORY
          </div>
          <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, lineHeight: '1.4', marginTop: '2px' }}>
            {wx.pitchImpactAdvice}
          </div>
        </div>
      </div>
    </div>
  );
}
