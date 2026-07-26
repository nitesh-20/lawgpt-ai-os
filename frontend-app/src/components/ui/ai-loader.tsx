import * as React from "react";

interface LoaderProps {
  size?: number; 
  text?: string;
}

export const Component: React.FC<LoaderProps> = ({ size = 150, text = "Generating" }) => {
  const letters = text.split("");

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs">
      <div className="bg-[#0a0a0a]/95 border border-neutral-900 rounded-[28px] p-6 flex flex-col items-center justify-center space-y-6 shadow-2xl w-[90%] max-w-[340px] h-[260px] select-none">
        
        {/* Glowing Orb Circle */}
        <div
          className="relative flex items-center justify-center font-sans"
          style={{ width: size, height: size }}
        >
          {letters.map((letter, index) => (
            <span
              key={index}
              className="inline-block text-white opacity-40 animate-loaderLetter text-[17px] font-medium tracking-wide mx-0.5"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {letter}
            </span>
          ))}

          <div
            className="absolute inset-0 rounded-full animate-loaderCircle"
          ></div>
        </div>

        {/* TAP TO STOP label */}
        {text.toLowerCase().includes("listen") && (
          <span className="text-[10px] font-mono text-neutral-400 tracking-[0.3em] uppercase animate-pulse pt-2 font-semibold">
            Tap to Stop
          </span>
        )}
      </div>

      <style>{`
        @keyframes loaderCircle {
          0% {
            transform: rotate(90deg);
            box-shadow:
              0 6px 12px 0 #38bdf8 inset,
              0 12px 18px 0 #005dff inset,
              0 36px 36px 0 #1e40af inset,
              0 0 3px 1.2px rgba(56, 189, 248, 0.3),
              0 0 6px 1.8px rgba(0, 93, 255, 0.2);
          }
          50% {
            transform: rotate(270deg);
            box-shadow:
              0 6px 12px 0 #60a5fa inset,
              0 12px 6px 0 #0284c7 inset,
              0 24px 36px 0 #005dff inset,
              0 0 3px 1.2px rgba(56, 189, 248, 0.3),
              0 0 6px 1.8px rgba(0, 93, 255, 0.2);
          }
          100% {
            transform: rotate(450deg);
            box-shadow:
              0 6px 12px 0 #4dc8fd inset,
              0 12px 18px 0 #005dff inset,
              0 36px 36px 0 #1e40af inset,
              0 0 3px 1.2px rgba(56, 189, 248, 0.3),
              0 0 6px 1.8px rgba(0, 93, 255, 0.2);
          }
        }

        @keyframes loaderLetter {
          0%,
          100% {
            opacity: 0.35;
            transform: translateY(0);
          }
          20% {
            opacity: 1;
            transform: scale(1.1);
          }
          40% {
            opacity: 0.6;
            transform: translateY(0);
          }
        }

        .animate-loaderCircle {
          animation: loaderCircle 5s linear infinite;
        }

        .animate-loaderLetter {
          animation: loaderLetter 3s infinite;
        }
      `}</style>
    </div>
  );
};
export default Component;
