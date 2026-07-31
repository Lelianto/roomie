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

/**
 * The grid loses a column at each breakpoint, and the dividers have to follow:
 * four columns are separated by right borders, two columns need a bottom border
 * under the first row, and a single column needs bottom borders throughout.
 */
const pillarClasses = [
  "min-h-[235px] border-r border-white/17 pt-[27px] pr-[25px] last:border-r-0 [&+article]:pl-[25px]",
  "max-wide:[&:nth-child(2)]:border-r-0 max-wide:[&:nth-child(-n+2)]:border-b max-wide:[&:nth-child(-n+2)]:border-white/17",
  "max-lap:min-h-0 max-lap:border-r-0 max-lap:border-b max-lap:border-white/17 max-lap:px-0 max-lap:pt-[27px] max-lap:pb-[30px] max-lap:last:border-b-0 max-lap:[&+article]:pl-0",
].join(" ");

export function TrustSection() {
  return (
    <section className="bg-ink px-[5.5vw] pt-[110px] pb-[100px] text-white max-lap:px-5 max-lap:pt-20 max-lap:pb-[60px]">
      <div className="flex items-end justify-between max-lap:flex-col max-lap:items-start max-lap:gap-[14px]">
        <p className="eyebrow">The Roomie standard</p>
        <h2 className="m-0 font-mona text-[clamp(48px,5.5vw,80px)] leading-[0.98] font-[650] tracking-[-0.055em] max-lap:text-[clamp(34px,9vw,48px)]">
          Everything handled.
          <br />
          Nothing improvised.
        </h2>
      </div>
      <div className="mt-[75px] grid grid-cols-4 border-t border-white/17 max-wide:grid-cols-2 max-lap:mt-[50px] max-lap:grid-cols-1">
        {pillars.map((pillar, index) => (
          <article key={pillar.title} className={pillarClasses}>
            <span className="font-mona text-[10px] text-lime">{`0${index + 1}`}</span>
            <h3 className="mt-[83px] mb-[11px] font-mona text-[17px] tracking-[-0.025em] max-lap:mt-[33px]">
              {pillar.title}
            </h3>
            <p className="m-0 text-xs leading-[1.6] opacity-[0.52]">{pillar.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
