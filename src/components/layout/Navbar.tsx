"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
<<<<<<< HEAD
import { Search, Zap, Bell, Menu, X, LogOut, User, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
=======
import { Search, Zap, Bell, Menu, X, LogOut, User, Plus, Sun, Moon, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
import { shortenAddress } from "@/lib/utils";
import Image from "next/image";
import CreateCommunityModal from "@/components/community/CreateCommunityModal";
import AuthModal from "@/components/layout/AuthModal";
<<<<<<< HEAD
import { Users } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated, isLoading, walletAddress, userId, username, avatarUrl, provider, login, logout, error } = useAuth();
=======

export default function Navbar() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isLoading, walletAddress, userId, username, avatarUrl, provider, login, logout, error, walletNeedsVerification, walletNotice, dismissWalletNotice } = useAuth();
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
  const displayName = username ?? (walletAddress ? shortenAddress(walletAddress) : null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loginPending, setLoginPending] = useState(false);
  const [createCommunityOpen, setCreateCommunityOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSearch = (value: string) => {
    const q = value.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
    setShowSuggestions(false);
  };

  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSearchSuggestions([]);
      return;
    }

    setSuggestionsLoading(true);
    try {
      const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchSuggestions(data);
      } else {
        setSearchSuggestions([]);
      }
    } catch (error) {
      console.error('Failed to fetch search suggestions:', error);
      setSearchSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue.trim()) {
        fetchSuggestions(searchValue);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // Debounce for 300ms

    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
<<<<<<< HEAD
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
=======
        <Link href="/" className="flex items-center gap-2 shrink-0">
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center relative"
            style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}>
            <img
              src="/medipear-logo.svg"
              alt="Medipear"
              className="w-5 h-5"
            />
          </div>
          <span className="font-bold text-base hidden sm:block" style={{ color: "var(--foreground)" }}>
            Medipear
          </span>
        </Link>

        {/* Search bar */}
        <div className="flex-1 max-w-xl hidden md:block relative" ref={searchRef}>
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
              onChange={(e) => {
                setSearchValue(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                setSearchFocused(true);
                if (searchValue.trim()) setShowSuggestions(true);
              }}
              onBlur={() => setSearchFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch(searchValue);
                if (e.key === "Escape") setShowSuggestions(false);
              }}
              className="bg-transparent outline-none text-sm w-full"
              style={{ color: "var(--foreground)" }}
            />
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && (searchSuggestions.length > 0 || suggestionsLoading) && (
            <div
              className="absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-2xl z-50 overflow-hidden"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              {suggestionsLoading ? (
                <div className="px-4 py-3 text-sm" style={{ color: "var(--muted)" }}>
                  Searching...
                </div>
              ) : searchSuggestions.length > 0 ? (
                <div className="max-h-80 overflow-y-auto">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (suggestion.type === 'community') {
                          router.push(`/p/${suggestion.slug}`);
                        } else {
                          router.push(`/post/${suggestion.id}`);
                        }
                        setShowSuggestions(false);
                        setSearchValue("");
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b last:border-b-0"
                      style={{ borderColor: "var(--border)" }}>
                      <div className="flex items-center gap-3">
                        {suggestion.type === 'community' ? (
                          <>
                            <span className="text-lg">{suggestion.iconUrl || "🍐"}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate" style={{ color: "var(--foreground)" }}>
                                🍐/{suggestion.slug}
                              </div>
                              <div className="text-sm truncate" style={{ color: "var(--muted)" }}>
                                {suggestion.description || "Community"}
                              </div>
                            </div>
                            <div className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
                              {suggestion.membersCount} members
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-8 h-8 rounded bg-purple-500/10 flex items-center justify-center">
                              <Search size={14} style={{ color: "#a78bfa" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate" style={{ color: "var(--foreground)" }}>
                                {suggestion.title}
                              </div>
                              <div className="text-sm truncate" style={{ color: "var(--muted)" }}>
                                Post in 🍐/{suggestion.community?.slug}
                              </div>
                            </div>
                            <div className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
                              {suggestion.upvotes - suggestion.downvotes} votes
                            </div>
                          </>
                        )}
                      </div>
                    </button>
                  ))}
                  <div className="px-4 py-2 border-t" style={{ borderColor: "var(--border)" }}>
                    <button
                      onClick={() => handleSearch(searchValue)}
                      className="w-full text-left text-sm hover:bg-white/5 px-2 py-1 rounded transition-colors"
                      style={{ color: "var(--accent)" }}>
                      Search for "{searchValue}" →
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
<<<<<<< HEAD
=======
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-lg border hover:bg-white/5 transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>

>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
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
            <div className="w-24 h-8 rounded-lg animate-pulse" style={{ background: "var(--surface-2)" }} />
          ) : isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors border"
                style={{ borderColor: "var(--border)" }}>
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={displayName ?? ""} width={24} height={24} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}>
                    {(displayName ?? "?").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="text-sm hidden md:block" style={{ color: "var(--foreground)" }}>
                  {displayName}
                </span>
              </button>

              {dropdownOpen && (
                <>
                  <button className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} style={{ background: "transparent" }} />
                  <div
                    className="absolute right-0 top-full mt-2 w-52 rounded-xl border shadow-2xl z-20 overflow-hidden py-1"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                    <div className="px-4 py-2.5 border-b" style={{ borderColor: "var(--border)" }}>
                      <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{displayName}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                        {provider === "google" ? "Google" : "Wallet"} account
                      </p>
                    </div>
                    <Link
                      href={`/profile/${walletAddress ?? userId}`}
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
                    <button
                      onClick={() => { setDropdownOpen(false); setCreateCommunityOpen(true); }}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm w-full text-left hover:bg-white/5 transition-colors"
                      style={{ color: "var(--foreground)" }}>
                      <Users size={14} style={{ color: "var(--muted)" }} />
                      Create Community
                    </button>
                    <div className="border-t my-1" style={{ borderColor: "var(--border)" }} />
                    <button
                      onClick={async () => { setDropdownOpen(false); await logout(); }}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm w-full text-left hover:bg-white/5 transition-colors"
                      style={{ color: "#f87171" }}>
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogin}
                disabled={loginPending}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border hover:bg-white/5 transition-all disabled:opacity-60"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                {loginPending ? (
                  <span className="w-3.5 h-3.5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                ) : (
                  <Zap size={13} style={{ color: "#a78bfa" }} />
                )}
                {loginPending ? "Connecting..." : "Connect Wallet"}
              </button>
              <button
                onClick={() => { setAuthModalMode("signin"); setAuthModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}>
                Sign In
              </button>
            </div>
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

<<<<<<< HEAD
=======
      {walletNeedsVerification && walletNotice && (
        <div
          className="absolute top-14 left-1/2 -translate-x-1/2 mt-2 w-[min(92vw,560px)] rounded-lg border px-4 py-3 shadow-xl z-50"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            <p className="text-sm flex-1" style={{ color: "var(--foreground)" }}>
              {walletNotice}
            </p>
            <button
              onClick={handleLogin}
              disabled={loginPending}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60"
              style={{ background: "var(--brand-gradient)", color: "var(--text-on-accent)" }}>
              {loginPending ? "Verifying..." : "Verify Wallet"}
            </button>
            <button
              onClick={dismissWalletNotice}
              className="px-2 py-1 rounded text-xs theme-hover-surface"
              style={{ color: "var(--muted)" }}>
              Dismiss
            </button>
          </div>
        </div>
      )}

>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setMobileMenuOpen(false);
                  handleSearch((e.target as HTMLInputElement).value);
                }
              }}
            />
          </div>
          <nav className="flex flex-col gap-1">
<<<<<<< HEAD
=======
            <button
              onClick={toggleTheme}
              className="px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors text-left"
              style={{ color: "var(--foreground)" }}>
              {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </button>
>>>>>>> 285550973379e98ffdd5e0ae52763a57b765120a
            {[
              { href: "/", label: "Home" },
              { href: "/explore", label: "Explore" },
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
            {isAuthenticated && (
              <Link
                href="/create"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors"
                style={{ color: "var(--foreground)" }}>
                Create Post
              </Link>
            )}
            {isAuthenticated && (
              <button
                onClick={() => { setMobileMenuOpen(false); setCreateCommunityOpen(true); }}
                className="px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors text-left"
                style={{ color: "var(--foreground)" }}>
                Create Community
              </button>
            )}
          </nav>
        </div>
      )}

      <CreateCommunityModal isOpen={createCommunityOpen} onClose={() => setCreateCommunityOpen(false)} />
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
      />
    </header>
  );
}
