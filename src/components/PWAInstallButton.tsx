import {Download, X} from 'lucide-react';
import React, {useState} from 'react';
import {usePWAInstall} from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{className?: string}> = ({
  className = '',
}) => {
  const {isInstallable, isInstalled, isIOS, install} = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-md transition-transform active:scale-95 hover:bg-emerald-600 whitespace-nowrap shrink-0 ${className}`}
      >
        <Download className="h-4 w-4 shrink-0" />
        <span>Instalar App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-white/95 px-4 py-2 text-sm font-bold text-slate-800 shadow-md transition-transform active:scale-95 hover:bg-white whitespace-nowrap shrink-0 ${className}`}
        >
          <Download className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Instalar</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-display text-xl font-bold">
                  Instalar no iPad / iPhone
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                1. Toque no botão <strong>Compartilhar</strong> na barra do Safari.
                <br />
                2. Escolha <strong>Adicionar à Tela de Início</strong> para jogar como aplicativo!
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full min-h-[44px] rounded-2xl bg-sky-500 py-2.5 text-sm font-bold text-white hover:bg-sky-600"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
