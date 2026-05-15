import React from 'react';

const menuItems = [
  {
    name: 'Artisan Croissant',
    description: 'Flaky, buttery layers baked fresh every morning.',
    price: '$4.50',
    category: 'Pastry',
    image: 'https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Pour Over Coffee',
    description: 'Single-origin beans brewed to perfection.',
    price: '$5.00',
    category: 'Coffee',
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Matcha Latte',
    description: 'Ceremonial grade matcha with steamed oat milk.',
    price: '$6.50',
    category: 'Specialty',
    image: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Almond Biscotti',
    description: 'Crispy twice-baked Italian cookies, perfect for dipping.',
    price: '$3.00',
    category: 'Pastry',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=400'
  }
];

const MenuHighlight = ({ onBookClick }) => {
  return (
    <section id="menu" className="py-24 bg-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-script text-5xl text-woodDark mb-4">Our Selection</h2>
          <p className="text-woodDark/80 max-w-2xl mx-auto text-lg">
            Curated pairings of specialty roasts and artisanal pastries, displayed beautifully for your enjoyment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {menuItems.map((item, index) => (
            <div key={index} className="bg-sandLight rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group flex flex-col">
              <div className="relative aspect-[4/3] w-full overflow-hidden shrink-0">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-woodDark">
                  {item.price}
                </div>
              </div>
              <div className="p-6 relative">
                {/* Decorative subtle arch in the card */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-green/20 rounded-b-lg"></div>
                
                <span className="text-xs uppercase tracking-wider text-green font-bold block mb-2">{item.category}</span>
                <h3 className="text-xl font-bold text-woodDark mb-2">{item.name}</h3>
                <p className="text-woodDark/70 text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-transparent border-2 border-green text-green px-8 py-3 rounded-full hover:bg-green hover:text-white transition-colors duration-300 font-medium text-lg">
            View Full Menu
          </button>
          <button 
            onClick={onBookClick}
            className="bg-green border-2 border-green text-white px-8 py-3 rounded-full hover:bg-transparent hover:text-green transition-colors duration-300 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Book a Table
          </button>
        </div>
      </div>
    </section>
  );
};

export default MenuHighlight;


