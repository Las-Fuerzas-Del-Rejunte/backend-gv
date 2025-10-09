# Diagrama de clases y arquitectura

## Modelo de dominio

```mermaid
classDiagram
    direction LR

    class Brand {
      +id: string
      +userId: string
      +name: string
      +description: string?
      +logo: string?
      +createdAt: string
      +updatedAt: string
    }

    class Line {
      +id: string
      +brandId: string
      +name: string
      +description: string?
      +createdAt: string
      +updatedAt: string
    }

    class Product {
      +id: string
      +userId: string
      +brandId: string
      +lineId: string
      +name: string
      +description: string?
      +category: string
      +price: number
      +image: string?
      +stockQuantity: number
      +minStock: number
      +createdAt: string
      +updatedAt: string
      +suppliers: ProductSupplier[]
    }

    class ProductSupplier {
      +id: string
      +productId: string
      +supplierId: string
      +code: string
      +createdAt: string
    }

    class Supplier {
      +id: string
      +name: string
      +contactPerson: string?
      +email: string?
      +phone: string?
      +address: string?
      +createdAt: string
      +updatedAt: string
    }

    class Sale {
      +id: string
      +employeeId: string
      +totalAmount: number
      +saleDate: string
      +notes: string?
      +createdAt: string
      +updatedAt: string
    }

    class SaleItem {
      +id: string
      +saleId: string
      +productId: string
      +quantity: number
      +unitPrice: number
      +subtotal: number
      +createdAt: string
    }

    Brand "1" <-- "0..*" Line : agrupa
    Line "1" <-- "0..*" Product : clasifica
    Product "1" <-- "0..*" SaleItem : vendido en
    Sale "1" --> "1..*" SaleItem : agrupa
    Product "1" <-- "0..*" ProductSupplier : codifica
    Supplier "1" <-- "0..*" ProductSupplier : abastece
```

**Relaciones clave**
- Cada linea pertenece a una marca y su nombre es unico dentro de esa marca.
- Un producto debe indicar obligatoriamente linea y marca; los DTO permiten adjuntar `newBrand` y `newLine` para crearlos en el mismo flujo.
- `ProductSupplier` modela la relacion N a N entre productos y proveedores, almacenando el codigo propio de cada proveedor.
- El umbral de stock (`minStock`) vive en `Product` y ahora siempre se normaliza a cero si no se especifica.

## Capas de aplicacion y acceso a datos

```mermaid
classDiagram
    direction TB

    class SupabaseService

    class SupabaseCrudRepository~Record,Domain,Create,Update~ {
      +findAll()
      +findById(id)
      +create(payload)
      +update(id, payload)
      +remove(id)
    }
    <<abstract>> SupabaseCrudRepository~Record,Domain,Create,Update~

    SupabaseService <.. SupabaseCrudRepository~Record,Domain,Create,Update~ : usa

    class BrandsRepository
    class LinesRepository
    class ProductsRepository
    class ProductSuppliersRepository
    class SuppliersRepository
    class SalesRepository

    SupabaseCrudRepository~Record,Domain,Create,Update~ <|-- BrandsRepository
    SupabaseCrudRepository~Record,Domain,Create,Update~ <|-- LinesRepository
    SupabaseCrudRepository~Record,Domain,Create,Update~ <|-- ProductsRepository
    SupabaseCrudRepository~Record,Domain,Create,Update~ <|-- SuppliersRepository

    SupabaseService <.. ProductSuppliersRepository
    SupabaseService <.. SalesRepository

    class BrandsService
    class LinesService
    class ProductsService
    class SuppliersService
    class SalesService

    BrandsService --> BrandsRepository
    LinesService --> LinesRepository
    ProductsService --> ProductsRepository
    ProductsService --> ProductSuppliersRepository
    LinesService --> BrandsService
    SalesService --> SalesRepository

    class BrandsController
    class LinesController
    class ProductsController
    class SuppliersController
    class SalesController

    BrandsController --> BrandsService
    LinesController --> LinesService
    ProductsController --> ProductsService
    SuppliersController --> SuppliersService
    SalesController --> SalesService

    class SupabaseAuthGuard
    class SupabaseRoleGuard

    SupabaseAuthGuard --> SupabaseService
```

**Como leer el diagrama**
- Los controladores siguen el patron controlador -> servicio -> repositorio; `ProductsService` ahora orquesta creacion de marca y linea cuando se envian `newBrand`/`newLine` y sincroniza proveedores via `ProductSuppliersRepository`.
- `LinesService` exige que la linea pertenezca a una marca existente y valida la unicidad (nombre + marca).
- El modulo de ventas agrega `SalesService.getSummaryMetrics` y `getMonthlyMetrics`, que aprovechan `SalesRepository.findMetricsData` para devolver KPI filtrables.