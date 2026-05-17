import React from 'react';

const SeatingArea = () => {
  return (
    <section id="atmosphere" className="py-24 bg-sandLight overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Arch Visuals */}
          <div className="relative h-[600px] flex justify-center items-end pb-12 gap-6">
            {/* Left Arch */}
            <div className="w-1/3 h-3/4 bg-green rounded-t-full shadow-2xl relative overflow-hidden transform -translate-y-12">
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
              {/* Simulated Hanging Light */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-32 bg-gold/60"></div>
              <div className="absolute top-32 left-1/2 -translate-x-1/2 w-8 h-4 bg-gold rounded-b-full"></div>
              <div className="absolute top-36 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full blur-[15px] opacity-70"></div>
              {/* Seating Representation */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-wood/80 rounded-lg"></div>
            </div>

            {/* Center Arch */}
            <div className="w-1/3 h-full bg-green rounded-t-full shadow-2xl relative overflow-hidden z-10 border-4 border-sandLight">
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-40 bg-gold/60"></div>
              <div className="absolute top-40 left-1/2 -translate-x-1/2 w-8 h-4 bg-gold rounded-b-full"></div>
              <div className="absolute top-44 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full blur-[20px] opacity-80"></div>
              {/* Table & Chair Representation */}
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-20 h-20 bg-wood rounded-full border-4 border-woodDark z-20 shadow-xl"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-green/80 rounded-t-lg z-10 border-t border-woodDark/30"></div>
            </div>

            {/* Right Arch */}
            <div className="w-1/3 h-3/4 bg-green rounded-t-full shadow-2xl relative overflow-hidden transform -translate-y-12">
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-24 bg-gold/60"></div>
              <div className="absolute top-24 left-1/2 -translate-x-1/2 w-8 h-4 bg-gold rounded-b-full"></div>
              <div className="absolute top-28 left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full blur-[12px] opacity-60"></div>
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-wood/80 rounded-lg"></div>
            </div>
            
            {/* Floating plant element */}
            <div className="absolute bottom-0 -right-10 w-48 h-64 bg-[url('https://images.unsplash.com/photo-1599598425947-330026216d01?auto=format&fit=crop&q=80')] bg-cover bg-center rounded-tl-[100px] shadow-lg opacity-90 z-20"></div>
          </div>

          {/* Text Content */}
          <div className="text-left">
            <span className="text-green font-bold uppercase tracking-widest text-sm mb-4 block">The Atmosphere</span>
            <h2 className="text-4xl md:text-5xl font-bold text-woodDark mb-6 leading-tight">
              A Space Designed for <span className="font-script text-green font-normal">Connection</span>
            </h2>
            <p className="text-lg text-woodDark/80 mb-6">
              Whether you're settling in for a focused work session, catching up with old friends, or simply taking a moment for yourself, our beautifully designed arches and plush velvet seating provide the perfect backdrop.
            </p>
            <p className="text-lg text-woodDark/80 mb-8">
              Soft, warm lighting cascaded from woven fixtures creates an intimate mood that makes every visit feel special.
            </p>
            
            <div className="grid grid-cols-2 gap-8 border-t border-sand pt-8">
              <div>
                <h4 className="text-2xl font-bold text-woodDark mb-2">Free WiFi</h4>
                <p className="text-sm text-woodDark/70">Fast, reliable connection for all guests.</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-woodDark mb-2">Plenty of Plugs</h4>
                <p className="text-sm text-woodDark/70">Stay charged while you work or relax.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SeatingArea;
