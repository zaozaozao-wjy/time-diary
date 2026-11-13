import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookHeart, Flower2, Leaf, Sparkles } from "lucide-react";
import { paletteFromTheme, THEMES } from "../data/themes";

interface CoverPageProps {
  diaryCount: number;
  onOpen: () => void;
}

const coverChoices = [THEMES[0], THEMES[3], THEMES[6], THEMES[13], THEMES[15]];

export function CoverPage({ diaryCount, onOpen }: CoverPageProps) {
  const [coverTheme, setCoverTheme] = useState(coverChoices[0]);
  const [opening, setOpening] = useState(false);
  const palette = paletteFromTheme(coverTheme);

  const handleOpen = () => {
    if (opening) return;
    setOpening(true);
    window.setTimeout(onOpen, 720);
  };

  return (
    <main className="cover-page page-shell">
      <div className="cover-sunwash cover-sunwash-a" />
      <div className="cover-sunwash cover-sunwash-b" />
      <div className="cover-botanical botanical-left" aria-hidden="true">
        <svg viewBox="0 0 240 430">
          <path d="M24 430c65-107 97-241 90-385" />
          <path d="M88 234c-59-9-83-45-72-100 52 5 83 41 87 92M100 187c47-28 94-15 120 23-38 42-86 35-128-8M111 122c-34-22-44-52-24-83 34 18 48 48 38 83M157 278c48-25 88-8 108 31-42 29-79 18-111-19M42 351c-35 4-58-11-70-42 35-13 65-3 84 30" />
          <g className="botanical-flower">
            <ellipse cx="84" cy="77" rx="18" ry="39" transform="rotate(-40 84 77)" />
            <ellipse cx="82" cy="82" rx="18" ry="39" transform="rotate(41 82 82)" />
            <ellipse cx="65" cy="83" rx="18" ry="39" transform="rotate(105 65 83)" />
            <ellipse cx="87" cy="101" rx="18" ry="39" transform="rotate(163 87 101)" />
            <ellipse cx="104" cy="78" rx="18" ry="39" transform="rotate(222 104 78)" />
            <circle cx="85" cy="85" r="14" />
          </g>
        </svg>
      </div>
      <div className="cover-botanical botanical-right" aria-hidden="true">
        <svg viewBox="0 0 220 380">
          <path d="M190 380c-49-100-54-209-17-327" />
          <path d="M168 164c-41-6-63-30-58-68 35-3 60 18 70 58M171 222c36-26 70-19 91 10-28 32-59 30-91-10M105 291c-35-6-53-28-48-58 30-2 51 15 59 47" />
          <g className="botanical-seed">
            <circle cx="150" cy="61" r="7" />
            <circle cx="176" cy="82" r="5" />
            <circle cx="130" cy="91" r="4" />
          </g>
        </svg>
      </div>

      <motion.section
        className="cover-copy"
        initial={{ opacity: 0, x: -28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="cover-eyebrow">
          <span />
          little moments, kept softly
        </div>
        <h1>
          时光日记
          <small>Little Moments</small>
        </h1>
        <p className="cover-lead">
          把平凡日子里的小小闪光，
          <br />
          拼贴成只属于你的温柔纸页。
        </p>
        <div className="cover-notes">
          <span><Leaf size={15} /> 写下此刻</span>
          <span><Flower2 size={15} /> 收藏心情</span>
          <span><BookHeart size={15} /> 留住小事</span>
        </div>
        <button
          className={`open-journal-button ${opening ? "is-opening" : ""}`}
          onClick={handleOpen}
          disabled={opening}
        >
          <span className="open-button-icon"><BookHeart size={20} /></span>
          <span>{opening ? "轻轻翻开中…" : "打开手帖"}</span>
          <ArrowRight size={18} />
        </button>
        <div className="cover-footnote">
          <span>{diaryCount > 0 ? `已经收藏了 ${diaryCount} 个闪光片刻` : "第一段故事，从今天开始"}</span>
          <span className="cover-dot" />
          <span>所有内容只保存在你的设备</span>
        </div>
      </motion.section>

      <motion.div
        className={`cover-book-scene ${opening ? "is-opening" : ""}`}
        initial={{ opacity: 0, y: 30, rotate: -3 }}
        animate={{ opacity: 1, y: 0, rotate: -2 }}
        transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="cover-book-shadow" />
        <div
          className="journal-cover"
          style={{
            background: `linear-gradient(145deg, ${palette.paper} 0%, ${palette.auxiliary} 100%)`,
            color: palette.text,
          }}
        >
          <div className="cover-cloth-texture" />
          <div className="cover-spine" />
          <div className="cover-ribbon" style={{ background: palette.accent }} />
          <div className="cover-corner corner-tl" />
          <div className="cover-corner corner-tr" />
          <div className="cover-corner corner-bl" />
          <div className="cover-corner corner-br" />
          <div className="cover-label">
            <span className="cover-label-kicker">A LITTLE MOMENTS JOURNAL</span>
            <div className="cover-mini-flower" aria-hidden="true">
              <i /><i /><i /><i /><b />
            </div>
            <h2>时光日记</h2>
            <p>Little Moments</p>
            <div className="cover-label-line" />
            <span className="cover-label-year">est. 2026</span>
          </div>
          <div className="cover-sticker" style={{ background: palette.decoration }}>
            <Sparkles size={19} />
            <span>今日也值得<br />被好好收藏</span>
          </div>
          <div className="cover-lace" />
        </div>
        <div className="cover-paper-stack" style={{ background: palette.auxiliary }}>
          <span />
        </div>
        <div className="cover-theme-picker">
          <span>封面颜色</span>
          <div>
            {coverChoices.map((theme) => (
              <button
                key={theme.id}
                className={coverTheme.id === theme.id ? "is-active" : ""}
                style={{ background: theme.colors[0], borderColor: theme.colors[2] }}
                onClick={() => setCoverTheme(theme)}
                aria-label={`更换为${theme.name}封面`}
                title={theme.name}
              />
            ))}
          </div>
        </div>
      </motion.div>

      <div className="cover-floating-card cover-floating-card-a">
        <Sparkles size={14} />
        <span>今日份的小美好</span>
      </div>
      <div className="cover-floating-card cover-floating-card-b">
        <Leaf size={14} />
        <span>慢慢写，也没关系</span>
      </div>
    </main>
  );
}
