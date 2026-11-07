import { PREVENTION_TIPS } from '../data/education'

export default function PreventionTips() {
  return (
    <section aria-labelledby="tips-heading" className="tips">
      <h2 id="tips-heading">Preventing tick bites</h2>
      <div className="card-grid">
        {PREVENTION_TIPS.map((group) => (
          <article key={group.title} className="panel">
            <h3>{group.title}</h3>
            <ul>{group.tips.map((t) => <li key={t}>{t}</li>)}</ul>
          </article>
        ))}
      </div>
      <p className="muted small">General guidance only - not a substitute for advice from your vet or GP.</p>
    </section>
  )
}
