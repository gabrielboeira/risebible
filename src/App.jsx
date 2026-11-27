import { useCallback, useEffect, useRef, useState } from 'react'
import { api, DEMO, saveDay, saveMark, savePlan, saveProfile } from './lib/backend.js'
import { loadContent, streakInfo } from './lib/bible.js'
import Auth from './screens/Auth.jsx'
import Today from './screens/Today.jsx'
import Bible from './screens/Bible.jsx'
import Search from './screens/Search.jsx'
import Saved from './screens/Saved.jsx'
import Profile from './screens/Profile.jsx'
import { Icon, Logo } from './components/ui.jsx'

const TABS = [
  ['hoje', 'Hoje', 'sun'], ['biblia', 'Bíblia', 'book'], ['buscar', 'Buscar', 'search'], ['salvos', 'Salvos', 'mark'], ['perfil', 'Perfil', 'user'],
]

export default function App() {
  const [ready, setReady] = useState(false)
  const [fail, setFail] = useState(false)
  const [session, setSession] = useState(undefined)
  const [data, setData] = useState(null)
  const [tab, setTab] = useState(() => TABS.some(t => t[0] === location.hash.slice(1)) ? location.hash.slice(1) : 'hoje')
  const [pos, setPos] = useState({ b: 42, c: 3, v: null, n: 0 })
  const [toast, setToast] = useState('')
  const tRef = useRef()
  const dataRef = useRef(null); dataRef.current = data

  const say = useCallback(m => { setToast(m); clearTimeout(tRef.current); tRef.current = setTimeout(() => setToast(''), 2200) }, [])

  useEffect(() => { loadContent().then(() => setReady(true)).catch(() => setFail(true)) }, [])
  useEffect(() => {
    api.session().then(setSession)
    return api.onChange(s => { setSession(prev => { if (!prev && s) setTab('hoje'); return s }) })
  }, [])
  useEffect(() => {
    if (!session) { setData(null); return }
    let on = true
    api.load(session.user.id).then(d => on && setData(d)).catch(() => on && say('Não foi possível carregar seu progresso. Verifique a conexão.'))
    return () => { on = false }
  }, [session?.user?.id])

  useEffect(() => {
    const f = () => { const h = location.hash.slice(1); if (TABS.some(t => t[0] === h)) setTab(h) }
    addEventListener('hashchange', f); return () => removeEventListener('hashchange', f)
  }, [])
  const go = t => { setTab(t); try { if (location.hash !== '#' + t) location.hash = t } catch { /* */ } scrollTo(0, 0) }
  const openRef = (b, c, v = null) => { setPos(p => ({ b, c, v, n: p.n + 1 })); go('biblia') }

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
  if (!ready || session === undefined || (session && !data)) return <div className="boot"><Logo /><span className="spin" aria-label="Carregando" /></div>
  if (!session) return <Auth demo={DEMO} />

  const st = streakInfo(data.days)
  const props = { data, act, say, openRef, go, st, session, demo: DEMO }

  return (
    <div className="app" data-tab={tab}>
      <header className="bar">
        <Logo small />
        <button className="pill" onClick={() => go('hoje')} aria-label={`${st.cur} dias seguidos`}>
          <Icon name="flame" size={18} />{st.cur}
        </button>
      </header>
      <nav className="tabs" aria-label="Seções">
          {TABS.map(([id, label, ic]) => (
            <a key={id} href={'#' + id} aria-current={tab === id ? 'page' : undefined} onClick={e => { e.preventDefault(); go(id) }}>
              <span className="tab-ic"><Icon name={ic} /></span>{label}
            </a>
          ))}
        </nav>
      <main className="wrap" key={tab}>
        {tab === 'hoje' && <Today {...props} />}
        {tab === 'biblia' && <Bible {...props} pos={pos} setPos={setPos} />}
        {tab === 'buscar' && <Search {...props} />}
        {tab === 'salvos' && <Saved {...props} />}
        {tab === 'perfil' && <Profile {...props} />}
      </main>
      <div className={'toast' + (toast ? ' on' : '')} role="status">{toast}</div>
    </div>
  )
}
