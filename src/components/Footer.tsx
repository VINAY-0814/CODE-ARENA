import React from 'react';
import { Code2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-[#211A28] bg-[#17131C]/90 text-[#A1A1AA] text-xs py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#A855F7] flex items-center justify-center">
                <Code2 className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-mono text-sm font-bold text-[#FAFAFA] tracking-tight">
                CodeArena
              </span>
            </div>
            <p className="text-[#A1A1AA] text-xs leading-relaxed">
              Gamified coding challenge platform. Code, compete in real-time 1v1 battles, earn XP, maintain streaks, and conquer developer leaderboards.
            </p>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="text-[#FAFAFA] font-semibold mb-3 text-xs tracking-wider uppercase">Platform</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('challenges')} className="hover:text-[#FAFAFA] transition-colors">
                  Challenges
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('battle')} className="hover:text-[#FAFAFA] transition-colors">
                  1v1 Coding Battle
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('leaderboard')} className="hover:text-[#FAFAFA] transition-colors">
                  Global Leaderboard
                </button>
              </li>
            </ul>
          </div>

          {/* Learning & Categories */}
          <div>
            <h4 className="text-[#FAFAFA] font-semibold mb-3 text-xs tracking-wider uppercase">Categories</h4>
            <ul className="space-y-2 text-[#A1A1AA]">
              <li>Arrays &amp; Strings</li>
              <li>Dynamic Programming</li>
              <li>Stacks &amp; Queues</li>
              <li>Trees &amp; Graphs</li>
              <li>Algorithms &amp; Math</li>
            </ul>
          </div>

          {/* Architecture */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs tracking-wider uppercase">Architecture</h4>
            <p className="text-neutral-500 text-xs leading-relaxed mb-2">
              Engineered with the MEAN Stack (MongoDB, Express.js, Angular, Node.js) and secure sandboxed code execution.
            </p>
            <div className="flex items-center gap-2 text-neutral-400 font-mono text-[11px]">
              <span>MongoDB</span> · <span>Express</span> · <span>Node</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <p>© {new Date().getFullYear()} CodeArena. “Code. Compete. Conquer.” All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-neutral-300 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-neutral-300 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-neutral-300 transition-colors cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
