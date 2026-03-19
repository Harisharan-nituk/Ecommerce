import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { sellerAPI, productsAPI, brandsAPI, uploadAPI, categoriesAPI } from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';
import { useHasPermission } from '../../../hooks/usePermissions';
import Loading from '../../../components/Loading/Loading';
import { toast } from 'react-toastify';
import { FiImage, FiLink, FiX, FiCheck } from 'react-icons/fi';
import { getMainCategories, getSubcategories } from '../../../utils/categoryMapping';
import './ProductForm.css';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  const canManageProducts = useHasPermission('vendor.product.manage_own');
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    sku: '',
    status: 'active',
    image_url: '',
    image_urls: [''], // Array for multiple images (start with one empty)
    category_id: '',
    category: '',
    subcategory: '',
    brand: '',
    brand_id: '',
    custom_brand: '', // For custom brand input
    sizes: [], // Array of selected sizes
  });
  const [imageError, setImageError] = useState(false);
  const [useCustomBrand, setUseCustomBrand] = useState(false);
  const [uploadingImages, setUploadingImages] = useState({}); // Track upload progress per image
  const [imageFiles, setImageFiles] = useState({}); // Store file objects for upload
  
  // Fetch brands
  const { data: brandsData, error: brandsError } = useQuery(
    'brands',
    () => brandsAPI.getAll(),
    { 
      staleTime: 10 * 60 * 1000,
      retry: 1,
      onError: (error) => {
        console.warn('Failed to fetch brands:', error);
      }
    }
  );
  
  const fetchedBrands = brandsData?.data?.data || [];
  
  // Sample brands if no brands are available or API fails
  const sampleBrands = [
    { id: 'sample-1', name: 'Nike' },
    { id: 'sample-2', name: 'Adidas' },
    { id: 'sample-3', name: 'Puma' },
    { id: 'sample-4', name: 'Reebok' },
    { id: 'sample-5', name: 'Under Armour' },
  ];
  
  // Use fetched brands if available, otherwise use sample brands
  // Also use sample brands if API returns empty array, fails, or route not found
  const hasBrandsError = brandsError || (brandsData?.data?.success === false);
  const brands = (fetchedBrands.length > 0 && !hasBrandsError) ? fetchedBrands : sampleBrands;
  
  // Fetch categories for legacy category dropdown
  const { data: categoriesData } = useQuery(
    'categories',
    () => categoriesAPI.getAll(),
    { staleTime: 10 * 60 * 1000 }
  );
  
  const categories = categoriesData?.data?.data || [];
  
  // Get main categories from mapping
  const mainCategories = getMainCategories();
  
  // Get subcategories based on selected category
  const availableSubcategories = formData.category 
    ? getSubcategories(formData.category)
    : [];

  // Sample image URLs from Varnelle.in for quick product creation
  const sampleImageUrls = [
    'https://varnelle.in/cdn/shop/files/meadow_mist_pose_4.png?v=1767429106&width=1024',
    'https://varnelle.in/cdn/shop/files/meadow_mist_pose_1.png?v=1767429106&width=1024',
    'https://varnelle.in/cdn/shop/files/Panda_pose_2.png?v=1767677298&width=1024',
    'https://varnelle.in/cdn/shop/files/Panda_pose_3.png?v=1767677298&width=1024',
    'https://varnelle.in/cdn/shop/files/Catpose2.png?v=1767677286&width=1024',
    'https://varnelle.in/cdn/shop/files/Catpose3.png?v=1767677286&width=1024',
    'https://varnelle.in/cdn/shop/files/Butterfly_pose_2.png?v=1767677350&width=1024',
    'https://varnelle.in/cdn/shop/files/Butterfly_pose_1.png?v=1767677350&width=1024',
    'https://varnelle.in/cdn/shop/files/BOTANIC_BLOOM_POSE-1.png?v=1767677266&width=1024',
    'https://varnelle.in/cdn/shop/files/BOTANIC_BLOOM_POSE-2.png?v=1767677266&width=678',
    'https://varnelle.in/cdn/shop/files/LAVENDER_POCKET_POSE-2.png?v=1767677309&width=1024',
    'https://varnelle.in/cdn/shop/files/LAVENDER_POCKET_POSE-3.png?v=1767677309&width=1024',
    'https://varnelle.in/cdn/shop/files/Whiskered_Mischief_Embroidered_Cat_Shirt_POSE-2.png?v=1767677389&width=1024',
    'https://varnelle.in/cdn/shop/files/Whiskered_Mischief_Embroidered_Cat_Shirt_POSE-3.png?v=1767677389&width=1024',
    'https://varnelle.in/cdn/shop/files/Leaf_Whisper_Minimalist_Embroidered_Shirt_POSE-1.png?v=1767677363&width=1024',
    'https://varnelle.in/cdn/shop/files/Leaf_Whisper_Minimalist_Embroidered_Shirt_POSE-3.png?v=1767677363&width=1024',
    'https://varnelle.in/cdn/shop/files/Amber_Bloom_Embroidered_Layered_Top_POSE-1.png?v=1767676871&width=1024',
    'https://varnelle.in/cdn/shop/files/Amber_Bloom_Embroidered_Layered_Top_POSE-3.png?v=1767676871&width=1024',
    'https://varnelle.in/cdn/shop/files/Ivory_Whisper_Embroidered_Layered_Top_POSE-1.png?v=1767676893&width=1024',
    'https://varnelle.in/cdn/shop/files/LilacBreezeEmbroideredOrganza-LayeredTopPOSE-2.png?v=1767676882&width=1024',
  ];


  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!canManageProducts) {
      toast.error('You don\'t have permission to manage products');
      navigate('/seller/dashboard');
      return;
    }

    if (isEdit) {
      fetchProduct();
    }
  }, [isAuthenticated, navigate, id, isEdit, canManageProducts]);

  const fetchProduct = async () => {
    try {
      setFetching(true);
      const response = await sellerAPI.getMyProducts();
      if (response.data.success) {
        const product = response.data.data.find(
          p => (p.id || p._id) === id
        );
        if (product) {
          setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price || '',
            stock: product.stock || '',
            sku: product.sku || '',
            status: product.status || 'active',
            image_url: product.image_url || product.image || '',
            image_urls: product.image_urls || (product.image_url ? [product.image_url] : []),
            category_id: product.category_id || '',
            category: product.category || '',
            subcategory: product.subcategory || '',
            brand: product.brand || '',
            brand_id: product.brand_id || null,
            custom_brand: '',
            sizes: (product.sizes && Array.isArray(product.sizes)) 
              ? product.sizes 
              : (typeof product.sizes === 'string' && product.sizes 
                  ? (() => {
                      try {
                        return JSON.parse(product.sizes);
                      } catch (e) {
                        return [];
                      }
                    })()
                  : []),
          });
        }
      }
    } catch (err) {
      toast.error('Failed to load product');
      navigate('/seller/products');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value,
      };
      
      // Reset subcategory when category changes
      if (name === 'category') {
        newData.subcategory = '';
      }
      
      return newData;
    });
    
    // Reset image error when URL changes
    if (name === 'image_url') {
      setImageError(false);
    }
  };
  
  const handleBrandChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      setUseCustomBrand(true);
      setFormData(prev => ({
        ...prev,
        brand_id: '',
        brand: '',
      }));
    } else {
      setUseCustomBrand(false);
      const selectedBrand = brands.find(b => (b.id || b._id) === value);
      // If it's a sample brand, just set the name, don't set brand_id
      const isSampleBrand = value && value.toString().startsWith('sample-');
      setFormData(prev => ({
        ...prev,
        brand: selectedBrand?.name || '',
        brand_id: isSampleBrand ? null : (value || ''),
      }));
    }
  };
  
  const handleCustomBrandChange = (e) => {
    setFormData(prev => ({
      ...prev,
      custom_brand: e.target.value,
      brand: e.target.value,
    }));
  };
  
  const handleAddImage = () => {
    if (formData.image_urls.length < 3) {
      setFormData(prev => ({
        ...prev,
        image_urls: [...prev.image_urls, ''],
      }));
    } else {
      toast.info('You can add maximum 3 images');
    }
  };
  
  const handleRemoveImage = async (index) => {
    const currentUrl = formData.image_urls[index];
    
    // If it's a Supabase URL, try to delete it
    if (currentUrl && (currentUrl.includes('supabase.co') || currentUrl.includes('storage/v1'))) {
      try {
        // Extract file path from URL
        const urlParts = currentUrl.split('/storage/v1/object/public/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1].split('/').slice(1).join('/');
          await uploadAPI.deleteImage(filePath);
        }
      } catch (error) {
        console.warn('Failed to delete image from Supabase:', error);
      }
    }
    
    // Remove from form
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index),
    }));
    
    // Remove file reference
    setImageFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[index];
      return newFiles;
    });
  };
  
  const handleImageUrlChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.map((url, i) => i === index ? value : url),
    }));
  };
  
  const handleFileSelect = async (index, file) => {
    if (!file) return;
    
    // Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Allowed: JPEG, PNG, GIF, WebP');
      return;
    }
    
    if (file.size > maxSize) {
      toast.error('File size exceeds 5MB limit');
      return;
    }
    
    // Store file for upload
    setImageFiles(prev => ({
      ...prev,
      [index]: file,
    }));
    
    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.map((url, i) => i === index ? previewUrl : url),
    }));
    
    // Upload to Supabase
    setUploadingImages(prev => ({ ...prev, [index]: true }));
    
    try {
      const response = await uploadAPI.uploadImage(file, 'products');
      
      if (response.data.success) {
        const supabaseUrl = response.data.data.url;
        
        // Update form data with Supabase URL
        setFormData(prev => ({
          ...prev,
          image_urls: prev.image_urls.map((url, i) => i === index ? supabaseUrl : url),
        }));
        
        // Clean up preview URL
        URL.revokeObjectURL(previewUrl);
        
        toast.success(`Image ${index + 1} uploaded successfully!`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Network error. Please check if backend server is running.';
      toast.error(`Failed to upload image ${index + 1}: ${errorMessage}`);
      console.error('Upload error:', error);
      
      // Remove preview on error
      setFormData(prev => ({
        ...prev,
        image_urls: prev.image_urls.map((url, i) => i === index ? '' : url),
      }));
      URL.revokeObjectURL(previewUrl);
    } finally {
      setUploadingImages(prev => ({ ...prev, [index]: false }));
    }
  };
  
  const handleRemoveUploadedImage = async (index) => {
    const currentUrl = formData.image_urls[index];
    
    // If it's a Supabase URL, try to delete it
    if (currentUrl && (currentUrl.includes('supabase.co') || currentUrl.includes('storage/v1'))) {
      try {
        // Extract file path from URL
        const urlParts = currentUrl.split('/storage/v1/object/public/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1].split('/').slice(1).join('/');
          await uploadAPI.deleteImage(filePath);
        }
      } catch (error) {
        console.warn('Failed to delete image from Supabase:', error);
      }
    }
    
    // Remove from form
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index),
    }));
    
    // Remove file reference
    setImageFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[index];
      return newFiles;
    });
  };

  const handleImageUrlTest = () => {
    if (formData.image_url) {
      const img = new Image();
      img.onload = () => {
        setImageError(false);
        toast.success('Image URL is valid!');
      };
      img.onerror = () => {
        setImageError(true);
        toast.error('Invalid image URL or image cannot be loaded');
      };
      img.src = formData.image_url;
    }
  };

  const handleUseSampleImage = (url) => {
    setFormData(prev => ({
      ...prev,
      image_url: url,
    }));
    setImageError(false);
    toast.success('Sample image URL added!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    
    if (!formData.subcategory) {
      toast.error('Please select a subcategory');
      return;
    }
    
    if (!formData.brand && !formData.custom_brand) {
      toast.error('Please select or enter a brand');
      return;
    }
    
    if (formData.image_urls.length === 0) {
      toast.error('Please add at least one product image');
      return;
    }

    try {
      setLoading(true);
      // Ensure price and stock are numbers, not strings
      const price = typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price;
      const stock = typeof formData.stock === 'string' ? parseInt(formData.stock) : (formData.stock || 0);
      
      // Validate price
      if (isNaN(price) || price < 0) {
        toast.error('Please enter a valid price (number >= 0)');
        return;
      }
      
      // Validate stock
      if (isNaN(stock) || stock < 0) {
        toast.error('Please enter a valid stock quantity (number >= 0)');
        return;
      }
      
      // Handle brand_id - don't send sample brand IDs
      let brandIdToSend = null;
      if (!useCustomBrand && formData.brand_id) {
        // Only send brand_id if it's not a sample brand (sample brands start with "sample-")
        if (!formData.brand_id.toString().startsWith('sample-')) {
          brandIdToSend = formData.brand_id;
        }
      }
      
      const productData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        price: price,
        stock: stock,
        sku: formData.sku?.trim() || null,
        status: formData.status,
        image_url: formData.image_urls[0] || formData.image_url || '', // First image as primary
        image_urls: formData.image_urls.filter(url => url && url.trim() !== ''), // Array of all images
        category_id: formData.category_id || null,
        category: formData.category,
        subcategory: formData.subcategory,
        brand: formData.brand || formData.custom_brand,
        brand_id: brandIdToSend,
        sizes: formData.sizes || [], // Array of selected sizes
      };

      let response;
      if (isEdit) {
        response = await sellerAPI.updateProduct(id, productData);
      } else {
        response = await sellerAPI.createProduct(productData);
      }

      if (response.data.success) {
        toast.success(`Product ${isEdit ? 'updated' : 'created'} successfully!`);
        navigate('/seller/products');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} product`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Loading />;

  return (
    <div className="product-form">
      <div className="form-header">
        <h1>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
        <button className="btn-back" onClick={() => navigate('/seller/products')}>
          ← Back to Products
        </button>
      </div>

      <form onSubmit={handleSubmit} className="product-form-content">
        <div className="form-group">
          <label htmlFor="name">Product Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter product name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Enter product description"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Price (₹) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="stock">Stock Quantity</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              placeholder="0"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="sku">SKU (Stock Keeping Unit)</label>
            <input
              type="text"
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="e.g., PROD-001"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Main Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Main Category</option>
              {mainCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="subcategory">Subcategory *</label>
            <select
              id="subcategory"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              required
              disabled={!formData.category}
            >
              <option value="">
                {formData.category ? 'Select Subcategory' : 'Select Category First'}
              </option>
              {availableSubcategories.map((subcat, idx) => (
                <option key={`${subcat}-${idx}`} value={subcat}>
                  {subcat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="brand_id">Brand *</label>
          {!useCustomBrand ? (
            <>
              <select
                id="brand_id"
                name="brand_id"
                value={formData.brand_id}
                onChange={handleBrandChange}
                required={!useCustomBrand}
              >
                <option value="">Select Brand</option>
                {brands.map((brand) => (
                  <option key={brand.id || brand._id} value={brand.id || brand._id}>
                    {brand.name}
                  </option>
                ))}
                <option value="custom">+ Add Custom Brand</option>
              </select>
              <small className="form-hint">
                Select a brand from the list or choose "Add Custom Brand" to enter your own.
              </small>
            </>
          ) : (
            <>
              <div className="custom-brand-input-group">
                <input
                  type="text"
                  id="custom_brand"
                  name="custom_brand"
                  value={formData.custom_brand}
                  onChange={handleCustomBrandChange}
                  placeholder="Enter brand name"
                  required={useCustomBrand}
                  className="custom-brand-input"
                />
                <button
                  type="button"
                  className="btn-remove-custom-brand"
                  onClick={() => {
                    setUseCustomBrand(false);
                    setFormData(prev => ({
                      ...prev,
                      custom_brand: '',
                      brand: '',
                    }));
                  }}
                  title="Use dropdown instead"
                >
                  <FiX />
                </button>
              </div>
              <small className="form-hint">
                Enter your brand name. You can switch back to the dropdown if needed.
              </small>
            </>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="category_id">Legacy Category (Optional)</label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
          >
            <option value="">Select Legacy Category (Optional)</option>
            {categories.map((cat) => (
              <option key={cat.id || cat._id} value={cat.id || cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          <small className="form-hint">
            This field is kept for backward compatibility. Use Main Category and Subcategory above.
          </small>
        </div>

        <div className="form-group">
          <label>Available Sizes (Optional)</label>
          <div className="size-selection-form">
            {['S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XS', 'Free Size'].map((size) => (
              <label key={size} className="size-checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.sizes.includes(size)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({
                        ...prev,
                        sizes: [...prev.sizes, size]
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        sizes: prev.sizes.filter(s => s !== size)
                      }));
                    }
                  }}
                />
                <span className="size-checkbox-text">{size}</span>
              </label>
            ))}
          </div>
          <small className="form-hint">
            Select the sizes available for this product. Leave empty if size doesn't apply.
          </small>
        </div>

        <div className="form-group">
          <label>
            <FiImage /> Product Images * (Up to 3 images)
          </label>
          
          {/* Uploaded Images Gallery - Scrollable Preview */}
          {formData.image_urls.filter(url => url && url.trim() !== '').length > 0 && (
            <div className="uploaded-images-gallery">
              <div className="gallery-header">
                <span className="gallery-title">Uploaded Images ({formData.image_urls.filter(url => url && url.trim() !== '').length})</span>
                <span className="gallery-hint">← Scroll to see all images →</span>
              </div>
              <div className="gallery-scroll-container">
                {formData.image_urls.map((url, index) => {
                  if (!url || url.trim() === '') return null;
                  return (
                    <div key={index} className="gallery-image-item">
                      <div className="gallery-image-wrapper">
                        <img 
                          src={url} 
                          alt={`Product Image ${index + 1}`} 
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23ddd" width="150" height="150"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage Error%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        {uploadingImages[index] && (
                          <div className="gallery-upload-overlay">
                            <div className="upload-spinner">⏳</div>
                            <span>Uploading...</span>
                          </div>
                        )}
                        <div className="gallery-image-number">{index + 1}</div>
                        <button
                          type="button"
                          className="gallery-remove-btn"
                          onClick={() => handleRemoveImage(index)}
                          title="Remove this image"
                        >
                          <FiX />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Multiple Image Uploads - File Upload or URL */}
          <div className="multiple-images-section">
            {formData.image_urls.map((url, index) => (
              <div key={index} className="image-url-item">
                <div className="image-upload-options">
                  <label className="file-upload-label">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileSelect(index, file);
                        }
                      }}
                      style={{ display: 'none' }}
                      disabled={uploadingImages[index]}
                    />
                    <span className="file-upload-button">
                      {uploadingImages[index] ? (
                        <>⏳ Uploading...</>
                      ) : (
                        <>📤 Upload to Supabase</>
                      )}
                    </span>
                  </label>
                  <span className="upload-or">OR</span>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    placeholder={`Image ${index + 1} URL (https://example.com/image.jpg)`}
                    className={`image-url-input ${imageError ? 'error' : ''}`}
                    required
                  />
                  {formData.image_urls.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove-image"
                      onClick={() => handleRemoveImage(index)}
                      title="Remove this image"
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {formData.image_urls.length < 3 && (
              <button
                type="button"
                className="btn-add-image"
                onClick={handleAddImage}
              >
                <FiImage /> Add Another Image ({formData.image_urls.length}/3)
              </button>
            )}
          </div>

          {/* Legacy single image URL (for backward compatibility) */}
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label htmlFor="image_url">
              <FiImage /> Legacy Image URL (Optional - for backward compatibility)
            </label>
            <div className="image-url-input-group">
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className={imageError ? 'error' : ''}
              />
              <button
                type="button"
                className="btn-test-image"
                onClick={handleImageUrlTest}
                disabled={!formData.image_url}
                title="Test Image URL"
              >
                <FiCheck />
              </button>
            </div>
          </div>

          {/* Sample Image URLs */}
          <div className="sample-images-section">
            <label className="sample-images-label">
              <FiLink /> Quick Add: Sample Image URLs from Varnelle.in
            </label>
            <div className="sample-images-grid">
              {sampleImageUrls.map((url, index) => (
                <button
                  key={index}
                  type="button"
                  className="sample-image-btn"
                  onClick={() => {
                    if (formData.image_urls.length < 3) {
                      // Find first empty slot or add new one
                      const emptyIndex = formData.image_urls.findIndex(u => !u || u.trim() === '');
                      if (emptyIndex >= 0) {
                        handleImageUrlChange(emptyIndex, url);
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          image_urls: [...prev.image_urls, url],
                        }));
                      }
                    } else {
                      toast.info('Maximum 3 images allowed');
                    }
                  }}
                  title="Click to add this image"
                >
                  <img src={url} alt={`Sample ${index + 1}`} />
                  <span className="sample-overlay">Add This</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate('/seller/products')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;

