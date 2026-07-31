const pillars = [
  {
    title: "Quality checked",
    body: "Every piece is inspected, cleaned, and photographed before it enters your room.",
  },
  {
    title: "Delivery & setup",
    body: "We deliver, assemble, cable-manage, and leave your workspace ready for Monday.",
  },
  {
    title: "Swap as you grow",
    body: "Change individual pieces or expand the setup without restarting your rental.",
  },
  {
    title: "Flexible returns",
    body: "Schedule collection when plans change. No boxes or disassembly required.",
  },
];

export function TrustSection() {
  return (
    <section className="trust-section">
      <div className="trust-heading">
        <p className="eyebrow">The Roomie standard</p>
        <h2>
          Everything handled.
          <br />
          Nothing improvised.
        </h2>
      </div>
      <div className="trust-grid">
        {pillars.map((pillar, index) => (
          <article key={pillar.title}>
            <span>{`0${index + 1}`}</span>
            <h3>{pillar.title}</h3>
            <p>{pillar.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
