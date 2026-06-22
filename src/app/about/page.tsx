'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Github, Linkedin, MessageCircle, Mail, Shield, Target, Swords, BookOpen, Users, Rocket, CheckCircle, AlertTriangle, Flag, Trophy, Eye, Lock } from 'lucide-react';

const aboutSections = [
  { icon: Shield, title: 'Who We Are', content: 'Cyber Guardians Society is for people who love solving problems and finding hidden things. We welcome everyone — no matter your background. Our goal is simple: teach you to think like a hacker through real challenges.', side: 'red' as const },
  { icon: Target, title: 'Our Mission', content: 'We believe the best way to learn cybersecurity is by actually doing it. Our platform gives you real practice, not just theory. Train through real hacking simulations. Learn by exploring, not just reading. Build skills you can actually use.', side: 'blue' as const },
  { icon: Swords, title: 'Enter The Arena', content: 'Each challenge hides a secret called a flag. Find it and you prove you solved the challenge. It won\'t be easy — you have to look carefully and think outside the box. Find hidden flags inside each challenge. Every flag you find moves you forward.', side: 'red' as const },
  { icon: BookOpen, title: 'The Challenges', content: 'We cover all the major areas of cybersecurity: Cryptography, Web Exploitation, Reverse Engineering, Digital Forensics, OSINT, Pwn, and Miscellaneous. Each category tests different skills and thinking patterns.', side: 'blue' as const },
  { icon: Users, title: 'Beyond Competition', content: 'This is more than just a game. Cyber Guardians is a community where people help each other grow. Share ideas and tips with others. Track your progress on the leaderboard. Grow together through learning and teamwork.', side: 'red' as const },
  { icon: Rocket, title: 'Begin Your Journey', content: 'Start small, learn the basics, and slowly take on harder challenges. If you get stuck, hints are there to help — but try on your own first. Some challenges test your knowledge. Some test how much you don\'t give up.', side: 'blue' as const },
];

const rules = [
  { icon: Flag, title: 'Flag Format', desc: 'All flags follow the format CGS{...}. Submit the exact flag to earn points for a challenge.', color: 'text-red-core' },
  { icon: Trophy, title: 'Scoring', desc: 'Points are awarded per challenge based on difficulty. Easy=25, Medium=50, Hard=75, Expert=100 bonus blood points.', color: 'text-green-400' },
  { icon: Eye, title: 'No Sharing', desc: 'Do not share flags, solutions, or hints with other players. Collusion will result in disqualification.', color: 'text-yellow-400' },
  { icon: Lock, title: 'Fair Play', desc: 'Only use the provided platform. Do not attack the infrastructure, other users\' accounts, or attempt to bypass security.', color: 'text-purple-400' },
  { icon: CheckCircle, title: 'Account Rules', desc: 'One account per person. Multiple accounts will be banned. Keep your credentials secure and do not share access.', color: 'text-blue-core' },
  { icon: AlertTriangle, title: 'Respect', desc: 'Be respectful to all community members. Harassment, hate speech, or toxic behavior results in immediate removal.', color: 'text-orange-400' },
];

export default function About() {
  return (
    <div className="min-h-screen py-8 sm:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="text-txt-muted text-xs font-mono uppercase tracking-[0.2em]">About Us</span>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-txt-primary mt-2">About CGS</h1>
          <p className="text-txt-secondary text-sm sm:text-base max-w-2xl mx-auto mt-4">
            Empowering the next generation of cybersecurity professionals through competitive challenges and community-driven learning.
          </p>
        </motion.div>

        <div className="dual-beam" />

        {/* About Sections - 2 col grid with icons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {aboutSections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`card card-lift p-5 border-l-2 ${section.side === 'red' ? 'border-l-red-core' : 'border-l-blue-core'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${section.side === 'red' ? 'bg-red-core/10' : 'bg-blue-core/10'}`}>
                  <section.icon className={`w-5 h-5 ${section.side === 'red' ? 'text-red-core' : 'text-blue-core'}`} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-txt-primary text-lg mb-2">{section.title}</h2>
                  <p className="text-txt-secondary text-sm leading-relaxed">{section.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Rules Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <span className="text-txt-muted text-xs font-mono uppercase tracking-[0.2em]">Guidelines</span>
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
              transition={{ delay: i * 0.06 }}
              className="card card-lift p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-surface">
                  <rule.icon className={`w-5 h-5 ${rule.color}`} />
                </div>
                <h3 className="font-display font-bold text-txt-primary text-sm">{rule.title}</h3>
              </div>
              <p className="text-txt-secondary text-xs leading-relaxed">{rule.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="dual-beam" />

        {/* Team */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <span className="text-txt-muted text-xs font-mono uppercase tracking-[0.2em]">Team</span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-txt-primary mt-2">Meet the Team</h2>
          <p className="text-txt-secondary text-sm max-w-xl mx-auto mt-3">
            The people behind CGS CTF — building, designing, and running it all.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {[
            { name: 'Shayan Ahmed', role: 'Founder / Director', desc: 'Vision and leadership', img: '/images/shayan-ahmed.jpeg' },
            { name: 'Muhammad Saad', role: 'Deputy Lead', desc: 'Coordination and execution', img: '/images/muhammad-saad.jpeg' },
            { name: 'Muhammad Taha', role: 'Technical Lead', desc: 'Cybersecurity and CTFs', img: '/images/muhammad-taha.jpeg' },
            { name: 'Esha Javed', role: 'Graphics Design Lead', desc: 'Design and branding', img: '/images/esha-javed.jpeg' },
            { name: 'Jannat Fatima', role: 'Media & Communications Lead', desc: 'Social media management and announcements', img: '/images/jannat-fatima.jpg' },
            { name: 'Asad Malik', role: 'Event Management Lead', desc: 'Event planning and execution', img: '/images/asad-malik.jpeg' },
            { name: 'Bisma Noor', role: 'Community & Outreach Lead', desc: 'Engagement and collaborations', img: '/images/bisma-noor.jpeg' },
          ].map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card card-lift p-5 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden mb-4 ring-2 ring-border-c">
                <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-body font-semibold text-txt-primary text-base">{member.name}</h3>
              <p className="text-blue-glow text-xs font-mono uppercase tracking-wider mt-1">{member.role}</p>
              <p className="text-txt-muted text-xs mt-2">{member.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="dual-beam" />
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center py-8">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-txt-primary mb-3">Ready to join the fight?</h2>
          <p className="text-txt-secondary text-sm mb-6">Register now and start your journey. Every expert was once a beginner.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="btn-primary px-6 py-3 text-sm inline-flex items-center justify-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/scoreboard" className="btn-outline px-6 py-3 text-sm inline-flex items-center justify-center">
              View Leaderboard
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
