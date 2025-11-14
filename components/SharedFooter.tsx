import React from 'react';
import { FOOTER_LINKS } from './content/iconConstants';
import Logo from './Logo';

type Page = 'contact' | 'about' | 'api' | 'privacy' | 'terms' | 'docs' | 'careers' | 'research' | 'apiKey';

interface SharedFooterProps {
  onNavigate: (page: Page) => void;
  activePage?: Page;
}

const SharedFooter: React.FC<SharedFooterProps> = ({ onNavigate, activePage }) => {
    const validPages: (Page)[] = ['about', 'api', 'apiKey', 'research', 'docs', 'careers', 'contact', 'privacy', 'terms'];

    return (
      <footer className="bg-gradient-to-t from-white to-[#FFF0F5]">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div className="mb-6 md:mb-0">
                <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                    <Logo className="h-8 w-8 text-[#D6336C]" />
                    <h3 className="text-2xl font-bold">Cube<span className="text-[#D6336C]">Gen</span> AI</h3>
                </div>
                <p className="text-[#555555]">Instant Architecture Design.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                {validPages.map(page => (
                    <a
                      key={page}
                      href={`#${page}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(page);
                      }}
                      className={`font-medium transition-colors capitalize ${activePage === page ? 'text-[#D6336C]' : 'text-[#555] hover:text-[#2B2B2B]'}`}
                    >
                        {page === 'api' ? 'API & Pricing' : (page === 'apiKey' ? 'API Keys' : page)}
                    </a>
                ))}
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-pink-200 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 sm:mb-0">&copy; {new Date().getFullYear()} CubeGen AI. All rights reserved.</p>
            <div className="flex space-x-4">
                {FOOTER_LINKS.socials.map(social => (
                    <a key={social.name} href={social.href} className="text-gray-400 hover:text-[#D6336C] transition-colors">
                        <span className="sr-only">{social.name}</span>
                        <social.icon className="h-6 w-6" />
                    </a>
                ))}
            </div>
          </div>
        </div>
      </footer>
    );
};

export default SharedFooter;