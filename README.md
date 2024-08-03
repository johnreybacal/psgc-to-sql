# psgc-to-sql

A package for ingesting PSGC publication files into SQL databases

It uses [psgc-reader](https://www.npmjs.com/package/psgc-reader) to read the publication file and [sequelize](https://www.npmjs.com/package/sequelize) to store it in an SQL engine of your choice

## Basic Usage

### 1. Setup `sequelize`

```typescript
import psgcToSql from "psgc-to-sql";

// If you already have a sequelize instance
psgcToSql.setSequelize(sequelize);

// Otherwise, setup your connection
psgcToSql.connect(DB_NAME, DB_USERNAME, DB_PASSWORD, options);
```

see: https://sequelize.org/docs/v6/getting-started/#connecting-to-a-database

### 2. Define

We can define how we want the data to be saved

-   Into multiple tables
    -   Associate these tables
-   Into a single table

#### 2.1. Into multiple tables

Create an object of type `Definitions`

-   `Definitions` is a collection of Definitions (extensions of `BaseDefinition`)

```typescript
import { Definitions } from "psgc-to-sql";

const definition: Definitions = {
    region: {
        tableName: "regions",
        modelName: "Region",
        id: "id",
        code: "code",
        name: "name",
    },
    // Other properties omitted
};

// Define it
psgcToSql.define(definition);

// If we want, we can associate these tables
psgcToSql.associate();
```

Basic properties of a `BaseDefinition`:

-   `tableName`: Name of the table to store this location type
-   `modelName`: Model to register (or registered) in sequelize
-   `id` (optional): ID of the table
-   `name`: Name of the location
-   `code`: PSGC code `// will make this optional`

#### 2.2. Into a single table

```typescript
import { TypedDefinition } from "psgc-to-sql";

// Create an object of type `TypedDefinition`
const definition: TypedDefinition = {
    // Other properties omitted
    type: "type",
    typeAlias: {
        Reg: "region",
        Prov: "province",
        City: "city",
        Mun: "municipality",
        SubMun: "sub municipality",
        Bgy: "barangay",
    },
};

// Define it
psgcToSql.define(definition);
```

Added properties:

-   `type`: Field to store Geographic Level columns (Reg, Prov, City, ...etc)
-   `typeAlias`: Override the value of Geographic Level from the publication file

### 3. Ingest

```typescript
await psgcToSql.toSql(filePath);
```
