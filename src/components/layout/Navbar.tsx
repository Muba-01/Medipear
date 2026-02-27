"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Zap, Bell, Menu, X, LogOut, User, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { shortenAddress } from "@/lib/utils";

export default function Navbar() {
  const { isAuthenticated, isLoading, walletAddress, login, logout, error } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loginPending, setLoginPending] = useState(false);

  const handleLogin = async () => {
    setLoginPending(true);
    await login();
    setLoginPending(false);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 border-b"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}>
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-bold text-base hidden sm:block" style={{ color: "var(--foreground)" }}>
            MedPear
          </span>
        </Link>

        {/* Search bar */}
        <div className="flex-1 max-w-xl hidden md:block">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all"
            style={{
              background: "var(--surface-2)",
              borderColor: searchFocused ? "#7c3aed" : "var(--border)",
            }}>
            <Search size={14} style={{ color: "var(--muted)" }} />
            <input
              type="text"
              placeholder="Search communities and posts..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="bg-transparent outline-none text-sm w-full"
              style={{ color: "var(--foreground)" }}
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated && (
            <Link
              href="/create"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border hover:bg-white/5 transition-all"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
              <Plus size={13} />
              Create
            </Link>
          )}

          {isAuthenticated && (
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors">
              <Bell size={16} style={{ color: "var(--muted)" }} />
            </button>
          )}

          {/* Auth area */}
          {isLoading ? (
            <div
              className="w-24 h-8 rounded-lg animate-pulse"
              style={{ background: "var(--surface-2)" }}
            />
          ) : isAuthenticated && walletAddress ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors border"
                style={{ borderColor: "var(--border)" }}>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}>
                  {walletAddress.slice(2, 4).toUpperCase()}
                </div>
                <span className="text-sm hidden md:block" style={{ color: "var(--foreground)" }}>
                  {shortenAddress(walletAddress)}
                </span>
              </button>

              {dropdownOpen && (
                <>
                  <button
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                    style={{ background: "transparent" }}
                  />
                  <div
                    className="absolute right-0 top-full mt-2 w-48 rounded-xl border shadow-2xl z-20 overflow-hidden py-1"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                    <Link
                      href={`/profile/${walletAddress}`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                      style={{ color: "var(--foreground)" }}>
                      <User size={14} style={{ color: "var(--muted)" }} />
                      My Profile
                    </Link>
                    <Link
                      href="/create"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                      style={{ color: "var(--foreground)" }}>
                      <Plus size={14} style={{ color: "var(--muted)" }} />
                      Create Post
                    </Link>
                    <div className="border-t my-1" style={{ borderColor: "var(--border)" }} />
                    <button
                      onClick={async () => {
                        setDropdownOpen(false);
                        await logout();
                      }}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm w-full text-left hover:bg-white/5 transition-colors"
                      style={{ color: "#f87171" }}>
                      <LogOut size={14} />
                      Disconnect
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={handleLogin}
              disabled={loginPending}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}>
              {loginPending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Zap size={13} />
              )}
              {loginPending ? "Connecting..." : "Connect Wallet"}
            </button>
          )}

          <button
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? (
              <X size={16} style={{ color: "var(--muted)" }} />
            ) : (
              <Menu size={16} style={{ color: "var(--muted)" }} />
            )}
          </button>
        </div>
      </div>

      {/* Error toast */}
      {error && (
        <div
          className="absolute top-14 left-1/2 -translate-x-1/2 mt-2 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-lg z-50"
          style={{ background: "#dc2626" }}>
          {error}
        </div>
      )}

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden px-4 py-3 border-t"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border mb-3"
            style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
            <Search size={14} style={{ color: "var(--muted)" }} />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm w-full"
              style={{ color: "var(--foreground)" }}
            />
          </div>
          <nav className="flex flex-col gap-1">
            {[
              { href: "/", label: "Home" },
              { href: "/explore", label: "Explore" },
              ...(isAuthenticated ? [{ href: "/create", label: "Create Post" }] : []),
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors"
                style={{ color: "var(--foreground)" }}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
