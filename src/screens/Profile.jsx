import { useState } from 'react'
import { Icon, SQUADS } from '../components/ui.jsx'
import { api } from '../lib/backend.js'
import { MES, ymd, today, flameName } from '../lib/bible.js'

const TIERS = [[1, 'Faísca'], [3, 'Chama'], [7, 'Fogueira'], [14, 'Incêndio'], [30, 'Fogo que não apaga']]

export default function Profile({ data, act, st, session, demo, say }) {
  const [name, setName] = useState(data.profile.name || '')
  const [month, setMonth] = useState(() => { const d = today(); return new Date(d.getFullYear(), d.getMonth(), 1, 12) })
  const read = Object.keys(data.plan).length
  const saved = Object.values(data.marks).filter(m => m.saved).length
  const first = (month.getDay() + 6) % 7, days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const tk = ymd(today())
  const nextTier = TIERS.find(([n]) => n > st.cur)

  return (
    <div className="profile">
      <section className="idcard">
        <span className="avatar" aria-hidden="true">{(data.profile.name || '?').trim().charAt(0).toUpperCase() || '?'}</span>
        <div className="id-who">
          <h1>{data.profile.name || 'Sem nome'}</h1>
          {data.profile.squad && <p>Squad {data.profile.squad}</p>}
          <p className="id-tier"><Icon name="flame" size={16} />{flameName(st.cur)}</p>
        </div>
        <dl className="stats">
          <div><dt>Sequência</dt><dd>{st.cur}</dd></div>
          <div><dt>Recorde</dt><dd>{st.best}</dd></div>
          <div><dt>Devocionais</dt><dd>{st.total}</dd></div>
          <div><dt>Capítulos lidos</dt><dd>{read}</dd></div>
        </dl>
        {nextTier && <p className="next">{nextTier[0] - st.cur === 1 ? 'Falta 1 dia' : `Faltam ${nextTier[0] - st.cur} dias`} para virar <b>{nextTier[1]}</b>.</p>}
      </section>

      <section className="block cal">
        <div className="cal-head">
          <button className="btn icon" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1, 12))} aria-label="Mês anterior"><Icon name="left" /></button>
          <h2>{MES[month.getMonth()]} de {month.getFullYear()}</h2>
          <button className="btn icon" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1, 12))} aria-label="Próximo mês" disabled={month.getMonth() === today().getMonth() && month.getFullYear() === today().getFullYear()}><Icon name="right" /></button>
        </div>
        <div className="cal-grid">
          {['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'].map(d => <span key={d} className="cal-w">{d}</span>)}
          {Array.from({ length: first }, (_, i) => <span key={'e' + i} />)}
          {Array.from({ length: days }, (_, i) => {
            const k = ymd(new Date(month.getFullYear(), month.getMonth(), i + 1, 12)), ok = data.days[k]?.done
            return <span key={k} className={'cal-d' + (ok ? ' ok' : '') + (k === tk ? ' now' : '')} aria-label={`${i + 1}${ok ? ', devocional feito' : ''}`}>
              {i + 1}
            </span>
          })}
        </div>
      </section>

      <section className="block">
        <h2>Seus dados</h2>
        <label className="fld"><span>Nome</span>
          <input value={name} onChange={e => setName(e.target.value)} onBlur={() => { if (name.trim() && name.trim() !== data.profile.name) { act.profile({ name: name.trim() }); say('Nome atualizado') } }} />
        </label>
        <fieldset className="fld"><legend>Squad</legend>
          <div className="chips">{SQUADS.map(s => (
            <button key={s} className={data.profile.squad === s ? 'on' : ''} aria-pressed={data.profile.squad === s} onClick={() => act.profile({ squad: data.profile.squad === s ? null : s })}>{s}</button>
          ))}</div>
        </fieldset>
        <p className="muted small">Entrou como {session.user.email}. {saved} {saved === 1 ? 'versículo salvo' : 'versículos salvos'}.</p>
        <button className="btn wide" onClick={() => api.signOut()}><Icon name="out" />Sair da conta</button>
      </section>

      <p className="credit">
        {demo ? 'Modo demonstração: seus dados ficam só neste navegador. ' : 'Seus dados ficam salvos na sua conta e aparecem em qualquer aparelho. '}
        Texto bíblico: Bíblia Livre © Diego Santos, Mario Sérgio e Marco Teles, licença <a href="https://creativecommons.org/licenses/by/3.0/br/" target="_blank" rel="noreferrer">CC BY 3.0 BR</a>.
      </p>
    </div>
  )
}
