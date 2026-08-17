'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface TimelineFiltersState {
  search: string;
  category: string;
  severity: string;
  module: string;
  dateFrom: string;
  dateTo: string;
}

export interface TimelineFiltersProps {
  onFiltersChange: (filters: TimelineFiltersState) => void;
  categories?: string[];
  severities?: string[];
  modules?: string[];
}

export function TimelineFilters({
  onFiltersChange,
  categories = [
    'APPOINTMENT',
    'CONSULTATION',
    'DIAGNOSIS',
    'PRESCRIPTION',
    'INVESTIGATION',
    'BILLING',
    'ADMISSION',
    'DISCHARGE',
  ],
  severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
  modules = [
    'appointments',
    'consultations',
    'prescriptions',
    'pharmacy',
    'laboratory',
    'ipd',
    'discharge',
    'billing',
    'icu',
    'ot',
    'nursing',
  ],
}: Readonly<TimelineFiltersProps>) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [module, setModule] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      onFiltersChange({ search, category, severity, module, dateFrom, dateTo });
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category, severity, module, dateFrom, dateTo, onFiltersChange]);

  return (
    <div
      style={{
        padding: '16px',
        background: '#f9fafb',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '20px',
      }}
    >
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            htmlFor="search-input"
            style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}
          >
            Search
          </label>
          <input
            id="search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symptoms, meds, tests..."
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
            }}
          />
        </div>

        {/* Category */}
        <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            htmlFor="category-select"
            style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}
          >
            Category
          </label>
          <select
            id="category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              background: '#fff',
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Severity */}
        <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            htmlFor="severity-select"
            style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}
          >
            Severity
          </label>
          <select
            id="severity-select"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              background: '#fff',
            }}
          >
            <option value="">All Severities</option>
            {severities.map((sev) => (
              <option key={sev} value={sev}>
                {sev}
              </option>
            ))}
          </select>
        </div>

        {/* Module */}
        <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            htmlFor="module-select"
            style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}
          >
            Module
          </label>
          <select
            id="module-select"
            value={module}
            onChange={(e) => setModule(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              background: '#fff',
            }}
          >
            <option value="">All Modules</option>
            {modules.map((mod) => (
              <option key={mod} value={mod}>
                {mod}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {/* Date From */}
        <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            htmlFor="date-from"
            style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}
          >
            Date From
          </label>
          <input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
            }}
          />
        </div>

        {/* Date To */}
        <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="date-to" style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
            Date To
          </label>
          <input
            id="date-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
            }}
          />
        </div>

        {/* Clear Filters */}
        <div style={{ flex: '1 1 100px', display: 'flex', alignItems: 'flex-end' }}>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setCategory('');
              setSeverity('');
              setModule('');
              setDateFrom('');
              setDateTo('');
            }}
            style={{
              width: '100%',
              padding: '9px 16px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: '#fff',
              color: '#374151',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
