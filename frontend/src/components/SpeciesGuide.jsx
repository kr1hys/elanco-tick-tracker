import { SPECIES_GUIDE } from '../data/education'

export default function SpeciesGuide({ countsBySpecies = {} }) {
  return (
    <section aria-labelledby="guide-heading">
      <h2 id="guide-heading">Tick species identification guide</h2>
      <p className="muted">The five species recorded in our sightings data. Most ticks look very similar to the naked eye, so don't worry if you can't tell - you can report a sighting as "Not sure / unknown species".</p>
      <div className="card-grid">
        {SPECIES_GUIDE.map((s) => (
          <article key={s.name} className="panel species-card">
            <h3>{s.name}</h3>
            <p className="latin"><em>{s.latinName}</em>{s.alsoKnownAs && ` · also called the ${s.alsoKnownAs}`}</p>
            <dl>
              <dt>Hosts</dt><dd>{s.hosts}</dd>
              <dt>Where it lives</dt><dd>{s.habitat}</dd>
              <dt>How to spot it</dt><dd>{s.spotting}</dd>
              <dt>Risk to pets</dt><dd>{s.petRisk}</dd>
              {countsBySpecies[s.name] !== undefined && (
                <><dt>Sightings recorded</dt><dd>{countsBySpecies[s.name]}</dd></>
              )}
            </dl>
          </article>
        ))}
      </div>
    </section>
  )
}
