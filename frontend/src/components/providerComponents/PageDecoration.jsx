import React from 'react'
import './PageDecoration.css'

const PageDecoration = () => {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden w-[80%] ml-[16vw] mt-[4vw] top-0 left-0">

      <span className="absolute left-[-60px] top-[120px] h-[4px] w-[240px] rotate-[-44deg] rounded-full bg-cyan-400/10 blur-[1px] fadeInOut" />
      <span className="absolute left-[220px] top-[0px] h-[6px] w-[280px] rotate-[-49deg] rounded-full bg-cyan-400/8 blur-[1px] slideX" />
      <span className="absolute right-[85px] top-[35px] h-[18px] w-[300px] rotate-[-49deg] rounded-full bg-cyan-400/10 fadeInOut" />
      <span className="absolute right-[20px] top-[115px] h-[260px] w-[260px] rotate-[-49deg] rounded-full bg-cyan-400/8 blur-[1px] slowSpin" />
      <span className="absolute bottom-[0px] right-[18px] h-[3px] w-[120px] rotate-[-45deg] rounded-full bg-cyan-400/10 fadeInOut" />
      <span className="absolute bottom-[0px] left-[140px] h-[3px] w-[70px] rotate-[-45deg] rounded-full bg-cyan-400/8 slideY" />
      <span className="absolute top-[150px] left-[140px] h-[3px] w-[70px] rotate-[-45deg] rounded-full bg-cyan-400/8 fadeInOut" />
      <span className="absolute left-[160px] top-[520px] h-[4px] w-[240px] rotate-[-44deg] rounded-full bg-cyan-400/10 blur-[1px] fadeInOut" />
      <span className="absolute left-[420px] top-[435px] h-[260px] w-[260px] rotate-[-49deg] rounded-full bg-cyan-400/8 blur-[1px] slowSpin" />

    </div>
  );
};

export default PageDecoration;
