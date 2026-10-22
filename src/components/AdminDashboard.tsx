import React, { useState, useEffect } from 'react';
import { 
  getFranchiseLeads, 
  updateFranchiseLeadStatus, 
  FranchiseLead, 
  getD1GalleryPosts, 
  saveD1GalleryPost, 
  clearD1GallerySlot,
  D1GalleryPost,
  getFranchiseVideoConfig,
  saveFranchiseVideoConfig,
  clearFranchiseVideoConfig,
  FranchiseVideoConfig
} from '../services/d1Api';
import { 
  Users, 
  ExternalLink, 
  Save, 
  RefreshCw, 
  Search, 
  Download, 
  Image as ImageIcon, 
  Video as VideoIcon,
  Phone,
  Mail,
  MapPin,
  Clock,
  LogOut,
  Video,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Lock,
  Upload,
  Smartphone,
  Laptop,
  Trash2,
  Sparkles
} from 'lucide-react';
import { 
  saveMediaToDB, 
  compressImage, 
  extractVideoThumbnail 
} from '../utils/mediaStorage';
import { subscribeRealtime } from '../utils/realtime';
import { InstagramIcon as Instagram, WhatsAppIcon } from './Icons';
import { Logo } from './Logo';
import { AdminLogin } from './AdminLogin';
import { 
  getActiveSessionToken, 
  verifySessionToken, 
  destroySession, 
  verifyPassword, 
  updateAdminPassword, 
  getActiveAdminHash 
} from '../utils/security';

interface AdminDashboardProps {
  onBackToHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToHome }) => {
  // Authentication Guard with Cryptographic Session Token Verification
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(getActiveSessionToken());
  });

  const [activeTab, setActiveTab] = useState<'leads' | 'gallery' | 'video' | 'security'>('leads');
  const [leads, setLeads] = useState<FranchiseLead[]>([]);
  const [galleryPosts, setGalleryPosts] = useState<D1GalleryPost[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [leadFilter, setLeadFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected slot for editing in gallery
  const [activeSlotNumber, setActiveSlotNumber] = useState<number>(1);
  const [slotForm, setSlotForm] = useState<D1GalleryPost>({
    slot_number: 1,
    type: 'photo',
    media_url: '',
    thumbnail_url: '',
    permalink: 'https://www.instagram.com/elchicanofloripa/',
    caption: '',
    is_active: 1,
  });
  const [saveStatus, setSaveStatus] = useState<string>('');

  // Franchise Video Configuration
  const [videoConfig, setVideoConfig] = useState<FranchiseVideoConfig>({
    isEnabled: false,
    videoUrl: '',
    posterUrl: '',
    title: 'Apresentação do Modelo El Chicano',
  });
  const [videoSaveStatus, setVideoSaveStatus] = useState<string>('');

  // Media File Upload States (Mobile & Desktop)
  const [isUploadingSlot, setIsUploadingSlot] = useState(false);
  const [slotFileNote, setSlotFileNote] = useState<string>('');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoFileNote, setVideoFileNote] = useState<string>('');
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [posterFileNote, setPosterFileNote] = useState<string>('');

  // Security & Password Change State
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdStatus, setPwdStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });
  const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);

  // Validate active cryptographic session on mount
  useEffect(() => {
    async function validateSession() {
      const token = getActiveSessionToken();
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      const verified = await verifySessionToken(token);
      if (!verified.valid) {
        destroySession();
        setIsAuthenticated(false);
      }
    }
    validateSession();
  }, []);

  // Load leads, gallery posts and video configuration
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }

    // Real-time synchronization subscription
    const unsubGallery = subscribeRealtime('GALLERY_UPDATED', (updatedPosts) => {
      if (Array.isArray(updatedPosts)) {
        setGalleryPosts(updatedPosts);
      }
    });

    const unsubVideo = subscribeRealtime('FRANCHISE_VIDEO_UPDATED', (cfg) => {
      if (cfg) {
        setVideoConfig(cfg);
      }
    });

    return () => {
      unsubGallery();
      unsubVideo();
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    destroySession();
    setIsAuthenticated(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdStatus({ type: '', message: '' });

    if (!pwdCurrent) {
      setPwdStatus({ type: 'error', message: 'Informe a senha atual de acesso.' });
      return;
    }

    if (pwdNew.length < 8) {
      setPwdStatus({ type: 'error', message: 'A nova senha deve possuir pelo menos 8 caracteres.' });
      return;
    }

    if (pwdNew !== pwdConfirm) {
      setPwdStatus({ type: 'error', message: 'A confirmação de senha não confere com a nova senha digitada.' });
      return;
    }

    setIsUpdatingPwd(true);

    try {
      const activeHash = getActiveAdminHash();
      const isCurrentValid = await verifyPassword(pwdCurrent, activeHash);

      if (!isCurrentValid) {
        setPwdStatus({ type: 'error', message: 'A senha atual informada está incorreta.' });
        setIsUpdatingPwd(false);
        return;
      }

      await updateAdminPassword(pwdNew);
      setPwdCurrent('');
      setPwdNew('');
      setPwdConfirm('');
      setPwdStatus({ 
        type: 'success', 
        message: 'Senha alterada com sucesso! O novo hash PBKDF2 com salt aleatório foi registrado com segurança.' 
      });
      setIsUpdatingPwd(false);
    } catch (err: any) {
      setPwdStatus({ type: 'error', message: err?.message || 'Erro ao atualizar senha.' });
      setIsUpdatingPwd(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <AdminLogin
        onLoginSuccess={() => setIsAuthenticated(true)}
        onBackToHome={onBackToHome}
      />
    );
  }

  const loadData = async () => {
    setIsLoadingLeads(true);
    try {
      const [leadsData, postsData, vConfig] = await Promise.all([
        getFranchiseLeads(),
        getD1GalleryPosts(),
        getFranchiseVideoConfig(),
      ]);
      setLeads(leadsData);
      setGalleryPosts(postsData);
      setVideoConfig(vConfig);

      // Sync currently active slot with loaded data
      const currentActive = postsData.find((p) => Number(p.slot_number) === activeSlotNumber);
      if (currentActive) {
        setSlotForm(currentActive);
      } else {
        const slot1 = postsData.find((p) => Number(p.slot_number) === 1);
        if (slot1) setSlotForm(slot1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const handleStatusChange = async (id: number | string, newStatus: string) => {
    await updateFranchiseLeadStatus(id, newStatus);
    setLeads((prev) => prev.map((l) => (String(l.id) === String(id) ? { ...l, status: newStatus as any } : l)));
  };

  const handleSelectSlot = (slotNum: number) => {
    setActiveSlotNumber(slotNum);
    setSlotFileNote('');
    const existing = galleryPosts.find((p) => p.slot_number === slotNum);
    if (existing) {
      setSlotForm(existing);
    } else {
      setSlotForm({
        slot_number: slotNum,
        type: 'photo',
        media_url: '',
        thumbnail_url: '',
        permalink: 'https://www.instagram.com/elchicanofloripa/',
        caption: `Publicação do Slot #${slotNum}`,
        is_active: 1,
      });
    }
    setSaveStatus('');
  };

  const handleFileUploadSlot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingSlot(true);
    setSlotFileNote('Processando mídia...');

    try {
      const isVideo = file.type.startsWith('video') || Boolean(file.name.match(/\.(mp4|mov|webm|m4v)$/i));

      if (isVideo) {
        setSlotFileNote('Extraindo miniatura e processando vídeo...');
        const thumbDataUrl = await extractVideoThumbnail(file);
        const { url, sizeMb } = await saveMediaToDB(
          `slot_${activeSlotNumber}`,
          file,
          file.name
        );

        setSlotForm((prev) => ({
          ...prev,
          type: 'video',
          media_url: url,
          thumbnail_url: thumbDataUrl || url,
        }));
        setSlotFileNote(`Vídeo importado: ${file.name} (${sizeMb} MB)`);
      } else {
        setSlotFileNote('Otimizando imagem para alta performance...');
        const { blob, dataUrl, sizeMb } = await compressImage(file, 1600, 1600, 0.85);
        await saveMediaToDB(
          `slot_${activeSlotNumber}`,
          blob,
          file.name,
          dataUrl
        );

        setSlotForm((prev) => ({
          ...prev,
          type: 'photo',
          media_url: dataUrl,
          thumbnail_url: dataUrl,
        }));
        setSlotFileNote(`Foto importada: ${file.name} (${sizeMb} MB)`);
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      setSlotFileNote(`Erro ao importar: ${err?.message || 'Tente novamente'}`);
    } finally {
      setIsUploadingSlot(false);
      e.target.value = '';
    }
  };

  const handleFileUploadFranchiseVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    setVideoFileNote('Processando e salvando vídeo...');

    try {
      const thumbDataUrl = await extractVideoThumbnail(file);
      const { url, sizeMb } = await saveMediaToDB('franchise_video', file, file.name);

      if (thumbDataUrl) {
        await saveMediaToDB('franchise_video_poster', file, 'poster_auto.webp', thumbDataUrl);
      }

      setVideoConfig((prev) => ({
        ...prev,
        isEnabled: true,
        videoUrl: url,
        posterUrl: prev.posterUrl || thumbDataUrl,
      }));

      setVideoFileNote(`Vídeo carregado: ${file.name} (${sizeMb} MB)`);
    } catch (err: any) {
      console.error('Video upload error:', err);
      setVideoFileNote('Erro ao importar vídeo. Tente outro arquivo.');
    } finally {
      setIsUploadingVideo(false);
      e.target.value = '';
    }
  };

  const handleFileUploadFranchisePoster = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPoster(true);
    setPosterFileNote('Otimizando imagem de capa...');

    try {
      const { blob, dataUrl, sizeMb } = await compressImage(file, 1920, 1080, 0.85);
      await saveMediaToDB('franchise_video_poster', blob, file.name, dataUrl);

      setVideoConfig((prev) => ({
        ...prev,
        posterUrl: dataUrl,
      }));

      setPosterFileNote(`Capa importada: ${file.name} (${sizeMb} MB)`);
    } catch (err: any) {
      console.error('Poster upload error:', err);
      setPosterFileNote('Erro ao importar capa.');
    } finally {
      setIsUploadingPoster(false);
      e.target.value = '';
    }
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotForm.media_url) {
      alert('Informe a URL da imagem ou vídeo ou selecione um arquivo.');
      return;
    }

    setSaveStatus('Salvando...');
    try {
      const updatedPost: D1GalleryPost = {
        ...slotForm,
        slot_number: activeSlotNumber,
        updated_at: new Date().toISOString(),
      };

      // 1. Instant 0ms Optimistic Update for Admin UI
      setGalleryPosts((prev) => {
        const filtered = prev.filter((p) => Number(p.slot_number) !== activeSlotNumber);
        return [...filtered, updatedPost].sort((a, b) => Number(a.slot_number) - Number(b.slot_number));
      });

      // 2. Persist to storage & broadcast in real-time
      await saveD1GalleryPost(updatedPost);

      setSaveStatus('Salvo com sucesso!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch {
      setSaveStatus('Erro ao salvar');
    }
  };

  const handleClearSlot = async () => {
    const confirmClear = window.confirm(
      `Deseja realmente zerar e limpar o Slot #${activeSlotNumber}?\n\nA imagem/vídeo e a legenda serão excluídos e o slot voltará ao estado vazio no site imediatamente.`
    );
    if (!confirmClear) return;

    setSaveStatus('Zerando slot...');
    try {
      await clearD1GallerySlot(activeSlotNumber);

      const blankSlot: D1GalleryPost = {
        slot_number: activeSlotNumber,
        type: 'photo',
        media_url: '',
        thumbnail_url: '',
        permalink: 'https://www.instagram.com/elchicanofloripa/',
        caption: '',
        is_active: 0,
      };

      setSlotForm(blankSlot);
      setSlotFileNote('');

      // Immediate 0ms local state update
      setGalleryPosts((prev) => {
        const filtered = prev.filter((p) => Number(p.slot_number) !== activeSlotNumber);
        return [...filtered, blankSlot].sort((a, b) => Number(a.slot_number) - Number(b.slot_number));
      });

      setSaveStatus(`Slot #${activeSlotNumber} zerado com sucesso!`);
      setTimeout(() => setSaveStatus(''), 3500);
    } catch {
      setSaveStatus('Erro ao zerar slot.');
    }
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setVideoSaveStatus('Salvando...');
    try {
      await saveFranchiseVideoConfig(videoConfig);
      setVideoSaveStatus('Vídeo atualizado com sucesso no site!');
      setTimeout(() => setVideoSaveStatus(''), 3000);
    } catch {
      setVideoSaveStatus('Erro ao salvar vídeo');
    }
  };

  const handleClearVideo = async () => {
    const confirmClear = window.confirm(
      'Deseja realmente excluir o vídeo da franquia?\n\nO arquivo de vídeo e a capa serão apagados do sistema e o bloco será desativado no site em tempo real.'
    );
    if (!confirmClear) return;

    setVideoSaveStatus('Excluindo vídeo...');
    try {
      await clearFranchiseVideoConfig();

      setVideoConfig({
        isEnabled: false,
        videoUrl: '',
        posterUrl: '',
        title: 'Apresentação do Modelo El Chicano',
      });
      setVideoFileNote('');
      setPosterFileNote('');

      setVideoSaveStatus('Vídeo da franquia excluído com sucesso!');
      setTimeout(() => setVideoSaveStatus(''), 3500);
    } catch {
      setVideoSaveStatus('Erro ao excluir vídeo.');
    }
  };


  const exportLeadsCSV = () => {
    if (leads.length === 0) return;
    const headers = ['ID', 'Nome', 'WhatsApp', 'Email', 'Cidade', 'UF', 'Capital', 'Status', 'Data'];
    const rows = leads.map((l) => [
      l.id,
      `"${l.name}"`,
      `"${l.phone}"`,
      `"${l.email}"`,
      `"${l.city}"`,
      `"${l.state}"`,
      `"${l.capital}"`,
      `"${l.status || 'novo'}"`,
      `"${l.created_at || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads-franquia-elchicano-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter((l) => {
    const matchesFilter = leadFilter === 'all' || (l.status || 'novo') === leadFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || 
      l.name?.toLowerCase().includes(query) || 
      l.city?.toLowerCase().includes(query) || 
      l.email?.toLowerCase().includes(query) ||
      l.phone?.includes(query);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF5E8] text-[#001219] flex flex-col md:flex-row relative selection:bg-[#EE9B00] selection:text-[#001219]">
      
      {/* Background Texture & Warm Ambient Glow (Matches FranchisePage) */}
      <div 
        className="fixed inset-0 bg-cover bg-center pointer-events-none opacity-[0.03] mix-blend-multiply"
        style={{ backgroundImage: "url('/images/sections/texture-rupestre.webp')" }}
      />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#EE9B00]/10 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#005F73]/10 blur-[140px] pointer-events-none" />

      {/* SIDEBAR NAVIGATION (Desktop & Mobile Responsive) */}
      <aside className="w-full md:w-72 bg-white border-b-4 md:border-b-0 md:border-r-4 border-[#001219] p-4 sm:p-6 flex flex-col justify-between shrink-0 z-20 shadow-[4px_0px_0px_#001219]">
        <div>
          {/* Brand Header with Clean Logo */}
          <div className="flex items-center justify-between md:justify-start gap-3.5 mb-6 md:mb-8 pb-4 md:pb-6 border-b-2 border-[#001219]/10">
            <div className="flex items-center gap-3">
              <div className="h-12 w-auto flex items-center justify-center shrink-0">
                <Logo className="h-11 w-auto" />
              </div>
              <div className="flex flex-col text-left">
                <h2 className="font-display font-black text-lg uppercase text-[#001219] leading-none tracking-tight">
                  El Chicano
                </h2>
                <p className="font-mono text-xs uppercase font-bold text-[#CA6702] tracking-wider mt-1">
                  Painel Gestão
                </p>
              </div>
            </div>

            {/* Quick Mobile Logout Action */}
            <button
              type="button"
              onClick={handleLogout}
              className="md:hidden p-2.5 rounded-xl bg-[#FAF5E8] hover:bg-[#AE2012]/15 text-[#AE2012] border-2 border-[#001219] text-xs font-mono transition-colors shadow-sm"
              title="Encerrar Sessão"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-row md:flex-col gap-2.5 overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab('leads')}
              className={`flex-1 md:w-full flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl font-mono text-xs uppercase font-bold transition-all cursor-pointer border-2 shrink-0 ${
                activeTab === 'leads'
                  ? 'bg-[#EE9B00] text-[#001219] border-[#001219] shadow-[3px_3px_0px_#001219]'
                  : 'bg-[#FAF5E8] text-[#001219]/70 border-[#001219]/15 hover:border-[#001219] hover:bg-white hover:text-[#001219]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Leads Franquia</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'leads' ? 'bg-[#001219] text-[#EE9B00]' : 'bg-white text-[#001219] border border-[#001219]/20'
              }`}>
                {leads.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('gallery')}
              className={`flex-1 md:w-full flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl font-mono text-xs uppercase font-bold transition-all cursor-pointer border-2 shrink-0 ${
                activeTab === 'gallery'
                  ? 'bg-[#EE9B00] text-[#001219] border-[#001219] shadow-[3px_3px_0px_#001219]'
                  : 'bg-[#FAF5E8] text-[#001219]/70 border-[#001219]/15 hover:border-[#001219] hover:bg-white hover:text-[#001219]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                <span>Feed Instagram</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white text-[#001219] border border-[#001219]/20">
                7 Slots
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('video')}
              className={`flex-1 md:w-full flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl font-mono text-xs uppercase font-bold transition-all cursor-pointer border-2 shrink-0 ${
                activeTab === 'video'
                  ? 'bg-[#EE9B00] text-[#001219] border-[#001219] shadow-[3px_3px_0px_#001219]'
                  : 'bg-[#FAF5E8] text-[#001219]/70 border-[#001219]/15 hover:border-[#001219] hover:bg-white hover:text-[#001219]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                <span>Vídeo Franquia</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                videoConfig.isEnabled ? 'bg-[#0A9396] text-white border border-[#001219]' : 'bg-white text-[#001219]/50 border border-[#001219]/20'
              }`}>
                {videoConfig.isEnabled ? 'Ativo' : 'Oculto'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`flex-1 md:w-full flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl font-mono text-xs uppercase font-bold transition-all cursor-pointer border-2 shrink-0 ${
                activeTab === 'security'
                  ? 'bg-[#EE9B00] text-[#001219] border-[#001219] shadow-[3px_3px_0px_#001219]'
                  : 'bg-[#FAF5E8] text-[#001219]/70 border-[#001219]/15 hover:border-[#001219] hover:bg-white hover:text-[#001219]'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#005F73]" />
                <span>Segurança & Senha</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white text-[#001219] border border-[#001219]/20">
                PBKDF2
              </span>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom Actions (Desktop Only - Logout Only, No Voltar ao Site) */}
        <div className="pt-4 md:pt-6 border-t-2 border-[#001219]/10 mt-4 md:mt-6 hidden md:flex flex-col gap-2">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[#AE2012] hover:bg-[#AE2012]/10 border-2 border-[#AE2012]/30 hover:border-[#AE2012] bg-[#FAF5E8] font-mono text-xs uppercase font-bold transition-all cursor-pointer shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-8 md:p-10 overflow-y-auto max-h-screen">
        
        {/* ================================================================= */}
        {/* TAB 1: LEADS DE FRANQUIA */}
        {/* ================================================================= */}
        {activeTab === 'leads' && (
          <div className="max-w-6xl mx-auto flex flex-col gap-6">
            
            {/* Header & Export Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#001219]/10 text-left">
              <div>
                <span className="font-mono text-[10px] text-[#CA6702] uppercase font-bold tracking-widest">
                  Gestão Comercial
                </span>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-[#001219] uppercase">
                  Leads de Prospecção de Franquia
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadData}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF5E8] text-[#001219] border-2 border-[#001219] shadow-[2px_2px_0px_#001219] font-mono text-xs uppercase font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Recarregar"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Atualizar</span>
                </button>

                <button
                  type="button"
                  onClick={exportLeadsCSV}
                  disabled={leads.length === 0}
                  className="px-4 py-2 rounded-xl bg-[#0A9396] hover:bg-[#94D2BD] text-white hover:text-[#001219] border-2 border-[#001219] shadow-[3px_3px_0px_#001219] font-mono text-xs uppercase font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar CSV</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border-2 border-[#001219] shadow-[4px_4px_0px_#001219]">
              
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#001219]/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nome, cidade, email ou telefone..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAF5E8] border-2 border-[#001219]/20 text-xs font-sans text-[#001219] placeholder:text-[#001219]/40 focus:outline-none focus:border-[#EE9B00]"
                />
              </div>

              {/* Status filter tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                {['all', 'novo', 'em_contato', 'qualificado', 'negociacao', 'fechado'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setLeadFilter(status)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase font-bold whitespace-nowrap transition-all cursor-pointer ${
                      leadFilter === status
                        ? 'bg-[#EE9B00] text-[#001219] font-black border-2 border-[#001219] shadow-[2px_2px_0px_#001219]'
                        : 'bg-[#FAF5E8] text-[#001219]/70 border border-[#001219]/15 hover:border-[#001219] hover:text-[#001219]'
                    }`}
                  >
                    {status === 'all' ? 'Todos' : status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Leads List / Responsive Cards */}
            {isLoadingLeads ? (
              <div className="py-16 text-center text-xs font-mono text-[#005F73]">
                Carregando leads...
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border-3 border-[#001219] shadow-[6px_6px_0px_#001219] p-8">
                <p className="font-display font-black text-xl text-[#001219] uppercase">Nenhum lead encontrado</p>
                <p className="font-sans text-xs text-[#001219]/60 mt-1">
                  Os interessados que preencherem o formulário na página de franquia aparecerão aqui automaticamente.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {filteredLeads.map((lead) => {
                  const whatsappClean = (lead.phone || '').replace(/\D/g, '');
                  const whatsappLink = `https://wa.me/55${whatsappClean}?text=${encodeURIComponent(
                    `Olá ${lead.name}! Sou especialista de expansão da Franquia El Chicano. Vi seu interesse para a região de ${lead.city}-${lead.state}. Podemos conversar?`
                  )}`;

                  return (
                    <div 
                      key={lead.id}
                      className="bg-white border-3 border-[#001219] hover:border-[#EE9B00] rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-all shadow-[4px_4px_0px_#001219] hover:-translate-y-0.5"
                    >
                      {/* Left: Contact Info */}
                      <div className="flex flex-col gap-1 text-left w-full lg:w-auto">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-display font-black text-lg text-[#001219]">
                            {lead.name}
                          </h4>
                          <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded-md bg-[#FAF5E8] border border-[#001219]/20 text-[#005F73] font-bold">
                            {lead.capital}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-sans text-[#001219]/75 mt-1">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Phone className="w-3.5 h-3.5 text-[#CA6702]" />
                            {lead.phone}
                          </span>
                          <span className="flex items-center gap-1.5 font-medium">
                            <Mail className="w-3.5 h-3.5 text-[#005F73]" />
                            {lead.email}
                          </span>
                          <span className="flex items-center gap-1.5 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-[#CA6702]" />
                            {lead.city} / {lead.state}
                          </span>
                          {lead.created_at && (
                            <span className="flex items-center gap-1.5 text-[11px] font-mono text-[#001219]/50">
                              <Clock className="w-3 h-3" />
                              {new Date(lead.created_at).toLocaleDateString('pt-BR')} às {new Date(lead.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions and Status Selector */}
                      <div className="flex items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-[#001219]/10">
                        <select
                          value={lead.status || 'novo'}
                          onChange={(e) => handleStatusChange(lead.id!, e.target.value)}
                          className="bg-[#FAF5E8] border-2 border-[#001219] rounded-xl px-3 py-1.5 font-mono text-xs uppercase font-bold text-[#001219] focus:outline-none focus:border-[#EE9B00] shadow-[2px_2px_0px_#001219]"
                        >
                          <option value="novo">🟢 Novo</option>
                          <option value="em_contato">🟡 Em Contato</option>
                          <option value="qualificado">🔵 Qualificado</option>
                          <option value="negociacao">🟣 Negociação</option>
                          <option value="fechado">🏆 Fechado</option>
                          <option value="descartado">⚪ Descartado</option>
                        </select>

                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-mono text-xs uppercase font-black flex items-center gap-1.5 transition-all border-2 border-[#001219] shadow-[2px_2px_0px_#001219] hover:shadow-[3px_3px_0px_#001219]"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: FEED INSTAGRAM (7 SLOTS QUE ALIMENTAM A GALERIA) */}
        {/* ================================================================= */}
        {activeTab === 'gallery' && (
          <div className="max-w-6xl mx-auto flex flex-col gap-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#001219]/10 text-left">
              <div>
                <span className="font-mono text-[10px] text-[#005F73] uppercase font-bold tracking-widest">
                  Gestão Visual & Mídia
                </span>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-[#001219] uppercase">
                  Feed Instagram (7 Slots Dinâmicos)
                </h2>
                <p className="font-sans text-xs text-[#001219]/70 mt-1">
                  Cadastre e edite as fotos, vídeos, legendas e links oficiais de cada um dos 7 slots que alimentam a galeria do site em tempo real.
                </p>
              </div>
            </div>

            {/* Slot Selector Strip (1 to 7) - Mobile Touch Friendly */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                const isCurrent = activeSlotNumber === num;
                const slotData = galleryPosts.find((p) => p.slot_number === num);
                const hasMedia = Boolean(slotData?.media_url);

                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleSelectSlot(num)}
                    className={`p-3 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-[#EE9B00] text-[#001219] border-[#001219] shadow-[4px_4px_0px_#001219] scale-102 font-bold'
                        : hasMedia
                        ? 'bg-white text-[#001219] border-2 border-[#001219] shadow-[2px_2px_0px_#001219] hover:border-[#EE9B00]'
                        : 'bg-[#FAF5E8] text-[#001219]/60 border-2 border-dashed border-[#001219]/30 hover:border-[#001219]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase font-black">
                        Slot #{String(num).padStart(2, '0')}
                      </span>
                      {hasMedia && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0A9396] border border-[#001219]" title="Mídia ativa" />
                      )}
                    </div>
                    <p className="font-sans text-xs font-bold mt-2 truncate">
                      {slotData?.caption || (hasMedia ? 'Preenchido' : 'Vazio')}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Slot Edit Form & Live Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white p-5 sm:p-8 rounded-3xl border-3 border-[#001219] shadow-[6px_6px_0px_#001219]">
              
              {/* Form Column */}
              <form onSubmit={handleSaveSlot} className="lg:col-span-7 flex flex-col gap-4 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-xl text-[#001219] uppercase">
                    Configurando Slot #{String(activeSlotNumber).padStart(2, '0')}
                  </h3>
                  <span className="font-mono text-[10px] text-[#005F73] uppercase font-bold">
                    Alimenta @elchicanofloripa
                  </span>
                </div>


                {/* File Upload from Computer or Mobile Phone */}
                <div className="bg-[#FAF5E8] border-2 border-dashed border-[#001219]/35 hover:border-[#001219] rounded-2xl p-4 sm:p-5 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] uppercase font-black text-[#001219] flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-[#CA6702]" />
                      Importar do Celular ou Computador
                    </span>
                    <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded-full bg-white border border-[#001219]/20 text-[#005F73] font-bold">
                      Galeria / Câmera / Arquivos
                    </span>
                  </div>

                  <p className="font-sans text-xs text-[#001219]/70 mb-3">
                    Selecione uma foto ou vídeo diretamente do seu smartphone ou computador. O arquivo é otimizado automaticamente para carregar instantaneamente.
                  </p>

                  <label className="w-full flex flex-col items-center justify-center py-4 px-4 bg-white hover:bg-[#EE9B00]/10 border-2 border-[#001219] rounded-xl shadow-[3px_3px_0px_#001219] hover:shadow-[4px_4px_0px_#001219] cursor-pointer transition-all group">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUploadSlot}
                      disabled={isUploadingSlot}
                      className="hidden"
                    />
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#FAF5E8] border border-[#001219] flex items-center justify-center text-[#CA6702] group-hover:scale-105 transition-transform">
                        <Smartphone className="w-4 h-4 sm:hidden" />
                        <Laptop className="w-4 h-4 hidden sm:block" />
                      </div>
                      <div className="text-left">
                        <span className="font-display font-black text-xs uppercase text-[#001219] block group-hover:text-[#CA6702] transition-colors">
                          {isUploadingSlot ? 'Processando arquivo...' : 'Escolher Foto ou Vídeo'}
                        </span>
                        <span className="font-mono text-[10px] text-[#001219]/50 block">
                          Toque para abrir a galeria ou câmera
                        </span>
                      </div>
                    </div>
                  </label>

                  {slotFileNote && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-white border border-[#001219]/20 text-left flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-[#0A9396] flex items-center gap-1.5 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        {slotFileNote}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSlotForm((prev) => ({ ...prev, media_url: '', thumbnail_url: '' }));
                          setSlotFileNote('');
                        }}
                        className="text-[#AE2012] hover:text-black p-1 transition-colors"
                        title="Remover mídia"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Media URL (Optional / Direct Link / CDN) */}
                <div>
                  <label className="block font-mono text-[11px] uppercase font-bold text-[#001219] mb-1">
                    Ou cole uma URL Externa (Opcional se já importou o arquivo acima)
                  </label>
                  <input
                    type="text"
                    value={slotForm.media_url.startsWith('data:') || slotForm.media_url.startsWith('blob:') ? '' : slotForm.media_url}
                    onChange={(e) => {
                      const val = e.target.value;
                      const isVideo = Boolean(val.match(/\.(mp4|mov|webm|m4v)(\?.*)?$/i));
                      setSlotForm((prev) => ({ 
                        ...prev, 
                        media_url: val,
                        type: isVideo ? 'video' : 'photo'
                      }));
                      setSlotFileNote('');
                    }}
                    placeholder={slotForm.media_url ? 'Arquivo já importado pelo dispositivo (ou cole nova URL)' : 'https://sua-cdn.com/foto.jpg ou /images/...'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5E8] border-2 border-[#001219]/25 text-xs font-sans text-[#001219] focus:outline-none focus:border-[#EE9B00] shadow-[2px_2px_0px_#001219]"
                  />
                </div>

                {/* Redirect Link (Instagram Permalink) */}
                <div>
                  <label className="block font-mono text-[11px] uppercase font-bold text-[#001219] mb-1">
                    Link de Redirecionamento (Post Oficial do Instagram)
                  </label>
                  <input
                    type="url"
                    value={slotForm.permalink || ''}
                    onChange={(e) => setSlotForm((prev) => ({ ...prev, permalink: e.target.value }))}
                    placeholder="https://www.instagram.com/p/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5E8] border-2 border-[#001219]/25 text-xs font-sans text-[#001219] focus:outline-none focus:border-[#EE9B00] shadow-[2px_2px_0px_#001219]"
                  />
                </div>

                {/* Caption / Description */}
                <div>
                  <label className="block font-mono text-[11px] uppercase font-bold text-[#001219] mb-1">
                    Legenda do Post
                  </label>
                  <input
                    type="text"
                    value={slotForm.caption || ''}
                    onChange={(e) => setSlotForm((prev) => ({ ...prev, caption: e.target.value }))}
                    placeholder="Legenda da publicação oficial..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5E8] border-2 border-[#001219]/25 text-xs font-sans text-[#001219] focus:outline-none focus:border-[#EE9B00] shadow-[2px_2px_0px_#001219]"
                  />
                </div>

                {/* Actions: Save & Clear / Delete */}
                <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="submit"
                    className="py-3.5 px-6 rounded-2xl bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-xs uppercase tracking-wider border-3 border-[#001219] shadow-[4px_4px_0px_#001219] hover:shadow-[6px_6px_0px_#001219] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Slot #{activeSlotNumber}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearSlot}
                    className="py-3.5 px-6 rounded-2xl bg-[#FAF5E8] hover:bg-[#AE2012] text-[#AE2012] hover:text-white font-display font-black text-xs uppercase tracking-wider border-3 border-[#AE2012] hover:border-[#001219] shadow-[4px_4px_0px_#AE2012] hover:shadow-[6px_6px_0px_#001219] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    title={`Limpar e zerar o conteúdo do Slot #${activeSlotNumber}`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Zerar / Excluir Slot #{activeSlotNumber}</span>
                  </button>

                  {saveStatus && (
                    <span className="font-mono text-xs text-[#0A9396] font-bold text-center sm:text-left">
                      {saveStatus}
                    </span>
                  )}
                </div>
              </form>

              {/* Preview Column */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <p className="font-mono text-[11px] uppercase font-bold text-[#001219] mb-2 text-left">
                  Preview em Tempo Real no Site
                </p>

                <div className="bg-[#001219] border-4 border-[#001219] rounded-3xl overflow-hidden shadow-[6px_6px_0px_#001219] flex flex-col">
                  <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
                    {slotForm.media_url ? (
                      slotForm.type === 'video' ? (
                        <video
                          src={slotForm.media_url}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={slotForm.media_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/products/el-chicano-246.webp';
                          }}
                        />
                      )
                    ) : (
                      <div className="p-6 text-center text-white/40 font-mono text-xs">
                        Cole uma URL de mídia para ver o preview do card
                      </div>
                    )}

                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-black/70 text-[#94D2BD] font-mono text-[9px] uppercase font-bold flex items-center gap-1.5 border border-white/10">
                        <Instagram className="w-3 h-3 text-[#EE9B00]" />
                        <span>Slot #{String(activeSlotNumber).padStart(2, '0')}</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#001f2d] flex items-center justify-between text-left text-xs font-sans">
                    <p className="text-white/80 line-clamp-1">{slotForm.caption || 'Sem legenda cadastrada'}</p>
                    <ExternalLink className="w-3.5 h-3.5 text-white/50 shrink-0 ml-2" />
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: VÍDEO DE APRESENTAÇÃO DA FRANQUIA */}
        {/* ================================================================= */}
        {activeTab === 'video' && (
          <div className="max-w-4xl mx-auto flex flex-col gap-6 text-left">
            
            {/* Header */}
            <div className="pb-4 border-b-2 border-[#001219]/10">
              <span className="font-mono text-[10px] text-[#CA6702] uppercase font-bold tracking-widest">
                Controle de Mídia
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-[#001219] uppercase">
                Vídeo de Apresentação da Franquia
              </h2>
              <p className="font-sans text-xs text-[#001219]/70 mt-1">
                Ative ou desative o vídeo e defina a URL do vídeo que será exibido aos interessados na página de conversão.
              </p>
            </div>

            {/* Video Settings Form */}
            <form onSubmit={handleSaveVideo} className="bg-white p-6 sm:p-8 rounded-3xl border-3 border-[#001219] shadow-[6px_6px_0px_#001219] flex flex-col gap-5">
              
              {/* Enable / Disable Switch */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF5E8] border-2 border-[#001219]/20">
                <div>
                  <h4 className="font-display font-bold text-sm text-[#001219] uppercase">
                    Exibir Vídeo na Página de Conversão
                  </h4>
                  <p className="font-sans text-xs text-[#001219]/60 mt-0.5">
                    Quando desativado, a página foca 100% no título de impacto e botão direto para o especialista.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setVideoConfig((prev) => ({ ...prev, isEnabled: !prev.isEnabled }))}
                  className={`w-14 h-8 rounded-full p-1 transition-colors border-2 border-[#001219] cursor-pointer shadow-[2px_2px_0px_#001219] ${
                    videoConfig.isEnabled
                      ? 'bg-[#0A9396]'
                      : 'bg-[#001219]/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      videoConfig.isEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Video File Import from Computer or Mobile */}
              <div className="bg-[#FAF5E8] border-2 border-dashed border-[#001219]/35 hover:border-[#001219] rounded-2xl p-5 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[11px] uppercase font-black text-[#001219] flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-[#CA6702]" />
                    Importar Vídeo do Computador ou Celular
                  </span>
                  <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded-full bg-white border border-[#001219]/20 text-[#005F73] font-bold">
                    Vídeo Nativo
                  </span>
                </div>

                <p className="font-sans text-xs text-[#001219]/70 mb-3">
                  Selecione o arquivo de vídeo (.mp4, .mov, .webm) do seu celular ou computador. O sistema extrai a capa do primeiro frame automaticamente!
                </p>

                <label className="w-full flex flex-col items-center justify-center py-4 px-4 bg-white hover:bg-[#EE9B00]/10 border-2 border-[#001219] rounded-xl shadow-[3px_3px_0px_#001219] hover:shadow-[4px_4px_0px_#001219] cursor-pointer transition-all group">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUploadFranchiseVideo}
                    disabled={isUploadingVideo}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FAF5E8] border border-[#001219] flex items-center justify-center text-[#CA6702] group-hover:scale-105 transition-transform">
                      <Smartphone className="w-4 h-4 sm:hidden" />
                      <Laptop className="w-4 h-4 hidden sm:block" />
                    </div>
                    <div className="text-left">
                      <span className="font-display font-black text-xs uppercase text-[#001219] block group-hover:text-[#CA6702] transition-colors">
                        {isUploadingVideo ? 'Processando e gravando vídeo...' : 'Selecionar Arquivo de Vídeo'}
                      </span>
                      <span className="font-mono text-[10px] text-[#001219]/50 block">
                        Toque para abrir seus vídeos (MP4, MOV, WebM)
                      </span>
                    </div>
                  </div>
                </label>

                {videoFileNote && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-white border border-[#001219]/20 text-left flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-[#0A9396] flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      {videoFileNote}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setVideoConfig((prev) => ({ ...prev, videoUrl: '' }));
                        setVideoFileNote('');
                      }}
                      className="text-[#AE2012] hover:text-black p-1 transition-colors"
                      title="Remover vídeo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Video URL (Optional fallback) */}
              <div>
                <label className="block font-mono text-[11px] uppercase font-bold text-[#001219] mb-1.5">
                  Ou URL Externa do Vídeo (Link direto .mp4, CDN, YouTube, Vimeo)
                </label>
                <input
                  type="text"
                  value={videoConfig.videoUrl.startsWith('data:') || videoConfig.videoUrl.startsWith('blob:') ? '' : videoConfig.videoUrl}
                  onChange={(e) => {
                    setVideoConfig((prev) => ({ ...prev, videoUrl: e.target.value }));
                    setVideoFileNote('');
                  }}
                  placeholder={videoConfig.videoUrl ? 'Vídeo já importado pelo dispositivo (ou cole nova URL)' : 'https://sua-cdn.com/videos/apresentacao-franquia.mp4'}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF5E8] border-2 border-[#001219]/25 text-xs font-sans text-[#001219] focus:outline-none focus:border-[#EE9B00] shadow-[2px_2px_0px_#001219]"
                />
              </div>

              {/* Poster / Capa File Import */}
              <div className="bg-[#FAF5E8] border-2 border-dashed border-[#001219]/35 hover:border-[#001219] rounded-2xl p-5 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[11px] uppercase font-black text-[#001219] flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-[#005F73]" />
                    Importar Foto de Capa (Poster) do Celular ou Computador
                  </span>
                </div>

                <p className="font-sans text-xs text-[#001219]/70 mb-3">
                  (Opcional) Escolha uma foto de capa personalizada para ser exibida antes do usuário dar play.
                </p>

                <label className="w-full flex flex-col items-center justify-center py-3.5 px-4 bg-white hover:bg-[#005F73]/10 border-2 border-[#001219] rounded-xl shadow-[3px_3px_0px_#001219] hover:shadow-[4px_4px_0px_#001219] cursor-pointer transition-all group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUploadFranchisePoster}
                    disabled={isUploadingPoster}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF5E8] border border-[#001219] flex items-center justify-center text-[#005F73]">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="font-display font-black text-xs uppercase text-[#001219] block">
                        {isUploadingPoster ? 'Comprimindo capa...' : 'Escolher Foto de Capa'}
                      </span>
                    </div>
                  </div>
                </label>

                {posterFileNote && (
                  <div className="mt-2.5 p-2 rounded-xl bg-white border border-[#001219]/20 text-left flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-[#0A9396] flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      {posterFileNote}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setVideoConfig((prev) => ({ ...prev, posterUrl: '' }));
                        setPosterFileNote('');
                      }}
                      className="text-[#AE2012] hover:text-black p-1 transition-colors"
                      title="Remover capa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Poster / Thumbnail URL (Optional fallback) */}
              <div>
                <label className="block font-mono text-[11px] uppercase font-bold text-[#001219] mb-1.5">
                  Ou URL Externa da Imagem de Capa (Opcional)
                </label>
                <input
                  type="text"
                  value={videoConfig.posterUrl?.startsWith('data:') || videoConfig.posterUrl?.startsWith('blob:') ? '' : videoConfig.posterUrl}
                  onChange={(e) => {
                    setVideoConfig((prev) => ({ ...prev, posterUrl: e.target.value }));
                    setPosterFileNote('');
                  }}
                  placeholder={videoConfig.posterUrl ? 'Capa já importada pelo dispositivo (ou cole nova URL)' : 'https://sua-cdn.com/images/capa-video.webp'}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF5E8] border-2 border-[#001219]/25 text-xs font-sans text-[#001219] focus:outline-none focus:border-[#EE9B00] shadow-[2px_2px_0px_#001219]"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block font-mono text-[11px] uppercase font-bold text-[#001219] mb-1.5">
                  Título da Apresentação
                </label>
                <input
                  type="text"
                  value={videoConfig.title || ''}
                  onChange={(e) => setVideoConfig((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Apresentação do Modelo de Franquia El Chicano"
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF5E8] border-2 border-[#001219]/25 text-xs font-sans text-[#001219] focus:outline-none focus:border-[#EE9B00] shadow-[2px_2px_0px_#001219]"
                />
              </div>

              {/* Live Video Preview Box */}
              {videoConfig.videoUrl && (
                <div className="bg-[#001219] border-3 border-[#001219] rounded-2xl p-4 shadow-[4px_4px_0px_#001219]">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#94D2BD] mb-2 block">
                    Preview do Vídeo no Site:
                  </span>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                    <video
                      src={videoConfig.videoUrl}
                      poster={videoConfig.posterUrl}
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Actions: Save & Clear / Delete */}
              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="submit"
                  className="py-3.5 px-6 rounded-2xl bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-xs uppercase tracking-wider border-3 border-[#001219] shadow-[4px_4px_0px_#001219] hover:shadow-[6px_6px_0px_#001219] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Configuração de Vídeo</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearVideo}
                  className="py-3.5 px-6 rounded-2xl bg-[#FAF5E8] hover:bg-[#AE2012] text-[#AE2012] hover:text-white font-display font-black text-xs uppercase tracking-wider border-3 border-[#AE2012] hover:border-[#001219] shadow-[4px_4px_0px_#AE2012] hover:shadow-[6px_6px_0px_#001219] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  title="Excluir o arquivo de vídeo e capa da franquia"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir / Zerar Vídeo da Franquia</span>
                </button>

                {videoSaveStatus && (
                  <span className="font-mono text-xs text-[#0A9396] font-bold text-center sm:text-left">
                    {videoSaveStatus}
                  </span>
                )}
              </div>

            </form>

          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: SEGURANÇA & GOVERNANÇA DE SENHA */}
        {/* ================================================================= */}
        {activeTab === 'security' && (
          <div className="max-w-4xl mx-auto flex flex-col gap-6 text-left">
            {/* Header */}
            <div className="pb-4 border-b-2 border-[#001219]/10">
              <span className="font-mono text-[10px] text-[#CA6702] uppercase font-bold tracking-widest">
                Proteção Criptográfica
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-[#001219] uppercase">
                Segurança & Credenciais de Acesso
              </h2>
            </div>

            {/* Architecture Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border-2 border-[#001219] shadow-[3px_3px_0px_#001219]">
                <div className="flex items-center gap-2 text-[#0A9396] mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-mono text-[11px] uppercase font-black">Algoritmo</span>
                </div>
                <p className="font-sans font-bold text-sm text-[#001219]">PBKDF2-HMAC-SHA256</p>
                <p className="font-mono text-[10px] text-[#001219]/60 mt-0.5">100.000 iterações com salt aleatório de 16 bytes</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border-2 border-[#001219] shadow-[3px_3px_0px_#001219]">
                <div className="flex items-center gap-2 text-[#005F73] mb-1">
                  <Lock className="w-4 h-4" />
                  <span className="font-mono text-[11px] uppercase font-black">Sessão Ativa</span>
                </div>
                <p className="font-sans font-bold text-sm text-[#001219]">Token Assinado Digitalmente</p>
                <p className="font-mono text-[10px] text-[#001219]/60 mt-0.5">Expiração automática em 4 horas (sem texto puro)</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border-2 border-[#001219] shadow-[3px_3px_0px_#001219]">
                <div className="flex items-center gap-2 text-[#AE2012] mb-1">
                  <KeyRound className="w-4 h-4" />
                  <span className="font-mono text-[11px] uppercase font-black">Anti-Bruteforce</span>
                </div>
                <p className="font-sans font-bold text-sm text-[#001219]">Bloqueio Inteligente</p>
                <p className="font-mono text-[10px] text-[#001219]/60 mt-0.5">Trava de segurança após 5 falhas consecutivas</p>
              </div>
            </div>

            {/* Change Password Form */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-3 border-[#001219] shadow-[6px_6px_0px_#001219]">
              <h3 className="font-display font-black text-xl text-[#001219] uppercase mb-1">
                Alterar Senha do Administrador
              </h3>
              <p className="font-mono text-xs text-[#001219]/60 mb-6">
                Ao atualizar, um novo salt criptográfico exclusivo será gerado e a nova derivação de chave será salva.
              </p>

              {pwdStatus.message && (
                <div className={`p-4 rounded-2xl border-2 mb-6 font-mono text-xs font-bold flex items-center gap-2 ${
                  pwdStatus.type === 'success' 
                    ? 'bg-[#0A9396]/10 border-[#0A9396] text-[#0A9396]' 
                    : 'bg-[#AE2012]/10 border-[#AE2012] text-[#AE2012]'
                }`}>
                  {pwdStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{pwdStatus.message}</span>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="flex flex-col gap-4 max-w-lg">
                <div>
                  <label className="block font-mono text-[11px] uppercase font-bold text-[#001219] mb-1.5">
                    Senha Atual de Acesso *
                  </label>
                  <input
                    type="password"
                    required
                    value={pwdCurrent}
                    onChange={(e) => setPwdCurrent(e.target.value)}
                    placeholder="Digite a senha atual"
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF5E8] border-2 border-[#001219]/25 text-xs font-sans text-[#001219] focus:outline-none focus:border-[#EE9B00] shadow-[2px_2px_0px_#001219]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase font-bold text-[#001219] mb-1.5">
                    Nova Senha Segura (Mínimo 8 caracteres) *
                  </label>
                  <input
                    type="password"
                    required
                    value={pwdNew}
                    onChange={(e) => setPwdNew(e.target.value)}
                    placeholder="Mínimo 8 caracteres (letras, números, símbolos)"
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF5E8] border-2 border-[#001219]/25 text-xs font-sans text-[#001219] focus:outline-none focus:border-[#EE9B00] shadow-[2px_2px_0px_#001219]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase font-bold text-[#001219] mb-1.5">
                    Confirmar Nova Senha *
                  </label>
                  <input
                    type="password"
                    required
                    value={pwdConfirm}
                    onChange={(e) => setPwdConfirm(e.target.value)}
                    placeholder="Repita exatamente a nova senha"
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF5E8] border-2 border-[#001219]/25 text-xs font-sans text-[#001219] focus:outline-none focus:border-[#EE9B00] shadow-[2px_2px_0px_#001219]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingPwd}
                    className="py-3.5 px-6 rounded-2xl bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-xs uppercase tracking-wider border-3 border-[#001219] shadow-[4px_4px_0px_#001219] hover:shadow-[6px_6px_0px_#001219] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{isUpdatingPwd ? 'Derivando Hash Criptográfico...' : 'Atualizar Chave de Acesso'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
