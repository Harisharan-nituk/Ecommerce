require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../src/models/mongoose/Category');
const categoryModel = require('../src/models/CategoryModel');

// Category mapping from frontend - includes main categories and subcategories
const categoryMapping = {
  men: {
    name: 'Men',
    slug: 'men',
    description: 'Men\'s fashion and clothing',
    subcategories: [
      'T-Shirts', 'Casual Shirts', 'Formal Shirts', 'Sweatshirts', 'Sweaters', 'Jackets',
      'Blazers & Coats', 'Suits', 'Rain Jackets', 'Kurtas & Kurta Sets', 'Sherwanis',
      'Nehru Jackets', 'Dhotis', 'Jeans', 'Casual Trousers', 'Formal Trousers', 'Shorts',
      'Track Pants & Joggers', 'Briefs & Trunks', 'Boxers', 'Vests', 'Sleepwear & Loungewear',
      'Thermals', 'Casual Shoes', 'Sports Shoes', 'Formal Shoes', 'Sneakers', 'Sandals & Floaters',
      'Flip Flops', 'Socks', 'Sunglasses & Frames', 'Watches', 'Sports Sandals', 'Active T-Shirts',
      'Track Pants & Shorts', 'Tracksuits', 'Jackets & Sweatshirts', 'Sports Accessories', 'Swimwear',
      'Smart Wearables', 'Fitness Gadgets', 'Headphones', 'Speakers', 'Wallets', 'Belts',
      'Perfumes & Body Mists', 'Trimmers', 'Deodorants', 'Ties, Cufflinks & Pocket Squares',
      'Accessory Gift Sets', 'Caps & Hats', 'Mufflers, Scarves & Gloves', 'Phone Cases',
      'Rings & Wristwear', 'Helmets', 'Bags & Backpacks'
    ]
  },
  women: {
    name: 'Women',
    slug: 'women',
    description: 'Women\'s fashion and clothing',
    subcategories: [
      'Kurtas & Suits', 'Kurtis, Tunics & Tops', 'Sarees', 'Ethnic Wear', 'Leggings, Salwars & Churidars',
      'Skirts & Palazzos', 'Dress Materials', 'Lehenga Cholis', 'Dupattas & Shawls', 'Jackets',
      'Belts, Scarves & More', 'Watches & Wearables', 'Dresses', 'Tops', 'Tshirts', 'Jeans',
      'Trousers & Capris', 'Shorts & Skirts', 'Co-ords', 'Playsuits', 'Jumpsuits', 'Shrugs',
      'Sweaters & Sweatshirts', 'Jackets & Coats', 'Blazers & Waistcoats', 'Flats', 'Casual Shoes',
      'Heels', 'Boots', 'Sports Shoes & Floaters', 'Clothing', 'Footwear', 'Sports Accessories',
      'Sports Equipment', 'Bra', 'Briefs', 'Shapewear', 'Sleepwear & Loungewear', 'Swimwear',
      'Camisoles & Thermals', 'Makeup', 'Skincare', 'Premium Beauty', 'Lipsticks', 'Fragrances',
      'Smart Wearables', 'Fitness Gadgets', 'Headphones', 'Speakers', 'Fashion Jewellery',
      'Fine Jewellery', 'Earrings', 'Backpacks', 'Handbags, Bags & Wallets', 'Luggages & Trolleys'
    ]
  },
  kids: {
    name: 'Kids',
    slug: 'kids',
    description: 'Kids fashion and clothing',
    subcategories: [
      'T-Shirts', 'Shirts', 'Shorts', 'Jeans', 'Trousers', 'Dungarees & Jumpsuits',
      'Jackets & Sweatshirts', 'Track Pants & Pyjamas', 'Ethnic Wear', 'Formal Wear',
      'Innerwear & Thermals', 'Nightwear & Loungewear', 'Value Packs', 'Dresses', 'Tops & T-Shirts',
      'Clothing Sets', 'Lehengas & Choli', 'Kurtas & Kurta Sets', 'Leggings & Salwars',
      'Jeans & Trousers', 'Shorts & Skirts', 'Skirts & Palazzos', 'Dungarees & Jumpsuits',
      'Jackets & Sweatshirts', 'Track Pants & Pyjamas', 'Innerwear & Thermals', 'Nightwear & Loungewear',
      'Value Packs', 'Baby Boy', 'Baby Girl', 'Baby Unisex', 'Newborn (0-6M)', '6-12 Months',
      '12-24 Months', 'Casual Shoes', 'Sports Shoes', 'Formal Shoes', 'Sandals & Floaters',
      'Flip Flops', 'Socks', 'Action Figures', 'Soft Toys', 'Dolls & Doll Houses',
      'Puzzles & Board Games', 'Educational Toys', 'Remote Control Toys', 'Outdoor Toys',
      'Arts & Crafts', 'Diapers', 'Baby Wipes', 'Baby Bath & Skincare', 'Baby Feeding',
      'Baby Gear', 'Baby Bedding', 'Bags & Backpacks', 'Watches', 'Sunglasses', 'Caps & Hats',
      'Hair Accessories', 'Jewellery & Hair Clips', 'Backpacks', 'School Bags', 'Lunch Bags',
      'Travel Bags', 'Bedsheets', 'Blankets & Quilts', 'Pillows & Cushions', 'Wall Décor',
      'Lamps & Lighting'
    ]
  },
  'home-living': {
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Home decor, furniture, and living essentials',
    subcategories: [
      'Bed Runners', 'Mattress Protectors', 'Bedsheets', 'Bedding Sets', 'Blankets, Quilts & Dohars',
      'Pillows & Pillow Covers', 'Bed Covers', 'Diwan Sets', 'Chair Pads & Covers', 'Sofa Covers',
      'Floor Runners', 'Carpets', 'Floor Mats & Dhurries', 'Door Mats', 'Bath Towels',
      'Hand & Face Towels', 'Beach Towels', 'Towels Set', 'Bath Rugs', 'Bath Robes',
      'Bathroom Accessories', 'Shower Curtains', 'Floor Lamps', 'Ceiling Lamps', 'Table Lamps',
      'Wall Lamps', 'Outdoor Lamps', 'String Lights', 'Plants & Planters', 'Aromas & Candles',
      'Clocks', 'Mirrors', 'Wall Décor', 'Festive Decor', 'Pooja Essentials', 'Wall Shelves',
      'Fountains', 'Showpieces & Vases', 'Ottoman', 'Cushions & Cushion Covers', 'Curtains',
      'Table Runners', 'Dinnerware & Serveware', 'Cups and Mugs', 'Bakeware & Cookware',
      'Kitchen Storage & Tools', 'Bar & Drinkware', 'Table Covers & Furnishings', 'Bins',
      'Hangers', 'Organisers', 'Hooks & Holders', 'Laundry Bags'
    ]
  },
  beauty: {
    name: 'Beauty',
    slug: 'beauty',
    description: 'Beauty and personal care products',
    subcategories: [
      'Lipstick', 'Lip Gloss', 'Lip Liner', 'Mascara', 'Eyeliner', 'Kajal', 'Eyeshadow',
      'Foundation', 'Primer', 'Concealer', 'Compact', 'Nail Polish', 'Face Moisturiser',
      'Cleanser', 'Masks & Peel', 'Sunscreen', 'Serum', 'Face Wash', 'Eye Cream', 'Lip Balm',
      'Body Lotion', 'Body Wash', 'Body Scrub', 'Hand Cream', 'Masks', 'Shampoo', 'Conditioner',
      'Hair Cream', 'Hair Oil', 'Hair Gel', 'Hair Color', 'Hair Serum', 'Hair Accessory',
      'Perfume', 'Deodorant', 'Body Mist', 'Hair Straightener', 'Hair Dryer', 'Epilator',
      'Trimmers', 'Beard Oil', 'Hair Wax', 'Beauty Gift', 'Makeup Kit'
    ]
  },
  electronics: {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Electronics, gadgets, and tech products',
    subcategories: [
      'Smartphones', 'Feature Phones', 'Mobile Cases & Covers', 'Screen Protectors',
      'Mobile Chargers', 'Power Banks', 'Mobile Cables', 'Mobile Holders & Stands',
      'Bluetooth Headsets', 'Mobile Memory Cards', 'Selfie Sticks', 'Laptops', 'Gaming Laptops',
      'Ultrabooks', 'Desktop Computers', 'All-in-One PCs', 'Laptop Bags & Cases', 'Laptop Stands',
      'Laptop Chargers', 'External Hard Drives', 'USB Flash Drives', 'Laptop Cooling Pads',
      'Tablets', 'iPad', 'Android Tablets', 'Tablet Cases & Covers', 'Tablet Stands', 'eReaders',
      'Kindle', 'Tablet Chargers', 'Headphones', 'Earbuds', 'Wireless Headphones', 'Gaming Headsets',
      'Bluetooth Speakers', 'Home Audio Systems', 'Soundbars', 'Earphones', 'Neckbands',
      'True Wireless Earbuds', 'DSLR Cameras', 'Mirrorless Cameras', 'Action Cameras',
      'Digital Cameras', 'Camera Lenses', 'Camera Bags', 'Tripods', 'Memory Cards',
      'Camera Batteries', 'Camera Filters', 'Smart TVs', 'LED TVs', 'OLED TVs', '4K Ultra HD TVs',
      'TV Stands & Mounts', 'Streaming Devices', 'TV Remote Controls', 'HDMI Cables', 'TV Antennas',
      'Gaming Consoles', 'Gaming Laptops', 'Gaming PCs', 'Gaming Keyboards', 'Gaming Mice',
      'Gaming Controllers', 'Gaming Headsets', 'Gaming Chairs', 'Gaming Monitors', 'VR Headsets',
      'Smart Speakers', 'Smart Lights', 'Smart Plugs', 'Smart Switches', 'Smart Doorbells',
      'Security Cameras', 'Smart Thermostats', 'Smart Locks', 'Home Automation', 'Smartwatches',
      'Fitness Trackers', 'Smart Bands', 'Smart Rings', 'AR Glasses', 'Keyboards', 'Mice',
      'Webcams', 'Monitors', 'Printers', 'Scanners', 'Routers', 'Modems', 'Network Switches',
      'UPS & Inverters', 'Internal Hard Drives', 'SSD Drives', 'Pen Drives', 'Cloud Storage',
      'USB Cables', 'HDMI Cables', 'Charging Cables', 'Wireless Chargers', 'Car Chargers',
      'Wall Chargers', 'Cable Organizers'
    ]
  }
};

async function seedCategories() {
  try {
    // Check if using MongoDB
    const useMongoDB = process.env.USE_MONGODB === 'true' || process.env.USE_MONGODB === true;
    const mongoUrl = process.env.MONGODB_URI || process.env.DATABASE_URL || process.env.MONGO_URI || process.env.MONGODB_CONNECTION_STRING;
    
    if (useMongoDB && mongoUrl) {
      // Connect to MongoDB
      await mongoose.connect(mongoUrl);
      console.log('✅ Connected to MongoDB\n');
    } else {
      console.log('ℹ️  Using MySQL - categories will be created via CategoryModel\n');
      // Initialize MySQL connection
      const dbManager = require('../src/config/database');
      try {
        await dbManager.initialize();
        console.log('✅ MySQL connection initialized\n');
      } catch (error) {
        console.error('❌ Failed to initialize MySQL:', error.message);
        // Try MongoDB as fallback if MySQL fails
        if (mongoUrl) {
          console.log('⚠️  Trying MongoDB as fallback...\n');
          await mongoose.connect(mongoUrl);
          console.log('✅ Connected to MongoDB\n');
        } else {
          throw error;
        }
      }
    }

    console.log('🌱 Seeding categories from mapping...\n');

    const createdCategories = [];
    const existingCategories = [];

    // Determine which database we're actually using
    const actuallyUsingMongoDB = mongoose.connection.readyState === 1;
    
    if (actuallyUsingMongoDB) {
      // Prepare all categories to insert
      const categoriesToInsert = [];
      const existingSlugs = new Set();
      
      // First, check which categories already exist
      const existing = await Category.find({ slug: { $in: Object.values(categoryMapping).map(c => c.slug) } });
      existing.forEach(cat => existingSlugs.add(cat.slug));
      
      // Prepare categories that don't exist
      for (const [key, categoryData] of Object.entries(categoryMapping)) {
        if (!existingSlugs.has(categoryData.slug)) {
          categoriesToInsert.push({
            name: categoryData.name,
            slug: categoryData.slug,
            description: categoryData.description,
            level: 0,
            parentId: null,
            isActive: true,
            sortOrder: Object.keys(categoryMapping).indexOf(key),
            created_at: new Date(),
            updated_at: new Date()
          });
        } else {
          const existingCat = existing.find(c => c.slug === categoryData.slug);
          console.log(`ℹ️  Category already exists: ${existingCat.name} (${existingCat.slug})`);
          existingCategories.push(existingCat);
        }
      }
      
      // Insert all new categories at once using insertMany (bypasses hooks)
      if (categoriesToInsert.length > 0) {
        try {
          const result = await Category.insertMany(categoriesToInsert, { 
            ordered: false, // Continue even if one fails
            rawResult: true 
          });
          console.log(`✅ Created ${categoriesToInsert.length} main categories`);
          // Fetch the created categories
          const created = await Category.find({ 
            slug: { $in: categoriesToInsert.map(c => c.slug) } 
          });
          createdCategories.push(...created);
          created.forEach(cat => console.log(`   ✅ ${cat.name} (${cat.slug})`));
        } catch (insertError) {
          // Handle partial success
          if (insertError.writeErrors) {
            const successful = categoriesToInsert.length - insertError.writeErrors.length;
            console.log(`⚠️  Created ${successful} of ${categoriesToInsert.length} categories`);
            // Fetch successfully created ones
            const slugs = categoriesToInsert
              .filter((_, idx) => !insertError.writeErrors.some(e => e.index === idx))
              .map(c => c.slug);
            if (slugs.length > 0) {
              const created = await Category.find({ slug: { $in: slugs } });
              createdCategories.push(...created);
            }
          } else {
            throw insertError;
          }
        }
      }
      
      // Now seed subcategories
      console.log('\n🌱 Seeding subcategories...\n');
      const subcategoriesToInsert = [];
      const parentCategoryMap = new Map(); // Map slug to category _id
      
      // Fetch all parent categories to get their IDs
      const allParentCategories = await Category.find({ 
        slug: { $in: Object.keys(categoryMapping).map(key => categoryMapping[key].slug) } 
      });
      allParentCategories.forEach(cat => {
        parentCategoryMap.set(cat.slug, cat._id);
      });
      
      // Check existing subcategories
      const existingSubcategorySlugs = new Set();
      const existingSubcategories = await Category.find({ level: 1 });
      existingSubcategories.forEach(sub => {
        if (sub.slug) existingSubcategorySlugs.add(sub.slug);
      });
      
      // Prepare subcategories for each main category
      for (const [key, categoryData] of Object.entries(categoryMapping)) {
        if (!categoryData.subcategories || !Array.isArray(categoryData.subcategories)) continue;
        
        const parentId = parentCategoryMap.get(categoryData.slug);
        if (!parentId) {
          console.log(`⚠️  Parent category ${categoryData.name} not found, skipping subcategories`);
          continue;
        }
        
        categoryData.subcategories.forEach((subName, index) => {
          const subSlug = subName.toLowerCase().replace(/\s+/g, '-').replace(/[&,]/g, '').replace(/\//g, '-');
          if (!existingSubcategorySlugs.has(subSlug)) {
            subcategoriesToInsert.push({
              name: subName,
              slug: subSlug,
              description: `${subName} under ${categoryData.name}`,
              level: 1,
              parentId: parentId,
              isActive: true,
              sortOrder: index,
              created_at: new Date(),
              updated_at: new Date()
            });
          }
        });
      }
      
      // Insert all subcategories at once
      if (subcategoriesToInsert.length > 0) {
        try {
          const result = await Category.insertMany(subcategoriesToInsert, {
            ordered: false,
            rawResult: true
          });
          console.log(`✅ Created ${subcategoriesToInsert.length} subcategories`);
          createdCategories.push(...subcategoriesToInsert.map(s => ({ name: s.name, slug: s.slug })));
        } catch (insertError) {
          if (insertError.writeErrors) {
            const successful = subcategoriesToInsert.length - insertError.writeErrors.length;
            console.log(`⚠️  Created ${successful} of ${subcategoriesToInsert.length} subcategories`);
            const successfulSubs = subcategoriesToInsert
              .filter((_, idx) => !insertError.writeErrors.some(e => e.index === idx));
            createdCategories.push(...successfulSubs.map(s => ({ name: s.name, slug: s.slug })));
          } else {
            console.error('❌ Error inserting subcategories:', insertError.message);
          }
        }
      } else {
        console.log('ℹ️  All subcategories already exist');
      }
    } else {
      // MySQL path
      for (const [key, categoryData] of Object.entries(categoryMapping)) {
        try {
          // Use CategoryModel for MySQL
          const existing = await categoryModel.getAllCategories({ 
            parentId: null 
          });
          const exists = existing.find(cat => 
            (cat.slug && cat.slug === categoryData.slug) || 
            (cat.name && cat.name.toLowerCase() === categoryData.name.toLowerCase())
          );
          
          if (!exists) {
            const categoryId = await categoryModel.createCategory({
              name: categoryData.name,
              slug: categoryData.slug,
              description: categoryData.description,
              parentId: null,
              level: 0,
              isActive: true,
              sortOrder: Object.keys(categoryMapping).indexOf(key)
            });
            console.log(`✅ Created category: ${categoryData.name} (ID: ${categoryId})`);
            createdCategories.push({ name: categoryData.name, id: categoryId });
          } else {
            console.log(`ℹ️  Category already exists: ${categoryData.name}`);
            existingCategories.push(exists);
          }
        } catch (error) {
          console.error(`❌ Error creating category ${categoryData.name}:`, error.message);
        }
      }
    }

    console.log('\n✅ Categories seeding completed!');
    
    // Display summary
    if (actuallyUsingMongoDB) {
      const totalCategories = await Category.countDocuments({ isActive: true });
      const rootCategories = await Category.countDocuments({ parentId: null, isActive: true });
      const subcategories = await Category.countDocuments({ level: 1, isActive: true });
      
      console.log('\n📊 Summary:');
      console.log(`   Total categories: ${totalCategories}`);
      console.log(`   Root categories: ${rootCategories}`);
      console.log(`   Subcategories: ${subcategories}`);
      console.log(`   Created: ${createdCategories.length}`);
      console.log(`   Already existed: ${existingCategories.length}`);
      
      await mongoose.disconnect();
      console.log('\n✅ Disconnected from MongoDB');
    } else {
      const allCategories = await categoryModel.getAllCategories();
      console.log('\n📊 Summary:');
      console.log(`   Total categories: ${allCategories.length}`);
      console.log(`   Created: ${createdCategories.length}`);
      console.log(`   Already existed: ${existingCategories.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

// Run the seed function
seedCategories();
