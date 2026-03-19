/**
 * Category and Subcategory Mapping
 * This file contains all categories and subcategories used across the application
 * Used by CategoryMenu component and ProductForm for consistency
 */

export const categoryMapping = {
  men: {
    name: 'Men',
    subcategories: [
      // Topwear
      'T-Shirts',
      'Casual Shirts',
      'Formal Shirts',
      'Sweatshirts',
      'Sweaters',
      'Jackets',
      'Blazers & Coats',
      'Suits',
      'Rain Jackets',
      // Indian & Festive Wear
      'Kurtas & Kurta Sets',
      'Sherwanis',
      'Nehru Jackets',
      'Dhotis',
      // Bottomwear
      'Jeans',
      'Casual Trousers',
      'Formal Trousers',
      'Shorts',
      'Track Pants & Joggers',
      // Innerwear & Sleepwear
      'Briefs & Trunks',
      'Boxers',
      'Vests',
      'Sleepwear & Loungewear',
      'Thermals',
      // Footwear
      'Casual Shoes',
      'Sports Shoes',
      'Formal Shoes',
      'Sneakers',
      'Sandals & Floaters',
      'Flip Flops',
      'Socks',
      // Personal Care & Grooming
      'Sunglasses & Frames',
      'Watches',
      // Sports & Active Wear
      'Sports Sandals',
      'Active T-Shirts',
      'Track Pants & Shorts',
      'Tracksuits',
      'Jackets & Sweatshirts',
      'Sports Accessories',
      'Swimwear',
      // Gadgets
      'Smart Wearables',
      'Fitness Gadgets',
      'Headphones',
      'Speakers',
      // Fashion Accessories
      'Wallets',
      'Belts',
      'Perfumes & Body Mists',
      'Trimmers',
      'Deodorants',
      'Ties, Cufflinks & Pocket Squares',
      'Accessory Gift Sets',
      'Caps & Hats',
      'Mufflers, Scarves & Gloves',
      'Phone Cases',
      'Rings & Wristwear',
      'Helmets',
      'Bags & Backpacks'
    ]
  },
  women: {
    name: 'Women',
    subcategories: [
      // Indian & Fusion Wear
      'Kurtas & Suits',
      'Kurtis, Tunics & Tops',
      'Sarees',
      'Ethnic Wear',
      'Leggings, Salwars & Churidars',
      'Skirts & Palazzos',
      'Dress Materials',
      'Lehenga Cholis',
      'Dupattas & Shawls',
      'Jackets',
      'Belts, Scarves & More',
      'Watches & Wearables',
      // Western Wear
      'Dresses',
      'Tops',
      'Tshirts',
      'Jeans',
      'Trousers & Capris',
      'Shorts & Skirts',
      'Co-ords',
      'Playsuits',
      'Jumpsuits',
      'Shrugs',
      'Sweaters & Sweatshirts',
      'Jackets & Coats',
      'Blazers & Waistcoats',
      // Footwear
      'Flats',
      'Casual Shoes',
      'Heels',
      'Boots',
      'Sports Shoes & Floaters',
      // Sports & Active Wear
      'Clothing',
      'Footwear',
      'Sports Accessories',
      'Sports Equipment',
      // Lingerie & Sleepwear
      'Bra',
      'Briefs',
      'Shapewear',
      'Sleepwear & Loungewear',
      'Swimwear',
      'Camisoles & Thermals',
      // Beauty & Personal Care
      'Makeup',
      'Skincare',
      'Premium Beauty',
      'Lipsticks',
      'Fragrances',
      // Gadgets
      'Smart Wearables',
      'Fitness Gadgets',
      'Headphones',
      'Speakers',
      // Jewellery
      'Fashion Jewellery',
      'Fine Jewellery',
      'Earrings',
      // Bags
      'Backpacks',
      'Handbags, Bags & Wallets',
      'Luggages & Trolleys'
    ]
  },
  kids: {
    name: 'Kids',
    subcategories: [
      // Boys Clothing
      'T-Shirts',
      'Shirts',
      'Shorts',
      'Jeans',
      'Trousers',
      'Dungarees & Jumpsuits',
      'Jackets & Sweatshirts',
      'Track Pants & Pyjamas',
      'Ethnic Wear',
      'Formal Wear',
      'Innerwear & Thermals',
      'Nightwear & Loungewear',
      'Value Packs',
      // Girls Clothing
      'Dresses',
      'Tops & T-Shirts',
      'Clothing Sets',
      'Lehengas & Choli',
      'Kurtas & Kurta Sets',
      'Ethnic Wear',
      'Leggings & Salwars',
      'Jeans & Trousers',
      'Shorts & Skirts',
      'Skirts & Palazzos',
      'Dungarees & Jumpsuits',
      'Jackets & Sweatshirts',
      'Track Pants & Pyjamas',
      'Innerwear & Thermals',
      'Nightwear & Loungewear',
      'Value Packs',
      // Infant Wear
      'Baby Boy',
      'Baby Girl',
      'Baby Unisex',
      'Newborn (0-6M)',
      '6-12 Months',
      '12-24 Months',
      // Footwear
      'Casual Shoes',
      'Sports Shoes',
      'Formal Shoes',
      'Sandals & Floaters',
      'Flip Flops',
      'Socks',
      // Toys & Games
      'Action Figures',
      'Soft Toys',
      'Dolls & Doll Houses',
      'Puzzles & Board Games',
      'Educational Toys',
      'Remote Control Toys',
      'Outdoor Toys',
      'Arts & Crafts',
      // Baby Care
      'Diapers',
      'Baby Wipes',
      'Baby Bath & Skincare',
      'Baby Feeding',
      'Baby Gear',
      'Baby Bedding',
      // Kids Accessories
      'Bags & Backpacks',
      'Watches',
      'Sunglasses',
      'Caps & Hats',
      'Hair Accessories',
      'Jewellery & Hair Clips',
      // Bags & Luggage
      'Backpacks',
      'School Bags',
      'Lunch Bags',
      'Travel Bags',
      // Kids Home & Living
      'Bedsheets',
      'Blankets & Quilts',
      'Pillows & Cushions',
      'Wall Décor',
      'Lamps & Lighting'
    ]
  },
  'home-living': {
    name: 'Home & Living',
    subcategories: [
      // Bed Linen & Furnishing
      'Bed Runners',
      'Mattress Protectors',
      'Bedsheets',
      'Bedding Sets',
      'Blankets, Quilts & Dohars',
      'Pillows & Pillow Covers',
      'Bed Covers',
      'Diwan Sets',
      'Chair Pads & Covers',
      'Sofa Covers',
      // Flooring
      'Floor Runners',
      'Carpets',
      'Floor Mats & Dhurries',
      'Door Mats',
      // Bath
      'Bath Towels',
      'Hand & Face Towels',
      'Beach Towels',
      'Towels Set',
      'Bath Rugs',
      'Bath Robes',
      'Bathroom Accessories',
      'Shower Curtains',
      // Lamps & Lighting
      'Floor Lamps',
      'Ceiling Lamps',
      'Table Lamps',
      'Wall Lamps',
      'Outdoor Lamps',
      'String Lights',
      // Home Décor
      'Plants & Planters',
      'Aromas & Candles',
      'Clocks',
      'Mirrors',
      'Wall Décor',
      'Festive Decor',
      'Pooja Essentials',
      'Wall Shelves',
      'Fountains',
      'Showpieces & Vases',
      'Ottoman',
      'Cushions & Cushion Covers',
      'Curtains',
      // Kitchen & Table
      'Table Runners',
      'Dinnerware & Serveware',
      'Cups and Mugs',
      'Bakeware & Cookware',
      'Kitchen Storage & Tools',
      'Bar & Drinkware',
      'Table Covers & Furnishings',
      // Storage
      'Bins',
      'Hangers',
      'Organisers',
      'Hooks & Holders',
      'Laundry Bags'
    ]
  },
  beauty: {
    name: 'Beauty',
    subcategories: [
      // Makeup
      'Lipstick',
      'Lip Gloss',
      'Lip Liner',
      'Mascara',
      'Eyeliner',
      'Kajal',
      'Eyeshadow',
      'Foundation',
      'Primer',
      'Concealer',
      'Compact',
      'Nail Polish',
      // Skincare, Bath & Body
      'Face Moisturiser',
      'Cleanser',
      'Masks & Peel',
      'Sunscreen',
      'Serum',
      'Face Wash',
      'Eye Cream',
      'Lip Balm',
      'Body Lotion',
      'Body Wash',
      'Body Scrub',
      'Hand Cream',
      // Baby Care
      'Masks',
      // Haircare
      'Shampoo',
      'Conditioner',
      'Hair Cream',
      'Hair Oil',
      'Hair Gel',
      'Hair Color',
      'Hair Serum',
      'Hair Accessory',
      // Fragrances
      'Perfume',
      'Deodorant',
      'Body Mist',
      // Appliances
      'Hair Straightener',
      'Hair Dryer',
      'Epilator',
      // Men's Grooming
      'Trimmers',
      'Beard Oil',
      'Hair Wax',
      // Beauty Gift & Makeup Set
      'Beauty Gift',
      'Makeup Kit'
    ]
  },
  electronics: {
    name: 'Electronics',
    subcategories: [
      // Mobile & Accessories
      'Smartphones',
      'Feature Phones',
      'Mobile Cases & Covers',
      'Screen Protectors',
      'Mobile Chargers',
      'Power Banks',
      'Mobile Cables',
      'Mobile Holders & Stands',
      'Bluetooth Headsets',
      'Mobile Memory Cards',
      'Selfie Sticks',
      // Laptops & Computers
      'Laptops',
      'Gaming Laptops',
      'Ultrabooks',
      'Desktop Computers',
      'All-in-One PCs',
      'Laptop Bags & Cases',
      'Laptop Stands',
      'Laptop Chargers',
      'External Hard Drives',
      'USB Flash Drives',
      'Laptop Cooling Pads',
      // Tablets & eReaders
      'Tablets',
      'iPad',
      'Android Tablets',
      'Tablet Cases & Covers',
      'Tablet Stands',
      'eReaders',
      'Kindle',
      'Tablet Chargers',
      // Audio & Headphones
      'Headphones',
      'Earbuds',
      'Wireless Headphones',
      'Gaming Headsets',
      'Bluetooth Speakers',
      'Home Audio Systems',
      'Soundbars',
      'Earphones',
      'Neckbands',
      'True Wireless Earbuds',
      // Cameras & Accessories
      'DSLR Cameras',
      'Mirrorless Cameras',
      'Action Cameras',
      'Digital Cameras',
      'Camera Lenses',
      'Camera Bags',
      'Tripods',
      'Memory Cards',
      'Camera Batteries',
      'Camera Filters',
      // TV & Entertainment
      'Smart TVs',
      'LED TVs',
      'OLED TVs',
      '4K Ultra HD TVs',
      'TV Stands & Mounts',
      'Streaming Devices',
      'TV Remote Controls',
      'HDMI Cables',
      'TV Antennas',
      // Gaming
      'Gaming Consoles',
      'Gaming Laptops',
      'Gaming PCs',
      'Gaming Keyboards',
      'Gaming Mice',
      'Gaming Controllers',
      'Gaming Headsets',
      'Gaming Chairs',
      'Gaming Monitors',
      'VR Headsets',
      // Smart Home & IoT
      'Smart Speakers',
      'Smart Lights',
      'Smart Plugs',
      'Smart Switches',
      'Smart Doorbells',
      'Security Cameras',
      'Smart Thermostats',
      'Smart Locks',
      'Home Automation',
      // Wearables
      'Smartwatches',
      'Fitness Trackers',
      'Smart Bands',
      'Smart Rings',
      'VR Headsets',
      'AR Glasses',
      // Computer Accessories
      'Keyboards',
      'Mice',
      'Webcams',
      'Monitors',
      'Printers',
      'Scanners',
      'Routers',
      'Modems',
      'Network Switches',
      'UPS & Inverters',
      // Storage & Memory
      'Internal Hard Drives',
      'SSD Drives',
      'External Hard Drives',
      'USB Flash Drives',
      'Memory Cards',
      'Pen Drives',
      'Cloud Storage',
      // Cables & Chargers
      'USB Cables',
      'HDMI Cables',
      'Charging Cables',
      'Wireless Chargers',
      'Car Chargers',
      'Wall Chargers',
      'Cable Organizers'
    ]
  }
};

/**
 * Get all main categories
 */
export const getMainCategories = () => {
  return Object.keys(categoryMapping).map(key => ({
    value: key,
    name: categoryMapping[key].name
  }));
};

/**
 * Get subcategories for a specific category
 */
export const getSubcategories = (category) => {
  if (!category || !categoryMapping[category]) {
    return [];
  }
  return categoryMapping[category].subcategories;
};

/**
 * Check if a subcategory belongs to a category
 */
export const isValidSubcategory = (category, subcategory) => {
  const subcategories = getSubcategories(category);
  return subcategories.includes(subcategory);
};
