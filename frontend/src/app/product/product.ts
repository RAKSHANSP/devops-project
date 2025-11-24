import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  _id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  location: string;
  phone: string;
  imageUrl?: string;
  postedBy: { name: string }; // No optional chaining needed as per interface
  postedDate: Date;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product.html',
  styleUrls: ['./product.css']
})
export class ProductComponent implements OnInit {
  products: Product[] = [];
  allProducts: Product[] = []; // Store all products for filtering
  searchTerm: string = '';
  currentProduct: any = null;
  isEditing = false;
  token = localStorage.getItem('token') || '';
  selectedImage: File | null = null;
  showForm = false;
  errorMessage: string = '';
  loading = false; // Loading state
  private searchTimeout: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    if (!this.token) {
      this.errorMessage = 'Please log in to view products.';
      return;
    }

    this.loading = true;
    const url = this.searchTerm ? `http://localhost:5000/products?search=${encodeURIComponent(this.searchTerm)}` : 'http://localhost:5000/products';
    
    this.http.get<Product[]>(url, { 
      headers: { Authorization: `Bearer ${this.token}` } 
    })
      .subscribe({
        next: (data) => {
          console.log('Fetched products:', data);
          if (this.searchTerm) {
            this.products = data;
          } else {
            this.products = data;
            this.allProducts = [...data];
          }
          this.errorMessage = '';
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading products:', err);
          this.errorMessage = 'Error loading products: ' + (err.error?.message || 'Unknown error');
          if (err.status === 401) {
            this.errorMessage = 'Please log in to view products.';
            this.products = [];
            this.allProducts = [];
          }
          this.loading = false;
        }
      });
  }

  onSearchTermChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.performSearch();
    }, 300);
  }

  performSearch() {
    if (this.searchTerm.trim()) {
      this.loadProducts();
    } else {
      this.searchTerm = '';
      this.products = [...this.allProducts];
      this.errorMessage = '';
    }
  }

  onFileSelected(event: any) {
    this.selectedImage = event.target.files[0];
  }

  showAddForm() {
    this.currentProduct = { name: '', description: '', quantity: 0, price: 0, location: '', phone: '' };
    this.selectedImage = null;
    this.isEditing = false;
    this.showForm = true;
    this.errorMessage = '';
    this.searchTerm = '';
    this.products = [...this.allProducts];
  }

  hideForm() {
    this.showForm = false;
    this.currentProduct = null;
    this.errorMessage = '';
  }

  editProduct(product: Product) {
    this.currentProduct = { ...product };
    this.selectedImage = null;
    this.isEditing = true;
    this.showForm = true;
    this.errorMessage = '';
    this.searchTerm = '';
    this.products = [...this.allProducts];
  }

  saveProduct() {
    // Validate name
    if (!this.currentProduct.name.trim()) {
      this.errorMessage = 'Name is required';
      return;
    }

    // Validate description
    if (!this.currentProduct.description.trim()) {
      this.errorMessage = 'Description is required';
      return;
    }

    // Validate quantity
    if (this.currentProduct.quantity <= 0 || isNaN(this.currentProduct.quantity)) {
      this.errorMessage = 'Quantity must be a positive number';
      return;
    }

    // Validate price
    if (this.currentProduct.price <= 0 || isNaN(this.currentProduct.price)) {
      this.errorMessage = 'Price must be a positive number';
      return;
    }

    // Validate location
    if (!this.currentProduct.location.trim()) {
      this.errorMessage = 'Location is required';
      return;
    }

    // Validate phone number: exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(this.currentProduct.phone)) {
      this.errorMessage = 'Phone number must be exactly 10 digits';
      return;
    }

    // Validate image is required
    if (!this.selectedImage) {
      this.errorMessage = 'Image is required';
      return;
    }

    if (!this.token) {
      this.errorMessage = 'Please log in to save a product.';
      return;
    }

    this.loading = true;
    const formData = new FormData();
    formData.append('name', this.currentProduct.name);
    formData.append('description', this.currentProduct.description);
    formData.append('quantity', this.currentProduct.quantity.toString());
    formData.append('price', this.currentProduct.price.toString());
    formData.append('location', this.currentProduct.location);
    formData.append('phone', this.currentProduct.phone);
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    const url = this.isEditing ? `http://localhost:5000/products/${this.currentProduct._id}` : 'http://localhost:5000/products';
    const method = this.isEditing ? 'PUT' : 'POST';

    this.http.request(method, url, {
      body: formData,
      headers: { Authorization: `Bearer ${this.token}` },
      reportProgress: true
    }).subscribe({
      next: (res: any) => {
        console.log('Save response:', res);
        this.loadProducts();
        this.hideForm();
        this.errorMessage = 'Product saved successfully!';
        setTimeout(() => this.errorMessage = '', 3000);
        this.loading = false;
      },
      error: (err) => {
        console.error('Save error:', err);
        this.errorMessage = 'Error saving product: ' + (err.error?.message || 'Unknown error');
        if (err.status === 401) {
          this.errorMessage = 'Invalid token. Please log in again.';
        }
        this.loading = false;
      }
    });
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.loading = true;
      this.http.delete(`http://localhost:5000/products/${id}`, {
        headers: { Authorization: `Bearer ${this.token}` }
      }).subscribe({
        next: () => {
          this.loadProducts();
          this.errorMessage = 'Product deleted!';
          setTimeout(() => this.errorMessage = '', 3000);
          this.loading = false;
        },
        error: (err) => {
          console.error('Delete error:', err);
          this.errorMessage = 'Error deleting product: ' + (err.error?.message || 'Unknown error');
          this.loading = false;
        }
      });
    }
  }

  buyProduct(product: Product) {
    if (confirm(`Confirm purchase of ${product.name} for ₹${product.price}?`)) {
      alert('Order recorded! Call the seller...');
      window.open(`tel:${product.phone}`);
    }
  }

  isOwner(product: Product): boolean {
    return true; // Placeholder for demo
  }

  updateQuantity(productId: string, newQuantity: number) {
    this.http.put(`http://localhost:5000/products/${productId}`, { quantity: newQuantity }, {
      headers: { Authorization: `Bearer ${this.token}` }
    }).subscribe({
      next: () => {
        this.loadProducts();
        this.errorMessage = 'Quantity updated!';
        setTimeout(() => this.errorMessage = '', 2000);
      },
      error: (err) => {
        console.error('Update quantity error:', err);
        this.errorMessage = 'Error updating quantity: ' + (err.error?.message || 'Unknown error');
      }
    });
  }

  updateQuantityInline(event: Event, productId: string) {
    const target = event.target as HTMLElement;
    if (target && target.innerText) {
      const newQuantity = parseInt(target.innerText.trim(), 10);
      if (!isNaN(newQuantity) && newQuantity >= 0) {
        this.updateQuantity(productId, newQuantity);
      } else {
        this.errorMessage = 'Invalid quantity';
        setTimeout(() => this.errorMessage = '', 2000);
        this.loadProducts();
      }
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.performSearch();
  }

  searchProducts() {
    this.performSearch();
  }

  // Add onImageError method to handle image load errors
  onImageError(event: Event) {
    const element = event.target as HTMLImageElement;
    element.style.display = 'none'; // Hide broken image
    const parent = element.parentElement;
    if (parent) {
      const noImage = document.createElement('div');
      noImage.className = 'no-image';
      noImage.textContent = 'No Image';
      parent.appendChild(noImage);
    }
  }
}