// Definições SVG globais: gradiente do símbolo (usado via fill="url(#rise-g)")
export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <linearGradient id="rise-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b4b8ff" /><stop offset="1" stopColor="#5b5bea" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Símbolo: meio disco subindo sobre a linha do horizonte
export function Mark({ className = '' }) {
  return (
    <svg className={'mark ' + className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.5 15.5a7.5 7.5 0 0 1 15 0z" fill="url(#rise-g)" />
      <rect x="2" y="18" width="20" height="2.4" rx="1.2" fill="currentColor" />
    </svg>
  )
}

// Marca: símbolo + RISE (caixa alta via CSS, nome acessível "Rise Bible")
export function Logo({ small }) {
  return (
    <div className={'logo' + (small ? ' sm' : '')} role="img" aria-label="Rise Bible">
      <Mark />
      <span className="logo-t" aria-hidden="true">Rise</span>
      {!small && <span className="logo-sub" aria-hidden="true">Bible</span>}
    </div>
  )
}

const P = {
  sun: <><path d="M3 18h18" /><path d="M6.5 18a5.5 5.5 0 0 1 11 0" /><path d="M12 4v4M5.2 8.2l2 2M18.8 8.2l-2 2" /></>,
  book: <><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5zM5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3" /><path d="M12 7v6M9.5 9.5h5" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  mark: <path d="M6 3.5h12v17l-6-4-6 4z" />,
  user: <><circle cx="12" cy="8.5" r="4" /><path d="M4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" /></>,
  left: <path d="m14.5 6-6 6 6 6" />, right: <path d="m9.5 6 6 6-6 6" />, down: <path d="m6 9.5 6 6 6-6" />,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8" /></>,
  note: <><path d="M5 4h14v11l-5 5H5z" /><path d="M14 20v-5h5M8.5 9h7M8.5 12.5h4" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  out: <><path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14" /><path d="M10 8l-4 4 4 4M6 12h10" /></>,
  flame: <path d="M12 3.2c.9 3 4.8 5 4.8 9.6a4.8 4.8 0 0 1-9.6 0c0-2.6 1.5-4.1 2.2-6 .7 1.5 1.5 2.3 2.2 2.3-.4-2-.4-4 .4-5.9z" />,
}
export function Icon({ name, size = 22 }) {
  return <svg className="ic" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{P[name]}</svg>
}

