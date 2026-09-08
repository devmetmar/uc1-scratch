/** SVG concept illustrations for key modules — theme via CSS variables. */
import type { ReactNode } from "react";

type IllustProps = { id: string };

function Frame({
  title,
  caption,
  children,
  height = 220,
}: {
  title: string;
  caption: string;
  children: ReactNode;
  height?: number;
}) {
  return (
    <figure className="illust">
      <figcaption className="illust-title">{title}</figcaption>
      <div className="illust-canvas">
        <svg viewBox={`0 0 640 ${height}`} width="100%" height={height}>
          {children}
        </svg>
      </div>
      <p className="illust-caption">{caption}</p>
    </figure>
  );
}

export function ModuleIllustration({ id }: IllustProps) {
  switch (id) {
    case "f01":
      return (
        <Frame
          title="Dua jalur prediksi"
          caption="Atas: model fisik/NWP. Bawah: ML/DL belajar dari data historis (pendekatan UC1)."
          height={200}
        >
          <rect x="30" y="30" width="150" height="50" rx="8" className="svg-box" />
          <text x="105" y="60" textAnchor="middle" className="svg-text">
            Persamaan fisika
          </text>
          <line x1="190" y1="55" x2="250" y2="55" className="svg-accent-stroke" strokeWidth="2" />
          <rect x="260" y="30" width="120" height="50" rx="8" className="svg-box" />
          <text x="320" y="60" textAnchor="middle" className="svg-text">
            Simulasi
          </text>
          <line x1="390" y1="55" x2="450" y2="55" className="svg-accent-stroke" strokeWidth="2" />
          <rect x="460" y="30" width="140" height="50" rx="8" className="svg-box" />
          <text x="530" y="60" textAnchor="middle" className="svg-text">
            Prediksi arus
          </text>

          <rect x="30" y="110" width="150" height="50" rx="8" className="svg-box" />
          <text x="105" y="140" textAnchor="middle" className="svg-text">
            Data X, y
          </text>
          <line x1="190" y1="135" x2="250" y2="135" className="svg-accent-stroke" strokeWidth="2" />
          <rect x="260" y="110" width="120" height="50" rx="8" className="svg-box-accent" />
          <text x="320" y="140" textAnchor="middle" className="svg-text">
            Belajar DL
          </text>
          <line x1="390" y1="135" x2="450" y2="135" className="svg-accent-stroke" strokeWidth="2" />
          <rect x="460" y="110" width="140" height="50" rx="8" className="svg-box" />
          <text x="530" y="140" textAnchor="middle" className="svg-text">
            Prediksi arus
          </text>
        </Frame>
      );
    case "f02":
      return (
        <Frame
          title="Supervised learning"
          caption="Fitur X (tide, angin, past currents…) → model → target y (arus U/V)."
        >
          <rect x="40" y="70" width="140" height="70" rx="8" className="svg-box" />
          <text x="110" y="110" textAnchor="middle" className="svg-text">
            X = fitur
          </text>
          <line x1="195" y1="105" x2="260" y2="105" className="svg-accent-stroke" strokeWidth="2" />
          <rect x="270" y="60" width="140" height="90" rx="8" className="svg-box-accent" />
          <text x="340" y="110" textAnchor="middle" className="svg-text">
            Model
          </text>
          <line x1="425" y1="105" x2="490" y2="105" className="svg-accent-stroke" strokeWidth="2" />
          <rect x="500" y="70" width="110" height="70" rx="8" className="svg-box" />
          <text x="555" y="110" textAnchor="middle" className="svg-text">
            y = arus
          </text>
        </Frame>
      );
    case "f03":
      return (
        <Frame
          title="Forward pass berlapis"
          caption="Setiap garis = bobot. Signal mengalir kiri→kanan hingga prediksi ŷ."
          height={210}
        >
          {(() => {
            const layers = [
              { x: 70, ys: [55, 100, 145], label: "Input" },
              { x: 220, ys: [45, 80, 115, 150], label: "Hidden" },
              { x: 370, ys: [45, 80, 115, 150], label: "Hidden" },
              { x: 520, ys: [75, 125], label: "Output" },
            ];
            const edges: Array<[number, number, number, number]> = [];
            for (let li = 0; li < layers.length - 1; li++) {
              for (const y1 of layers[li].ys) {
                for (const y2 of layers[li + 1].ys) {
                  edges.push([layers[li].x, y1, layers[li + 1].x, y2]);
                }
              }
            }
            return (
              <>
                {edges.map(([x1, y1, x2, y2], i) => (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    className="svg-edge"
                  />
                ))}
                {layers.map((L, li) => (
                  <g key={L.label + li}>
                    <text
                      x={L.x}
                      y={28}
                      textAnchor="middle"
                      className="svg-muted"
                    >
                      {L.label}
                    </text>
                    {L.ys.map((y, i) => (
                      <circle
                        key={i}
                        cx={L.x}
                        cy={y}
                        r={12}
                        className={li === 3 ? "svg-node-accent" : "svg-node"}
                      />
                    ))}
                  </g>
                ))}
              </>
            );
          })()}
        </Frame>
      );
    case "f06":
      return (
        <Frame
          title="Temporal split"
          caption="Train di masa lalu, val di tengah, test di masa depan — hindari leakage."
          height={160}
        >
          <rect x="40" y="50" width="200" height="45" className="svg-box-accent" />
          <text x="140" y="78" textAnchor="middle" className="svg-text">
            Train
          </text>
          <rect x="240" y="50" width="130" height="45" className="svg-box" />
          <text x="305" y="78" textAnchor="middle" className="svg-text">
            Val
          </text>
          <rect x="370" y="50" width="180" height="45" className="svg-box" strokeWidth="2" />
          <text x="460" y="78" textAnchor="middle" className="svg-text">
            Test (depan)
          </text>
          <text x="40" y="130" className="svg-muted">
            waktu →
          </text>
        </Frame>
      );
    case "f07":
      return (
        <Frame
          title="Kurva sehat vs overfitting"
          caption="Kiri: train & val turun bersama. Kanan: train turun, val naik = overfit."
          height={220}
        >
          <rect x="20" y="20" width="280" height="160" rx="8" className="svg-panel" />
          <text x="160" y="42" textAnchor="middle" className="svg-muted">
            Sehat
          </text>
          <path
            d="M50 70 Q120 90 200 120 T270 135"
            fill="none"
            className="svg-accent-stroke"
            strokeWidth="2"
          />
          <path
            d="M50 80 Q120 100 200 125 T270 140"
            fill="none"
            className="svg-stroke"
            strokeWidth="2"
            strokeDasharray="5 3"
          />
          <rect x="330" y="20" width="280" height="160" rx="8" className="svg-panel" />
          <text x="470" y="42" textAnchor="middle" className="svg-muted">
            Overfit
          </text>
          <path
            d="M360 75 Q430 100 500 130 T580 150"
            fill="none"
            className="svg-accent-stroke"
            strokeWidth="2"
          />
          <path
            d="M360 85 Q420 110 470 100 T580 55"
            fill="none"
            className="svg-stroke"
            strokeWidth="2"
            strokeDasharray="5 3"
          />
        </Frame>
      );
    case "f09":
    case "u09":
      return (
        <Frame
          title="ConvLSTM: ruang + waktu"
          caption="Filter lokal di peta arus + memori antar waktu → prediksi field."
          height={210}
        >
          {[0, 1, 2, 3, 4].map((r) =>
            [0, 1, 2, 3, 4].map((c) => (
              <rect
                key={`${r}-${c}`}
                x={40 + c * 26}
                y={40 + r * 26}
                width={24}
                height={24}
                className={
                  r >= 1 && r <= 3 && c >= 1 && c <= 3
                    ? "svg-box-accent"
                    : "svg-box"
                }
              />
            ))
          )}
          <text x="105" y="190" textAnchor="middle" className="svg-muted">
            kernel 3×3
          </text>
          {[0, 1, 2].map((t) => (
            <rect
              key={t}
              x={220 + t * 70}
              y={55}
              width={55}
              height={55}
              rx="4"
              className="svg-box"
            />
          ))}
          <text x="325" y="140" textAnchor="middle" className="svg-muted">
            t-2 → t-1 → t
          </text>
          <rect x="460" y="55" width="140" height="55" rx="8" className="svg-box-accent" />
          <text x="530" y="88" textAnchor="middle" className="svg-text">
            ConvLSTM
          </text>
        </Frame>
      );
    case "u02":
      return (
        <Frame
          title="Observasi · gap · forecast"
          caption="Segmen penuh = radar. Putus = gap diisi AI. Panah = forecast ~24 jam."
          height={170}
        >
          <rect x="40" y="70" width="130" height="28" rx="4" className="svg-box-accent" />
          <rect
            x="180"
            y="70"
            width="150"
            height="28"
            rx="4"
            className="svg-box"
            strokeDasharray="6 4"
          />
          <rect x="340" y="70" width="70" height="28" rx="4" className="svg-box-accent" />
          <rect x="430" y="70" width="130" height="28" rx="4" className="svg-box" />
          <line
            x1="420"
            y1="40"
            x2="420"
            y2="130"
            className="svg-stroke"
            strokeDasharray="3 3"
          />
          <text x="420" y="150" textAnchor="middle" className="svg-muted">
            sekarang
          </text>
          <text x="105" y="55" textAnchor="middle" className="svg-muted">
            observasi
          </text>
          <text x="255" y="55" textAnchor="middle" className="svg-muted">
            GAP
          </text>
          <text x="495" y="55" textAnchor="middle" className="svg-muted">
            forecast
          </text>
        </Frame>
      );
    case "u08":
      return (
        <Frame
          title="Analogue di ruang fitur"
          caption="Query hari ini mencari tetangga historis (Milvus/KNN) untuk baseline arus."
        >
          <rect x="40" y="30" width="300" height="160" rx="8" className="svg-panel" />
          {[
            [100, 70],
            [140, 120],
            [180, 90],
            [220, 140],
            [90, 140],
            [250, 70],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="6" className="svg-node" />
          ))}
          <circle cx={160} cy={110} r="9" className="svg-node-accent" />
          <circle cx={140} cy={120} r="12" fill="none" className="svg-accent-stroke" strokeWidth="2" />
          <circle cx={180} cy={90} r="12" fill="none" className="svg-accent-stroke" strokeWidth="2" />
          <rect x="380" y="60" width="200" height="50" rx="8" className="svg-box-accent" />
          <text x="480" y="90" textAnchor="middle" className="svg-text">
            WeightedRanker
          </text>
          <rect x="380" y="130" width="200" height="40" rx="8" className="svg-box" />
          <text x="480" y="155" textAnchor="middle" className="svg-text">
            Arus analog ≈ ŷ
          </text>
        </Frame>
      );
    case "u11":
      return (
        <Frame
          title="Eulerian vs Lagrangian"
          caption="Kiri: error di titik grid. Kanan: bandingkan lintasan partikel (NCLS)."
          height={210}
        >
          <rect x="20" y="25" width="270" height="155" rx="8" className="svg-panel" />
          <text x="155" y="48" textAnchor="middle" className="svg-muted">
            Eulerian
          </text>
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => (
              <g key={`${r}-${c}`}>
                <circle cx={70 + c * 55} cy={80 + r * 30} r="4" className="svg-node" />
                <line
                  x1={70 + c * 55}
                  y1={80 + r * 30}
                  x2={70 + c * 55 + 14}
                  y2={80 + r * 30 - 7}
                  className="svg-accent-stroke"
                  strokeWidth="1.5"
                />
              </g>
            ))
          )}
          <rect x="330" y="25" width="280" height="155" rx="8" className="svg-panel" />
          <text x="470" y="48" textAnchor="middle" className="svg-muted">
            Lagrangian
          </text>
          <path
            d="M370 140 Q430 60 520 90 T590 70"
            fill="none"
            className="svg-stroke"
            strokeWidth="2"
            strokeDasharray="5 3"
          />
          <path
            d="M370 140 Q440 75 530 95 T590 80"
            fill="none"
            className="svg-accent-stroke"
            strokeWidth="2.5"
          />
        </Frame>
      );
    default:
      return null;
  }
}
