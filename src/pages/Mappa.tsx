import RomaMap from "@/components/RomaMap";

const Mappa = () => {
  return (
    <div
      className="flex flex-col w-full"
      // Use min-height so internal sections (like map + drawer) have stable space
      style={{ minHeight: "calc(var(--app-height, 100vh) - 4rem)" }}
    >
      <RomaMap />
    </div>
  );
};

export default Mappa;