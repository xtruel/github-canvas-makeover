import MapPlaceholder from "@/components/MapPlaceholder";

const Mappa = () => {
  return (
    <div
      className="flex flex-col w-full"
      // Use min-height so internal sections (like map + drawer) have stable space
      style={{ minHeight: "calc(var(--app-height, 100vh) - 4rem)" }}
    >
      <MapPlaceholder />
    </div>
  );
};

export default Mappa;