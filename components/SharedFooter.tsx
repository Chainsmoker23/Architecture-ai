import React from 'react';
import { FOOTER_LINKS } from '../constants';

type Page = 'contact' | 'about' | 'sdk' | 'privacy' | 'terms' | 'docs';

interface SharedFooterProps {
  onNavigate: (page: Page | 'apiKey') => void;
  activePage?: Page;
}

const SharedFooter: React.FC<SharedFooterProps> = ({ onNavigate, activePage }) => {
    const validPages: (Page)[] = ['contact', 'about', 'sdk', 'privacy', 'terms', 'docs'];

    return (
      <footer className="bg-gradient-to-t from-white to-[#FFF0F5]">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div className="mb-6 md:mb-0">
                <h3 className="text-2xl font-bold">Archi<span className="text-[#D6336C]">Gen</span> AI</h3>
                <p className="text-[#555555]">Instant Architecture Design.</p>
            </div>
            <div className="flex items-center space-x-6 text-[#555555]">
                {FOOTER_LINKS.links.map((link) => {
                    const page = link.name.toLowerCase() as Page;

                    if (page === activePage) {
                        return <span key={link.name} className="font-semibold text-[#2B2B2B] cursor-default">{link.name}</span>;
                    }

                    if (validPages.includes(page)) {
                        return (
                            <button key={link.name} onClick={() => onNavigate(page)} className="hover:text-[#2B2B2B] transition-colors">
                                {link.name}
                            </button>
                        );
                    }

                    return (
                        <a key={link.name} href={link.href} className="hover:text-[#2B2B2B] transition-colors">{link.name}</a>
                    );
                })}
            </div>
          </div>
          <div className="mt-8 border-t border-[#EAEAEA] pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-[#555555] text-sm">&copy; {new Date().getFullYear()} ArchiGen AI. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                {FOOTER_LINKS.socials.map((social) => (
                    <a key={social.name} href={social.href} className="text-[#555555] hover:text-[#2B2B2B] transition-colors">
                        <span className="sr-only">{social.name}</span>
                        <social.icon className="h-6 w-6" aria-hidden="true" />
                    </a>
                ))}
            </div>
          </div>
        </div>
      </footer>
    );
};

export default SharedFooter;
