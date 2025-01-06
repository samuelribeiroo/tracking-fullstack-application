import { PropsWithChildren, forwardRef } from "react";

export const Map = forwardRef<HTMLDivElement | null>(({ children }: PropsWithChildren, ref) => {
  return (
    <div
      ref={ref} 
      className="
        min-w-[300px] max-h-[800px] 
        sm:min-h-[900px] sm:max-h-[600px] 
        md:min-h-[700px] md:max-h-[500px] 
        lg:min-h-[500px] lg:max-h-[400px] 
        xl:min-h-[400px] xl:max-h-[300px]"
      style={{ minHeight: "1200px", minWidth: "300px" }}
    >
      {children}
    </div>
  );
});

Map.displayName = "Map";

export default Map;