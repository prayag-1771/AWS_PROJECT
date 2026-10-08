import type { Module } from "@/lib/modules";

const WIDTH = 960;
const ROW = 76;
const BOX = 54;
const TOP = 54;

const EDGE = { x: 20, width: 190 };
const COMPUTE = { x: 320, width: 300 };
const DATA = { x: 730, width: 210 };

function clip(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

// Draws the project's architecture from its module designs: public entry
// point on the left, modules in the middle, data stores on the right.
export default function ProjectDiagram({ modules }: { modules: Module[] }) {
  const stores = Array.from(
    new Set(
      modules
        .flatMap((item) => [item.database_engine, item.storage])
        .filter((value) => value !== "None")
    )
  );

  const hasPublic = modules.some((item) => item.networking.startsWith("Public"));
  const rows = Math.max(modules.length, stores.length, 1);
  const height = TOP + rows * ROW + 8;

  // Vertical centre of item `index` in a column of `count` items.
  const centre = (index: number, count: number) =>
    TOP + ((rows - count) * ROW) / 2 + index * ROW + BOX / 2;

  const edgeY = centre(0, 1);

  return (
    <svg
      className="diagram"
      viewBox={`0 0 ${WIDTH} ${height}`}
      role="img"
      aria-label="Project architecture diagram"
    >
      <g fontFamily="inherit" fontSize="11" fontWeight="700" fill="#7b8496">
        <text x={EDGE.x} y="24">
          ENTRY
        </text>
        <text x={COMPUTE.x} y="24">
          MODULES
        </text>
        <text x={DATA.x} y="24">
          DATA STORES
        </text>
      </g>

      <g fill="none" strokeWidth="1.5">
        {modules.map((item, index) => {
          const y = centre(index, modules.length);

          return (
            <g key={item.id}>
              {item.networking.startsWith("Public") && (
                <path
                  stroke="#6366f1"
                  d={`M${EDGE.x + EDGE.width},${edgeY} C${COMPUTE.x - 50},${edgeY} ${COMPUTE.x - 60},${y} ${COMPUTE.x},${y}`}
                />
              )}

              {[item.database_engine, item.storage]
                .filter((value) => value !== "None")
                .map((value) => {
                  const storeY = centre(stores.indexOf(value), stores.length);

                  return (
                    <path
                      key={value}
                      stroke="#94a3b8"
                      d={`M${COMPUTE.x + COMPUTE.width},${y} C${DATA.x - 50},${y} ${DATA.x - 60},${storeY} ${DATA.x},${storeY}`}
                    />
                  );
                })}
            </g>
          );
        })}
      </g>

      {hasPublic && (
        <g>
          <rect
            x={EDGE.x}
            y={edgeY - BOX / 2}
            width={EDGE.width}
            height={BOX}
            rx="8"
            fill="#eef2ff"
            stroke="#6366f1"
          />
          <text x={EDGE.x + 14} y={edgeY - 3} fontSize="13" fontWeight="700">
            Load Balancer
          </text>
          <text x={EDGE.x + 14} y={edgeY + 14} fontSize="11" fill="#7b8496">
            Internet-facing ALB
          </text>
        </g>
      )}

      {modules.map((item, index) => {
        const y = centre(index, modules.length);

        return (
          <g key={item.id}>
            <rect
              x={COMPUTE.x}
              y={y - BOX / 2}
              width={COMPUTE.width}
              height={BOX}
              rx="8"
              fill="#fff7ed"
              stroke="#ea580c"
            />
            <text x={COMPUTE.x + 14} y={y - 3} fontSize="13" fontWeight="700">
              {clip(item.name, 34)}
            </text>
            <text x={COMPUTE.x + 14} y={y + 14} fontSize="11" fill="#7b8496">
              {item.type} · {item.deployment}
            </text>
          </g>
        );
      })}

      {stores.map((value, index) => {
        const y = centre(index, stores.length);

        return (
          <g key={value}>
            <rect
              x={DATA.x}
              y={y - BOX / 2}
              width={DATA.width}
              height={BOX}
              rx="8"
              fill="#eff6ff"
              stroke="#2563eb"
            />
            <text x={DATA.x + 14} y={y + 4} fontSize="13" fontWeight="700">
              {value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
