import React, { useState, useRef, useEffect } from 'react';
import { SITE_INFO } from '../data/constants';
import { ShoppingBag, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Flame, Sparkles, Heart, Anchor } from 'lucide-react';

export const About: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      setHasStarted(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = Number(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <section
      id="about-section"
      className="min-h-[100dvh] py-16 md:py-24 relative overflow-hidden flex flex-col justify-center items-center"
      style={{
        background: 'linear-gradient(160deg, #003843 0%, #004754 40%, #005F73 100%)',
      }}
    >
      {/* Background Texture & Atmospheric Glows */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#94D2BD_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#EE9B00]/12 blur-[130px] pointer-events-none animate-ambient-glow" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#94D2BD]/12 blur-[130px] pointer-events-none animate-ambient-glow" />

      {/* Texture Rupestre overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 opacity-[0.15] mix-blend-overlay"
        style={{ backgroundImage: "url('/images/sections/texture-rupestre.webp')" }}
      />

      <div className="max-w-[92rem] mx-auto px-4 sm:px-8 lg:px-12 relative z-10 w-full my-auto py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Story Editorial & 3 Pillars (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left gap-6">
            <span className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest text-white uppercase font-bold px-3.5 py-1.5 bg-[#CA6702] border-2 border-[#001219] rounded-full w-fit shadow-[2px_2px_0px_#001219] hover:rotate-1 transition-transform cursor-default">
              <span className="w-2 h-2 rounded-full bg-[#EE9B00] animate-pulse" />
              Nossa História • Raízes em Laguna & Floripa
            </span>

            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white uppercase leading-[0.95] tracking-tight">
              DA ESTRADA <br />
              <span className="text-[#EE9B00]">PARA A MESA</span>
            </h2>

            <div className="flex flex-col gap-4 font-sans text-white/90">
              <p className="text-base sm:text-lg md:text-xl font-medium leading-relaxed">
                Nascido no centro histórico de Laguna/SC, o <strong className="text-[#EE9B00] font-black">El Chicano</strong> cresceu para conectar pessoas através de comida de verdade e momentos reais.
              </p>
              <p className="text-sm sm:text-base md:text-lg font-medium leading-relaxed text-white/80">
                Um projeto familiar que mantém sua essência artesanal e respeito absoluto aos ingredientes. Aqui, o acolhimento não segue protocolo — é de família para família, feito com o fogo que nunca se apaga.
              </p>
            </div>

            {/* The 3 Pillars of El Chicano */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full my-2">
              <div className="p-4 rounded-2xl bg-white/[0.05] border-2 border-white/10 hover:border-[#EE9B00]/60 hover:bg-white/[0.08] transition-all group">
                <div className="w-9 h-9 rounded-xl bg-[#CA6702] text-white flex items-center justify-center mb-2.5 shadow-chicano-sm group-hover:scale-105 transition-transform">
                  <Flame className="w-4 h-4 fill-current" />
                </div>
                <h4 className="font-display font-black text-xs uppercase tracking-wider text-[#EE9B00]">
                  100% Artesanal
                </h4>
                <p className="font-sans text-[11px] text-white/70 mt-1 leading-snug">
                  Tortilhas feitas no dia, carnes grelhadas e salsas sem conservantes.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.05] border-2 border-white/10 hover:border-[#94D2BD]/60 hover:bg-white/[0.08] transition-all group">
                <div className="w-9 h-9 rounded-xl bg-[#0A9396] text-white flex items-center justify-center mb-2.5 shadow-chicano-sm group-hover:scale-105 transition-transform">
                  <Heart className="w-4 h-4 fill-current" />
                </div>
                <h4 className="font-display font-black text-xs uppercase tracking-wider text-[#94D2BD]">
                  Fé & Coração
                </h4>
                <p className="font-sans text-[11px] text-white/70 mt-1 leading-snug">
                  Cozinhar como ato sagrado de afeto e boas vibrações à mesa.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.05] border-2 border-white/10 hover:border-[#EE9B00]/60 hover:bg-white/[0.08] transition-all group">
                <div className="w-9 h-9 rounded-xl bg-[#001219] text-[#EE9B00] border border-[#EE9B00]/30 flex items-center justify-center mb-2.5 shadow-chicano-sm group-hover:scale-105 transition-transform">
                  <Anchor className="w-4 h-4" />
                </div>
                <h4 className="font-display font-black text-xs uppercase tracking-wider text-[#EE9B00]">
                  Origem Litorânea
                </h4>
                <p className="font-sans text-[11px] text-white/70 mt-1 leading-snug">
                  Da brisa de Laguna à ilha de Florianópolis: o encontro de dois mundos.
                </p>
              </div>
            </div>

            {/* Quote Box */}
            <div className="w-full pl-5 border-l-4 border-[#EE9B00] py-3 bg-white/[0.04] hover:bg-white/[0.07] rounded-r-xl pr-5 relative overflow-hidden transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-[#EE9B00]/15 via-transparent to-transparent rounded-r-xl pointer-events-none" />
              <p className="text-sm sm:text-base md:text-lg font-bold text-[#EE9B00] italic tracking-wide leading-relaxed relative">
                "Mudar não é apagar o passado, é dar um futuro às nossas raízes."
              </p>
            </div>

            {/* CTA */}
            <div className="mt-2">
              <a
                href={SITE_INFO.cardapioWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative overflow-hidden group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-[#001219] shadow-[4px_4px_0px_0px_#001219] hover:shadow-[7px_7px_0px_0px_#001219] hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#001219] transition-all duration-200 cursor-pointer"
              >
                <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none animate-cta-shimmer" />
                <span>FAZER MEU PEDIDO</span>
                <ShoppingBag className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
              </a>
            </div>
          </div>

          {/* Right Column: Cinematographic Custom Video Player (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div
              className="w-full relative rounded-[2.5rem] bg-[#001219] border-4 border-[#001219] shadow-[14px_14px_0px_0px_#001219] overflow-hidden group/video will-change-transform"
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => setShowControls(isPlaying ? false : true)}
            >
              {/* Top Video Header Badge */}
              <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#94D2BD] font-mono text-[9px] uppercase font-black tracking-wider border border-white/10">
                  <Flame className="w-3 h-3 text-[#EE9B00]" />
                  <span>Bastidores da Cozinha</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EE9B00] text-[#001219] font-mono text-[9px] font-black uppercase tracking-wider shadow-sm">
                  100% Real
                </span>
              </div>

              {/* Video Element */}
              <div className="relative aspect-[9/14] sm:aspect-[4/5] md:aspect-[3/4] w-full bg-black flex items-center justify-center overflow-hidden">
                <video
                  ref={videoRef}
                  src="/videos/about-video.mp4"
                  poster="/images/gallery/gallery-4.webp"
                  playsInline
                  loop
                  muted={isMuted}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleVideoEnded}
                  onClick={togglePlay}
                  className="w-full h-full object-cover cursor-pointer"
                />

                {/* Ambient vignette gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

                {/* Big Center Play / Pause Overlay Button */}
                {(!isPlaying || !hasStarted) && (
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-[#EE9B00] text-[#001219] border-3 border-[#001219] shadow-[6px_6px_0px_#001219] flex items-center justify-center hover:scale-110 active:scale-95 hover:bg-[#CA6702] hover:text-white transition-all duration-300 cursor-pointer z-20 group/play"
                    aria-label="Reproduzir vídeo da nossa história"
                  >
                    <span className="absolute inset-0 rounded-full bg-[#EE9B00]/40 animate-ping pointer-events-none" />
                    <Play className="w-9 h-9 ml-1 fill-current relative z-10" />
                  </button>
                )}

                {/* Custom Glassmorphism Controls Bar */}
                <div
                  className={`absolute bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent transition-opacity duration-300 ${
                    showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  {/* Timeline Scrubber */}
                  <div className="w-full flex items-center gap-2 mb-2">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#EE9B00] hover:h-2 transition-all"
                      aria-label="Barra de progresso do vídeo"
                    />
                  </div>

                  {/* Controls Row */}
                  <div className="flex items-center justify-between text-white text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={togglePlay}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-[#EE9B00] hover:text-[#001219] transition-all cursor-pointer"
                        aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={toggleMute}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-[#EE9B00] hover:text-[#001219] transition-all cursor-pointer"
                        aria-label={isMuted ? 'Ativar som' : 'Mutar som'}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>

                      <span className="text-[11px] text-[#E9D8A6]/80 font-bold">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleFullscreen}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-[#EE9B00] hover:text-[#001219] transition-all cursor-pointer"
                      aria-label="Tela cheia"
                    >
                      <Maximize className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Caption Pill */}
              <div className="p-4 bg-[#FAF5E8] border-t-3 border-[#001219] flex items-center justify-between text-left">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#005F73] font-black block">
                    Experiência Cinematográfica
                  </span>
                  <p className="font-display font-black text-sm text-[#001219] uppercase leading-tight mt-0.5">
                    O Fogo e o Carinho em Cada Prato
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[#CA6702]">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Immersive Transition to Menu */}
      <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-b from-transparent via-[#001219]/60 to-[#001219] pointer-events-none z-[10]" />
      <div className="section-divider-cool" />
      <div className="section-divider-glow-cool" />
    </section>
  );
};
