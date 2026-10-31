import React, { useState } from 'react';
import { ArrowLeft, Lock, User, ShieldCheck, AlertCircle } from 'lucide-react';
import { Logo } from './Logo';
import { verifyPassword, createSessionToken, getActiveAdminHash } from '../utils/security';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToHome }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLocked) {
      setError('Acesso bloqueado temporariamente por excesso de tentativas. Aguarde 60 segundos.');
      return;
    }

    if (!username.trim() || !password) {
      setError('Por favor, preencha o usuário e a senha de acesso.');
      return;
    }

    setIsLoading(true);

    try {
      const activeHash = getActiveAdminHash();
      const isValid = await verifyPassword(password, activeHash);

      // Verify username (standardized administrative handle)
      const isUserValid = username.trim().toLowerCase() === 'admin' || username.trim().toLowerCase() === 'elchicano';

      if (isValid && isUserValid) {
        // Generate cryptographic signed session token
        await createSessionToken(username.trim().toLowerCase());
        setFailedAttempts(0);
        setIsLoading(false);
        onLoginSuccess();
      } else {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);

        if (nextAttempts >= 5) {
          setIsLocked(true);
          setError('Múltiplas tentativas incorretas. Bloqueio de segurança ativado por 60 segundos.');
          setTimeout(() => {
            setIsLocked(false);
            setFailedAttempts(0);
            setError('');
          }, 60000);
        } else {
          setError(`Credenciais inválidas. Verifique os dados digitados (${5 - nextAttempts} tentativas restantes).`);
        }
        setIsLoading(false);
      }
    } catch {
      setIsLoading(false);
      setError('Erro interno de validação criptográfica. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5E8] text-[#001219] flex flex-col justify-between relative overflow-hidden selection:bg-[#EE9B00] selection:text-[#001219] px-4 py-8">
      {/* Background Texture & Ambient Glow */}
      <div
        className="fixed inset-0 bg-cover bg-center pointer-events-none opacity-[0.04] mix-blend-multiply"
        style={{ backgroundImage: "url('/images/sections/texture-rupestre.webp')" }}
      />
      <div className="fixed top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#EE9B00]/10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-10 left-10 w-[500px] h-[500px] rounded-full bg-[#005F73]/10 blur-[140px] pointer-events-none" />

      {/* Top Bar with Back Button */}
      <header className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#EE9B00] text-[#001219] border-2 border-[#001219] font-mono text-xs uppercase font-bold transition-all cursor-pointer shadow-[3px_3px_0px_#001219] hover:-translate-x-0.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Início</span>
        </button>

        <div className="flex items-center gap-2 font-mono text-[10px] text-[#001219]/60 font-bold uppercase tracking-wider bg-white/80 border-2 border-[#001219]/20 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0A9396]" />
          <span>Autenticação PBKDF2 Criptografada</span>
        </div>
      </header>

      {/* Center Login Box */}
      <main className="relative z-10 max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-white border-4 border-[#001219] rounded-[2.5rem] p-8 sm:p-10 shadow-[10px_10px_0px_#001219] flex flex-col relative">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Logo className="h-16 w-auto" />
            </div>

            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase text-[#001219] tracking-tight">
              El Chicano
            </h1>

            <p className="font-mono text-xs uppercase font-bold text-[#CA6702] tracking-widest mt-1">
              Painel de Gestão Operacional
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            {error && (
              <div className="p-3.5 rounded-xl bg-[#AE2012]/10 border-2 border-[#AE2012] text-[#AE2012] font-mono text-xs font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Input */}
            <div>
              <label htmlFor="admin-username" className="block font-mono text-[11px] uppercase font-bold text-[#001219] mb-1.5">
                Identificação do Administrador
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#001219]/50" />
                <input
                  id="admin-username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  disabled={isLoading || isLocked}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF5E8] border-2 border-[#001219] text-xs font-sans text-[#001219] focus:outline-none focus:border-[#EE9B00] shadow-[2px_2px_0px_#001219] transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="admin-password" className="block font-mono text-[11px] uppercase font-bold text-[#001219] mb-1.5">
                Chave Secreta de Acesso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#001219]/50" />
                <input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isLoading || isLocked}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF5E8] border-2 border-[#001219] text-xs font-sans text-[#001219] focus:outline-none focus:border-[#EE9B00] shadow-[2px_2px_0px_#001219] transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isLocked}
              className="mt-4 w-full py-4 px-6 rounded-2xl bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-sm uppercase tracking-wider border-3 border-[#001219] shadow-[6px_6px_0px_#001219] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isLoading ? 'Validando Hash...' : isLocked ? 'Bloqueado Temporariamente' : 'Entrar no Sistema'}</span>
            </button>
          </form>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="relative z-10 text-center font-mono text-[10px] text-[#001219]/40 uppercase tracking-widest font-semibold">
        El Chicano Mexican Food • Protegido por Criptografia de Ponta
      </footer>
    </div>
  );
};
