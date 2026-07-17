import { Background1 } from "@/components/Background1";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex-1 flex flex-col items-center justify-center min-h-screen overflow-hidden">
      <Background1 />
      
      <div className="z-10 flex flex-col items-center text-center space-y-8 max-w-4xl px-6">
        <div className="glass px-6 py-2 rounded-full inline-flex items-center gap-2 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium text-primary">Stellar Testnet Live</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
          The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Web3 Treasury</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          Manage your XLM, execute fast swaps, and track your transactions securely on the Stellar network.
        </p>
        
        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
          <Link href="/dashboard" className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 hover:scale-105 transition-all flex items-center gap-2">
            Enter App <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}
