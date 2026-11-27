import { useCallback, useEffect, useRef, useState } from 'react'
import { api, DEMO, authError, withTimeout, saveDay, saveMark, savePlan, saveProfile } from './lib/backend.js'
import { loadContent, streakInfo } from './lib/bible.js'
import Auth from './screens/Auth.jsx'
import Today from './screens/Today.jsx'
import Bible from './screens/Bible.jsx'
import Search from './screens/Search.jsx'
import Saved from './screens/Saved.jsx'
import Profile from './screens/Profile.jsx'
import Checkin from './screens/Checkin.jsx'
import Community from './screens/Community.jsx'
import { FlameMark, Icon, Logo } from './components/ui.jsx'

// Barra inferior: início, bíblia, +, comunidade, perfil. Buscar abre pela Bíblia; Salvos, pelo Perfil.
const TABS = [
  ['hoje', 'Início', 'home'], ['biblia', 'Bíblia', 'book'], ['checkin', 'Check-in', 'plus'], ['comunidade', 'Comunidade', 'users'], ['perfil', 'Perfil', 'user'],
]
const ROUTES = [...TABS.map(t => t[0]), 'buscar', 'salvos']
const PARENT = { buscar: 'biblia', salvos: 'perfil' } // qual aba fica acesa nas telas internas
const fromHash = () => { const h = location.hash.slice(1); return ROUTES.includes(h) ? h : null }

export default function App() {
  const [ready, setReady] = useState(false)
  const [fail, setFail] = useState(false)
  const [session, setSession] = useState(undefined)
  const [data, setData] = useState(null)
  const [loadErr, setLoadErr] = useState('')
  const [tries, setTries] = useState(0)
  const [tab, setTab] = useState(() => fromHash() || 'hoje')
  const [ciDay, setCiDay] = useState(null) // dia do check-in (null = hoje)
  const [pos, setPos] = useState({ b: 42, c: 3, v: null, n: 0 })
  const [toast, setToast] = useState('')
  const tRef = useRef()
  const dataRef = useRef(null); dataRef.current = data

  const say = useCallback(m => { setToast(m); clearTimeout(tRef.current); tRef.current = setTimeout(() => setToast(''), 2200) }, [])

  useEffect(() => { loadContent().then(() => setReady(true)).catch(() => setFail(true)) }, [])
  useEffect(() => {
    // se a sessão salva não puder ser lida (ou travar), cai no login em vez de carregar para sempre
    withTimeout(api.session()).then(setSession).catch(() => setSession(s => (s === undefined ? null : s)))
    return api.onChange(s => { setSession(prev => { if (!prev && s) setTab('hoje'); return s }) })
  }, [])
  useEffect(() => {
    setLoadErr('')
    if (!session) { setData(null); return }
    let on = true
    withTimeout(api.load(session.user.id)).then(d => on && setData(d)).catch(e => on && setLoadErr(authError(e)))
    return () => { on = false }
  }, [session?.user?.id, tries])

  useEffect(() => {
    const f = () => { const h = fromHash(); if (h) setTab(h) }
    addEventListener('hashchange', f); return () => removeEventListener('hashchange', f)
  }, [])
  // check-in usa tema claro (creme): o fundo da página acompanha
  const light = !!session && tab === 'checkin'
  useEffect(() => { document.documentElement.classList.toggle('light', light) }, [light])

  const go = t => { if (t === 'checkin') setCiDay(null); setTab(t); try { if (location.hash !== '#' + t) location.hash = t } catch { /* */ } scrollTo(0, 0) }
  const openRef = (b, c, v = null) => { setPos(p => ({ b, c, v, n: p.n + 1 })); go('biblia') }
  const openCheckin = k => { go('checkin'); setCiDay(k) }

  // gravação otimista: atualiza a tela na hora e salva em segundo plano
  const commit = (next, saver) => {
    dataRef.current = next; setData(next)
    saver(session.user.id, next).catch(() => say('Não foi possível salvar. Verifique a conexão e tente de novo.'))
  }
  const act = {
    day(k, patch) { const d = dataRef.current, n = { ...d, days: { ...d.days, [k]: { ...d.days[k], ...patch } } }; commit(n, (u, a) => saveDay(u, a, k)) },
    marks(keys, patch) {
      const d = dataRef.current, marks = { ...d.marks }
      keys.forEach(k => {
        const cur = { ...marks[k], ...patch, at: Date.now() }
        if (!cur.color && !cur.saved && !cur.note) delete marks[k]; else marks[k] = cur
      })
      const next = { ...d, marks }; dataRef.current = next
      commit(next, (u, a) => Promise.all(keys.map(k => saveMark(u, a, k))))
    },
    mark(k, patch) { act.marks([k], patch) },
    plan(id, ch, on) { const d = dataRef.current, plan = { ...d.plan }; if (on) plan[id + ':' + ch] = true; else delete plan[id + ':' + ch]; commit({ ...d, plan }, (u, a) => savePlan(u, a, id, ch)) },
    profile(patch) { const d = dataRef.current; commit({ ...d, profile: { ...d.profile, ...patch } }, saveProfile) },
  }

  if (fail) return <div className="boot"><Logo /><p>Não foi possível carregar a Bíblia. Verifique sua conexão e recarregue a página.</p></div>
  if (session && loadErr) return (
    <div className="boot">
      <Logo />
      <p>Não foi possível carregar seu progresso.</p>
      <p className="boot-err" role="alert">{loadErr}</p>
      <div className="boot-acts">
        <button className="btn primary" onClick={() => { setLoadErr(''); setTries(n => n + 1) }}>Tentar de novo</button>
        <button className="btn" onClick={() => api.signOut().catch(() => {}).finally(() => { setSession(null); setLoadErr('') })}>Sair da conta</button>
      </div>
    </div>
  )
  if (!ready || session === undefined || (session && !data)) return <div className="boot"><FlameMark live className="boot-flame" /><Logo /><span className="sr-only" role="status">Carregando</span></div>
  if (!session) return <Auth demo={DEMO} />

  const st = streakInfo(data.days)
  const props = { data, act, say, openRef, openCheckin, go, st, session, demo: DEMO }
  const lit = PARENT[tab] || tab

  return (
    <div className="app" data-tab={tab}>
      <header className="bar">
        <Logo small />
        <button className="pill" onClick={() => go('hoje')} aria-label={`${st.cur} dias seguidos`}>
          <FlameMark />{st.cur}
        </button>
      </header>
      <nav className="tabs" aria-label="Seções">
        {TABS.map(([id, label, ic]) => (
          <a key={id} href={'#' + id} className={id === 'checkin' ? 'tab-plus' : undefined} aria-current={lit === id ? 'page' : undefined} aria-label={id === 'checkin' ? 'Fazer check-in' : undefined} onClick={e => { e.preventDefault(); go(id) }}>
            <span className="tab-ic"><Icon name={ic} size={id === 'checkin' ? 26 : 22} /></span><span className="tab-l">{label}</span>
          </a>
        ))}
      </nav>
      <main className="wrap" key={tab}>
        {tab === 'hoje' && <Today {...props} />}
        {tab === 'biblia' && <Bible {...props} pos={pos} setPos={setPos} />}
        {tab === 'buscar' && <Search {...props} />}
        {tab === 'checkin' && <Checkin {...props} day={ciDay} key={ciDay || 'hoje'} />}
        {tab === 'comunidade' && <Community {...props} />}
        {tab === 'salvos' && <Saved {...props} />}
        {tab === 'perfil' && <Profile {...props} />}
      </main>
      <div className={'toast' + (toast ? ' on' : '')} role="status">{toast}</div>
    </div>
  )
}
