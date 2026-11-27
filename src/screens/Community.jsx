import { Mascot } from '../components/ui.jsx'

// Comunidade: o feed de check-ins está no ROADMAP.md (próxima fase). Por enquanto, tela de "em breve".
export default function Community({ go }) {
  return (
    <div className="community">
      <Mascot className="cm-mascot" />
      <span className="soon">Em breve</span>
      <h1>Comunidade</h1>
      <p>Aqui você vai ver os check-ins da galera, com fotos e textos dos devocionais, e torcer pela sequência de cada um.</p>
      <button className="btn big lime" onClick={() => go('checkin')}>Fazer meu check-in</button>
    </div>
  )
}
