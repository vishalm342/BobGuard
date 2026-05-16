import React from 'react';

const Hero = ({ onBookClick }) => {
  return (
    <section id="home" className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden min-h-[90vh] flex items-center">
      {/* Decorative background elements to simulate warm lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-goldLight/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sand/40 rounded-full blur-[120px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <div className="text-left">
            <h1 className="text-5xl md:text-7xl font-bold text-woodDark leading-tight mb-6">
              Experience the <br/>
              <span className="font-script text-gold font-normal">Warmth</span> of Coffee
            </h1>
            <p className="text-lg md:text-xl text-wood mb-8 max-w-lg">
              Step into a sanctuary of flavor. Our expertly crafted brews and cozy atmosphere offer the perfect escape from the everyday hustle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-woodDark text-sandLight px-8 py-3 rounded-full hover:bg-wood transition-colors duration-300 font-medium text-lg shadow-lg hover:shadow-xl">
                Explore Menu
              </button>
              <button 
                onClick={onBookClick}
                className="bg-transparent border-2 border-woodDark text-woodDark px-8 py-3 rounded-full hover:bg-woodDark hover:text-sandLight transition-colors duration-300 font-medium text-lg"
              >
                Book a Table
              </button>
            </div>
          </div>


          {/* Visual Element: Arch and image placeholder simulating the counter */}
          <div className="relative h-[500px] w-full rounded-t-full bg-sand border-8 border-white/50 shadow-2xl overflow-hidden flex items-center justify-center group">
            {/* Inner glow and shading to mimic the physical counter depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-woodDark/40 to-transparent z-10"></div>
            
            {/* Simulated hanging lights */}
            <div className="absolute top-0 left-1/4 w-1 h-32 bg-gold/50 z-20"></div>
            <div className="absolute top-32 left-1/4 w-6 h-6 bg-goldLight rounded-full blur-[8px] z-20"></div>
            <div className="absolute top-32 left-1/4 w-3 h-3 bg-white rounded-full z-20 shadow-[0_0_15px_rgba(212,175,55,1)]"></div>

            <div className="absolute top-10 right-1/3 w-1 h-20 bg-gold/50 z-20"></div>
            <div className="absolute top-30 right-1/3 w-8 h-8 bg-goldLight rounded-full blur-[10px] z-20"></div>
            <div className="absolute top-30 right-1/3 w-4 h-4 bg-white rounded-full z-20 shadow-[0_0_20px_rgba(212,175,55,1)]"></div>

            {/* Placeholder representation of the beautiful espresso machine and pastries */}
            <div className="relative z-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>
            
            <div className="absolute bottom-10 left-10 right-10 p-6 glass rounded-2xl z-20 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <h3 className="font-script text-3xl text-woodDark mb-2">Signature Roast</h3>
              <p className="text-woodDark/80 font-medium">Discover notes of dark chocolate and toasted almond in every cup.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
