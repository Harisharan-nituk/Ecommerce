require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../src/models/mongoose/Category');

// Category structure like Flipkart
const categories = [
  // Electronics (Root)
  {
    name: "Electronics",
    slug: "electronics",
    level: 0,
    children: [
      { name: "Smart Phones", slug: "smart-phones", level: 1 },
      { name: "Tablets", slug: "tablets", level: 1 },
      { name: "Laptops", slug: "laptops", level: 1 },
      { name: "PCs", slug: "pcs", level: 1 },
      { name: "Smart Watches", slug: "smart-watches", level: 1 },
      { name: "Head Phones", slug: "head-phones", level: 1 },
      { name: "Earbuds", slug: "earbuds", level: 1 },
      { name: "Cameras", slug: "cameras", level: 1 },
      { name: "Mouses", slug: "mouses", level: 1 },
      { name: "Printers", slug: "printers", level: 1 },
    ]
  },
  // Fashion (Root)
  {
    name: "Fashion",
    slug: "fashion",
    level: 0,
    children: [
      {
        name: "Men's Clothing",
        slug: "mens-clothing",
        level: 1,
        children: [
          { name: "T-Shirts", slug: "mens-tshirts", level: 2 },
          { name: "Shirts", slug: "mens-shirts", level: 2 },
          { name: "Jeans", slug: "mens-jeans", level: 2 },
          { name: "Trousers", slug: "mens-trousers", level: 2 },
          { name: "Shorts", slug: "mens-shorts", level: 2 },
          { name: "Jackets", slug: "mens-jackets", level: 2 },
        ]
      },
      {
        name: "Men's Shoes",
        slug: "mens-shoes",
        level: 1,
        children: [
          { name: "Casual Shoes", slug: "mens-casual-shoes", level: 2 },
          { name: "Sports Shoes", slug: "mens-sports-shoes", level: 2 },
          { name: "Formal Shoes", slug: "mens-formal-shoes", level: 2 },
          { name: "Sneakers", slug: "mens-sneakers", level: 2 },
          { name: "Sandals", slug: "mens-sandals", level: 2 },
        ]
      },
      {
        name: "Women's Clothing",
        slug: "womens-clothing",
        level: 1,
        children: [
          { name: "Dresses", slug: "womens-dresses", level: 2 },
          { name: "Tops", slug: "womens-tops", level: 2 },
          { name: "Jeans", slug: "womens-jeans", level: 2 },
          { name: "Skirts", slug: "womens-skirts", level: 2 },
          { name: "Jackets", slug: "womens-jackets", level: 2 },
          { name: "Leggings", slug: "womens-leggings", level: 2 },
        ]
      },
    ]
  },
  // Toys & Games (Root)
  {
    name: "Toys & Games",
    slug: "toys-games",
    level: 0,
    children: [
      { name: "Action Figures", slug: "action-figures", level: 1 },
      { name: "Board Games", slug: "board-games", level: 1 },
      { name: "Building Sets", slug: "building-sets", level: 1 },
      { name: "Dolls", slug: "dolls", level: 1 },
      { name: "Educational Toys", slug: "educational-toys", level: 1 },
      { name: "Outdoor Toys", slug: "outdoor-toys", level: 1 },
      { name: "Puzzles", slug: "puzzles", level: 1 },
      { name: "Remote Control", slug: "remote-control-toys", level: 1 },
    ]
  },
];

async function seedCategories() {
  try {
    // Connect to MongoDB
    const mongoUrl = process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (!mongoUrl) {
      console.error('❌ MongoDB connection string not found in environment variables!');
      console.error('Please set MONGODB_URI or DATABASE_URL in your .env file');
      process.exit(1);
    }

    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB\n');

    console.log('🌱 Seeding categories...\n');

    for (const rootCategory of categories) {
      // Create root category
      let root = await Category.findOne({ slug: rootCategory.slug });
      
      if (!root) {
        root = await Category.create({
          name: rootCategory.name,
          slug: rootCategory.slug,
          level: rootCategory.level,
          parentId: null,
        });
        console.log(`✅ Created root category: ${root.name}`);
      } else {
        console.log(`ℹ️  Root category already exists: ${root.name}`);
      }

      // Create level 1 children
      if (rootCategory.children) {
        for (const child1 of rootCategory.children) {
          let child1Category = await Category.findOne({ slug: child1.slug });
          
          if (!child1Category) {
            child1Category = await Category.create({
              name: child1.name,
              slug: child1.slug,
              level: child1.level,
              parentId: root._id,
            });
            console.log(`  ✅ Created category: ${child1Category.name}`);
          } else {
            console.log(`  ℹ️  Category already exists: ${child1Category.name}`);
          }

          // Create level 2 children if they exist
          if (child1.children) {
            for (const child2 of child1.children) {
              let child2Category = await Category.findOne({ slug: child2.slug });
              
              if (!child2Category) {
                child2Category = await Category.create({
                  name: child2.name,
                  slug: child2.slug,
                  level: child2.level,
                  parentId: child1Category._id,
                });
                console.log(`    ✅ Created subcategory: ${child2Category.name}`);
              } else {
                console.log(`    ℹ️  Subcategory already exists: ${child2Category.name}`);
              }
            }
          }
        }
      }
    }

    console.log('\n✅ Categories seeded successfully!');
    
    // Display summary
    const totalCategories = await Category.countDocuments({ isActive: true });
    const rootCategories = await Category.countDocuments({ parentId: null, isActive: true });
    
    console.log('\n📊 Summary:');
    console.log(`   Total categories: ${totalCategories}`);
    console.log(`   Root categories: ${rootCategories}`);
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

seedCategories();
