import React, { useState } from 'react';
import { ArrowLeft, Lock, User, KeyRound } from 'lucide-react';
import { Logo } from './Logo';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToHome }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      // Demo authentication rule: accepts admin / admin123 or non-empty for smooth sales demo
      if (
        (username.trim().toLowerCase() === 'admin' && password === 'admin123') ||
        (username.trim().length > 0 && password.length >= 4)
      ) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('elchicano_admin_auth', 'true');
        }
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setError('Usuário ou senha incorretos. Use admin / admin123 para testar.');
      }
    }, 400);
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#FAF5E8] text-[#001219] flex flex-col justify-between relative overflow-hidden selection:bg-[#EE9B00] selection:text-[#001219] px-4 py-8">
      
      {/* Background Texture & Warm Ambient Glow */}
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
          <span>Voltar ao Site</span>
        </button>
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
              Painel Gestão
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            {error && (
              <div className="p-3 rounded-xl bg-[#AE2012]/10 border-2 border-[#AE2012] text-[#AE2012] font-mono text-xs text-center font-bold">
                {error}
              </div>
            )}

            {/* Username Input */}
            <div>
              <label className="block font-mono text-[11px] uppercase font-bold text-[#001219] mb-1.5">
                Usuário / Identificação
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#001219]/50" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF5E8] border-2 border-[#001219] text-xs font-sans text-[#001219] focus:outline-none focus:border-[#EE9B00] shadow-[2px_2px_0px_#001219] transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block font-mono text-[11px] uppercase font-bold text-[#001219] mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#001219]/50" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF5E8] border-2 border-[#001219] text-xs font-sans text-[#001219] focus:outline-none focus:border-[#EE9B00] shadow-[2px_2px_0px_#001219] transition-colors"
                />
              </div>
            </div>

            {/* Demo Credentials Helper */}
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-left font-mono text-[10px] text-[#005F73] hover:text-[#CA6702] transition-colors flex items-center gap-1.5 cursor-pointer pt-1 font-bold"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Usar credenciais de demonstração (admin / admin123)</span>
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full py-4 px-6 rounded-2xl bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-sm uppercase tracking-wider border-3 border-[#001219] shadow-[6px_6px_0px_#001219] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isLoading ? 'Autenticando...' : 'Acessar Painel'}</span>
            </button>
          </form>

        </div>
      </main>

      {/* Footer copyright */}
      <footer className="relative z-10 text-center font-mono text-[10px] text-[#001219]/40 uppercase tracking-widest font-semibold">
        El Chicano Gastronomia Mexicana • Todos os direitos reservados
      </footer>

    </div>
  );
};
