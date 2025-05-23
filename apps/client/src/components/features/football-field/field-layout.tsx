interface FieldLayoutProps {
  children: React.ReactElement;
}

export default function FieldLayout({ children }: FieldLayoutProps) {
  return (
    <div className="relative top-0 mx-0 my-auto aspect-[1.5] w-full overflow-visible">
      <div className="z-2 absolute h-full w-full border-2 border-solid border-white/30 bg-transparent"></div>
      <div className="z-2 absolute left-0 top-1/4 h-1/2 w-1/6 border-2 border-white/30 bg-black bg-transparent"></div>
      <div className="box-d left border"></div>
      <div className="z-2 absolute left-0 top-[37%] h-1/4 w-1/12 border-2 border-white/30 bg-black bg-transparent"></div>
      <div className="z-2 absolute right-0 top-1/4 h-1/2 w-1/6 border-2 border-white/30 bg-black bg-transparent"></div>
      <div className="box-d right border"></div>
      <div className="z-2 absolute right-0 top-[37%] h-1/4 w-1/12 border-2 border-white/30 bg-black bg-transparent"></div>
      <div className="z-2 absolute left-[5.5%] top-1/2 h-[4px] w-[4px] -translate-y-1/2 rounded-full bg-white/30 md:left-[11%]"></div>
      <div className="z-2 absolute right-[5.5%] top-1/2 h-[4px] w-[4px] -translate-y-1/2 rounded-full bg-white/30 md:right-[11%]"></div>
      <div className="z-2 absolute left-1/2 top-1/2 h-[4px] w-[4px] -translate-x-[50%] -translate-y-1/2 rounded-full bg-white/30 md:h-[8px] md:w-[8px]"></div>
      <div className="absolute left-1/2 top-0 z-20 h-full w-0.5 -translate-x-1/2 bg-white/30"></div>
      <div className="absolute left-1/2 top-1/2 h-[60px] w-[60px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/30 bg-none md:h-[120px] md:w-[120px]"></div>
      <div className="h-full w-full bg-animation-scanline bg-primary"></div>
      {children}
    </div>
  );
}
