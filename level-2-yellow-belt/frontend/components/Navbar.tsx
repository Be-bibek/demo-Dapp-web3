"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Home, LayoutDashboard, Send, Moon, Sun, Wallet, Vault } from "lucide-react";
import { useTheme } from "next-themes";
import { useWalletStore } from "@/store/walletStore";

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { publicKey, connect, disconnect } = useWalletStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const links = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/transfer", icon: Send, label: "Transfer" },
    { href: "/vault", icon: Vault, label: "Vault" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] md:w-auto flex justify-center">
      <motion.div 
        className="glass rounded-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between md:justify-center gap-2 md:gap-6 w-full md:w-auto"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="flex items-center gap-1 md:gap-4">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            
            return (
              <Link key={link.href} href={link.href} className="relative group">
                <motion.div
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-xl transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Icon size={24} className="w-5 h-5 md:w-6 md:h-6" />
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>

        <div className="w-px h-6 md:h-8 bg-border mx-1 md:mx-2 hidden sm:block" />

        <div className="flex items-center gap-2 md:gap-4">
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {mounted ? (
              theme === 'dark' ? <Sun className="w-5 h-5 md:w-6 md:h-6" /> : <Moon className="w-5 h-5 md:w-6 md:h-6" />
            ) : (
              <div className="w-5 h-5 md:w-6 md:h-6" />
            )}
          </motion.button>

          {/* Wallet Connect */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={publicKey ? disconnect : connect}
            className={`flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-full font-bold text-xs md:text-sm transition-all shadow-lg ${
              publicKey 
                ? 'bg-secondary text-secondary-foreground border border-border' 
                : 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-primary/30 hover:shadow-primary/50 border border-transparent'
            }`}
          >
            <Wallet size={16} />
            <span className="hidden sm:inline">
              {publicKey ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}` : 'Connect'}
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
