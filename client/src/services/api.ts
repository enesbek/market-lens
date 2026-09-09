import { Product, Campaign, SimulationResult, BatchSimulationSummary, MarketplaceAccount } from '../types/index';

const API_BASE = '/api';

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products`);
  const json = await res.json();
  return json.data || [];
}

export async function createProduct(product: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Ürün eklenemedi');
  return json.data;
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Ürün güncellenemedi');
  return json.data;
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Ürün silinemedi');
}

export async function fetchCampaigns(marketplace?: string): Promise<Campaign[]> {
  const url = marketplace ? `${API_BASE}/campaigns?marketplace=${marketplace}` : `${API_BASE}/campaigns`;
  const res = await fetch(url);
  const json = await res.json();
  return json.data || [];
}

export async function createCampaign(campaign: Partial<Campaign>): Promise<Campaign> {
  const res = await fetch(`${API_BASE}/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(campaign)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Kampanya eklenemedi');
  return json.data;
}

export async function simulatePlayground(params: any): Promise<SimulationResult> {
  const res = await fetch(`${API_BASE}/simulate/playground`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Simülasyon başarısız');
  return json.data;
}

export async function simulateBatch(params: { campaignId?: string; customCampaign?: Campaign; categoryFilter?: string; marketplaceFilter?: string }): Promise<BatchSimulationSummary> {
  const res = await fetch(`${API_BASE}/simulate/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Toplu simülasyon başarısız');
  return json.data;
}

export async function fetchInsights(): Promise<any> {
  const res = await fetch(`${API_BASE}/simulate/insights`);
  const json = await res.json();
  return json.data || {};
}

export async function fetchMarketplaces(): Promise<{ accounts: MarketplaceAccount[]; shippingTiers: any[]; commissionRates: any[] }> {
  const res = await fetch(`${API_BASE}/marketplaces`);
  const json = await res.json();
  return json.data || { accounts: [], shippingTiers: [], commissionRates: [] };
}

export async function syncMarketplace(marketplace?: string): Promise<{ success: boolean; message: string; syncTime: string }> {
  const res = await fetch(`${API_BASE}/marketplaces/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ marketplace })
  });
  return res.json();
}
