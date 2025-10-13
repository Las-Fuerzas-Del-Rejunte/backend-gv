import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductsRepository } from './repositories/products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { BrandsService } from '../brands/brands.service';
import { LinesService } from '../lines/lines.service';
import { CategoriesService } from '../categories/categories.service';
import { ClientsService } from '../clients/clients.service';

interface BrandResolution {
  brandId: string;
  rollbackActions: Array<() => Promise<void>>;
}

interface LineResolution {
  lineId: string;
  rollbackActions: Array<() => Promise<void>>;
}

interface CategoryResolution {
  categoryId?: string;
  rollbackActions: Array<() => Promise<void>>;
}

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly brandsService: BrandsService,
    private readonly linesService: LinesService,
    private readonly categoriesService: CategoriesService,
    private readonly clientsService: ClientsService,
  ) {}

  findAll(): Promise<Product[]> {
    return this.productsRepository.findAll();
  }

  findOne(id: string): Promise<Product> {
    return this.productsRepository.findById(id);
  }

  async create(payload: CreateProductDto): Promise<Product> {
    let brandInfo: BrandResolution | null = null;
    let lineInfo: LineResolution | null = null;
    let categoryInfo: CategoryResolution | null = null;

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

      categoryInfo = await this.resolveCategory({
        categoryId: payload.categoryId,
        newCategory: payload.newCategory,
      });

      if (payload.clientId !== undefined) {
        await this.clientsService.findOne(payload.clientId);
      }

      const productPayload: CreateProductDto = {
        userId: payload.userId,
        name: payload.name,
        price: payload.price,
        stockQuantity: payload.stockQuantity,
        minStock: payload.minStock ?? 0,
        brandId: brandInfo.brandId,
        lineId: lineInfo.lineId,
      } as CreateProductDto;

      if (payload.description !== undefined) {
        productPayload.description = payload.description;
      }

      if (payload.image !== undefined) {
        productPayload.image = payload.image;
      }

      if (categoryInfo.categoryId !== undefined) {
        productPayload.categoryId = categoryInfo.categoryId;
      }

      if (payload.clientId !== undefined) {
        productPayload.clientId = payload.clientId;
      }

      const product = await this.productsRepository.create(productPayload);
      return this.productsRepository.findById(product.id);
    } catch (error) {
      await this.rollback(
        categoryInfo?.rollbackActions,
        lineInfo?.rollbackActions,
        brandInfo?.rollbackActions,
      );
      throw error;
    }
  }

  async update(id: string, payload: UpdateProductDto): Promise<Product> {
    const existing = await this.productsRepository.findById(id);
    const userId = payload.userId ?? existing.userId;

    let brandInfo: BrandResolution | null = null;
    let lineInfo: LineResolution | null = null;
    let categoryInfo: CategoryResolution | null = null;

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
      });

      categoryInfo = await this.resolveCategory({
        categoryId: payload.categoryId,
        newCategory: payload.newCategory,
        currentCategoryId: existing.categoryId,
      });

      if (payload.clientId !== undefined) {
        await this.clientsService.findOne(payload.clientId);
      }

      const productPayload: UpdateProductDto = {
        userId,
        brandId: brandInfo.brandId,
        lineId: lineInfo.lineId,
      } as UpdateProductDto;

      if (payload.name !== undefined) {
        productPayload.name = payload.name;
      }

      if (payload.description !== undefined) {
        productPayload.description = payload.description;
      }

      if (payload.price !== undefined) {
        productPayload.price = payload.price;
      }

      if (payload.image !== undefined) {
        productPayload.image = payload.image;
      }

      if (payload.stockQuantity !== undefined) {
        productPayload.stockQuantity = payload.stockQuantity;
      }

      if (payload.minStock !== undefined) {
        productPayload.minStock = payload.minStock;
      }

      if (categoryInfo.categoryId !== undefined) {
        productPayload.categoryId = categoryInfo.categoryId;
      }

      if (payload.clientId !== undefined) {
        productPayload.clientId = payload.clientId;
      }

      return this.productsRepository.update(id, productPayload);
    } catch (error) {
      await this.rollback(
        categoryInfo?.rollbackActions,
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
    ...actionGroups: Array<Array<() => Promise<void>> | undefined>
  ): Promise<void> {
    const actions = actionGroups
      .filter((group): group is Array<() => Promise<void>> => !!group)
      .flat()
      .reverse();

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

  private async resolveCategory(options: {
    categoryId?: string;
    newCategory?: CreateProductDto['newCategory'];
    currentCategoryId?: string | null;
  }): Promise<CategoryResolution> {
    const { categoryId, newCategory, currentCategoryId } = options;
    const rollbackActions: Array<() => Promise<void>> = [];

    if (newCategory && categoryId) {
      throw new BadRequestException(
        'Provide either an existing categoryId or newCategory data, not both.',
      );
    }

    if (newCategory) {
      const category = await this.categoriesService.create(newCategory);
      rollbackActions.push(async () =>
        this.categoriesService.remove(category.id),
      );
      return { categoryId: category.id, rollbackActions };
    }

    if (categoryId) {
      await this.categoriesService.findOne(categoryId);
      return { categoryId, rollbackActions };
    }

    if (currentCategoryId) {
      return { categoryId: currentCategoryId, rollbackActions };
    }

    return { rollbackActions };
  }
}
