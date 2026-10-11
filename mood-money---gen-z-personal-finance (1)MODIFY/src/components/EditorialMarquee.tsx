import React from "react";

interface EditorialMarqueeProps {
  className?: string;
  variant?: "divider" | "compact";
}

export function EditorialMarquee({ className = "", variant = "divider" }: EditorialMarqueeProps) {
  const phraseTrack1 = (
    <>
      <span className="inline-flex items-center gap-4 mx-4">
        <span>SPEND SMARTER</span>
        <span className="text-[#E94355]">✦</span>
        <span>SAVE BETTER</span>
        <span className="text-[#F6DF79]">✦</span>
        <span>YOUR MONEY, YOUR RULES</span>
        <span className="text-[#E94355]">✦</span>
        <span>30 DAYS · ₹10,000</span>
        <span className="text-[#552139]">✦</span>
        <span>DISCRETIONARY DISCIPLINE</span>
        <span className="text-[#E94355]">✦</span>
      </span>
    </>
  );

  const phraseTrack2 = (
    <>
      <span className="inline-flex items-center gap-4 mx-4">
        <span>RITUAL CYCLE 04</span>
        <span className="text-[#F6DF79]">✦</span>
        <span>RUN THE NUMBERS</span>
        <span className="text-[#E94355]">✦</span>
        <span>SURVIVE WITHOUT STRAIN</span>
        <span className="text-[#552139]">✦</span>
        <span>STRESS-TEST IMPULSES</span>
        <span className="text-[#E94355]">✦</span>
        <span>DECIDE FOR YOURSELF</span>
        <span className="text-[#F6DF79]">✦</span>
      </span>
    </>
  );

  if (variant === "compact") {
    return (
      <div
        className={`w-full overflow-hidden py-2 bg-[#FFF9F1]/80 border-y border-[#292225]/15 select-none pointer-events-none ${className}`}
      >
        <div className="marquee-track-left font-display-hero text-sm sm:text-base tracking-[0.2em] font-extrabold uppercase text-[#292225]/25">
          {phraseTrack1}
          {phraseTrack1}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden py-4 sm:py-6 bg-[#FFF9F1] border-y-[1.5px] border-[#292225] shadow-[0_2px_0px_#292225] select-none my-space-lg ${className}`}
      aria-label="Editorial Brand Marquee"
    >
      {/* Background geometric grid tone */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#F2C6D5]/10 to-transparent pointer-events-none" />

      {/* Track 1: Right-to-Left (Espresso subtle contrast) */}
      <div className="relative overflow-hidden mb-1 sm:mb-2">
        <div className="marquee-track-left font-display-hero text-2xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-wider text-[#292225]/20 hover:text-[#292225]/35 transition-colors">
          {phraseTrack1}
          {phraseTrack1}
        </div>
      </div>

      {/* Track 2: Left-to-Right (Cherry Red stroke / Burgundy accent) */}
      <div className="relative overflow-hidden">
        <div className="marquee-track-right font-display-hero text-xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-widest text-transparent [-webkit-text-stroke:1.2px_#E94355] sm:[-webkit-text-stroke:1.5px_#E94355] opacity-45 hover:opacity-75 transition-opacity">
          {phraseTrack2}
          {phraseTrack2}
        </div>
      </div>
    </div>
  );
}

export default EditorialMarquee;
