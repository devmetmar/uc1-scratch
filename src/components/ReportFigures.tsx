import { useMemo, useState } from "react";
import manifest from "../data/figures-manifest.json";

type FigureEntry = {
  id: string;
  file: string;
  page: number;
  captions: string[];
  modules: string[];
  source: string;
};

type Manifest = {
  source: string;
  note: string;
  figures: FigureEntry[];
};

const data = manifest as Manifest;

function figureSrc(file: string) {
  const base = import.meta.env.BASE_URL || "/";
  const clean = file.replace(/^\//, "");
  return `${base}${clean}`;
}

/** Report figures relevant to a curriculum module id (e.g. u06). */
export function ReportFigures({ moduleId }: { moduleId: string }) {
  const figs = useMemo(
    () => data.figures.filter((f) => f.modules.includes(moduleId)),
    [moduleId]
  );
  const [openId, setOpenId] = useState<string | null>(null);

  if (figs.length === 0) return null;

  return (
    <section className="report-figures">
      <div className="report-figures-head">
        <h3>Gambar dari Draft Report</h3>
        <p className="hint">
          {figs.length} halaman figure · sumber Issue 3.0 (CLS, internal)
        </p>
      </div>
      <div className="figure-grid">
        {figs.map((f) => {
          const expanded = openId === f.id;
          return (
            <figure key={f.id} className={expanded ? "fig-card expanded" : "fig-card"}>
              <button
                type="button"
                className="fig-thumb-btn"
                onClick={() => setOpenId(expanded ? null : f.id)}
                aria-expanded={expanded}
              >
                <img
                  src={figureSrc(f.file)}
                  alt={f.captions[0] ?? `Report page ${f.page}`}
                  loading="lazy"
                />
              </button>
              <figcaption>
                <strong>p.{f.page}</strong>
                {f.captions.slice(0, expanded ? 99 : 2).map((c) => (
                  <span key={c}>{c}</span>
                ))}
                {f.captions.length > 2 && !expanded && (
                  <span className="fig-more">+{f.captions.length - 2} caption…</span>
                )}
              </figcaption>
              {expanded && (
                <a
                  className="btn"
                  href={figureSrc(f.file)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Buka penuh
                </a>
              )}
            </figure>
          );
        })}
      </div>
      <p className="fig-source">{data.source}</p>
    </section>
  );
}
