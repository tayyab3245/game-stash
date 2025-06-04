export const neonBtn = (disabled = false, danger = false) => ({
  background: disabled
    ? '#444'
    : danger
    ? '#ff3737'
    : 'linear-gradient(135deg,#00c6ff 0%,#0072ff 100%)',
  color: '#fff',
  padding: '12px 18px',
  border: 'none',
  borderRadius: 10,
  fontSize: 14,
  cursor: disabled ? 'not-allowed' : 'pointer',
  boxShadow: disabled
    ? 'none'
    : danger
    ? '0 0 6px rgba(255,55,55,.6), 0 0 12px rgba(255,55,255,.4)'
    : '0 0 6px rgba(0,198,255,.6), 0 0 12px rgba(0,114,255,.4)',
  transition: 'transform .15s, filter .15s',
});
