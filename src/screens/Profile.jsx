import { useState } from 'react'
import { Badge, FlameMark, Icon } from '../components/ui.jsx'
import { api } from '../lib/backend.js'
import { MES, ymd, today, flameName } from '../lib/bible.js'

const TIERS = [[1, 'Faísca'], [3, 'Chama'], [7, 'Fogueira'], [14, 'Incêndio'], [30, 'Fogo que não apaga']]

export default function Profile({ data, act, st, session, demo, say, go }) {
  const [name, setName] = useState(data.profile.name || '')
  const [month, setMonth] = useState(() => { const d = today(); return new Date(d.getFullYear(), d.getMonth(), 1, 12) })
  const read = Object.keys(data.plan).length
  const marks = Object.values(data.marks)
  const nVerses = marks.filter(m => m.saved || m.color).length, nNotes = marks.filter(m => m.note).length
  const dares = Object.values(data.days).filter(d => d.challenge).length
  const first = (month.getDay() + 6) % 7, days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const tk = ymd(today())
  const nextTier = TIERS.find(([n]) => n > st.cur)

  // Selos: critérios simples, calculados a partir do que já é salvo (sem tabela nova)
  const badges = [
    { icon: 'flame', title: `Day ${Math.max(st.cur, 1)}`, on: st.cur >= 1, hint: st.cur >= 1 ? 'Sequência atual' : 'Faça o 1º check-in' },
    { icon: 'target', title: 'Foco', on: dares >= 5, hint: dares >= 5 ? '5 desafios feitos' : `${dares}/5 desafios` },
    { icon: 'calendar', title: 'Constância', on: st.best >= 7, hint: st.best >= 7 ? '7 dias seguidos' : `Recorde ${st.best}/7 dias` },
    { icon: 'heart', title: 'Presença', on: st.total >= 30, hint: st.total >= 30 ? '30 devocionais' : `${st.total}/30 devocionais` },
  ]

  return (
    <div className="profile">
      <section className="idcard">
        <span className="avatar" aria-hidden="true">{(data.profile.name || '?').trim().charAt(0).toUpperCase() || '?'}</span>
        <div className="id-who">
          <h1>{data.profile.name || 'Sem nome'}</h1>
          <p className="id-tier"><Icon name="flame" size={16} />{flameName(st.cur)}</p>
        </div>
        <FlameMark live className="id-flame" />
        <dl className="stats">
          <div><dt>Sequência</dt><dd>{st.cur}</dd></div>
          <div><dt>Recorde</dt><dd>{st.best}</dd></div>
          <div><dt>Devocionais</dt><dd>{st.total}</dd></div>
          <div><dt>Capítulos lidos</dt><dd>{read}</dd></div>
        </dl>
        {nextTier && <p className="next">{nextTier[0] - st.cur === 1 ? 'Falta 1 dia' : `Faltam ${nextTier[0] - st.cur} dias`} para virar <b>{nextTier[1]}</b>.</p>}
      </section>

      <section className="block">
        <h2>Selos</h2>
        <ul className="badges">{badges.map(b => <Badge key={b.title} {...b} />)}</ul>
      </section>

      <button className="golink" onClick={() => go('salvos')}>
        <Icon name="mark" />
        <span><b>Salvos, anotações e diário</b><small>{nVerses} {nVerses === 1 ? 'versículo' : 'versículos'} · {nNotes} {nNotes === 1 ? 'anotação' : 'anotações'}</small></span>
        <Icon name="right" />
      </button>

      <section className="block cal">
        <div className="cal-head">
          <button className="btn icon ghost" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1, 12))} aria-label="Mês anterior"><Icon name="left" /></button>
          <h2>{MES[month.getMonth()]} de {month.getFullYear()}</h2>
          <button className="btn icon ghost" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1, 12))} aria-label="Próximo mês" disabled={month.getMonth() === today().getMonth() && month.getFullYear() === today().getFullYear()}><Icon name="right" /></button>
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
        <p className="muted small">Entrou como {session.user.email}.</p>
        <button className="btn wide" onClick={() => api.signOut()}><Icon name="out" />Sair da conta</button>
      </section>

      <p className="credit">
        {demo ? 'Modo demonstração: seus dados ficam só neste navegador. ' : 'Seus dados ficam salvos na sua conta e aparecem em qualquer aparelho. '}
        Texto bíblico: Bíblia Livre © Diego Santos, Mario Sérgio e Marco Teles, licença <a href="https://creativecommons.org/licenses/by/3.0/br/" target="_blank" rel="noreferrer">CC BY 3.0 BR</a>.
      </p>
    </div>
  )
}
