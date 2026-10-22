import React, { useState, useEffect } from 'react';
import { submitFranchiseLead, FranchiseLead, getFranchiseVideoConfig, FranchiseVideoConfig } from '../services/d1Api';
import { ArrowLeft, Send, CheckCircle2, DollarSign, Clock, TrendingUp, Flame, X, ChevronRight, Play } from 'lucide-react';
import { WhatsAppIcon } from './Icons';
import { Logo } from './Logo';
import { subscribeRealtime } from '../utils/realtime';

interface FranchisePageProps {
  onBackToHome: () => void;
}

export const FranchisePage: React.FC<FranchisePageProps> = ({ onBackToHome }) => {
  const [videoConfig, setVideoConfig] = useState<FranchiseVideoConfig>({
    isEnabled: false,
    videoUrl: '',
    posterUrl: '',
    title: '',
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FranchiseLead>({
    name: '',
    phone: '',
    email: '',
    city: '',
    state: 'SC',
    capital: 'R$ 150k - R$ 250k',
    experience: 'nao',
  });

  useEffect(() => {
    const refreshVideo = () => {
      getFranchiseVideoConfig().then((cfg) => {
        setVideoConfig(cfg);
      });
    };

    // 1. Initial fetch
    refreshVideo();

    // 2. Real-time subscription across tabs and components
    const unsub = subscribeRealtime('FRANCHISE_VIDEO_UPDATED', (newCfg) => {
      if (newCfg) {
        setVideoConfig(newCfg);
      }
    });

    // 3. Tab focus revalidation
    window.addEventListener('focus', refreshVideo);

    return () => {
      unsub();
      window.removeEventListener('focus', refreshVideo);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) return;

    setIsSubmitting(true);
    try {
      await submitFranchiseLead(formData);
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      `Olá! Meu nome é ${formData.name || 'Investidor'}. Tenho interesse em abrir uma Franquia El Chicano em ${formData.city || 'minha cidade'}-${formData.state || 'SC'} com investimento de ${formData.capital || 'capital a definir'}. Gostaria de falar com o especialista!`
    );
    window.open(`https://wa.me/5548991206132?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FAF5E8] text-[#001219] flex flex-col justify-between relative overflow-x-hidden selection:bg-[#EE9B00] selection:text-[#001219]">
      
      {/* Subtle Warm Background Pattern */}
      <div 
        className="fixed inset-0 bg-cover bg-center pointer-events-none opacity-[0.04] mix-blend-multiply"
        style={{ backgroundImage: "url('/images/sections/texture-rupestre.webp')" }}
      />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#EE9B00]/10 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#005F73]/10 blur-[140px] pointer-events-none" />

      {/* TOP HEADER */}
      <header className="relative z-20 max-w-6xl mx-auto w-full px-4 sm:px-8 py-5 sm:py-6 flex items-center justify-between border-b-2 border-[#001219]/10">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-[#EE9B00] text-[#001219] border-2 border-[#001219] font-mono text-xs uppercase font-bold transition-all cursor-pointer shadow-[3px_3px_0px_#001219] hover:-translate-y-0.5 active:translate-y-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Site</span>
        </button>

        {/* Brand Logo - Prominent & Impactful */}
        <div className="flex items-center justify-center">
          <Logo className="h-22 sm:h-28 md:h-36 lg:h-44 w-auto transition-transform hover:scale-105" />
        </div>

        {/* Direct WhatsApp Contact Button */}
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#001219] hover:bg-[#005F73] text-white font-mono text-xs uppercase font-bold transition-all cursor-pointer shadow-[3px_3px_0px_#EE9B00]"
        >
          <span>Falar Agora</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#EE9B00]" />
        </button>
      </header>

      {/* MAIN HERO CONVERSION STAGE (Bright, Clean, High-Impact) */}
      <main className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-8 py-10 sm:py-16 flex flex-col items-center text-center my-auto">
        

        {/* High-Impact Conversion Headline */}
        <h1 className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-[#001219] uppercase leading-[1.05] tracking-tight max-w-4xl">
          SEJA DONO DO AUTÊNTICO <br />
          <span className="text-[#CA6702] relative inline-block">
            SABOR MEXICANO
            <span className="absolute -bottom-1.5 left-0 w-full h-2 bg-[#EE9B00] -z-10 rounded-full" />
          </span>{' '}
          NA SUA CIDADE
        </h1>

        {/* REPOSITIONED PRIMARY CTA BUTTON (Central, Prominent, Action-Oriented) */}
        <div className="mt-8 sm:mt-10 flex flex-col items-center gap-3 w-full max-w-md">
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="w-full relative overflow-hidden group py-5 px-8 bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-base sm:text-lg uppercase tracking-wider rounded-2xl border-4 border-[#001219] shadow-[8px_8px_0px_0px_#001219] hover:shadow-[12px_12px_0px_0px_#001219] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 cursor-pointer"
          >
            <span className="absolute inset-0 -translate-x-full animate-cta-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
            <div className="relative z-10 flex items-center justify-center gap-3">
              <span>FALE COM NOSSO ESPECIALISTA</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* 3 HIGH-IMPACT CONVERSION PILLARS (Compact, Sleek, Neobrutalist Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 w-full mt-8 sm:mt-10 text-left">
          
          {/* Card 1: Margens */}
          <div className="bg-white border-2 border-[#001219] rounded-xl p-4 sm:p-4.5 shadow-[3px_3px_0px_#001219] hover:-translate-y-0.5 transition-transform">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#FAF5E8] border border-[#001219] flex items-center justify-center mb-2.5 text-[#CA6702]">
              <TrendingUp className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5px]" />
            </div>
            <h3 className="font-display font-black text-sm sm:text-base uppercase text-[#001219] leading-tight">
              Margem de 22% a 28%
            </h3>
            <p className="font-sans text-[11px] sm:text-xs text-[#001219]/70 mt-1 leading-snug font-medium">
              CMV rigorosamente controlado, fornecedores homologados e ticket médio elevado garantem máxima lucratividade líquida.
            </p>
          </div>

          {/* Card 2: Payback */}
          <div className="bg-white border-2 border-[#001219] rounded-xl p-4 sm:p-4.5 shadow-[3px_3px_0px_#001219] hover:-translate-y-0.5 transition-transform">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#FAF5E8] border border-[#001219] flex items-center justify-center mb-2.5 text-[#005F73]">
              <Clock className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5px]" />
            </div>
            <h3 className="font-display font-black text-sm sm:text-base uppercase text-[#001219] leading-tight">
              Payback 14 a 18 Meses
            </h3>
            <p className="font-sans text-[11px] sm:text-xs text-[#001219]/70 mt-1 leading-snug font-medium">
              Retorno acelerado do capital investido através de suporte completo na escolha do ponto, arquitetura e inauguração.
            </p>
          </div>

          {/* Card 3: Operação */}
          <div className="bg-white border-2 border-[#001219] rounded-xl p-4 sm:p-4.5 shadow-[3px_3px_0px_#001219] hover:-translate-y-0.5 transition-transform">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#FAF5E8] border border-[#001219] flex items-center justify-center mb-2.5 text-[#EE9B00]">
              <Flame className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5px]" />
            </div>
            <h3 className="font-display font-black text-sm sm:text-base uppercase text-[#001219] leading-tight">
              Operação Descomplicada
            </h3>
            <p className="font-sans text-[11px] sm:text-xs text-[#001219]/70 mt-1 leading-snug font-medium">
              Processos simples, sem necessidade de chef de alta gastronomia. Treinamento presencial intensivo para sua equipe.
            </p>
          </div>

        </div>

        {/* OPTIONAL DYNAMIC VIDEO CONTAINER (Only displayed if enabled in Admin Panel) */}
        {videoConfig.isEnabled && videoConfig.videoUrl && (
          <div className="w-full max-w-3xl mt-10 bg-white border-3 border-[#001219] rounded-2xl p-4 shadow-[6px_6px_0px_#001219]">
            <h4 className="font-display font-black text-base sm:text-lg text-[#001219] uppercase mb-3 text-center">
              {videoConfig.title || 'Apresentação do Modelo de Negócio'}
            </h4>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border-2 border-[#001219]">
              <video
                src={videoConfig.videoUrl}
                poster={videoConfig.posterUrl || undefined}
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-8 py-3.5 sm:py-4 text-center border-t-2 border-[#001219]/10 font-mono text-[9px] sm:text-[10px] text-[#001219]/45 uppercase tracking-wider">
        El Chicano Franquias • Santa Catarina • Todos os direitos reservados
      </footer>

      {/* PROSPECTING MODAL FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001219]/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#FAF5E8] border-4 border-[#001219] rounded-[2rem] p-6 sm:p-8 shadow-[12px_12px_0px_#001219] text-[#001219] max-h-[92vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                setIsSubmitted(false);
              }}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white border-2 border-[#001219] flex items-center justify-center text-[#001219] hover:bg-[#AE2012] hover:text-white transition-colors cursor-pointer shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>

            {!isSubmitted ? (
              <>
                <div className="text-left mb-6">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#CA6702] tracking-widest">
                    Canal Exclusivo para Franqueados
                  </span>
                  <h3 className="font-display font-black text-2xl text-[#001219] uppercase leading-tight mt-1">
                    Fale com Nosso Especialista
                  </h3>
                  <p className="font-sans text-xs text-[#001219]/70 mt-1 font-medium">
                    Preencha os dados abaixo para receber a apresentação completa e o plano de retorno financeiro.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-left">
                  {/* Nome */}
                  <div>
                    <label className="block font-mono text-[11px] uppercase font-bold text-[#001219] mb-1">
                      Seu Nome Completo *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Nome e Sobrenome"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-[#001219] text-xs font-sans text-[#001219] focus:outline-none focus:border-[#EE9B00] shadow-[2px_2px_0px_#001219]"
                    />
                  </div>

                  {/* WhatsApp & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono text-[11px] uppercase font-bold text-[#001219] mb-1">
                        WhatsApp (com DDD) *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(48) 99999-9999"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-[#001219] text-xs font-sans text-[#001219] focus:outline-none focus:border-[#EE9B00] shadow-[2px_2px_0px_#001219]"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] uppercase font-bold text-[#001219] mb-1">
                        E-mail *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="seuemail@provedor.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-[#001219] text-xs font-sans text-[#001219] focus:outline-none focus:border-[#EE9B00] shadow-[2px_2px_0px_#001219]"
                      />
                    </div>
                  </div>

                  {/* Cidade & Estado */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block font-mono text-[11px] uppercase font-bold text-[#001219] mb-1">
                        Cidade de Interesse *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Sua cidade"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-[#001219] text-xs font-sans text-[#001219] focus:outline-none focus:border-[#EE9B00] shadow-[2px_2px_0px_#001219]"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] uppercase font-bold text-[#001219] mb-1">
                        UF *
                      </label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border-2 border-[#001219] text-xs font-mono font-bold text-[#001219] focus:outline-none focus:border-[#EE9B00] shadow-[2px_2px_0px_#001219]"
                      >
                        <option value="SC">SC</option>
                        <option value="PR">PR</option>
                        <option value="RS">RS</option>
                        <option value="SP">SP</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                  </div>

                  {/* Capital Disponível */}
                  <div>
                    <label className="block font-mono text-[11px] uppercase font-bold text-[#001219] mb-1">
                      Capital Disponível para Investimento
                    </label>
                    <select
                      name="capital"
                      value={formData.capital}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-[#001219] text-xs font-mono font-bold text-[#001219] focus:outline-none focus:border-[#EE9B00] shadow-[2px_2px_0px_#001219]"
                    >
                      <option value="R$ 100k - R$ 150k">R$ 100k a R$ 150k</option>
                      <option value="R$ 150k - R$ 250k">R$ 150k a R$ 250k (Recomendado)</option>
                      <option value="R$ 250k - R$ 400k">R$ 250k a R$ 400k (Loja Completa)</option>
                      <option value="Acima de R$ 400k">Acima de R$ 400k (Múltiplas unidades)</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-3 w-full py-4 px-6 rounded-xl bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-sm uppercase tracking-wider border-2 border-[#001219] shadow-[4px_4px_0px_#001219] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Enviando...' : 'Quero Ser Franqueado'}</span>
                  </button>
                </form>
              </>
            ) : (
              /* Success View */
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-16 h-16 rounded-full bg-[#0A9396] text-white border-3 border-[#001219] flex items-center justify-center mb-4 shadow-[4px_4px_0px_#001219]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h3 className="font-display font-black text-2xl text-[#001219] uppercase">
                  Solicitação Enviada!
                </h3>

                <p className="font-sans text-xs sm:text-sm text-[#001219]/80 mt-2 max-w-sm">
                  Seus dados foram registrados com sucesso. Para acelerar seu atendimento, inicie a conversa no WhatsApp agora:
                </p>

                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="mt-6 w-full py-4 px-6 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-display font-black text-sm uppercase tracking-wider border-2 border-[#001219] shadow-[4px_4px_0px_#001219] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  <span>Conversar no WhatsApp Agora</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
