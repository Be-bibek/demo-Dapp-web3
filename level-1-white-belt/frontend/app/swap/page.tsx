import React from 'react';

export default function SwapPage() {
  return (
    <div className="flex-1 p-6 lg:p-12 w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <h1 className="text-4xl font-bold tracking-tight text-center md:text-left mb-8">Swap Assets</h1>
      
      <div className="glass rounded-3xl p-6 md:p-10 max-w-lg mx-auto relative overflow-hidden shadow-2xl shadow-primary/10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
        
        <form className="space-y-4 relative z-10">
          <div className="space-y-2 p-5 bg-background/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
            <label className="text-sm font-semibold text-muted-foreground">You Pay</label>
            <div className="flex justify-between items-center gap-4">
              <input 
                type="number" 
                placeholder="0.00"
                className="w-full bg-transparent text-4xl font-bold outline-none text-foreground placeholder:text-muted-foreground/50"
              />
              <span className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full font-bold shadow-sm">XLM</span>
            </div>
          </div>

          <div className="flex justify-center -my-6 relative z-20">
            <button type="button" className="p-3 bg-primary text-white border-4 border-background rounded-full hover:scale-110 transition-transform shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
            </button>
          </div>
          
          <div className="space-y-2 p-5 bg-background/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
            <label className="text-sm font-semibold text-muted-foreground">You Receive</label>
            <div className="flex justify-between items-center gap-4">
              <input 
                type="number" 
                placeholder="0.00"
                readOnly
                className="w-full bg-transparent text-4xl font-bold outline-none text-muted-foreground cursor-not-allowed"
              />
              <span className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full font-bold shadow-sm">USDC</span>
            </div>
          </div>
          
          <button type="button" className="w-full py-4 mt-6 bg-gradient-to-r from-primary to-blue-500 text-white font-bold text-lg rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-primary/30">
            Review Swap
          </button>
        </form>
      </div>
    </div>
  );
}
