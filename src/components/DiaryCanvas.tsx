import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  Group,
  Image as KonvaImage,
  Layer,
  Line,
  Rect,
  Stage,
  Text,
  Transformer,
} from "react-konva";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { CanvasElement, DiaryEntry, ThemePalette } from "../types";
import { fontFamilyFor, mixHex, MOOD_OPTIONS, WEATHER_OPTIONS } from "../data/themes";

export const PAGE_WIDTH = 720;
export const PAGE_HEIGHT = 960;

interface DiaryCanvasProps {
  entry: DiaryEntry;
  readOnly?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onUpdate?: (
    id: string,
    patch: Partial<CanvasElement>,
    options?: { checkpoint?: boolean },
  ) => void;
  onCheckpoint?: () => void;
  onTextEdit?: (id: string) => void;
  onPhotoDoubleClick?: (id: string) => void;
  editingId?: string | null;
  onEditingText?: (text: string) => void;
  onFinishEditing?: () => void;
  zoom?: number;
  panMode?: boolean;
  className?: string;
  onViewportScale?: (scale: number) => void;
}

function useHtmlImage(src?: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!src) {
      setImage(null);
      return;
    }
    let cancelled = false;
    const nextImage = new window.Image();
    nextImage.crossOrigin = "anonymous";
    nextImage.onload = () => {
      if (!cancelled) setImage(nextImage);
    };
    nextImage.onerror = () => {
      if (!cancelled) setImage(null);
    };
    nextImage.src = src;
    return () => {
      cancelled = true;
      nextImage.onload = null;
      nextImage.onerror = null;
    };
  }, [src]);
  return image;
}

function textureDots(palette: ThemePalette) {
  const dots: { x: number; y: number; radius: number; opacity: number }[] = [];
  let seed = 71;
  for (let index = 0; index < 150; index += 1) {
    seed = (seed * 9301 + 49297) % 233280;
    const x = (seed / 233280) * PAGE_WIDTH;
    seed = (seed * 9301 + 49297) % 233280;
    const y = (seed / 233280) * PAGE_HEIGHT;
    dots.push({
      x,
      y,
      radius: index % 5 === 0 ? 1.2 : 0.65,
      opacity: palette.text === "#302B58" ? 0.08 : 0.09,
    });
  }
  return dots;
}

function PaperBackground({ palette, backgroundId }: { palette: ThemePalette; backgroundId?: string }) {
  const dots = useMemo(() => textureDots(palette), [palette]);
  const tint = useMemo(() => mixHex(palette.paper, palette.auxiliary, 0.1), [palette]);
  const edgeWash = useMemo(() => mixHex(palette.paper, palette.accent, 0.065), [palette]);
  const gridLines = useMemo(
    () =>
      backgroundId === "bg-grid"
        ? [
            ...Array.from({ length: 25 }, (_, index) => ({
              points: [0, index * 40, PAGE_WIDTH, index * 40],
            })),
            ...Array.from({ length: 18 }, (_, index) => ({
              points: [index * 40, 0, index * 40, PAGE_HEIGHT],
            })),
          ]
        : [],
    [backgroundId],
  );

  return (
    <Group listening={false}>
      <Rect
        width={PAGE_WIDTH}
        height={PAGE_HEIGHT}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: PAGE_WIDTH, y: PAGE_HEIGHT }}
        fillLinearGradientColorStops={[0, palette.paper, 0.46, tint, 1, edgeWash]}
      />
      <Group opacity={0.8}>
        <Rect
          x={-155}
          y={-145}
          width={430}
          height={390}
          cornerRadius={190}
          fill={palette.decoration}
          opacity={0.13}
          rotation={-12}
        />
        <Rect
          x={505}
          y={-120}
          width={350}
          height={300}
          cornerRadius={140}
          fill={palette.accent}
          opacity={0.09}
          rotation={19}
        />
        <Rect
          x={-120}
          y={725}
          width={390}
          height={300}
          cornerRadius={130}
          fill={palette.auxiliary}
          opacity={0.1}
          rotation={13}
        />
        <Rect
          x={0}
          y={0}
          width={12}
          height={PAGE_HEIGHT}
          fill={palette.accent}
          opacity={0.32}
        />
        <Rect
          x={PAGE_WIDTH - 8}
          y={0}
          width={8}
          height={PAGE_HEIGHT}
          fill={palette.decoration}
          opacity={0.26}
        />
        <Line
          points={[34, 272, 108, 244, 144, 282, 218, 252]}
          stroke={palette.accent}
          strokeWidth={1.2}
          opacity={0.2}
          tension={0.55}
        />
        <Line
          points={[492, 824, 548, 792, 606, 811, 680, 770]}
          stroke={palette.decoration}
          strokeWidth={1.6}
          opacity={0.26}
          tension={0.55}
        />
        <Group x={633} y={835} opacity={0.3}>
          <Rect x={-3} y={-19} width={6} height={19} cornerRadius={4} fill={palette.accent} />
          <Rect x={11} y={-18} width={6} height={19} cornerRadius={4} fill={palette.decoration} rotation={58} />
          <Rect x={-17} y={-18} width={6} height={19} cornerRadius={4} fill={palette.decoration} rotation={-58} />
          <Rect x={-3} y={-3} width={7} height={7} cornerRadius={4} fill={palette.text} opacity={0.5} />
        </Group>
      </Group>
      {backgroundId === "bg-dot" &&
        Array.from({ length: 18 * 24 }, (_, index) => (
          <Rect
            key={`dot-${index}`}
            x={20 + (index % 18) * 40}
            y={20 + Math.floor(index / 18) * 40}
            width={2.2}
            height={2.2}
            cornerRadius={2}
            fill={palette.text}
            opacity={0.18}
          />
        ))}
      {gridLines.map((line, index) => (
        <Line
          key={`grid-${index}`}
          points={line.points}
          stroke={palette.text}
          strokeWidth={0.8}
          opacity={0.1}
        />
      ))}
      {backgroundId === "bg-flower" && (
        <Group opacity={0.33}>
          <Line points={[10, 720, 180, 595, 360, 640, 560, 510, 720, 535]} stroke="#8BA184" strokeWidth={2} tension={0.5} />
          <Line points={[30, 850, 172, 760, 320, 792, 520, 690, 720, 730]} stroke="#A9B596" strokeWidth={1.5} tension={0.5} />
          {[
            [145, 612, "#D9A7A4"],
            [572, 520, "#E1B6B4"],
            [343, 793, "#D4AAA7"],
            [681, 727, "#E2B8AC"],
          ].map(([x, y, color], index) => (
            <Group key={index} x={Number(x)} y={Number(y)}>
              {[0, 72, 144, 216, 288].map((angle) => (
                <Rect
                  key={angle}
                  x={-4}
                  y={-20}
                  width={8}
                  height={19}
                  fill={String(color)}
                  cornerRadius={8}
                  rotation={angle}
                />
              ))}
              <Rect x={-4} y={-4} width={8} height={8} cornerRadius={4} fill="#D4B477" />
            </Group>
          ))}
        </Group>
      )}
      {backgroundId === "bg-coffee" && (
        <Group opacity={0.13}>
          <Rect x={548} y={45} width={120} height={120} cornerRadius={60} stroke="#896B5A" strokeWidth={10} />
          <Rect x={564} y={61} width={88} height={88} cornerRadius={44} fill="#896B5A" opacity={0.15} />
          <Line points={[22, 904, 332, 728, 714, 620]} stroke="#7B6657" strokeWidth={4} tension={0.4} />
        </Group>
      )}
      {backgroundId === "bg-night" && (
        <Group opacity={0.4}>
          {[
            [82, 82, 2.4],
            [644, 96, 2],
            [512, 178, 1.4],
            [160, 310, 1.6],
            [608, 620, 1.8],
            [88, 760, 1.3],
            [414, 872, 2.1],
          ].map(([x, y, radius], index) => (
            <Group key={index} x={x} y={y}>
              <Rect x={-2} y={-12} width={4} height={24} cornerRadius={4} fill={palette.text} />
              <Rect x={-12} y={-2} width={24} height={4} cornerRadius={4} fill={palette.text} />
            </Group>
          ))}
        </Group>
      )}
      {dots.map((dot, index) => (
        <Rect
          key={`texture-${index}`}
          x={dot.x}
          y={dot.y}
          width={dot.radius}
          height={dot.radius}
          cornerRadius={dot.radius}
          fill={palette.text}
          opacity={dot.opacity}
        />
      ))}
      <Rect x={0} y={0} width={PAGE_WIDTH} height={PAGE_HEIGHT} stroke={palette.text} strokeWidth={1} opacity={0.12} />
      <Rect x={14} y={14} width={PAGE_WIDTH - 28} height={PAGE_HEIGHT - 28} stroke={palette.text} strokeWidth={0.7} opacity={0.08} />
    </Group>
  );
}

function PageHeading({ entry }: { entry: DiaryEntry }) {
  const dateLabel = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${entry.date}T00:00:00`));
  const weatherLabel = WEATHER_OPTIONS.find((item) => item.id === entry.weather)?.label;
  const moodLabel = MOOD_OPTIONS.find((item) => item.id === entry.mood)?.label;
  const hasWeatherTag = entry.elements.some((element) => element.type === "tag" && element.weather);
  const hasMoodTag = entry.elements.some((element) => element.type === "tag" && element.mood);
  return (
    <Group listening={false}>
      <Text
        x={48}
        y={34}
        width={610}
        text={entry.title || "未命名的小日子"}
        fontFamily='"Songti SC", "SimSun", serif'
        fontStyle="bold"
        fontSize={32}
        fill={entry.palette.text}
        wrap="none"
        ellipsis
      />
      <Text
        x={51}
        y={78}
        width={420}
        text={dateLabel}
        fontFamily='"Microsoft YaHei", sans-serif'
        fontSize={13}
        letterSpacing={0.8}
        fill={entry.palette.text}
        opacity={0.62}
      />
      <Rect x={51} y={107} width={54} height={2} fill={entry.palette.accent} opacity={0.72} />
      {(weatherLabel || moodLabel) && (
        <Text
          x={472}
          y={78}
          width={188}
          text={[
            !hasWeatherTag ? weatherLabel : "",
            !hasMoodTag ? moodLabel : "",
          ].filter(Boolean).join(" · ")}
          align="right"
          fontFamily='"Microsoft YaHei", sans-serif'
          fontSize={12}
          fill={entry.palette.text}
          opacity={0.58}
        />
      )}
      {entry.body && (
        <Text
          x={51}
          y={890}
          width={610}
          height={42}
          text={entry.body}
          fontFamily='"Microsoft YaHei", "PingFang SC", sans-serif'
          fontSize={14}
          lineHeight={1.45}
          fill={entry.palette.text}
          opacity={0.68}
          wrap="word"
          ellipsis
        />
      )}
    </Group>
  );
}

function PhotoScene({
  element,
  palette,
  artWidth,
  artHeight,
  offsetX,
  offsetY,
}: {
  element: CanvasElement;
  palette: ThemePalette;
  artWidth: number;
  artHeight: number;
  offsetX: number;
  offsetY: number;
}) {
  const image = useHtmlImage(element.src);
  const cropScale = element.cropScale ?? 1;
  let imageWidth = artWidth;
  let imageHeight = artHeight;
  let x = 0;
  let y = 0;
  if (image && image.width > 0 && image.height > 0) {
    const cover = Math.max(artWidth / image.width, artHeight / image.height) * cropScale;
    imageWidth = image.width * cover;
    imageHeight = image.height * cover;
    x = (artWidth - imageWidth) * (element.cropX ?? 0.5);
    y = (artHeight - imageHeight) * (element.cropY ?? 0.5);
  }
  return (
    <Group clipX={offsetX} clipY={offsetY} clipWidth={artWidth} clipHeight={artHeight}>
      {image ? (
        <KonvaImage image={image} x={offsetX + x} y={offsetY + y} width={imageWidth} height={imageHeight} />
      ) : (
        <Group x={offsetX} y={offsetY}>
          <Rect width={artWidth} height={artHeight} fill={palette.auxiliary} />
          <Rect
            x={artWidth * 0.18}
            y={artHeight * 0.18}
            width={artWidth * 0.64}
            height={artHeight * 0.58}
            cornerRadius={Math.min(artWidth, artHeight) * 0.08}
            stroke={palette.text}
            strokeWidth={2}
            opacity={0.35}
            dash={[8, 7]}
          />
          <Line
            points={[
              artWidth * 0.25,
              artHeight * 0.65,
              artWidth * 0.43,
              artHeight * 0.43,
              artWidth * 0.58,
              artHeight * 0.57,
              artWidth * 0.75,
              artHeight * 0.35,
            ]}
            stroke={palette.text}
            strokeWidth={3}
            opacity={0.42}
            tension={0.35}
          />
          <Text
            width={artWidth}
            y={artHeight * 0.69}
            text="双击放入照片"
            align="center"
            fontFamily="Microsoft YaHei"
            fontSize={Math.max(13, Math.min(19, artWidth * 0.065))}
            fill={palette.text}
            opacity={0.55}
          />
        </Group>
      )}
    </Group>
  );
}

function PhotoElement({
  element,
  palette,
  onDoubleClick,
}: {
  element: CanvasElement;
  palette: ThemePalette;
  onDoubleClick?: () => void;
}) {
  const style = element.frameStyle ?? "polaroid";
  const width = element.width;
  const height = element.height;
  let insetX = 14;
  let insetY = 14;
  let artWidth = width - 28;
  let artHeight = height - 63;
  if (style === "rounded") {
    insetX = 11;
    insetY = 11;
    artWidth = width - 22;
    artHeight = height - 22;
  }
  if (style === "film") {
    insetX = 22;
    insetY = 28;
    artWidth = width - 44;
    artHeight = height - 78;
  }
  if (style === "torn") {
    insetX = 18;
    insetY = 18;
    artWidth = width - 36;
    artHeight = height - 54;
  }
  return (
    <Group onDblClick={onDoubleClick}>
      {style === "film" ? (
        <>
          <Rect width={width} height={height} fill="#4A443F" cornerRadius={2} shadowColor="#6C5A49" shadowBlur={7} shadowOpacity={0.24} shadowOffsetY={4} />
          {Array.from({ length: Math.max(3, Math.floor(height / 44)) }, (_, index) => (
            <Group key={index}>
              <Rect x={7} y={10 + index * 42} width={9} height={17} fill={palette.paper} opacity={0.9} />
              <Rect x={width - 16} y={10 + index * 42} width={9} height={17} fill={palette.paper} opacity={0.9} />
            </Group>
          ))}
        </>
      ) : (
        <Rect
          width={width}
          height={height}
          fill="#FFFCF5"
          cornerRadius={style === "rounded" ? 18 : style === "torn" ? 3 : 2}
          shadowColor="#5E4D3E"
          shadowBlur={9}
          shadowOpacity={0.18}
          shadowOffsetX={2}
          shadowOffsetY={5}
        />
      )}
      {style === "torn" && (
        <Line
          points={[8, 8, 22, 13, 34, 6, 51, 12, 71, 6, 95, 13, width - 12, 7, width - 6, height - 17, width - 23, height - 10, width - 40, height - 15, width - 61, height - 8, width - 91, height - 14, width - 121, height - 7, 34, height - 12, 13, height - 5, 6, height - 27]}
          stroke={palette.text}
          opacity={0.12}
          strokeWidth={1.5}
        />
      )}
      <PhotoScene
        element={element}
        palette={palette}
        artWidth={artWidth}
        artHeight={artHeight}
        offsetX={insetX}
        offsetY={insetY}
      />
      {style === "rounded" && (
        <Rect x={insetX} y={insetY} width={artWidth} height={artHeight} cornerRadius={13} stroke="#FFFCF5" strokeWidth={1} opacity={0.8} />
      )}
      {style === "film" && (
        <Text
          y={height - 36}
          width={width}
          text="LITTLE MOMENTS  ·  2026"
          align="center"
          fill={palette.paper}
          fontFamily="Courier New"
          fontSize={10}
          letterSpacing={1.4}
          opacity={0.78}
        />
      )}
    </Group>
  );
}

function arcPoints(radius: number, centerX = 14, baseY = 25) {
  return Array.from({ length: 13 }, (_, index) => {
    const angle = Math.PI - (Math.PI * index) / 12;
    return [
      centerX + Math.cos(angle) * radius,
      baseY - Math.sin(angle) * radius,
    ];
  }).flat();
}

function TagGlyph({ element }: { element: CanvasElement }) {
  if (element.weather === "sunny") {
    return (
      <Group>
        <Rect x={5} y={5} width={18} height={18} cornerRadius={9} fill="#F2C96C" stroke="#B58B45" strokeWidth={0.8} />
        {[
          [14, 0, 14, 3],
          [14, 25, 14, 28],
          [0, 14, 3, 14],
          [25, 14, 28, 14],
          [4, 4, 6.5, 6.5],
          [21.5, 21.5, 24, 24],
          [23.5, 4, 21, 6.5],
          [6.5, 21.5, 4, 24],
        ].map((points, index) => (
          <Line key={index} points={points} stroke="#C39448" strokeWidth={1.8} lineCap="round" />
        ))}
      </Group>
    );
  }

  if (element.weather === "cloudy") {
    return (
      <Group>
        <Rect x={14} y={2} width={13} height={13} cornerRadius={7} fill="#F0CF7F" />
        <Rect x={3} y={13} width={17} height={10} cornerRadius={6} fill="#EDF4F2" stroke="#76929A" strokeWidth={1.1} />
        <Rect x={11} y={9} width={16} height={12} cornerRadius={7} fill="#FFFDF8" stroke="#76929A" strokeWidth={1.1} />
      </Group>
    );
  }

  if (element.weather === "rainy") {
    return (
      <Group>
        <Rect x={2} y={5} width={18} height={10} cornerRadius={6} fill="#D9E8E7" stroke="#668A95" strokeWidth={1.1} />
        <Rect x={10} y={2} width={14} height={12} cornerRadius={7} fill="#F7FBF8" stroke="#668A95" strokeWidth={1.1} />
        {[5, 13, 21].map((x, index) => (
          <Line
            key={x}
            points={[x, 18 + (index % 2) * 2, x - 1.5, 23 + (index % 2) * 2, x + 1.5, 21 + (index % 2) * 2, x, 27]}
            stroke="#6FA3BA"
            strokeWidth={1.8}
            lineCap="round"
          />
        ))}
      </Group>
    );
  }

  if (element.weather === "snowy") {
    return (
      <Group>
        {[
          [14, 1, 14, 27],
          [2, 7, 26, 21],
          [26, 7, 2, 21],
        ].map((points, index) => (
          <Line key={index} points={points} stroke="#6FA2B8" strokeWidth={2} lineCap="round" />
        ))}
        <Rect x={11} y={11} width={6} height={6} cornerRadius={3} fill="#FFFDF8" stroke="#6FA2B8" strokeWidth={1} />
      </Group>
    );
  }

  if (element.weather === "rainbow") {
    return (
      <Group>
        <Line points={arcPoints(12)} stroke="#D58F93" strokeWidth={3} lineCap="round" />
        <Line points={arcPoints(9)} stroke="#E4BF68" strokeWidth={3} lineCap="round" />
        <Line points={arcPoints(6)} stroke="#8CAE98" strokeWidth={3} lineCap="round" />
      </Group>
    );
  }

  const fill =
    element.mood === "happy"
      ? "#F2D58B"
      : element.mood === "calm"
        ? "#DCE9D7"
        : element.mood === "moved"
          ? "#F2D8DC"
        : element.mood === "tired"
          ? "#E8DDCC"
          : element.mood === "sad"
            ? "#DCE6EF"
            : element.mood === "excited"
              ? "#F4DCC1"
              : "#E5E6E3";
  const ink =
    element.mood === "moved"
      ? "#BE7881"
      : element.mood === "excited"
        ? "#D27C48"
        : "#6E6D67";

  if (element.mood === "moved") {
    return (
      <Group>
        <Rect x={1} y={1} width={26} height={26} cornerRadius={13} fill={fill} stroke={ink} strokeWidth={1.1} />
        <Line points={[9, 13, 6, 9, 4, 10, 6, 13, 9, 15]} fill="#C77F88" closed />
        <Line points={[19, 13, 16, 9, 14, 10, 16, 13, 19, 15]} fill="#C77F88" closed />
        <Line points={[10, 20, 14, 21, 18, 20]} stroke={ink} strokeWidth={1.4} lineCap="round" tension={0.3} />
      </Group>
    );
  }

  if (element.mood === "excited") {
    return (
      <Group>
        <Rect x={1} y={1} width={26} height={26} cornerRadius={13} fill={fill} stroke={ink} strokeWidth={1.1} />
        <Line points={[8, 7, 9, 9, 11, 9, 9.5, 11, 10, 13, 8, 12, 6, 13, 6.5, 11, 5, 9, 7, 9]} fill="#D27C48" closed />
        <Line points={[20, 7, 21, 9, 23, 9, 21.5, 11, 22, 13, 20, 12, 18, 13, 18.5, 11, 17, 9, 19, 9]} fill="#D27C48" closed />
        <Rect x={10} y={16} width={8} height={7} cornerRadius={4} fill="#B96D44" />
        <Line points={[6, 16, 4, 19, 6, 20]} stroke={ink} strokeWidth={1.3} lineCap="round" />
        <Line points={[22, 16, 24, 19, 22, 20]} stroke={ink} strokeWidth={1.3} lineCap="round" />
      </Group>
    );
  }

  return (
    <Group>
      <Rect x={1} y={1} width={26} height={26} cornerRadius={13} fill={fill} stroke={ink} strokeWidth={1.1} />
      {element.mood === "tired" ? (
        <>
          <Line points={[6, 11, 11, 11]} stroke={ink} strokeWidth={1.5} lineCap="round" />
          <Line points={[17, 11, 22, 11]} stroke={ink} strokeWidth={1.5} lineCap="round" />
          <Line points={[10, 20, 14, 18, 18, 20]} stroke={ink} strokeWidth={1.4} lineCap="round" tension={0.3} />
        </>
      ) : element.mood === "sad" ? (
        <>
          <Rect x={7} y={10} width={3} height={3} cornerRadius={2} fill={ink} />
          <Rect x={18} y={10} width={3} height={3} cornerRadius={2} fill={ink} />
          <Line points={[8, 21, 14, 17, 20, 21]} stroke={ink} strokeWidth={1.5} lineCap="round" tension={0.35} />
          <Line points={[23, 20, 22, 25, 24, 24]} stroke="#719CB8" strokeWidth={1.5} lineCap="round" />
        </>
      ) : element.mood === "calm" ? (
        <>
          <Line points={[6, 12, 11, 14]} stroke={ink} strokeWidth={1.5} lineCap="round" />
          <Line points={[17, 14, 22, 12]} stroke={ink} strokeWidth={1.5} lineCap="round" />
          <Line points={[10, 19, 14, 20, 18, 19]} stroke={ink} strokeWidth={1.4} lineCap="round" tension={0.3} />
        </>
      ) : (
        <>
          <Rect x={7} y={10} width={3} height={3} cornerRadius={2} fill={ink} />
          <Rect x={18} y={10} width={3} height={3} cornerRadius={2} fill={ink} />
          <Line points={[8, 17, 11, 21, 15, 22, 20, 17]} stroke={ink} strokeWidth={1.5} lineCap="round" tension={0.35} />
        </>
      )}
    </Group>
  );
}

function TagElement({ element }: { element: CanvasElement }) {
  const fill =
    element.weather === "sunny"
      ? "#FFF0C9"
      : element.weather === "rainy"
        ? "#E2EFF3"
        : element.weather === "snowy"
          ? "#EEF6F7"
          : element.weather === "rainbow"
            ? "#F9EEE7"
            : element.weather === "cloudy"
              ? "#EAF1EF"
              : element.mood === "happy"
                ? "#FFF0C9"
                : element.mood === "calm"
                  ? "#E5F0E3"
                  : element.mood === "moved"
                    ? "#F8E7E9"
                    : element.mood === "tired"
                      ? "#F1E9DC"
                      : element.mood === "sad"
                        ? "#E8EFF5"
                        : "#FBE9D9";
  const size = Math.min(element.width, element.height);
  return (
    <Group>
      <Rect
        width={size}
        height={size}
        fill={fill}
        cornerRadius={size / 2}
        stroke="#FFFDF8"
        strokeWidth={2}
        shadowColor="#5D4D42"
        shadowBlur={7}
        shadowOpacity={0.16}
        shadowOffsetX={1}
        shadowOffsetY={3}
      />
      <Group
        x={size / 2 - 14}
        y={size / 2 - 14}
        scaleX={size / 58}
        scaleY={size / 58}
      >
        <TagGlyph element={element} />
      </Group>
    </Group>
  );
}

function ElementContent({
  element,
  palette,
  onPhotoDoubleClick,
}: {
  element: CanvasElement;
  palette: ThemePalette;
  onPhotoDoubleClick?: () => void;
}) {
  const image = useHtmlImage(
    element.type === "photo" || element.type === "frame" ? undefined : element.src,
  );

  if (element.type === "photo" || element.type === "frame") {
    return <PhotoElement element={element} palette={palette} onDoubleClick={onPhotoDoubleClick} />;
  }

  if (element.type === "text") {
    return (
      <Text
        width={element.width}
        height={element.height}
        text={element.text ?? "写下一点什么"}
        fontFamily={fontFamilyFor(element.fontStyle)}
        fontSize={element.fontSize ?? 24}
        lineHeight={1.55}
        fill={element.color ?? palette.text}
        align={element.align ?? "left"}
        verticalAlign="top"
        wrap="word"
      />
    );
  }

  if (element.type === "note") {
    return (
      <Group>
        {image ? (
          <KonvaImage image={image} width={element.width} height={element.height} />
        ) : (
          <Rect width={element.width} height={element.height} fill="#FFF0D4" cornerRadius={2} shadowColor="#5B4B3D" shadowBlur={5} shadowOpacity={0.16} />
        )}
        <Text
          x={18}
          y={20}
          width={element.width - 36}
          height={element.height - 34}
          text={element.text ?? "双击写下小纸条"}
          fontFamily={fontFamilyFor(element.fontStyle)}
          fontSize={element.fontSize ?? 18}
          lineHeight={1.5}
          fill={element.color ?? palette.text}
          align={element.align ?? "left"}
          wrap="word"
        />
      </Group>
    );
  }

  if (element.type === "tag") {
    return <TagElement element={element} />;
  }

  if (element.type === "shape") {
    return (
      <Group>
        <Rect
          width={element.width}
          height={element.height}
          fill={element.backgroundColor ?? palette.decoration}
          cornerRadius={Math.min(element.width, element.height) / 2}
          opacity={element.opacity}
        />
        <Line
          points={[
            element.width * 0.48,
            element.height * 0.17,
            element.width * 0.62,
            element.height * 0.41,
            element.width * 0.86,
            element.height * 0.43,
            element.width * 0.67,
            element.height * 0.59,
            element.width * 0.75,
            element.height * 0.85,
            element.width * 0.49,
            element.height * 0.69,
            element.width * 0.24,
            element.height * 0.85,
            element.width * 0.33,
            element.height * 0.58,
            element.width * 0.14,
            element.height * 0.42,
            element.width * 0.39,
            element.height * 0.39,
          ]}
          closed
          fill={element.color ?? palette.auxiliary}
          stroke={palette.paper}
          strokeWidth={3}
          tension={0.2}
        />
      </Group>
    );
  }

  if (image) {
    return <KonvaImage image={image} width={element.width} height={element.height} />;
  }

  return <Rect width={element.width} height={element.height} fill={palette.auxiliary} opacity={0.7} cornerRadius={8} />;
}

interface ElementNodeProps {
  element: CanvasElement;
  palette: ThemePalette;
  readOnly: boolean;
  isSelected: boolean;
  registerRef: (id: string, node: Konva.Group | null) => void;
  onSelect?: (id: string | null) => void;
  onUpdate?: (
    id: string,
    patch: Partial<CanvasElement>,
    options?: { checkpoint?: boolean },
  ) => void;
  onCheckpoint?: () => void;
  onTextEdit?: (id: string) => void;
  onPhotoDoubleClick?: (id: string) => void;
}

function ElementNode({
  element,
  palette,
  readOnly,
  isSelected,
  registerRef,
  onSelect,
  onUpdate,
  onCheckpoint,
  onTextEdit,
  onPhotoDoubleClick,
}: ElementNodeProps) {
  const handleClick = (event: KonvaEventObject<MouseEvent | TouchEvent>) => {
    event.cancelBubble = true;
    if (!readOnly) onSelect?.(element.id);
  };

  const handleDoubleClick = (event: KonvaEventObject<MouseEvent | TouchEvent>) => {
    event.cancelBubble = true;
    if (readOnly) return;
    if (element.type === "photo" || element.type === "frame") {
      onPhotoDoubleClick?.(element.id);
      return;
    }
    if (element.type === "text" || element.type === "note") {
      onTextEdit?.(element.id);
    }
  };

  const handleDragStart = () => {
    if (readOnly) return;
    onCheckpoint?.();
  };

  const handleDragEnd = (event: KonvaEventObject<DragEvent>) => {
    if (readOnly) return;
    onUpdate?.(element.id, {
      x: Math.round(event.target.x()),
      y: Math.round(event.target.y()),
    });
  };

  const handleTransformEnd = (event: KonvaEventObject<Event>) => {
    if (readOnly) return;
    const node = event.target as Konva.Group;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    onUpdate?.(element.id, {
      x: Math.round(node.x()),
      y: Math.round(node.y()),
      width: Math.max(34, Math.round(element.width * scaleX)),
      height: Math.max(30, Math.round(element.height * scaleY)),
      rotation: Math.round(node.rotation() * 10) / 10,
    });
  };

  return (
    <Group
      ref={(node) => registerRef(element.id, node)}
      x={element.x}
      y={element.y}
      rotation={element.rotation}
      opacity={element.opacity}
      draggable={!readOnly}
      onClick={handleClick}
      onTap={handleClick}
      onDblClick={handleDoubleClick}
      onDblTap={handleDoubleClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTransformStart={onCheckpoint}
      onTransformEnd={handleTransformEnd}
      shadowColor={!readOnly && isSelected ? "#8B7562" : undefined}
      shadowBlur={!readOnly && isSelected ? 2 : 0}
      shadowOpacity={!readOnly && isSelected ? 0.1 : 0}
    >
      <ElementContent
        element={element}
        palette={palette}
        onPhotoDoubleClick={() => onPhotoDoubleClick?.(element.id)}
      />
    </Group>
  );
}

export const DiaryCanvas = forwardRef<Konva.Stage, DiaryCanvasProps>(function DiaryCanvas(
  {
    entry,
    readOnly = false,
    selectedId,
    onSelect,
    onUpdate,
    onCheckpoint,
    onTextEdit,
    onPhotoDoubleClick,
    editingId,
    onEditingText,
    onFinishEditing,
    zoom = 1,
    panMode = false,
    className = "",
    onViewportScale,
  },
  forwardedRef,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const nodeRefs = useRef<Record<string, Konva.Group>>({});
  const [containerSize, setContainerSize] = useState({ width: 800, height: 900 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragOrigin = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const updateSize = () => {
      setContainerSize({
        width: Math.max(250, element.clientWidth),
        height: Math.max(300, element.clientHeight),
      });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const fitScale = useMemo(() => {
    const paddingX = readOnly ? 30 : 46;
    const paddingY = readOnly ? 26 : 50;
    return Math.min(
      Math.max(0.2, (containerSize.width - paddingX) / PAGE_WIDTH),
      Math.max(0.2, (containerSize.height - paddingY) / PAGE_HEIGHT),
    );
  }, [containerSize, readOnly]);

  const displayScale = fitScale * zoom;

  useEffect(() => {
    onViewportScale?.(displayScale);
  }, [displayScale, onViewportScale]);

  useEffect(() => {
    setPan({ x: 0, y: 0 });
  }, [displayScale]);

  const registerRef = useCallback((id: string, node: Konva.Group | null) => {
    if (node) nodeRefs.current[id] = node;
    else delete nodeRefs.current[id];
  }, []);

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;
    const node = selectedId ? nodeRefs.current[selectedId] : null;
    transformer.nodes(node ? [node] : []);
    transformer.getLayer()?.batchDraw();
  }, [selectedId, entry.elements]);

  useEffect(() => {
    if (stageRef.current && forwardedRef) {
      if (typeof forwardedRef === "function") forwardedRef(stageRef.current);
      else forwardedRef.current = stageRef.current;
    }
  }, [forwardedRef]);

  const handleStageClick = (event: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (event.target === event.target.getStage()) onSelect?.(null);
  };

  const selectedElement = entry.elements.find((element) => element.id === selectedId);
  const editingElement = entry.elements.find((element) => element.id === editingId);

  const startPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!panMode) return;
    dragOrigin.current = {
      x: event.clientX,
      y: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const movePan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragOrigin.current) return;
    setPan({
      x: dragOrigin.current.panX + event.clientX - dragOrigin.current.x,
      y: dragOrigin.current.panY + event.clientY - dragOrigin.current.y,
    });
  };

  const endPan = () => {
    dragOrigin.current = null;
  };

  return (
    <div
      ref={containerRef}
      className={`diary-canvas-fit ${panMode ? "is-pan-mode" : ""} ${className}`}
      onPointerDown={startPan}
      onPointerMove={movePan}
      onPointerUp={endPan}
      onPointerCancel={endPan}
    >
      <div
        className="diary-stage-shell"
        style={{
          width: PAGE_WIDTH * displayScale,
          height: PAGE_HEIGHT * displayScale,
          transform: `translate(${pan.x}px, ${pan.y}px)`,
        }}
      >
        <Stage
          ref={stageRef}
          width={PAGE_WIDTH * displayScale}
          height={PAGE_HEIGHT * displayScale}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          <Layer scaleX={displayScale} scaleY={displayScale}>
            <PaperBackground palette={entry.palette} backgroundId={entry.backgroundId} />
            <PageHeading entry={entry} />
            {entry.elements.map((element) => (
              <ElementNode
                key={element.id}
                element={element}
                palette={entry.palette}
                readOnly={readOnly}
                isSelected={selectedId === element.id}
                registerRef={registerRef}
                onSelect={onSelect}
                onUpdate={onUpdate}
                onCheckpoint={onCheckpoint}
                onTextEdit={onTextEdit}
                onPhotoDoubleClick={onPhotoDoubleClick}
              />
            ))}
            {!readOnly && selectedElement && !editingId && (
              <Transformer
                ref={transformerRef}
                rotateEnabled
                rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
                rotateAnchorOffset={28}
                keepRatio={false}
                borderStroke={entry.palette.text}
                borderDash={[5, 3]}
                borderStrokeWidth={1.5}
                anchorFill="#FFFDF7"
                anchorStroke={entry.palette.text}
                anchorCornerRadius={5}
                anchorSize={9}
                padding={4}
                enabledAnchors={[
                  "top-left",
                  "top-right",
                  "bottom-left",
                  "bottom-right",
                  "middle-left",
                  "middle-right",
                  "top-center",
                  "bottom-center",
                ]}
                boundBoxFunc={(oldBox, newBox) =>
                  newBox.width < 34 || newBox.height < 30 ? oldBox : newBox
                }
              />
            )}
          </Layer>
        </Stage>
        {!readOnly && editingElement && (editingElement.type === "text" || editingElement.type === "note") && (
          <textarea
            className="canvas-inline-editor"
            value={editingElement.text ?? ""}
            autoFocus
            onChange={(event) => onEditingText?.(event.target.value)}
            onBlur={onFinishEditing}
            style={{
              left: (editingElement.x + (editingElement.type === "note" ? 18 : 0)) * displayScale,
              top: (editingElement.y + (editingElement.type === "note" ? 20 : 0)) * displayScale,
              width:
                (editingElement.width - (editingElement.type === "note" ? 36 : 0)) *
                displayScale,
              height:
                (editingElement.height - (editingElement.type === "note" ? 34 : 0)) *
                displayScale,
              transform: `rotate(${editingElement.rotation}deg)`,
              transformOrigin: "top left",
              fontFamily: fontFamilyFor(editingElement.fontStyle),
              fontSize: (editingElement.fontSize ?? 24) * displayScale,
              lineHeight: 1.55,
              color: editingElement.color ?? entry.palette.text,
              textAlign: editingElement.align ?? "left",
              background:
                editingElement.type === "note"
                  ? "rgba(255, 249, 235, .82)"
                  : "rgba(255, 253, 247, .62)",
            }}
          />
        )}
      </div>
    </div>
  );
});
