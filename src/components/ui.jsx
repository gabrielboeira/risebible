// Identidade Flame no Rise Bible: chama de contorno laranja com miolo creme e "+", ícones de linha arredondados.

// Chama redesenhada em vetor a partir de public/flame/chama.png (nítida em qualquer tamanho)
const OUTER = 'M52 6C56 18 65 29 70 41C72 46 75 47 77 43C79 40 80 37 80 33C92 47 96 62 96 78C96 104 76 124 50 124C24 124 4 104 4 80C4 64 10 50 20 37C21 44 24 49 29 51C30 40 35 29 41 21C46 15 50 11 52 6Z'
const INNER = 'M53.4 46C56.7 57 63.4 62 65.1 71C66.8 67 68.5 63 68.5 59C75.2 69 76.9 80 75.2 90C73.5 104 63.4 112 50 112C36.6 112 26.5 104 24.8 92C24 82 26.5 73 31.5 65C33.2 71 35.7 75 39.1 76C39.9 63 46.6 53 53.4 46Z'

// Símbolo do Flame. `white` = versão de linha branca (para fundo laranja); `live` = brilho laranja nas versões grandes.
export function FlameMark({ className = '', live = false, white = false }) {
  const c = white ? '#FFFFFF' : '#FF5A1F'
  return (
    <svg className={'flame-mark' + (live ? ' live' : '') + (className ? ' ' + className : '')} viewBox="-4 0 110 132" aria-hidden="true">
      <path d={OUTER} fill={white ? 'none' : '#FFF4E8'} stroke={c} strokeWidth="8" strokeLinejoin="round" />
      <path d={INNER} fill={white ? 'none' : c} stroke={white ? c : 'none'} strokeWidth="7" strokeLinejoin="round" />
      <g fill={c}><rect x="86" y="8" width="6" height="18" rx="3" /><rect x="80" y="14" width="18" height="6" rx="3" /></g>
    </svg>
  )
}

// Mascote do Flame: a Bíblia com fogo (public/flame/mascote.png)
export function Mascot({ className = '', alt = '' }) {
  return <img className={'mascot' + (className ? ' ' + className : '')} src={import.meta.env.BASE_URL + 'flame/mascote.png'} alt={alt} width="140" height="180" decoding="async" />
}

// Marca: chama + "rise bible" em Poppins Bold laranja, com o "+" verde
export function Logo({ small }) {
  return (
    <div className={'logo' + (small ? ' sm' : '')} role="img" aria-label="Rise Bible">
      <FlameMark />
      <span className="logo-t" aria-hidden="true">rise bible<b>+</b></span>
    </div>
  )
}

const P = {
  home: <><path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 0 1 4 19z" /></>,
  book: <><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5zM5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3" /><path d="M12 7v6M9.5 9.5h5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  users: <><circle cx="9" cy="8.5" r="3.5" /><path d="M2.5 20c.9-3.3 3.4-5 6.5-5s5.6 1.7 6.5 5" /><path d="M15.5 5.2a3.5 3.5 0 0 1 0 6.6M17.5 15.3c2 .6 3.4 2.2 4 4.7" /></>,
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
  camera: <><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.6-2.5h5.4L16.3 7h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" /><circle cx="12" cy="12.8" r="3.4" /></>,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /></>,
  calendar: <><rect x="4" y="5.5" width="16" height="14.5" rx="2.5" /><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" /><path d="m9.3 14.6 1.9 1.9 3.6-3.6" /></>,
  heart: <path d="M12 19.5s-7.5-4.4-7.5-10a4.2 4.2 0 0 1 7.5-2.6 4.2 4.2 0 0 1 7.5 2.6c0 5.6-7.5 10-7.5 10z" />,
  lock: <><rect x="5.5" y="10.5" width="13" height="9.5" rx="2.5" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></>,
}
export function Icon({ name, size = 22 }) {
  return <svg className="ic" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{P[name]}</svg>
}

// Selos do perfil (Day N, Foco, Constância, Presença). `on` = conquistado.
export function Badge({ icon, title, hint, on }) {
  return (
    <li className={'badge' + (on ? ' on' : '')}>
      <span className="badge-ic">{on ? (icon === 'flame' ? <FlameMark /> : <Icon name={icon} size={26} />) : <Icon name="lock" size={22} />}</span>
      <b>{title}</b>
      <small>{hint}</small>
    </li>
  )
}
