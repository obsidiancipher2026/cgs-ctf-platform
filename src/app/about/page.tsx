'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Target, Swords, Rocket, Flag, Trophy, Eye, Lock, CheckCircle, AlertTriangle } from 'lucide-react';

const pillars = [
  { icon: Shield, title: 'Who We Are', content: 'Cyber Guardians Society is for people who love solving problems and finding hidden things. We welcome everyone — no matter your background. Our goal is simple: teach you to think like a hacker through real challenges.', accent: 'red' as const },
  { icon: Target, title: 'What We Do', content: 'We believe the best way to learn cybersecurity is by actually doing it. Our platform gives you real practice, not just theory. Train through real hacking simulations and build skills you can actually use.', accent: 'blue' as const },
  { icon: Swords, title: 'How to Play', content: 'Each challenge hides a secret called a flag. Find it and you prove you solved the challenge. It won\'t be easy — you have to look carefully and think outside the box. Every flag you find moves you forward.', accent: 'red' as const },
  { icon: Rocket, title: 'Begin Your Journey', content: 'Start small, learn the basics, and slowly take on harder challenges. If you get stuck, hints are there to help — but try on your own first. Some challenges test your knowledge. Some test how much you don\'t give up.', accent: 'blue' as const },
];

const rules = [
  { icon: Flag, title: 'Flag Format', desc: 'All flags follow the format CGS{...}. Submit the exact flag to earn points for a challenge.', color: 'text-red-core' },
  { icon: Trophy, title: 'Scoring', desc: 'Points are awarded per challenge based on difficulty. Easy=25, Medium=50, Hard=75, Expert=100 bonus blood points.', color: 'text-green-400' },
  { icon: Eye, title: 'No Sharing', desc: 'Do not share flags, solutions, or hints with other players. Collusion will result in disqualification.', color: 'text-yellow-400' },
  { icon: Lock, title: 'Fair Play', desc: 'Only use the provided platform. Do not attack the infrastructure, other users\' accounts, or attempt to bypass security.', color: 'text-purple-400' },
  { icon: CheckCircle, title: 'Account Rules', desc: 'One account per person. Multiple accounts will be banned. Keep your credentials secure and do not share access.', color: 'text-blue-core' },
  { icon: AlertTriangle, title: 'Respect', desc: 'Be respectful to all community members. Harassment, hate speech, or toxic behavior results in immediate removal.', color: 'text-orange-400' },
];

const teamMembers = [
  { name: 'Shayan Ahmed', role: 'Founder / Director', desc: 'Vision and leadership', img: '/images/shayan-ahmed.jpeg', color: 'chip-red' },
  { name: 'Muhammad Saad', role: 'Deputy Lead', desc: 'Coordination and execution', img: '/images/muhammad-saad.jpeg', color: 'chip-blue' },
  { name: 'Muhammad Taha', role: 'Technical Lead', desc: 'Cybersecurity and CTFs', img: '/images/muhammad-taha.jpeg', color: 'chip-blue' },
  { name: 'Esha Javed', role: 'Graphics Design Lead', desc: 'Design and branding', img: '/images/esha-javed.jpeg', color: 'chip-blue' },
  { name: 'Jannat Fatima', role: 'Media & Communications Lead', desc: 'Social media and announcements', img: '/images/jannat-fatima.jpg', color: 'chip-blue' },
  { name: 'Asad Malik', role: 'Event Management Lead', desc: 'Event planning and execution', img: '/images/asad-malik.jpeg', color: 'chip-blue' },
  { name: 'Bisma Noor', role: 'Community & Outreach Lead', desc: 'Engagement and collaborations', img: '/images/bisma-noor.jpeg', color: 'chip-blue' },
];

function stagger(i: number, base = 0.06) {
  return { delay: i * base };
}

export default function About() {
  return (
    <div className="min-h-screen py-8 sm:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Section 1: Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="eyebrow">About Us</span>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-txt-primary mt-3">Who We Are</h1>
          <p className="text-txt-secondary text-sm sm:text-base max-w-2xl mx-auto mt-4 leading-relaxed">
            Cyber Guardians Society is a community-driven cybersecurity platform built for students, by students. We believe the best way to learn security is through hands-on practice — solving real challenges, finding hidden flags, and growing together.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className="chip chip-red">Founded 2024</span>
            <span className="chip chip-blue">Community First</span>
          </div>
        </motion.div>

        <div className="gradient-divider" />

        {/* Section 2: Four Pillars */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <span className="eyebrow">What We Stand For</span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-txt-primary mt-2">Our Core Pillars</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={stagger(i, 0.08)}
              className={`card card-lift p-5 gradient-border-left`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${p.accent === 'red' ? 'bg-red-core/10' : 'bg-blue-core/10'}`}>
                  <p.icon className={`w-5 h-5 ${p.accent === 'red' ? 'text-red-core' : 'text-blue-core'}`} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-txt-primary text-lg mb-1">{p.title}</h2>
                  <p className="text-txt-secondary text-sm leading-relaxed">{p.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="gradient-divider" />

        {/* Section 3: Rules */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <span className="eyebrow">Guidelines</span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-txt-primary mt-2">Platform Rules</h2>
          <p className="text-txt-secondary text-sm max-w-xl mx-auto mt-3">
            Follow these rules to keep the competition fair and enjoyable for everyone.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {rules.map((rule, i) => (
            <motion.div
              key={rule.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={stagger(i, 0.06)}
              className="card card-lift p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-[10px] text-txt-muted font-bold w-5 h-5 flex items-center justify-center rounded-full bg-surface border border-border-c flex-shrink-0">{i + 1}</span>
                <rule.icon className={`w-4 h-4 ${rule.color} flex-shrink-0`} />
                <h3 className="font-display font-bold text-txt-primary text-sm">{rule.title}</h3>
              </div>
              <p className="text-txt-secondary text-xs leading-relaxed">{rule.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="gradient-divider" />

        {/* Section 4: Team — Hierarchy Tree */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <span className="eyebrow">Command Structure</span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-txt-primary mt-2">Meet the Team</h2>
          <p className="text-txt-secondary text-sm max-w-xl mx-auto mt-3">
            The people behind CGS CTF — building, designing, and running it all.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="tree-container mb-16 px-2"
        >
          {/* Level 1: Founder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="tree-card tree-card-founder flex flex-col items-center text-center"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <span className="tree-crown" />
              <span className="tree-role-badge founder">Founder</span>
            </div>
            <div className="flex flex-col items-center gap-2.5">
              <img
                src={teamMembers[0].img}
                alt={teamMembers[0].name}
                className="tree-avatar"
              />
              <div>
                <h3 className="font-display font-bold text-txt-primary text-lg sm:text-xl">{teamMembers[0].name}</h3>
                <p className="text-txt-muted text-xs mt-0.5">{teamMembers[0].desc}</p>
              </div>
            </div>
          </motion.div>

          {/* Spine */}
          <div className="tree-spine" />

          {/* Level 2: Deputy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="tree-card tree-card-deputy flex flex-col items-center text-center"
          >
            <span className="tree-role-badge deputy mb-2">Deputy Lead</span>
            <div className="flex flex-col items-center gap-2">
              <img
                src={teamMembers[1].img}
                alt={teamMembers[1].name}
                className="tree-avatar"
              />
              <div>
                <h3 className="font-display font-bold text-txt-primary text-base sm:text-lg">{teamMembers[1].name}</h3>
                <p className="text-txt-muted text-xs mt-0.5">{teamMembers[1].desc}</p>
              </div>
            </div>
          </motion.div>

          {/* Branch connector (visible on desktop) */}
          <div className="tree-branch-area hidden md:block" />

          {/* Level 3: Leads */}
          <div className="tree-leads-row">
            {teamMembers.slice(2).map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="tree-lead-node"
              >
                <div className="tree-card tree-card-lead flex flex-col items-center text-center">
                  <span className="tree-role-badge lead mb-1.5">{member.role}</span>
                  <img
                    src={member.img}
                    alt={member.name}
                    className="tree-avatar"
                  />
                  <h3 className="font-display font-bold text-txt-primary text-sm mt-1.5 leading-tight">{member.name}</h3>
                  <p className="text-txt-muted text-[11px] mt-1 leading-tight">{member.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="gradient-divider" />

        {/* Section 5: CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center py-6">
          <div className="max-w-xl mx-auto">
            <span className="eyebrow">Join the Mission</span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-txt-primary mt-3">Ready to join the fight?</h2>
            <p className="text-txt-secondary text-sm mt-3 mb-8 leading-relaxed">
              Register now and start your journey. Every expert was once a beginner.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register" className="btn-primary px-6 py-3 text-sm inline-flex items-center justify-center gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/scoreboard" className="btn-outline px-6 py-3 text-sm inline-flex items-center justify-center">
                View Leaderboard
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
