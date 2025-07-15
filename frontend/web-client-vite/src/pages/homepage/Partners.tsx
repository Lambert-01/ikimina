import React from 'react';

interface PartnerProps {
  name: string;
  website?: string;
}

// Simple component that renders partner logos as text with styled boxes instead of images
const Partner: React.FC<PartnerProps> = ({ name, website }) => {
  // Extract initials from the name
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <a 
      href={website} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="partner-logo group"
      aria-label={`Visit ${name} website`}
    >
      <div className="bg-white h-24 w-full rounded shadow-sm border border-gray-200 flex flex-col items-center justify-center transition-all duration-300 group-hover:shadow-lg p-4">
        <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center mb-2">
          <span className="font-bold text-primary-600">{initials}</span>
        </div>
        <p className="text-xs text-center text-gray-600 font-medium mt-1 line-clamp-1">
          {name}
        </p>
      </div>
    </a>
  );
};

const Partners: React.FC = () => {
  const partners = [
    {
      name: "National Bank of Rwanda (BNR)",
      website: "https://www.bnr.rw/"
    },
    {
      name: "Rwanda Development Bank (BRD)",
      website: "https://www.brd.rw/"
    },
    {
      name: "MTN Rwanda",
      website: "https://www.mtn.co.rw/"
    },
    {
      name: "Airtel Rwanda",
      website: "https://www.airtel.co.rw/"
    },
    {
      name: "Bank of Kigali",
      website: "https://www.bk.rw/"
    },
    {
      name: "AB Bank Rwanda",
      website: "https://abr.rw/"
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <span className="inline-block py-1 px-3 rounded-full bg-gray-100 text-gray-800 font-medium text-sm mb-4">
            OUR PARTNERS
          </span>
          <h2 className="section-title text-3xl font-bold text-gray-900 mb-4">Trusted by Rwanda's Leading Institutions</h2>
          <p className="section-subtitle text-gray-600 max-w-2xl mx-auto">
            We collaborate with Rwanda's top financial institutions and mobile payment providers to bring you the best service.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {partners.map((partner, index) => (
            <Partner
              key={index}
              name={partner.name}
              website={partner.website}
            />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <a href="#contact" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
            Interested in partnering with us? <span className="underline">Contact our team</span>
          </a>
        </div>
      </div>

      {/* Rwandan-inspired diagonal stripe divider */}
      <div className="mt-20 h-12 relative overflow-hidden">
        <div className="absolute inset-0 flex -rotate-3 scale-110">
          <div className="flex-1 bg-primary-500"></div>
          <div className="flex-1 bg-secondary-500"></div>
          <div className="flex-1 bg-accent-500"></div>
          <div className="flex-1 bg-primary-500"></div>
          <div className="flex-1 bg-secondary-500"></div>
          <div className="flex-1 bg-accent-500"></div>
        </div>
      </div>
    </section>
  );
};

export default Partners; 