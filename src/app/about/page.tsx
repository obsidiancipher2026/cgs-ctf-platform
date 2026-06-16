'use client';

import { motion } from 'framer-motion';
import { ChevronRight, Linkedin, Github, MessageCircle, Mail } from 'lucide-react';

const sections = [
  {
    title: 'Who We Are',
    content: 'In this new world, one that is riddled with secrets and hidden paths and adversaries, Cyber Guardians Society was formed for the people who will not be spectators anymore. Cyber Guardians Society consists of people from all walks of life who are united in their passion and dedication towards discovering something that others miss. Our aim is to take you out of your comfort zones through realistic attacks and challenges.',
    color: '#00d4ff',
  },
  {
    title: 'Our Mission',
    content: 'Every vulnerability tells a story. Our mission is to create an environment where aspiring and experienced security enthusiasts can sharpen their skills through authentic cyber warfare simulations. We believe cybersecurity is not learned from slides and textbooks alone. It is mastered through exploration, experimentation, and discovery. By blending education with competition, we prepare the next generation of defenders to navigate an increasingly complex digital battlefield.',
    color: '#7b2ff7',
  },
  {
    title: 'Enter The Arena',
    content: 'Not every challenge is what it seems. Hidden throughout the platform are secrets waiting to be uncovered. Each challenge conceals a flag, a piece of digital proof that confirms your success. To find it, you\'ll need to think differently, analyze carefully, and sometimes venture down paths others overlook. Every solved challenge reveals another layer of the puzzle. Every flag brings you one step closer to mastery.',
    color: '#00ff88',
  },
  {
    title: 'The Challenges',
    content: 'Behind every system lies a weakness. Our challenge ecosystem covers multiple cybersecurity domains, each designed to test a unique skillset: Cryptography — Ancient ciphers. Modern encryption. Hidden messages waiting to be revealed. Web Exploitation — Discover flaws buried beneath seemingly secure applications. Reverse Engineering — Dissect binaries, unravel logic, and expose hidden functionality. Digital Forensics — Follow the evidence, reconstruct events, and uncover the truth. Miscellaneous — Expect the unexpected. Some puzzles refuse to fit neatly into categories.',
    color: '#ffd700',
  },
  {
    title: 'Beyond Competition',
    content: 'Knowledge grows strongest when shared. Cyber Guardians Society is more than a platform. It is a gathering place for explorers, researchers, and problem-solvers who thrive on curiosity. Exchange ideas, discuss techniques, learn from others, and contribute to a community built around continuous growth. The leaderboard measures progress. The journey measures expertise.',
    color: '#ff2d79',
  },
  {
    title: 'Begin Your Journey',
    content: 'Every expert was once staring at their first challenge. Start with the easier missions, learn the fundamentals, and gradually unlock more difficult objectives. When the path forward becomes unclear, hints can illuminate the next step, but true satisfaction comes from discovering the answer yourself. Some challenges test your knowledge. Others test your persistence. The question is simple: How deep are you willing to go?',
    color: '#00f0ff',
  },
];

export default function About() {
  return (
    <div className="min-h-screen py-8 sm:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 sm:mb-16"
        >
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyber-cyan/30 bg-cyber-cyan/5 mb-6">
            <span className="text-cyber-cyan font-mono text-xs tracking-widest uppercase">About Us</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-cyber font-black text-white mb-4">
            About CGS
          </h1>
          <p className="text-gray-400 font-mono text-sm sm:text-base max-w-2xl mx-auto">
            Empowering the next generation of cybersecurity professionals through competitive challenges and community-driven learning.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, i) => {
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="cyber-card-glow rounded-xl p-4 sm:p-5 group"
                style={{ borderLeft: `3px solid ${section.color}` }}
              >
                <div className="min-w-0">
                  <motion.h2
                    className="font-cyber text-white text-base sm:text-lg mb-2"
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {section.title}
                  </motion.h2>
                  <p className="text-gray-400 font-mono text-xs sm:text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">{section.content}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Platform Developers Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-cyber font-bold text-white mb-8">Platform Developers</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-8 items-center">
            <motion.div
              className="cyber-card-glow rounded-2xl p-6 sm:p-8 w-72 flex flex-col items-center"
              whileHover={{ y: -8 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <motion.div
                className="w-24 h-24 rounded-full overflow-hidden mb-4 shadow-lg shadow-cyber-cyan/20 ring-2 ring-cyber-cyan/50"
                whileHover={{ scale: 1.08, boxShadow: '0 0 40px rgba(0, 229, 255, 0.3)' }}
              >
                <img src="/images/shayan-ahmed.jpeg" alt="Shayan Ahmed" className="w-full h-full object-cover img-glow" />
              </motion.div>
              <h3 className="font-cyber text-white text-lg font-bold">Shayan Ahmed</h3>
              <p className="text-cyber-cyan font-mono text-xs mt-1">Founder &amp; Organizer</p>
              <p className="text-gray-500 font-mono text-xs mt-3 max-w-[200px]">Building and maintaining the CTF platform infrastructure</p>
              <div className="flex items-center justify-center gap-3 mt-3">
                <a href="https://github.com/OperationZero-GHH" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors"><Github className="w-4 h-4" /></a>
                <a href="https://wa.me/923261458036" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-cyber-green transition-colors"><MessageCircle className="w-4 h-4" /></a>
                <a href="https://www.linkedin.com/in/shayanahmedmughal" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-cyber-cyan transition-colors"><Linkedin className="w-4 h-4" /></a>
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=sakingplays@gmail.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-cyber-red transition-colors"><Mail className="w-4 h-4" /></a>
              </div>
            </motion.div>
            <motion.div
              className="cyber-card-glow rounded-2xl p-6 sm:p-8 w-72 flex flex-col items-center"
              whileHover={{ y: -8 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <motion.div
                className="w-24 h-24 rounded-full overflow-hidden mb-4 shadow-lg shadow-cyber-red/20 ring-2 ring-orange-500/50"
                whileHover={{ scale: 1.08, boxShadow: '0 0 40px rgba(255, 0, 51, 0.3)' }}
              >
                <img src="/images/muhammad-saad.jpeg" alt="Muhammad Saad" className="w-full h-full object-cover img-glow" />
              </motion.div>
              <h3 className="font-cyber text-white text-lg font-bold">Muhammad Saad</h3>
              <p className="text-orange-400 font-mono text-xs mt-1">Challenges and Platform Security Organizer</p>
              <p className="text-gray-500 font-mono text-xs mt-3 max-w-[200px]">Designing challenges and ensuring platform security</p>
              <div className="flex items-center justify-center gap-3 mt-3">
                <a href="https://github.com/saad-838" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors"><Github className="w-4 h-4" /></a>
                <a href="https://wa.me/923272243678" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-cyber-green transition-colors"><MessageCircle className="w-4 h-4" /></a>
                <a href="https://www.linkedin.com/in/muhammad-saad-13ab46298/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-cyber-cyan transition-colors"><Linkedin className="w-4 h-4" /></a>
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=mrgill2792@gmail.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-cyber-red transition-colors"><Mail className="w-4 h-4" /></a>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="cyber-card-glow rounded-xl p-6 sm:p-8 mt-8 text-center"
        >
          <h2 className="font-cyber text-white text-lg sm:text-xl mb-4">
            Ready to <span className="text-cyber-green text-glow-green">join</span> the fight?
          </h2>
          <p className="text-gray-400 font-mono text-sm mb-6 max-w-lg mx-auto">
            Register now and start your journey. Every expert was once a beginner.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/register"
              className="cyber-btn cyber-btn-ripple inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyber-cyan/20 to-cyber-purple/20 border border-cyber-cyan/50 text-white font-cyber text-sm hover:from-cyber-cyan/30 hover:to-cyber-purple/30 hover:shadow-[0_0_30px_rgba(0,229,255,0.2)] transition-all duration-300"
            >
              Get Started
              <ChevronRight className="w-4 h-4" />
            </a>
            <a
              href="/scoreboard"
              className="cyber-btn cyber-btn-ripple inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-cyber-cyan/20 text-cyber-cyan font-cyber text-sm hover:bg-cyber-cyan/10 hover:border-cyber-cyan/50 transition-all duration-300"
            >
              View Leaderboard
            </a>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="mt-12 border-t border-cyber-cyan/10 pt-8 pb-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
              <div className="text-center sm:text-left">
                <h3 className="font-cyber font-bold text-sm text-white mb-3">Cyber Guardians Society</h3>
                <p className="text-gray-500 font-mono text-xs leading-relaxed">Empowering the next generation of cybersecurity professionals through competitive CTF challenges.</p>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-cyber font-bold text-sm text-white mb-3">Quick Links</h3>
                <div className="flex flex-col gap-2">
                  <a href="/" className="text-gray-500 font-mono text-xs hover:text-cyber-cyan transition-colors">Home</a>
                  <a href="/about" className="text-gray-500 font-mono text-xs hover:text-cyber-cyan transition-colors">About</a>
                  <a href="/announcements" className="text-gray-500 font-mono text-xs hover:text-cyber-cyan transition-colors">Announcements</a>
                  <a href="/challenges" className="text-gray-500 font-mono text-xs hover:text-cyber-cyan transition-colors">Challenges</a>
                  <a href="/scoreboard" className="text-gray-500 font-mono text-xs hover:text-cyber-cyan transition-colors">Scoreboard</a>
                </div>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-cyber font-bold text-sm text-white mb-3">Subscribe to Updates</h3>
                <div className="flex gap-2">
                  <input type="email" placeholder="your@email.com" className="cyber-input flex-1 px-3 py-2 rounded-lg font-mono text-xs min-w-0" />
                  <button className="px-4 py-2 rounded-lg bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan font-mono text-xs hover:bg-cyber-cyan/30 transition-all whitespace-nowrap">
                    Subscribe
                  </button>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-4">
                  <a href="https://www.linkedin.com/in/shayanahmedmughal" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-cyber-cyan transition-colors"><Linkedin className="w-5 h-5" /></a>
                  <a href="https://chat.whatsapp.com/DUvTs6TiEEj2CwTfG7eG9n" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-cyber-green transition-colors"><MessageCircle className="w-5 h-5" /></a>
                </div>
              </div>
            </div>
            <div className="border-t border-cyber-cyan/5 pt-4 text-center">
              <p className="text-gray-600 font-mono text-[10px]">&copy; 2026 Cyber Guardians Society. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
