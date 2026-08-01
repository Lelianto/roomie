import {
  getProduct,
  getSceneChairMatte,
  getSceneRender,
  getSetupProducts,
  hasCompletePicturedKit,
  picturedAccessoryIds,
  resolveScenePlacements,
  splitByChairMask,
  type RentalCycle,
  type ScenePlacement,
  type WorkspaceSetup,
} from "@/lib/catalog";
import { cycleLabel, formatMoney } from "@/lib/format";

const picturedAccessoryIdSet = new Set<string>(picturedAccessoryIds);

const stripName =
  "flex-none border-l border-white/18 pl-3 font-mona text-[10px] max-lap:hidden";
const chip =
  "flex min-h-[28px] flex-none items-center gap-[5px] rounded-full border border-white/12 bg-white/9 px-[9px] font-mona text-[9px] whitespace-nowrap";

function AccessoryStage({
  placements,
  className,
  label,
}: {
  placements: ScenePlacement[];
  className: string;
  label: string;
}) {
  if (placements.length === 0) return null;

  return (
    <div className={`scene-accessory-stage ${className}`} aria-label={label}>
      {placements.map((placement) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={placement.id}
          src={placement.overlay}
          alt=""
          className="scene-accessory"
          loading="eager"
          style={{
            height: `${placement.height}%`,
            left: `${placement.left}%`,
            top: `${placement.top}%`,
            width: `${placement.width}%`,
            zIndex: placement.zIndex,
          }}
        />
      ))}
    </div>
  );
}

export function WorkspaceScene({
  setup,
  cycle,
  total,
  sceneId,
}: {
  setup: WorkspaceSetup;
  cycle: RentalCycle;
  total: number;
  sceneId: string;
}) {
  const selected = getSetupProducts(setup);
  const desk = getProduct(setup.deskId);
  const chair = getProduct(setup.chairId);
  const accessories = selected.filter((product) => product.category === "accessory");
  const sceneImage = getSceneRender(setup);

  // With the full pictured kit selected the render already contains those
  // items, so only the remainder needs a live overlay.
  const livePlacements = hasCompletePicturedKit(setup)
    ? accessories.filter((product) => !picturedAccessoryIdSet.has(product.id))
    : accessories;
  const { behindChair, aheadOfChair } = splitByChairMask(
    resolveScenePlacements(livePlacements, setup.deskId),
  );
  const chairMatte = getSceneChairMatte(setup);

  if (!desk || !chair) return null;

  return (
    <figure className={`m-0 scene-desk-${setup.deskId}`} aria-labelledby={sceneId}>
      <div className="scene-room">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={sceneImage}
          src={sceneImage}
          alt=""
          width={1440}
          height={960}
          className="scene-composite"
          loading="eager"
          fetchPriority="high"
        />

        <AccessoryStage
          placements={behindChair}
          className="scene-stage-back"
          label="Back accessories placed in the live setup"
        />

        {/* Overlays always paint above the photo, so the chair back would end up
            behind an item meant to stand further away. The photo is redrawn on
            top and masked down to the chair silhouette to restore the depth. */}
        {chairMatte && behindChair.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${sceneImage}-mask`}
            src={sceneImage}
            alt=""
            className="scene-chair-mask"
            loading="eager"
            style={{
              maskImage: `url(${chairMatte})`,
              WebkitMaskImage: `url(${chairMatte})`,
            }}
          />
        ) : null}

        <AccessoryStage
          placements={aheadOfChair}
          className="scene-stage-front"
          label="Front accessories placed in the live setup"
        />

        <div className="absolute top-5 left-[22px] z-[15] max-lap:top-[14px] max-lap:left-[15px]">
          <span className="mb-[5px] flex items-center gap-[7px] font-mona text-[9px] font-bold tracking-[0.09em] uppercase">
            <i
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-[#4f9b66] shadow-[0_0_0_4px_rgba(79,155,102,0.16)]"
            />
            Live setup
          </span>
          <strong id={sceneId} className="font-mona text-xs">
            {selected.length} pieces in your room
          </strong>
        </div>

        <div className="absolute right-[18px] bottom-[18px] z-[15] bg-shell/86 px-[15px] py-3 backdrop-blur-[12px] max-lap:right-3 max-lap:bottom-3 max-mob:px-[11px] max-mob:py-[9px]">
          <span className="block font-mona text-[8px] font-bold tracking-[0.08em] uppercase">
            Rental total
          </span>
          <strong className="font-mona text-[25px] tracking-[-0.04em] max-mob:text-xl">
            {formatMoney(total)}
            <small className="text-[9px] font-medium opacity-55">
              /{cycleLabel(cycle)}
            </small>
          </strong>
        </div>
      </div>

      <div className="flex min-h-[66px] items-center gap-3 overflow-hidden bg-[#252a28] px-4 py-3 text-white max-lap:min-h-[68px] max-lap:px-[13px] max-lap:py-[9px]">
        <span className="flex-none font-mona text-[8px] font-[760] tracking-[0.1em] text-lime uppercase max-lap:max-w-[52px]">
          In this setup
        </span>
        <strong className={stripName}>{desk.name}</strong>
        <strong className={stripName}>{chair.name}</strong>
        {/* Keeps its class: the scrollbar reset has no utility equivalent. */}
        <div className="scene-accessory-list flex min-w-0 flex-1 gap-1.5 overflow-x-auto">
          {accessories.length > 0 ? (
            accessories.map((product) => (
              <small key={product.id} className={chip}>
                <i aria-hidden="true" className="text-lime not-italic">
                  ✓
                </i>
                {product.name}
              </small>
            ))
          ) : (
            <small className={chip}>No add-ons selected</small>
          )}
        </div>
      </div>

      <figcaption className="sr-only">
        Workspace preview showing {desk.name}, {chair.name}, and{" "}
        {accessories.map((item) => item.name).join(", ") || "no accessories"}.
      </figcaption>
    </figure>
  );
}
