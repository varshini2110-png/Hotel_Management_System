import React from 'react';

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div style={{ marginTop: '36px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          background: '#ffffff',
          color: '#0f172a',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          opacity: currentPage === 1 ? 0.45 : 1,
          fontWeight: 600,
          fontSize: '0.9rem'
        }}
      >
        Prev
      </button>

      {pages.map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => onPageChange(num)}
          style={{
            padding: '8px 15px',
            borderRadius: '8px',
            border: currentPage === num ? '1px solid #0f172a' : '1px solid #cbd5e1',
            background: currentPage === num ? '#0f172a' : '#ffffff',
            color: currentPage === num ? '#ffffff' : '#0f172a',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          {num}
        </button>
      ))}

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          background: '#ffffff',
          color: '#0f172a',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          opacity: currentPage === totalPages ? 0.45 : 1,
          fontWeight: 600,
          fontSize: '0.9rem'
        }}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;