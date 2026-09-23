// The circuit symbols the Cambridge 9702 syllabus lists for AS Physics
// (section 6, printed pages 61-62). The notes used to embed those two pages
// as images; they are Cambridge's printed pages and are not published in this
// public repo, so the symbols are drawn here instead, following the syllabus
// forms exactly -- including the ones that differ from what people often
// draw: the generator is a square, not a circle, and the light-dependent
// resistor has no enclosing circle.
//
// Every drawing is 120 wide on a 60-high grid with its wires on y = 30, and
// strokes in currentColor so the sheet follows the surrounding text colour.

type Symbol = { name: string; draw: React.ReactNode; tall?: boolean };

const STROKE = { stroke: "currentColor", strokeWidth: 2, fill: "none", strokeLinecap: "round" as const };

/** A line with a solid arrowhead at its (x2, y2) end. */
function Arrow({ x1, y1, x2, y2, head = 7 }: { x1: number; y1: number; x2: number; y2: number; head?: number }) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const spread = Math.PI / 7;
  const a = [x2 - head * Math.cos(angle - spread), y2 - head * Math.sin(angle - spread)];
  const b = [x2 - head * Math.cos(angle + spread), y2 - head * Math.sin(angle + spread)];
  // Stop the shaft at the arrowhead's base so the tip stays sharp.
  const bx = x2 - head * 0.8 * Math.cos(angle), by = y2 - head * 0.8 * Math.sin(angle);
  return <g>
    <line x1={x1} y1={y1} x2={bx} y2={by} {...STROKE} />
    <polygon points={`${x2},${y2} ${a[0]},${a[1]} ${b[0]},${b[1]}`} fill="currentColor" />
  </g>;
}

const Wires = ({ from = 36, to = 84 }: { from?: number; to?: number }) => <>
  <line x1={4} y1={30} x2={from} y2={30} {...STROKE} />
  <line x1={to} y1={30} x2={116} y2={30} {...STROKE} />
</>;

const Resistor = () => <rect x={36} y={20} width={48} height={20} {...STROKE} />;

const Meter = ({ letter }: { letter: string }) => <>
  <Wires from={44} to={76} />
  <circle cx={60} cy={30} r={16} {...STROKE} />
  <text x={60} y={31} textAnchor="middle" dominantBaseline="central" fontSize={17} fill="currentColor" stroke="none">{letter}</text>
</>;

/** One cell: the long thin plate is positive, the short thick plate negative. */
const Cell = ({ x, y = 30 }: { x: number; y?: number }) => <>
  <line x1={x} y1={y - 17} x2={x} y2={y + 17} {...STROKE} />
  <line x1={x + 9} y1={y - 8} x2={x + 9} y2={y + 8} {...STROKE} strokeWidth={4} strokeLinecap="butt" />
</>;

const SYMBOLS: Symbol[] = [
  { name: "cell", draw: <><Cell x={54} /><line x1={4} y1={30} x2={54} y2={30} {...STROKE} /><line x1={63} y1={30} x2={116} y2={30} {...STROKE} /></> },
  {
    name: "battery of cells", tall: true,
    draw: <>
      <line x1={4} y1={24} x2={40} y2={24} {...STROKE} /><Cell x={40} y={24} /><line x1={49} y1={24} x2={62} y2={24} {...STROKE} /><Cell x={62} y={24} /><line x1={71} y1={24} x2={116} y2={24} {...STROKE} />
      <text x={60} y={58} textAnchor="middle" fontSize={11} fill="currentColor" stroke="none">or</text>
      <line x1={4} y1={88} x2={34} y2={88} {...STROKE} /><Cell x={34} y={88} />
      <line x1={45} y1={88} x2={74} y2={88} {...STROKE} strokeDasharray="4 4" />
      <Cell x={76} y={88} /><line x1={85} y1={88} x2={116} y2={88} {...STROKE} />
    </>,
  },
  { name: "power supply", draw: <><line x1={4} y1={30} x2={34} y2={30} {...STROKE} /><circle cx={38} cy={30} r={4} {...STROKE} /><circle cx={82} cy={30} r={4} {...STROKE} /><line x1={86} y1={30} x2={116} y2={30} {...STROKE} /></> },
  {
    name: "a.c. power supply",
    draw: <><line x1={4} y1={30} x2={34} y2={30} {...STROKE} /><circle cx={38} cy={30} r={4} {...STROKE} />
      <path d="M52,31 q4,-7 8,0 t8,0" {...STROKE} />
      <circle cx={82} cy={30} r={4} {...STROKE} /><line x1={86} y1={30} x2={116} y2={30} {...STROKE} /></>,
  },
  { name: "junction of conductors", draw: <><line x1={20} y1={40} x2={100} y2={40} {...STROKE} /><line x1={60} y1={6} x2={60} y2={40} {...STROKE} /><circle cx={60} cy={40} r={4} fill="currentColor" /></> },
  { name: "lamp", draw: <><Wires from={44} to={76} /><circle cx={60} cy={30} r={16} {...STROKE} /><line x1={48.7} y1={18.7} x2={71.3} y2={41.3} {...STROKE} /><line x1={71.3} y1={18.7} x2={48.7} y2={41.3} {...STROKE} /></> },
  { name: "fixed resistor", draw: <><Wires /><Resistor /></> },
  { name: "variable resistor", draw: <><Wires /><Resistor /><Arrow x1={42} y1={54} x2={82} y2={6} /></> },
  { name: "thermistor", draw: <><Wires /><Resistor /><line x1={34} y1={52} x2={44} y2={52} {...STROKE} /><line x1={44} y1={52} x2={80} y2={6} {...STROKE} /></> },
  {
    name: "light-dependent resistor",
    draw: <><Wires /><Resistor /><Arrow x1={30} y1={2} x2={42} y2={15} /><Arrow x1={20} y1={6} x2={32} y2={19} /></>,
  },
  { name: "heater", draw: <><Wires /><Resistor /><line x1={48} y1={20} x2={48} y2={40} {...STROKE} /><line x1={60} y1={20} x2={60} y2={40} {...STROKE} /><line x1={72} y1={20} x2={72} y2={40} {...STROKE} /></> },
  { name: "switch", draw: <><line x1={4} y1={30} x2={44} y2={30} {...STROKE} /><line x1={50} y1={42} x2={84} y2={30} {...STROKE} /><line x1={84} y1={30} x2={116} y2={30} {...STROKE} /></> },
  { name: "earth", draw: <><line x1={60} y1={4} x2={60} y2={36} {...STROKE} /><line x1={44} y1={36} x2={76} y2={36} {...STROKE} /><line x1={50} y1={44} x2={70} y2={44} {...STROKE} /><line x1={56} y1={52} x2={64} y2={52} {...STROKE} /></> },
  // The bell's dome sits on top of its bar; the buzzer's bowl hangs beneath it.
  { name: "electric bell", draw: <><path d="M44,24 A16,16 0 0 1 76,24 Z" {...STROKE} /><line x1={52} y1={24} x2={52} y2={56} {...STROKE} /><line x1={68} y1={24} x2={68} y2={56} {...STROKE} /></> },
  { name: "buzzer", draw: <><path d="M44,10 A16,16 0 0 0 76,10 Z" {...STROKE} /><line x1={52} y1={23.9} x2={52} y2={56} {...STROKE} /><line x1={68} y1={23.9} x2={68} y2={56} {...STROKE} /></> },
  { name: "microphone", draw: <><line x1={34} y1={16} x2={34} y2={44} {...STROKE} /><circle cx={46} cy={30} r={12} {...STROKE} /><line x1={46} y1={18} x2={96} y2={18} {...STROKE} /><line x1={46} y1={42} x2={96} y2={42} {...STROKE} /></> },
  {
    name: "loudspeaker",
    draw: <><line x1={16} y1={22} x2={40} y2={22} {...STROKE} /><line x1={16} y1={38} x2={40} y2={38} {...STROKE} />
      <rect x={40} y={16} width={18} height={28} {...STROKE} /><path d="M58,16 L78,2 L78,58 L58,44" {...STROKE} strokeLinejoin="round" /></>,
  },
  {
    name: "motor",
    draw: <><Meter letter="M" /><line x1={54} y1={39} x2={66} y2={39} {...STROKE} strokeWidth={1.5} /></>,
  },
  {
    name: "generator",
    draw: <><Wires from={44} to={76} /><rect x={44} y={14} width={32} height={32} {...STROKE} />
      <text x={60} y={31} textAnchor="middle" dominantBaseline="central" fontSize={17} fill="currentColor" stroke="none">G</text></>,
  },
  { name: "ammeter", draw: <Meter letter="A" /> },
  { name: "voltmeter", draw: <Meter letter="V" /> },
  { name: "galvanometer", draw: <><Wires from={44} to={76} /><circle cx={60} cy={30} r={16} {...STROKE} /><Arrow x1={60} y1={42} x2={60} y2={18} /></> },
  { name: "potentiometer", draw: <><Wires /><Resistor /><line x1={30} y1={6} x2={60} y2={6} {...STROKE} /><Arrow x1={60} y1={6} x2={60} y2={20} /></> },
  { name: "diode", draw: <><Wires from={46} to={70} /><polygon points="46,18 46,42 70,30" {...STROKE} strokeLinejoin="round" /><line x1={70} y1={18} x2={70} y2={42} {...STROKE} /></> },
  {
    name: "light-emitting diode",
    draw: <><Wires from={46} to={70} /><polygon points="46,18 46,42 70,30" {...STROKE} strokeLinejoin="round" /><line x1={70} y1={18} x2={70} y2={42} {...STROKE} />
      <Arrow x1={70} y1={16} x2={82} y2={4} /><Arrow x1={80} y1={20} x2={92} y2={8} /></>,
  },
  { name: "oscilloscope", draw: <><Wires from={44} to={76} /><circle cx={60} cy={30} r={16} {...STROKE} /><path d="M50,35 L60,28 L60,34 L70,27" {...STROKE} strokeLinejoin="round" /></> },
  { name: "capacitor", draw: <><line x1={60} y1={4} x2={60} y2={25} {...STROKE} /><line x1={42} y1={25} x2={78} y2={25} {...STROKE} /><line x1={42} y1={35} x2={78} y2={35} {...STROKE} /><line x1={60} y1={35} x2={60} y2={56} {...STROKE} /></> },
];

export const CIRCUIT_SYMBOL_NAMES = SYMBOLS.map((symbol) => symbol.name);

export function CircuitSymbols() {
  return <figure className="circuit-symbols" aria-label="Circuit symbols used in the AS Physics 9702 examination">
    <ul>
      {SYMBOLS.map((symbol) => <li key={symbol.name} className={symbol.tall ? "tall" : undefined}>
        <svg viewBox={symbol.tall ? "0 0 120 110" : "0 0 120 60"} aria-hidden="true">{symbol.draw}</svg>
        <span>{symbol.name}</span>
      </li>)}
    </ul>
    <figcaption>Symbols as listed in the Cambridge 9702 syllabus, section 6 (printed pages 61–62). Drawn for StudyTrack.</figcaption>
  </figure>;
}
