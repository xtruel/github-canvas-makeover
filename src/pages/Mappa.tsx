import RomaMap from "@/components/RomaMap";

/**
 * Height uses the stabilized dynamic viewport variable set by initViewportHeight():
 *   --app-height (px value of dynamic visual viewport)
 * We subtract 4rem to preserve the original layout offset.
 * Fallback to 100vh while JS initializes (second argument in var()).
 */
const Mappa = () => {
  return (
    <div
      className="w-full"
      style={{ height: "calc(var(--app-height, 100vh) - 4rem)" }}
    >
      <RomaMap />
    </div>
  );
};

export default Mappa;