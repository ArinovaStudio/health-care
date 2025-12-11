import React from 'react';
import { Shield } from 'lucide-react';

function Footer() {

    const footerSections = [
        {
            title: "Company",
            links: [
                { name: 'About Us', link: '/' },
                { name: 'Team', link: '/' },
                { name: 'Careers', link: '/' },
            ],
        },
        {
            title: "Support",
            links: [
                { name: 'Contact', link: '/contact' },
                { name: 'Support', link: '/support' },
                { name: 'FAQ', link: '/faq' },
            ],
        },
        {
            title: "Legal",
            links: [
                { name: 'Privacy Policy', link: '/privacy' },
                { name: 'Terms of Service', link: '/terms' },
                { name: 'Dispose Data', link: '/dispose-data' },
            ],
        },
    ];

    return (
        <footer className='bg-white pt-12 pb-8 border-t border-gray-200'> 
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='grid grid-cols-1 gap-y-8 md:grid-cols-4 lg:grid-cols-5 md:gap-x-10 lg:gap-x-12'>

                    {/* Column 1: Brand/Tagline (Takes full width on mobile, 2 columns on desktop) */}
                    <div className='md:col-span-2 lg:col-span-2 space-y-3'> 
                        <div className='flex items-center space-x-2 text-xl font-bold font-serif text-gray-900'>
                            <Shield className='text-teal-500 w-6 h-6' /> MediLink
                        </div>
                        <p className='text-sm text-gray-500 max-w-sm'>
                            Your secure and centralized platform for managing all your medical records and credentials.
                        </p>
                    </div>

                    {/* Columns 2, 3, 4: Link Sections */}
                    {footerSections.map((section, index) => (
                        <div key={index} className='space-y-3'>
                            <h3 className='text-base font-semibold text-gray-900'>
                                {section.title}
                            </h3>
                            <ul className='space-y-2'>
                                {section.links.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        <a
                                            href={link.link}
                                            className='text-sm text-gray-600 hover:text-teal-600 transition-colors'
                                        >
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Section: Copyright */}
                <div className='mt-10 pt-5 border-t border-gray-100 text-center'> {/* Adjusted spacing */}
                    <p className='text-sm text-gray-500'>
                        © {new Date().getFullYear()} MediLink. All rights reserved. | Built with 💖 for a healthier future.
                    </p>
                </div>

            </div>
        </footer>
    );
}

export default Footer;