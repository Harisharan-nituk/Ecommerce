import React from 'react';
import { Link } from 'react-router-dom';
import './CategoryMenu.css';

const CategoryMenu = ({ type = 'men' }) => {
  // Men's Categories Structure
  const menCategories = [
    {
      title: 'Topwear',
      items: [
        'T-Shirts',
        'Casual Shirts',
        'Formal Shirts',
        'Sweatshirts',
        'Sweaters',
        'Jackets',
        'Blazers & Coats',
        'Suits',
        'Rain Jackets'
      ]
    },
    {
      title: 'Indian & Festive Wear',
      items: [
        'Kurtas & Kurta Sets',
        'Sherwanis',
        'Nehru Jackets',
        'Dhotis'
      ],
      highlight: true
    },
    {
      title: 'Bottomwear',
      items: [
        'Jeans',
        'Casual Trousers',
        'Formal Trousers',
        'Shorts',
        'Track Pants & Joggers'
      ]
    },
    {
      title: 'Innerwear & Sleepwear',
      items: [
        'Briefs & Trunks',
        'Boxers',
        'Vests',
        'Sleepwear & Loungewear',
        'Thermals'
      ]
    },
    {
      title: 'Plus Size',
      items: []
    },
    {
      title: 'Footwear',
      items: [
        'Casual Shoes',
        'Sports Shoes',
        'Formal Shoes',
        'Sneakers',
        'Sandals & Floaters',
        'Flip Flops',
        'Socks'
      ]
    },
    {
      title: 'Personal Care & Grooming',
      items: [
        'Sunglasses & Frames',
        'Watches'
      ],
      highlight: true
    },
    {
      title: 'Sports & Active Wear',
      items: [
        'Sports Shoes',
        'Sports Sandals',
        'Active T-Shirts',
        'Track Pants & Shorts',
        'Tracksuits',
        'Jackets & Sweatshirts',
        'Sports Accessories',
        'Swimwear'
      ]
    },
    {
      title: 'Gadgets',
      items: [
        'Smart Wearables',
        'Fitness Gadgets',
        'Headphones',
        'Speakers'
      ],
      highlight: true
    },
    {
      title: 'Fashion Accessories',
      items: [
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
        'Helmets'
      ]
    },
    {
      title: 'Bags & Backpacks',
      items: [],
      highlight: true
    },
    {
      title: 'Luggages & Trolleys',
      items: [],
      highlight: true
    }
  ];

  // Women's Categories Structure
  const womenCategories = [
    {
      title: 'Indian & Fusion Wear',
      items: [
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
        'Watches & Wearables'
      ]
    },
    {
      title: 'Western Wear',
      items: [
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
        'Blazers & Waistcoats'
      ]
    },
    {
      title: 'Plus Size',
      items: []
    },
    {
      title: 'Maternity',
      items: []
    },
    {
      title: 'Sunglasses & Frames',
      items: [],
      highlight: true
    },
    {
      title: 'Footwear',
      items: [
        'Flats',
        'Casual Shoes',
        'Heels',
        'Boots',
        'Sports Shoes & Floaters'
      ]
    },
    {
      title: 'Sports & Active Wear',
      items: [
        'Clothing',
        'Footwear',
        'Sports Accessories',
        'Sports Equipment'
      ]
    },
    {
      title: 'Lingerie & Sleepwear',
      items: [
        'Bra',
        'Briefs',
        'Shapewear',
        'Sleepwear & Loungewear',
        'Swimwear',
        'Camisoles & Thermals'
      ]
    },
    {
      title: 'Beauty & Personal Care',
      items: [
        'Makeup',
        'Skincare',
        'Premium Beauty',
        'Lipsticks',
        'Fragrances'
      ]
    },
    {
      title: 'Gadgets',
      items: [
        'Smart Wearables',
        'Fitness Gadgets',
        'Headphones',
        'Speakers'
      ],
      highlight: true
    },
    {
      title: 'Jewellery',
      items: [
        'Fashion Jewellery',
        'Fine Jewellery',
        'Earrings'
      ]
    },
    {
      title: 'Backpacks',
      items: [],
      highlight: true
    },
    {
      title: 'Handbags, Bags & Wallets',
      items: [],
      highlight: true
    },
    {
      title: 'Luggages & Trolleys',
      items: [],
      highlight: true
    }
  ];

  // Kids Categories Structure
  const kidsCategories = [
    {
      title: 'Boys Clothing',
      items: [
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
        'Value Packs'
      ]
    },
    {
      title: 'Girls Clothing',
      items: [
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
        'Value Packs'
      ]
    },
    {
      title: 'Infant Wear',
      items: [
        'Baby Boy',
        'Baby Girl',
        'Baby Unisex',
        'Newborn (0-6M)',
        '6-12 Months',
        '12-24 Months'
      ]
    },
    {
      title: 'Footwear',
      items: [
        'Casual Shoes',
        'Sports Shoes',
        'Formal Shoes',
        'Sandals & Floaters',
        'Flip Flops',
        'Socks'
      ]
    },
    {
      title: 'Toys & Games',
      items: [
        'Action Figures',
        'Soft Toys',
        'Dolls & Doll Houses',
        'Puzzles & Board Games',
        'Educational Toys',
        'Remote Control Toys',
        'Outdoor Toys',
        'Arts & Crafts'
      ]
    },
    {
      title: 'Baby Care',
      items: [
        'Diapers',
        'Baby Wipes',
        'Baby Bath & Skincare',
        'Baby Feeding',
        'Baby Gear',
        'Baby Bedding'
      ]
    },
    {
      title: 'Kids Accessories',
      items: [
        'Bags & Backpacks',
        'Watches',
        'Sunglasses',
        'Caps & Hats',
        'Hair Accessories',
        'Jewellery & Hair Clips'
      ]
    },
    {
      title: 'Bags & Luggage',
      items: [
        'Backpacks',
        'School Bags',
        'Lunch Bags',
        'Travel Bags'
      ]
    },
    {
      title: 'Kids Home & Living',
      items: [
        'Bedsheets',
        'Blankets & Quilts',
        'Pillows & Cushions',
        'Wall Décor',
        'Lamps & Lighting'
      ]
    }
  ];

  // Home & Living Categories Structure
  const homeLivingCategories = [
    {
      title: 'Bed Linen & Furnishing',
      items: [
        'Bed Runners',
        'Mattress Protectors',
        'Bedsheets',
        'Bedding Sets',
        'Blankets, Quilts & Dohars',
        'Pillows & Pillow Covers',
        'Bed Covers',
        'Diwan Sets',
        'Chair Pads & Covers',
        'Sofa Covers'
      ]
    },
    {
      title: 'Flooring',
      items: [
        'Floor Runners',
        'Carpets',
        'Floor Mats & Dhurries',
        'Door Mats'
      ]
    },
    {
      title: 'Bath',
      items: [
        'Bath Towels',
        'Hand & Face Towels',
        'Beach Towels',
        'Towels Set',
        'Bath Rugs',
        'Bath Robes',
        'Bathroom Accessories',
        'Shower Curtains'
      ]
    },
    {
      title: 'Lamps & Lighting',
      items: [
        'Floor Lamps',
        'Ceiling Lamps',
        'Table Lamps',
        'Wall Lamps',
        'Outdoor Lamps',
        'String Lights'
      ]
    },
    {
      title: 'Home Décor',
      items: [
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
        'Curtains'
      ]
    },
    {
      title: 'Furniture',
      items: []
    },
    {
      title: 'Home Gift Sets',
      items: []
    },
    {
      title: 'Kitchen & Table',
      items: [
        'Table Runners',
        'Dinnerware & Serveware',
        'Cups and Mugs',
        'Bakeware & Cookware',
        'Kitchen Storage & Tools',
        'Bar & Drinkware',
        'Table Covers & Furnishings'
      ]
    },
    {
      title: 'Storage',
      items: [
        'Bins',
        'Hangers',
        'Organisers',
        'Hooks & Holders',
        'Laundry Bags'
      ]
    }
  ];

  // Beauty & Personal Care Categories Structure
  const beautyCategories = [
    {
      title: 'Makeup',
      items: [
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
        'Nail Polish'
      ]
    },
    {
      title: 'Skincare, Bath & Body',
      items: [
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
        'Hand Cream'
      ]
    },
    {
      title: 'Baby Care',
      items: [
        'Masks'
      ]
    },
    {
      title: 'Haircare',
      items: [
        'Shampoo',
        'Conditioner',
        'Hair Cream',
        'Hair Oil',
        'Hair Gel',
        'Hair Color',
        'Hair Serum',
        'Hair Accessory'
      ]
    },
    {
      title: 'Fragrances',
      items: [
        'Perfume',
        'Deodorant',
        'Body Mist'
      ]
    },
    {
      title: 'Appliances',
      items: [
        'Hair Straightener',
        'Hair Dryer',
        'Epilator'
      ]
    },
    {
      title: "Men's Grooming",
      items: [
        'Trimmers',
        'Beard Oil',
        'Hair Wax'
      ]
    },
    {
      title: 'Beauty Gift & Makeup Set',
      items: [
        'Beauty Gift',
        'Makeup Kit'
      ]
    },
    {
      title: 'Premium Beauty',
      items: []
    },
    {
      title: 'Wellness & Hygiene',
      items: []
    },
    {
      title: 'Top Brands',
      items: [
        'Lakme',
        'Maybelline',
        'LOreal',
        'Philips',
        'Bath & Body Works',
        'THE BODY SHOP',
        'Biotique',
        'Mamaearth',
        'MCaffeine',
        'Nivea',
        'Lotus Herbals',
        'LOreal Professionnel',
        'KAMA AYURVEDA',
        'M.A.C',
        'Forest Essentials'
      ]
    }
  ];

  // Electronics Categories Structure
  const electronicsCategories = [
    {
      title: 'Mobile & Accessories',
      items: [
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
        'Selfie Sticks'
      ]
    },
    {
      title: 'Laptops & Computers',
      items: [
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
        'Laptop Cooling Pads'
      ]
    },
    {
      title: 'Tablets & eReaders',
      items: [
        'Tablets',
        'iPad',
        'Android Tablets',
        'Tablet Cases & Covers',
        'Tablet Stands',
        'eReaders',
        'Kindle',
        'Tablet Chargers'
      ]
    },
    {
      title: 'Audio & Headphones',
      items: [
        'Headphones',
        'Earbuds',
        'Wireless Headphones',
        'Gaming Headsets',
        'Bluetooth Speakers',
        'Home Audio Systems',
        'Soundbars',
        'Earphones',
        'Neckbands',
        'True Wireless Earbuds'
      ]
    },
    {
      title: 'Cameras & Accessories',
      items: [
        'DSLR Cameras',
        'Mirrorless Cameras',
        'Action Cameras',
        'Digital Cameras',
        'Camera Lenses',
        'Camera Bags',
        'Tripods',
        'Memory Cards',
        'Camera Batteries',
        'Camera Filters'
      ]
    },
    {
      title: 'TV & Entertainment',
      items: [
        'Smart TVs',
        'LED TVs',
        'OLED TVs',
        '4K Ultra HD TVs',
        'TV Stands & Mounts',
        'Streaming Devices',
        'TV Remote Controls',
        'HDMI Cables',
        'TV Antennas'
      ]
    },
    {
      title: 'Gaming',
      items: [
        'Gaming Consoles',
        'Gaming Laptops',
        'Gaming PCs',
        'Gaming Keyboards',
        'Gaming Mice',
        'Gaming Controllers',
        'Gaming Headsets',
        'Gaming Chairs',
        'Gaming Monitors',
        'VR Headsets'
      ]
    },
    {
      title: 'Smart Home & IoT',
      items: [
        'Smart Speakers',
        'Smart Lights',
        'Smart Plugs',
        'Smart Switches',
        'Smart Doorbells',
        'Security Cameras',
        'Smart Thermostats',
        'Smart Locks',
        'Home Automation'
      ]
    },
    {
      title: 'Wearables',
      items: [
        'Smartwatches',
        'Fitness Trackers',
        'Smart Bands',
        'Smart Rings',
        'VR Headsets',
        'AR Glasses'
      ]
    },
    {
      title: 'Computer Accessories',
      items: [
        'Keyboards',
        'Mice',
        'Webcams',
        'Monitors',
        'Printers',
        'Scanners',
        'Routers',
        'Modems',
        'Network Switches',
        'UPS & Inverters'
      ]
    },
    {
      title: 'Storage & Memory',
      items: [
        'Internal Hard Drives',
        'SSD Drives',
        'External Hard Drives',
        'USB Flash Drives',
        'Memory Cards',
        'Pen Drives',
        'Cloud Storage'
      ]
    },
    {
      title: 'Cables & Chargers',
      items: [
        'USB Cables',
        'HDMI Cables',
        'Charging Cables',
        'Wireless Chargers',
        'Car Chargers',
        'Wall Chargers',
        'Cable Organizers'
      ]
    },
    {
      title: 'Top Brands',
      items: [
        'Apple',
        'Samsung',
        'Sony',
        'LG',
        'OnePlus',
        'Xiaomi',
        'Realme',
        'HP',
        'Dell',
        'Lenovo',
        'Asus',
        'Acer',
        'JBL',
        'Boat',
        'Noise'
      ]
    }
  ];

  const renderCategoryColumn = (categories, startIndex, endIndex) => {
    const columnCategories = categories.slice(startIndex, endIndex);
    if (columnCategories.length === 0) return null;
    
    return (
      <div className="category-column">
        {columnCategories.map((category, index) => (
          <div key={`${startIndex}-${index}`} className="category-group">
            <h4 className={`category-group-title ${category.highlight ? 'highlighted' : ''}`}>
              {category.title}
            </h4>
            {category.items && category.items.length > 0 && (
              <ul className="category-items">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <Link
                      to={`/shop/${
                        type === 'home-living' || type === 'home & living' ? 'home-living' 
                        : type === 'beauty' || type === 'personal-care' ? 'beauty'
                        : type === 'electronics' ? 'electronics'
                        : type
                      }?category=${encodeURIComponent(item)}`}
                      className="category-item-link"
                      onClick={() => window.scrollTo(0, 0)}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  };

  const categories = type === 'men' 
    ? menCategories 
    : type === 'women' 
    ? womenCategories 
    : type === 'kids'
    ? kidsCategories
    : type === 'home-living' || type === 'home & living'
    ? homeLivingCategories
    : type === 'beauty' || type === 'personal-care'
    ? beautyCategories
    : type === 'electronics'
    ? electronicsCategories
    : menCategories; // Default fallback
  
  // Use 5 columns for Beauty category, 4 columns for others
  const columnCount = (type === 'beauty' || type === 'personal-care') ? 5 : 4;
  const itemsPerColumn = Math.ceil(categories.length / columnCount);

  const isBeauty = type === 'beauty' || type === 'personal-care';
  
  return (
    <div className={`category-menu-detailed ${isBeauty ? 'beauty-dropdown' : ''}`}>
      <div className={`category-menu-content ${isBeauty ? 'beauty-layout' : ''}`}>
        {Array.from({ length: columnCount }).map((_, colIndex) => {
          const start = colIndex * itemsPerColumn;
          const end = Math.min(start + itemsPerColumn, categories.length);
          return renderCategoryColumn(categories, start, end);
        })}
      </div>
    </div>
  );
};

export default CategoryMenu;
