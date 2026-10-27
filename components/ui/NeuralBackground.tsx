/**
 * NeuralBackground → "Ambient Light Mesh"
 *
 * Pure CSS gradient blobs for ambient depth on a light canvas.
 * Gold + sapphire only, very low opacity (4–8%), no purple.
 * No canvas, no JS, renders on server, ships zero JavaScript.
 *
 * Export name unchanged so all import sites keep working.
 */

export default function NeuralBackground() {
  return (
    <div className="liquid-mesh-bg" aria-hidden="true">
      <span className="lm-blob lm-blob-gold" />
      <span className="lm-blob lm-blob-sapphire" />
      <span className="lm-blob lm-blob-warm" />

      <style>{`
        .liquid-mesh-bg {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }

        .lm-blob {
          position: absolute;
          border-radius: 50%;
          will-change: transform;
        }

        .lm-blob-gold {
          top: -10%;
          left: -8%;
          width: 60vmax;
          height: 60vmax;
          background: radial-gradient(
            circle at 50% 50%,
            rgba(184, 134, 11, 0.07) 0%,
            rgba(184, 134, 11, 0.03) 35%,
            transparent 70%
          );
          animation: lm-drift-a 34s ease-in-out infinite alternate;
        }

        .lm-blob-sapphire {
          bottom: -15%;
          right: -10%;
          width: 65vmax;
          height: 65vmax;
          background: radial-gradient(
            circle at 50% 50%,
            rgba(37, 99, 235, 0.06) 0%,
            rgba(56, 189, 248, 0.03) 40%,
            transparent 72%
          );
          animation: lm-drift-b 40s ease-in-out infinite alternate;
        }

        .lm-blob-warm {
          top: 30%;
          left: 40%;
          width: 50vmax;
          height: 50vmax;
          background: radial-gradient(
            circle at 50% 50%,
            rgba(245, 244, 240, 0.5) 0%,
            rgba(244, 245, 248, 0.25) 45%,
            transparent 75%
          );
          animation: lm-drift-c 46s ease-in-out infinite alternate;
        }

        @keyframes lm-drift-a {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(4vw, 3vh) scale(1.08); }
          100% { transform: translate(-2vw, 5vh) scale(0.96); }
        }

        @keyframes lm-drift-b {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(-5vw, -3vh) scale(1.06); }
          100% { transform: translate(2vw, -4vh) scale(0.97); }
        }

        @keyframes lm-drift-c {
          0%   { transform: translate(-50%, -50%) scale(1); }
          50%  { transform: translate(-46%, -54%) scale(1.05); }
          100% { transform: translate(-53%, -48%) scale(0.98); }
        }

        @media (prefers-reduced-motion: reduce) {
          .lm-blob {
            animation: none !important;
          }
        }

        @media (max-width: 640px) {
          .lm-blob-warm {
            display: none;
          }
          .lm-blob-gold,
          .lm-blob-sapphire {
            width: 70vmax;
            height: 70vmax;
            opacity: 0.85;
          }
        }
      `}</style>
    </div>
  );
}
