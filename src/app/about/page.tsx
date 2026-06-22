'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Github, Linkedin, MessageCircle, Mail } from 'lucide-react';

const sections = [
  { title: 'Who We Are', content: 'Cyber Guardians Society is for people who love solving problems and finding hidden things. We welcome everyone — no matter your background. Our goal is simple: teach you to think like a hacker through real challenges.', side: 'red' as const },
  { title: 'Our Mission', content: 'We believe the best way to learn cybersecurity is by actually doing it. Our platform gives you real practice, not just theory. Train through real hacking simulations. Learn by exploring, not just reading. Build skills you can actually use.', side: 'blue' as const },
  { title: 'Enter The Arena', content: 'Each challenge hides a secret called a flag. Find it and you prove you solved the challenge. It won\'t be easy — you have to look carefully and think outside the box. Find hidden flags inside each challenge. Every flag you find moves you forward. You earn your progress here.', side: 'red' as const },
  { title: 'The Challenges', content: 'We cover all the major areas of cybersecurity: Cryptography — Break codes and hidden messages. Web Exploitation — Find weaknesses in websites. Reverse Engineering — Take apart programs and understand how they work. Digital Forensics — Investigate digital evidence like a detective. Miscellaneous — Anything and everything unexpected.', side: 'blue' as const },
  { title: 'Beyond Competition', content: 'This is more than just a game. Cyber Guardians is a community where people help each other grow. Share ideas and tips with others. Track your progress on the leaderboard. Grow together through learning and teamwork.', side: 'red' as const },
  { title: 'Begin Your Journey', content: 'Start small, learn the basics, and slowly take on harder challenges. If you get stuck, hints are there to help — but try on your own first. Begin with easy challenges and build up. Use hints only when you really need them. Some challenges test your knowledge. Some test how much you don\'t give up.', side: 'blue' as const },
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

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`card card-lift p-5 border-l-2 ${section.side === 'red' ? 'border-l-red-core' : 'border-l-blue-core'}`}
            >
              <h2 className="font-display font-bold text-txt-primary text-lg mb-2">{section.title}</h2>
              <p className="text-txt-secondary text-sm leading-relaxed">{section.content}</p>
            </motion.div>
          ))}
        </div>

        {/* Developers */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <span className="text-txt-muted text-xs font-mono uppercase tracking-[0.2em]">Team</span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-txt-primary mt-2">Platform Developers</h2>
        </motion.div>

        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
          {[
            { name: 'Shayan Ahmed', role: 'Founder & Organizer', img: '/images/shayan-ahmed.jpeg', github: 'https://github.com/OperationZero-GHH', linkedin: 'https://www.linkedin.com/in/shayanahmedmughal', whatsapp: 'https://wa.me/923261458036', email: 'https://mail.google.com/mail/?view=cm&fs=1&to=sakingplays@gmail.com' },
            { name: 'Muhammad Saad', role: 'Challenges & Security Organizer', img: '/images/muhammad-saad.jpeg', github: 'https://github.com/saad-838', linkedin: 'https://www.linkedin.com/in/muhammad-saad-13ab46298/', whatsapp: 'https://wa.me/923272243678', email: 'https://mail.google.com/mail/?view=cm&fs=1&to=mrgill2792@gmail.com' },
          ].map((dev) => (
            <motion.div key={dev.name} className="card p-6 w-72 flex flex-col items-center text-center" whileHover={{ y: -4 }}>
              <div className="w-20 h-20 rounded-full overflow-hidden mb-4 ring-2 ring-border-c">
                <img src={dev.img} alt={dev.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-body font-semibold text-txt-primary text-base">{dev.name}</h3>
              <p className="text-blue-glow text-xs font-mono uppercase tracking-wider mt-1">{dev.role}</p>
              <div className="flex items-center gap-3 mt-4">
                <a href={dev.github} target="_blank" rel="noopener noreferrer" className="text-txt-muted hover:text-txt-primary transition-colors"><Github className="w-4 h-4" /></a>
                <a href={dev.whatsapp} target="_blank" rel="noopener noreferrer" className="text-txt-muted hover:text-success transition-colors"><MessageCircle className="w-4 h-4" /></a>
                <a href={dev.linkedin} target="_blank" rel="noopener noreferrer" className="text-txt-muted hover:text-blue-glow transition-colors"><Linkedin className="w-4 h-4" /></a>
                <a href={dev.email} target="_blank" rel="noopener noreferrer" className="text-txt-muted hover:text-red-glow transition-colors"><Mail className="w-4 h-4" /></a>
              </div>
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
