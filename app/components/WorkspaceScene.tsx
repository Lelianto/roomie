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
    <figure className={`real-scene scene-desk-${setup.deskId}`} aria-labelledby={sceneId}>
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

        <div className="scene-status">
          <span>
            <i aria-hidden="true" />
            Live setup
          </span>
          <strong id={sceneId}>{selected.length} pieces in your room</strong>
        </div>

        <div className="scene-price">
          <span>Rental total</span>
          <strong>
            {formatMoney(total)}
            <small>/{cycleLabel(cycle)}</small>
          </strong>
        </div>
      </div>

      <div className="scene-selection-strip">
        <span>In this setup</span>
        <strong>{desk.name}</strong>
        <strong>{chair.name}</strong>
        <div className="scene-accessory-list">
          {accessories.length > 0 ? (
            accessories.map((product) => (
              <small key={product.id}>
                <i aria-hidden="true">✓</i>
                {product.name}
              </small>
            ))
          ) : (
            <small>No add-ons selected</small>
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
