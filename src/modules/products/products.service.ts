import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductsRepository } from './repositories/products.repository';
import {
  CreateProductDto,
  CreateProductSupplierDto,
} from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { BrandsService } from '../brands/brands.service';
import { LinesService } from '../lines/lines.service';
import { ProductSuppliersRepository } from './repositories/product-suppliers.repository';
import { SuppliersService } from '../suppliers/suppliers.service';
import { ProductSupplier } from './entities/product-supplier.entity';

interface BrandResolution {
  brandId: string;
  rollbackActions: Array<() => Promise<void>>;
}

interface LineResolution {
  lineId: string;
  rollbackActions: Array<() => Promise<void>>;
}

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly brandsService: BrandsService,
    private readonly linesService: LinesService,
    private readonly productSuppliersRepository: ProductSuppliersRepository,
    private readonly suppliersService: SuppliersService,
  ) {}

  findAll(): Promise<Product[]> {
    return this.productsRepository.findAll();
  }

  findOne(id: string): Promise<Product> {
    return this.productsRepository.findById(id);
  }

  async create(payload: CreateProductDto): Promise<Product> {
    const normalizedSuppliers = this.normalizeSuppliers(payload.suppliers);
    await this.ensureSuppliersExist(normalizedSuppliers);

    let brandInfo: BrandResolution | null = null;
    let lineInfo: LineResolution | null = null;
    let product: Product | null = null;

    try {
      brandInfo = await this.resolveBrand({
        brandId: payload.brandId,
        newBrand: payload.newBrand,
        userId: payload.userId,
      });

      lineInfo = await this.resolveLine({
        lineId: payload.lineId,
        newLine: payload.newLine,
        brandId: brandInfo.brandId,
      });

      const {
        newBrand: _newBrand,
        newLine: _newLine,
        suppliers: _suppliers,
        ...rest
      } = payload;
      void _newBrand;
      void _newLine;
      void _suppliers;
      const productPayload: CreateProductDto = {
        ...rest,
        brandId: brandInfo.brandId,
        lineId: lineInfo.lineId,
      } as CreateProductDto;

      if (productPayload.minStock === undefined) {
        productPayload.minStock = 0;
      }

      if (productPayload.minStock === undefined) {
        productPayload.minStock = 0;
      }

      product = await this.productsRepository.create(productPayload);
      await this.productSuppliersRepository.replaceForProduct(
        product.id,
        normalizedSuppliers,
        [],
      );

      return await this.productsRepository.findById(product.id);
    } catch (error) {
      if (product) {
        try {
          await this.productsRepository.remove(product.id);
        } catch {
          // Best-effort cleanup; ignore removal issues.
        }
      }

      await this.rollback(
        lineInfo?.rollbackActions,
        brandInfo?.rollbackActions,
      );
      throw error;
    }
  }

  async update(id: string, payload: UpdateProductDto): Promise<Product> {
    const existing = await this.productsRepository.findById(id);
    const userId = payload.userId ?? existing.userId;

    const suppliersProvided = payload.suppliers !== undefined;
    const normalizedSuppliers = suppliersProvided
      ? this.normalizeSuppliers(payload.suppliers ?? [])
      : undefined;

    if (normalizedSuppliers !== undefined) {
      await this.ensureSuppliersExist(normalizedSuppliers);
    }

    let brandInfo: BrandResolution | null = null;
    let lineInfo: LineResolution | null = null;
    let productUpdated = false;

    try {
      brandInfo = await this.resolveBrand({
        brandId: payload.brandId ?? existing.brandId,
        newBrand: payload.newBrand,
        userId,
        allowExisting: true,
        currentBrandId: existing.brandId,
      });

      lineInfo = await this.resolveLine({
        lineId: payload.lineId ?? existing.lineId,
        newLine: payload.newLine,
        brandId: brandInfo.brandId,
        currentLineId: existing.lineId,
      });

      const {
        newBrand: _updateNewBrand,
        newLine: _updateNewLine,
        suppliers: _updateSuppliers,
        ...rest
      } = payload;
      void _updateNewBrand;
      void _updateNewLine;
      void _updateSuppliers;
      const productPayload: UpdateProductDto = {
        ...rest,
        brandId: brandInfo.brandId,
        lineId: lineInfo.lineId,
        userId,
      } as UpdateProductDto;

      const product = await this.productsRepository.update(id, productPayload);
      productUpdated = true;

      if (normalizedSuppliers !== undefined) {
        await this.productSuppliersRepository.replaceForProduct(
          id,
          normalizedSuppliers,
          existing.suppliers,
        );
        return await this.productsRepository.findById(id);
      }

      return product;
    } catch (error) {
      if (normalizedSuppliers !== undefined) {
        try {
          await this.productSuppliersRepository.replaceForProduct(
            id,
            this.toSupplierDtos(existing.suppliers),
            [],
          );
        } catch {
          // Ignore restore issues to avoid shadowing the original error.
        }
      }

      if (productUpdated) {
        try {
          await this.productsRepository.update(id, {
            userId: existing.userId,
            brandId: existing.brandId,
            lineId: existing.lineId,
            name: existing.name,
            description: existing.description ?? null,
            category: existing.category,
            price: existing.price,
            image: existing.image ?? null,
            stockQuantity: existing.stockQuantity,
            minStock: existing.minStock,
          } as UpdateProductDto);
        } catch {
          // Ignore rollback errors; surface original failure.
        }
      }

      await this.rollback(
        lineInfo?.rollbackActions,
        brandInfo?.rollbackActions,
      );
      throw error;
    }
  }

  remove(id: string): Promise<void> {
    return this.productsRepository.remove(id);
  }

  async findLowStock(): Promise<Product[]> {
    const products = await this.productsRepository.findAll();
    return products.filter((product) => {
      const threshold = product.minStock ?? 0;
      return product.stockQuantity <= threshold;
    });
  }

  private async rollback(
    lineActions?: Array<() => Promise<void>>,
    brandActions?: Array<() => Promise<void>>,
  ): Promise<void> {
    const actions = [...(brandActions ?? []), ...(lineActions ?? [])].reverse();

    for (const action of actions) {
      try {
        await action();
      } catch {
        // Cleanup failures are ignored to preserve the original error context.
      }
    }
  }

  private async resolveBrand(options: {
    brandId?: string;
    newBrand?: CreateProductDto['newBrand'];
    userId: string;
    allowExisting?: boolean;
    currentBrandId?: string;
  }): Promise<BrandResolution> {
    const {
      brandId,
      newBrand,
      userId,
      allowExisting = false,
      currentBrandId,
    } = options;
    const rollbackActions: Array<() => Promise<void>> = [];

    if (newBrand && brandId) {
      throw new BadRequestException(
        'Provide either an existing brandId or newBrand data, not both.',
      );
    }

    if (!newBrand && !brandId) {
      throw new BadRequestException('A brand reference is required.');
    }

    if (newBrand) {
      const brand = await this.brandsService.create({
        ...newBrand,
        userId,
      });

      rollbackActions.push(async () => this.brandsService.remove(brand.id));

      return { brandId: brand.id, rollbackActions };
    }

    const resolvedBrandId = brandId!;

    if (!allowExisting || resolvedBrandId !== currentBrandId) {
      await this.brandsService.findOne(resolvedBrandId);
    }

    return { brandId: resolvedBrandId, rollbackActions };
  }

  private async resolveLine(options: {
    lineId?: string;
    newLine?: CreateProductDto['newLine'];
    brandId: string;
    currentLineId?: string;
  }): Promise<LineResolution> {
    const { lineId, newLine, brandId } = options;
    const rollbackActions: Array<() => Promise<void>> = [];

    if (newLine && lineId) {
      throw new BadRequestException(
        'Provide either an existing lineId or newLine data, not both.',
      );
    }

    if (!newLine && !lineId) {
      throw new BadRequestException('A line reference is required.');
    }

    if (newLine) {
      const line = await this.linesService.create({
        ...newLine,
        brandId,
      });

      rollbackActions.push(async () => this.linesService.remove(line.id));

      return { lineId: line.id, rollbackActions };
    }

    const resolvedLineId = lineId!;
    const existingLine = await this.linesService.findOne(resolvedLineId);

    if (existingLine.brandId !== brandId) {
      throw new BadRequestException(
        'The selected line does not belong to the chosen brand.',
      );
    }

    return { lineId: resolvedLineId, rollbackActions };
  }

  private normalizeSuppliers(
    input?: CreateProductSupplierDto[] | null,
  ): CreateProductSupplierDto[] {
    if (!input) {
      return [];
    }

    const seenCodes = new Set<string>();
    const seenSuppliers = new Set<string>();

    return input.map((item) => {
      const supplierId = item.supplierId;
      const code = item.code.trim();

      if (!code) {
        throw new BadRequestException('Supplier code cannot be empty.');
      }

      if (seenSuppliers.has(supplierId)) {
        throw new BadRequestException(
          'Duplicate supplier detected in payload.',
        );
      }

      const codeKey = code.toLowerCase();
      if (seenCodes.has(codeKey)) {
        throw new BadRequestException(
          'Supplier codes must be unique per product (case insensitive).',
        );
      }

      seenSuppliers.add(supplierId);
      seenCodes.add(codeKey);

      return { supplierId, code };
    });
  }

  private async ensureSuppliersExist(
    suppliers: CreateProductSupplierDto[],
  ): Promise<void> {
    if (suppliers.length === 0) {
      return;
    }

    await Promise.all(
      suppliers.map((supplier) =>
        this.suppliersService.findOne(supplier.supplierId),
      ),
    );
  }

  private toSupplierDtos(
    existing: ProductSupplier[],
  ): CreateProductSupplierDto[] {
    return existing.map((item) => ({
      supplierId: item.supplierId,
      code: item.code,
    }));
  }
}
