import fs from 'node:fs';
import path from 'node:path';
import { Logger } from '@melodiespark/shared/logger';
import { validate, ProductSchema } from '@melodiespark/schemas';

export class CommerceService {
  constructor() {
    this.logger = new Logger('CommerceService');
    this.catalogDir = 'C:/Melodie/data/catalog';
    this.catalog = [];
  }

  async initialize() {
    if (!fs.existsSync(this.catalogDir)) fs.mkdirSync(this.catalogDir, { recursive: true });
    this.logger.info('Commerce service initialized');
  }

  addProduct(product) {
    const v = validate(product, ProductSchema);
    if (!v.valid) throw new Error('Invalid Product Data');
    this.catalog.push(product);
    fs.writeFileSync(path.join(this.catalogDir, 'products.json'), JSON.stringify(this.catalog, null, 2));
    return product;
  }

  getProducts() { return this.catalog; }
}
