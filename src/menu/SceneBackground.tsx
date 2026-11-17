import { useEffect, useRef, useState, type CSSProperties } from "react";

const asset = (name: string) => `${import.meta.env.BASE_URL}menu/${name}.webp`;

const skyline = Array.from({ length: 36 }, (_, i) => ({
  x: 330 + i * 39,
  width: 25 + ((i * 17) % 24),
  height: 55 + ((i * 47) % 190),
}));

/** Independent image planes with animated geometry and a complete vector fallback. */
export default function SceneBackground({
  reduced,
  low,
}: {
  reduced: boolean;
  low: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [cityLoaded, setCityLoaded] = useState(false);
  const [deskLoaded, setDeskLoaded] = useState(false);
  const [leavesLoaded, setLeavesLoaded] = useState(false);
  useEffect(() => {
    const visibility = () => { if (host.current) host.current.dataset.paused = String(document.hidden); };
    document.addEventListener('visibilitychange', visibility);
    visibility();
    return () => document.removeEventListener('visibilitychange', visibility);
  }, []);
  useEffect(() => {
    // SVG image load events vary across browsers; decode through HTMLImageElement.
    let mounted = true;
    const assets = [
      ["city-sunset", setCityLoaded],
      ["desk-laptop", setDeskLoaded],
      ["canopy", setLeavesLoaded],
    ] as const;
    const images = assets.map(([name, setLoaded]) => {
      const image = new Image();
      image.src = asset(name);
      void image
        .decode()
        .then(() => {
          if (mounted) setLoaded(true);
        })
        .catch(() => {});
      return image;
    });
    return () => {
      mounted = false;
      images.forEach((image) => {
        image.src = "";
      });
    };
  }, []);
  return (
    <div
      ref={host}
      data-assets-ready={cityLoaded && deskLoaded && leavesLoaded}
      className={`menu-scene ${reduced ? "is-still" : ""} ${low ? "is-low" : ""}`}
      onPointerMove={(event) => {
        if (reduced || low || event.pointerType !== "mouse") return;
        host.current?.style.setProperty(
          "--look-x",
          `${(event.clientX / innerWidth - 0.5) * 10}px`,
        );
        host.current?.style.setProperty(
          "--look-y",
          `${(event.clientY / innerHeight - 0.5) * 6}px`,
        );
      }}
      aria-hidden="true"
    >
      <svg
        className="menu-world"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="mm-sky" x2="0" y2="1">
            <stop stopColor="#293b57" />
            <stop offset=".42" stopColor="#a18389" />
            <stop offset=".73" stopColor="#e6ae81" />
            <stop offset="1" stopColor="#f9d6a0" />
          </linearGradient>
          <radialGradient id="mm-sun">
            <stop stopColor="#fff3c7" stopOpacity=".95" />
            <stop offset=".2" stopColor="#ffdda1" stopOpacity=".6" />
            <stop offset="1" stopColor="#ffc781" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="mm-tower" x2="1" y2=".3">
            <stop stopColor="#283b4e" />
            <stop offset=".46" stopColor="#52616b" />
            <stop offset=".5" stopColor="#b3a490" />
            <stop offset=".55" stopColor="#364656" />
            <stop offset="1" stopColor="#213243" />
          </linearGradient>
          <linearGradient id="mm-wood" x2=".1" y2="1">
            <stop stopColor="#c08e56" />
            <stop offset=".3" stopColor="#825936" />
            <stop offset="1" stopColor="#302c29" />
          </linearGradient>
          <linearGradient id="mm-paper" x2=".4" y2="1">
            <stop stopColor="#ead8b3" />
            <stop offset="1" stopColor="#b4a68b" />
          </linearGradient>
          <linearGradient id="mm-cup">
            <stop stopColor="#393c3a" />
            <stop offset=".45" stopColor="#c0ad88" />
            <stop offset=".8" stopColor="#8f8165" />
            <stop offset="1" stopColor="#4b4940" />
          </linearGradient>
          <linearGradient id="mm-leaf" x2="1" y2="1">
            <stop stopColor="#718059" />
            <stop offset=".6" stopColor="#334b39" />
            <stop offset="1" stopColor="#152b27" />
          </linearGradient>
          <pattern
            id="mm-windows"
            width="14"
            height="19"
            patternUnits="userSpaceOnUse"
          >
            <path d="M4 3h3v8H4z" fill="#f3c78b" opacity=".6" />
            <path d="M10 3h2v8h-2z" fill="#b6c5ce" opacity=".22" />
          </pattern>
          <pattern
            id="mm-grain"
            width="160"
            height="23"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 5q60-7 160 0M0 16q90 8 160-1"
              fill="none"
              stroke="#2d201b"
              strokeOpacity=".17"
            />
          </pattern>
          <filter id="mm-soft">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
        <rect width="1600" height="900" fill="#17252c" />
        <g className="menu-distance">
          <g visibility={cityLoaded ? "hidden" : "visible"}>
            <rect x="280" width="1320" height="680" fill="url(#mm-sky)" />
            <ellipse
              className="menu-sunlight"
              cx="1030"
              cy="475"
              rx="480"
              ry="340"
              fill="url(#mm-sun)"
            />
            <circle cx="1016" cy="465" r="27" fill="#ffe9b1" />
            <g
              className="menu-clouds"
              fill="none"
              stroke="#f1c4a1"
              strokeWidth="8"
              opacity=".38"
            >
              <path d="M400 242q100-40 190-15t160-8M920 179q130 18 230-25t220 0M650 331q100-20 180 0t300-18M1080 373q140-28 360-22" />
              <path
                d="M420 150q90 20 250-10M1000 280q140 10 320-35"
                strokeWidth="3"
              />
            </g>
            <g opacity=".34" fill="#596473">
              {skyline.map((b, i) => (
                <rect
                  key={i}
                  x={b.x - 15}
                  y={550 - b.height * 0.76}
                  width={b.width + 15}
                  height={b.height * 0.76 + 70}
                />
              ))}
            </g>
            <g className="menu-city">
              {skyline.map((b, i) => (
                <g key={i}>
                  <path
                    d={`M${b.x} 630V${605 - b.height}l${b.width / 2} -7 ${b.width / 2} 7V630Z`}
                    fill={i % 3 ? "#344655" : "#475762"}
                  />
                  <rect
                    x={b.x + 3}
                    y={611 - b.height}
                    width={b.width - 6}
                    height={b.height - 3}
                    fill="url(#mm-windows)"
                    opacity={0.25 + (i % 4) * 0.17}
                  />
                </g>
              ))}
            </g>
            <g className="menu-aion">
              <path
                d="M1210 581V199l34-53 57-20 49 52 20 403Z"
                fill="url(#mm-tower)"
              />
              <path
                d="M1244 146V115m57 11V65m49 113V127"
                stroke="#bfaf96"
                strokeWidth="2"
              />
              <path
                d="M1244 159v413m57-428v428m49-379v379"
                stroke="#a1aab0"
                opacity=".3"
              />
              <path
                d="M1225 268h130v302h-130z"
                fill="url(#mm-windows)"
                opacity=".48"
              />
              <path
                d="m1260 226 20-34 20 34m-32-9h24"
                fill="none"
                stroke="#d5e7e6"
                strokeWidth="3"
              />
              <text
                x="1280"
                y="252"
                textAnchor="middle"
                fill="#dce8e4"
                fontSize="19"
                fontFamily="Arial"
                letterSpacing="5"
              >
                AION
              </text>
            </g>
            <path
              d="M345 565Q900 504 1600 562"
              fill="none"
              stroke="#273c4b"
              strokeWidth="15"
            />
            <path
              d="M345 559Q900 498 1600 556"
              fill="none"
              stroke="#aac8cd"
              strokeOpacity=".6"
              strokeWidth="2"
            />
            <path
              d="M740 540v90m405-95v95m370-80v80"
              stroke="#3b4c57"
              strokeWidth="7"
            />
          </g>
          <image
            href={asset("city-sunset")}
            x="280"
            y="-20"
            width="1320"
            height="710"
            preserveAspectRatio="xMidYMid slice"
            onLoad={() => setCityLoaded(true)}
            onError={() => setCityLoaded(false)}
          />
          {cityLoaded && (
            <>
              <ellipse
                className="menu-sunlight"
                cx="1110"
                cy="370"
                rx="350"
                ry="220"
                fill="url(#mm-sun)"
                opacity=".13"
              />
              <g
                className="menu-clouds menu-atmosphere"
                fill="#e5d5c4"
                opacity=".06"
                filter="url(#mm-soft)"
              >
                <ellipse cx="810" cy="179" rx="250" ry="12" />
                <ellipse cx="1210" cy="110" rx="180" ry="7" />
              </g>
              <g className="menu-city" fill="#ffe0a0" opacity=".4">
                {Array.from({ length: 18 }, (_, i) => (
                  <circle
                    key={i}
                    cx={570 + i * 49}
                    cy={510 + ((i * 13) % 90)}
                    r="1.2"
                  />
                ))}
              </g>
            </>
          )}
        </g>
        <g className="menu-room">
          <path d="M0 0h408v667H0z" fill="#1b252b" />
          <path d="M355 0h35v655h-35z" fill="#344044" />
          <path d="M390 0h17v655h-17z" fill="#111d24" />
          <path d="M685 0h22v644h-22zM1500 0h33v655h-33z" fill="#18272e" />
          <path
            d="M708 0h5v640h-5zM1533 0h5v655h-5z"
            fill="#a78d6f"
            opacity=".6"
          />
          <path d="M397 150 1600 24v28L397 176z" fill="#1b2a31" />
          <path
            d="M397 175 1600 51"
            stroke="#bb9870"
            strokeOpacity=".5"
            strokeWidth="3"
          />
          <path d="M390 638h1210v30H390z" fill="#273339" />
          <path d="M390 637h1210" stroke="#e7b77d" strokeWidth="4" />
          <path
            d="M0 0h175q-17 270 6 500l-30 226H0Z"
            fill="#131e27"
            opacity=".75"
          />
          <path
            d="M64 0q-29 340 0 620M110 0q-14 310 15 610"
            fill="none"
            stroke="#53606a"
            opacity=".12"
            strokeWidth="15"
          />
        </g>
        <g className="menu-desk">
          <g visibility={deskLoaded ? "hidden" : "visible"}>
            <path
              d="M340 685 1435 655 1720 847 180 837Z"
              fill="url(#mm-wood)"
            />
            <path
              d="M340 685 1435 655 1720 847 180 837Z"
              fill="url(#mm-grain)"
            />
            <path d="m180 837 1540 10v23L180 859z" fill="#302a25" />
            <path
              d="m340 685 1095-30"
              stroke="#dfb57c"
              strokeWidth="3"
              opacity=".7"
            />
            <ellipse
              cx="1055"
              cy="732"
              rx="345"
              ry="39"
              fill="#ffd292"
              opacity=".09"
            />
            <g transform="translate(475 603) rotate(-2)">
              <path d="M0 40h205v38H0z" fill="#243238" />
              <path d="M8 45h190v26H8z" fill="#b4a58a" />
              <path d="M-8 10h209v33H-8z" fill="#433f39" />
              <path d="M0 15h192v22H0z" fill="#c5b28d" />
              <path d="M-14-15h211v27H-14z" fill="#253139" />
              <path d="M-2-10h190V5H-2z" fill="#a89472" />
              <path
                d="M0 20h190M0 26h190M9 54h185M9 61h185"
                stroke="#7a7567"
                opacity=".5"
              />
            </g>
            <g transform="translate(701 625) rotate(-3)">
              <path d="M0-36h135l9 100H7Z" fill="#222c35" stroke="#8d887c" strokeWidth="2" />
              <path d="M8-27h119l8 82H15Z" fill="#14212e" />
              <path d="M7 64h137l34 32H-13Z" fill="#58616a" />
              <path d="M18 70h113l15 14H6Z" fill="#242d36" />
              <path d="M49 87h46l5 6H44Z" fill="#424d57" />
              <path d="M21-7h44m-43 12h70M25 17h37m-34 12h69M31 41h47" stroke="#9daec0" strokeWidth="2" opacity=".7" />
            </g>
            <g transform="translate(1177 625)">
              <ellipse
                cx="50"
                cy="95"
                rx="66"
                ry="13"
                fill="#242523"
                opacity=".45"
              />
              <path
                d="M78 12c47-12 49 62 5 56"
                fill="none"
                stroke="#8c8067"
                strokeWidth="11"
              />
              <path d="M5 5h83l-7 79q-35 20-68 0Z" fill="url(#mm-cup)" />
              <ellipse cx="46" cy="5" rx="41" ry="10" fill="#c8b18a" />
              <ellipse cx="46" cy="5" rx="35" ry="7" fill="#453b30" />
              <g
                className="menu-steam"
                fill="none"
                stroke="#e8ded0"
                strokeWidth="3"
                opacity=".25"
                filter="url(#mm-soft)"
              >
                <path d="M28-8q-20-25 0-48t-4-45M52-8q20-30 0-58t5-35M70-8q-12-20 0-39" />
              </g>
            </g>
            <g transform="translate(964 742) rotate(-8)">
              <path d="m-40-6 142-13 118 40-147 34-128-34z" fill="#252c2b" />
              <path
                d="m-36-12 138-13 113 39-143 31-120-29z"
                fill="url(#mm-paper)"
              />
              <path
                d="m102-25-30 70"
                fill="none"
                stroke="#7f796a"
                strokeWidth="2"
              />
              {[0, 1, 2, 3, 4].map((i) => (
                <path
                  key={i}
                  d={`m${-14 + i * 3} ${i * 6} 79-8m35-1 62 16`}
                  stroke="#8e8876"
                  opacity=".35"
                  fill="none"
                />
              ))}
            </g>
            <path d="m880 764 96-29 4 7-96 29z" fill="#202c32" />
            <path
              d="m882 763-13 8 16-1m80-32 3 6"
              stroke="#d6b780"
              strokeWidth="3"
            />
          </g>
          <image
            href={asset("desk-laptop")}
            x="230"
            y="100"
            width="1420"
            height="810"
            preserveAspectRatio="none"
            onLoad={() => setDeskLoaded(true)}
            onError={() => setDeskLoaded(false)}
          />
          {deskLoaded && (
            <g transform="translate(1410 553)" opacity=".7">
              <g
                className="menu-steam"
                fill="none"
                stroke="#ece4d5"
                strokeWidth="3"
                filter="url(#mm-soft)"
              >
                <path d="M0 0q-20-25 0-48t-4-35M20 0q20-30 0-58t5-25" />
              </g>
            </g>
          )}
        </g>
        <g className="menu-leaves">
          <g visibility={leavesLoaded ? "hidden" : "visible"}>
            <path
              d="M1050-30Q850 80 770 207M930 14Q780 65 670 25M831 107l-26 160M1457-10q-30 95 12 177"
              fill="none"
              stroke="#374631"
              strokeWidth="5"
            />
            {Array.from({ length: 21 }, (_, i) => {
              const x = 675 + ((i * 67) % 330),
                y = 10 + ((i * 31) % 165);
              return (
                <path
                  key={i}
                  d={`M${x} ${y}q-38-18-24 23 30 17 24-23Z`}
                  fill="url(#mm-leaf)"
                  transform={`rotate(${i * 41} ${x} ${y})`}
                />
              );
            })}
          </g>
          <image
            href={asset("canopy")}
            x="440"
            y="-60"
            width="1040"
            height="580"
            preserveAspectRatio="none"
            onLoad={() => setLeavesLoaded(true)}
            onError={() => setLeavesLoaded(false)}
          />
        </g>
        <g className="menu-foreground" fill="#142623">
          <g visibility={leavesLoaded ? "hidden" : "visible"}>
            <path d="M1410 940q24-156 139-268m-104 142q-77-93-41-169 76 34 51 141m27-27q-6-108 88-150 30 81-60 124m-94 108q-123-33-131-110 100-6 139 86" />
            <path d="M14 930q80-88 135-164M68 860q-80-101-49-152 72 28 75 125m1-9q-5-105 80-131 13 81-80 131m-41 67q-42-7-54-44" />
          </g>
          <path
            d="M481 900 456 808q-4-42 45-42l340 35q42 5 52 57l8 42"
            fill="#202b2e"
            stroke="#61523e"
            strokeWidth="5"
          />
        </g>
        <g className="menu-dust" fill="#f9dfab">
          {Array.from({ length: 16 }, (_, i) => (
            <circle
              key={i}
              cx={590 + i * 61}
              cy={210 + ((i * 97) % 510)}
              r={i % 3 ? 1.4 : 2.1}
              style={{ "--delay": `${i * -0.7}s` } as CSSProperties}
            />
          ))}
        </g>
      </svg>
      <div className="menu-vignette" />
    </div>
  );
}
